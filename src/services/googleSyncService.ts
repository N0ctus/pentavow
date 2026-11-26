import { PlayerProfile } from '../types/game';
import {
  saveAuthCookie,
  readAuthCookie,
  generateUniqueHunterTag,
  clearAllPentavowCookies,
} from '../utils/cookiePersistence';

export type AuthMode = 'guest' | 'google';

export interface GoogleUserInfo {
  name: string;
  email: string;
  picture?: string;
}

export type CloudSyncStatus =
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'error'
  | 'needs_client_id';

export interface AccountSyncState {
  chosen: boolean;
  mode: AuthMode;
  googleUser: GoogleUserInfo | null;
  clientId: string;
  lastSyncedAt: number | null;
  syncStatus: CloudSyncStatus;
  errorMessage: string | null;
}

export interface CloudSavePayload {
  version: number;
  updatedAt: number;
  currentRealmId: string;
  player: PlayerProfile;
}

const AUTH_CHOICE_KEY = 'pentavow_auth_choice_v1';
const CLIENT_ID_STORAGE_KEY = 'pentavow_google_client_id_v1';
const DRIVE_SAVE_FILENAME = 'pentavow_save_v1.json';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.appdata openid email profile';

interface StoredAuthMeta {
  chosen: boolean;
  mode: AuthMode;
  googleUser?: GoogleUserInfo | null;
  lastSyncedAt?: number | null;
}

function readStoredMeta(): StoredAuthMeta {
  try {
    const raw = localStorage.getItem(AUTH_CHOICE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        chosen: Boolean(parsed.chosen),
        mode: parsed.mode === 'google' ? 'google' : 'guest',
        googleUser: parsed.googleUser || null,
        lastSyncedAt: parsed.lastSyncedAt || null,
      };
    }
  } catch {
    // Ignore storage read errors
  }
  // Fallback to resilient cookie storage if localStorage is missing or cleared
  const cookieMeta = readAuthCookie();
  if (cookieMeta) {
    return {
      chosen: cookieMeta.chosen,
      mode: cookieMeta.mode,
      googleUser: cookieMeta.googleUser || null,
      lastSyncedAt: cookieMeta.lastSyncedAt || null,
    };
  }
  return { chosen: false, mode: 'guest', googleUser: null, lastSyncedAt: null };
}

function resolveClientId(): string {
  const envId = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_CLIENT_ID || '';
  if (envId.trim()) return envId.trim();
  try {
    return (localStorage.getItem(CLIENT_ID_STORAGE_KEY) || '').trim();
  } catch {
    return '';
  }
}

const initialMeta = typeof window !== 'undefined' ? readStoredMeta() : { chosen: false, mode: 'guest' as AuthMode };

let accountState: AccountSyncState = {
  chosen: initialMeta.chosen,
  mode: initialMeta.mode,
  googleUser: initialMeta.googleUser || null,
  clientId: typeof window !== 'undefined' ? resolveClientId() : '',
  lastSyncedAt: initialMeta.lastSyncedAt || null,
  syncStatus: 'idle',
  errorMessage: null,
};

let accessToken: string | null = null;
let cachedDriveFileId: string | null = null;
let cloudSyncTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function persistMeta() {
  try {
    localStorage.setItem(
      AUTH_CHOICE_KEY,
      JSON.stringify({
        chosen: accountState.chosen,
        mode: accountState.mode,
        googleUser: accountState.googleUser,
        lastSyncedAt: accountState.lastSyncedAt,
      })
    );
  } catch {
    // Ignore storage write errors
  }
  // Also backup to resilient cookie storage
  try {
    saveAuthCookie({
      chosen: accountState.chosen,
      mode: accountState.mode,
      googleUser: accountState.googleUser,
      hunterTag: generateUniqueHunterTag(accountState.googleUser?.email),
      lastSyncedAt: accountState.lastSyncedAt,
    });
  } catch {
    // Ignore cookie write errors
  }
}

function emit() {
  persistMeta();
  listeners.forEach(fn => fn());
}

export function subscribeAccountState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccountState(): AccountSyncState {
  return accountState;
}

export function chooseGuestMode() {
  accessToken = null;
  accountState = {
    ...accountState,
    chosen: true,
    mode: 'guest',
    syncStatus: 'idle',
    errorMessage: null,
  };
  emit();
}

export function setGoogleClientId(clientId: string) {
  const trimmed = clientId.trim();
  try {
    if (trimmed) {
      localStorage.setItem(CLIENT_ID_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(CLIENT_ID_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
  accountState = {
    ...accountState,
    clientId: trimmed,
    syncStatus: trimmed && accountState.syncStatus === 'needs_client_id' ? 'idle' : accountState.syncStatus,
    errorMessage: null,
  };
  emit();
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface GoogleGlobal {
  accounts?: {
    oauth2?: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (resp: { access_token?: string; error?: string; error_description?: string }) => void;
      }) => GoogleTokenClient;
      revoke?: (token: string, done: () => void) => void;
    };
  };
}

let gisLoadPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser required'));
  const g = (window as unknown as { google?: GoogleGlobal }).google;
  if (g?.accounts?.oauth2) return Promise.resolve();
  if (gisLoadPromise) return gisLoadPromise;

  gisLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisLoadPromise = null;
      reject(new Error('Could not load Google Sign-In script. Check internet connection.'));
    };
    document.head.appendChild(script);
  });

  return gisLoadPromise;
}

async function fetchGoogleProfile(token: string): Promise<GoogleUserInfo> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch Google user profile');
  const data = await res.json();
  return {
    name: data.name || data.given_name || 'Google Hunter',
    email: data.email || '',
    picture: data.picture,
  };
}

async function findDriveSaveFileId(token: string): Promise<string | null> {
  if (cachedDriveFileId) return cachedDriveFileId;
  const q = encodeURIComponent(`name='${DRIVE_SAVE_FILENAME}' and trashed=false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Google Drive list failed (${res.status})`);
  const data = await res.json();
  const fileId = data.files?.[0]?.id || null;
  cachedDriveFileId = fileId;
  return fileId;
}

async function downloadDriveSave(token: string): Promise<CloudSavePayload | null> {
  const fileId = await findDriveSaveFileId(token);
  if (!fileId) return null;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return null;
  return (await res.json()) as CloudSavePayload;
}

async function uploadDriveSave(token: string, payload: CloudSavePayload): Promise<void> {
  const existingId = await findDriveSaveFileId(token);
  const bodyJson = JSON.stringify(payload);

  if (existingId) {
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existingId)}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: bodyJson,
      }
    );
    if (!res.ok) throw new Error(`Google Drive update failed (${res.status})`);
    return;
  }

  const boundary = 'tessera_sync_boundary_' + Date.now();
  const metadata = JSON.stringify({
    name: DRIVE_SAVE_FILENAME,
    parents: ['appDataFolder'],
  });
  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${bodyJson}\r\n` +
    `--${boundary}--`;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );
  if (!res.ok) throw new Error(`Google Drive create failed (${res.status})`);
  const created = await res.json();
  cachedDriveFileId = created.id || null;
}

export async function connectGoogleAndSync(
  getLocalSave: () => { player: PlayerProfile; currentRealmId: string },
  applyCloudSave: (player: PlayerProfile, realmId: string) => void
): Promise<{ ok: boolean; source: 'cloud' | 'local' | 'error'; message: string }> {
  const clientId = resolveClientId();
  if (!clientId) {
    accountState = {
      ...accountState,
      clientId: '',
      syncStatus: 'needs_client_id',
      errorMessage: 'Add a free Google OAuth Client ID to enable Google Drive cloud sync.',
    };
    emit();
    return { ok: false, source: 'error', message: 'Missing Google OAuth Client ID' };
  }

  accountState = {
    ...accountState,
    clientId,
    syncStatus: 'syncing',
    errorMessage: null,
  };
  emit();

  try {
    await loadGoogleIdentityScript();
    const google = (window as unknown as { google?: GoogleGlobal }).google;
    if (!google?.accounts?.oauth2) {
      throw new Error('Google OAuth client unavailable');
    }

    const token = await new Promise<string>((resolve, reject) => {
      const client = google.accounts!.oauth2!.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPES,
        callback: resp => {
          if (resp.error || !resp.access_token) {
            reject(new Error(resp.error_description || resp.error || 'Google sign-in cancelled'));
            return;
          }
          resolve(resp.access_token);
        },
      });
      client.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
    });

    accessToken = token;
    const profile = await fetchGoogleProfile(token);
    const cloudSave = await downloadDriveSave(token);
    const local = getLocalSave();

    const googleHunterTag = generateUniqueHunterTag(profile?.email);
    let source: 'cloud' | 'local' = 'local';
    if (cloudSave?.player) {
      if (!cloudSave.player.hunterTag) {
        cloudSave.player.hunterTag = googleHunterTag;
      }
      applyCloudSave(cloudSave.player, cloudSave.currentRealmId || local.currentRealmId);
      source = 'cloud';
    } else {
      if (!local.player.hunterTag) {
        local.player.hunterTag = googleHunterTag;
      }
      if (local.player.name === 'Valerius' && profile?.name) {
        const firstName = profile.name.split(' ')[0].trim().slice(0, 16);
        if (firstName) {
          local.player.name = firstName;
        }
      }
      await uploadDriveSave(token, {
        version: 1,
        updatedAt: Date.now(),
        currentRealmId: local.currentRealmId,
        player: local.player,
      });
    }

    accountState = {
      ...accountState,
      chosen: true,
      mode: 'google',
      googleUser: profile,
      lastSyncedAt: Date.now(),
      syncStatus: 'synced',
      errorMessage: null,
    };
    emit();

    return {
      ok: true,
      source,
      message:
        source === 'cloud'
          ? `Loaded synced save from ${profile.email}`
          : `Backed up progress to ${profile.email}'s Google Drive`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Google sign-in failed';
    accountState = {
      ...accountState,
      syncStatus: 'error',
      errorMessage: msg,
    };
    emit();
    return { ok: false, source: 'error', message: msg };
  }
}

export function scheduleGoogleCloudUpload(player: PlayerProfile, currentRealmId: string) {
  if (accountState.mode !== 'google' || !accessToken) return;
  if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(async () => {
    cloudSyncTimer = null;
    if (!accessToken || accountState.mode !== 'google') return;
    try {
      accountState = { ...accountState, syncStatus: 'syncing' };
      emit();
      await uploadDriveSave(accessToken, {
        version: 1,
        updatedAt: Date.now(),
        currentRealmId,
        player,
      });
      accountState = {
        ...accountState,
        lastSyncedAt: Date.now(),
        syncStatus: 'synced',
        errorMessage: null,
      };
      emit();
    } catch (err) {
      accountState = {
        ...accountState,
        syncStatus: 'error',
        errorMessage: err instanceof Error ? err.message : 'Cloud save failed',
      };
      emit();
    }
  }, 2500);
}

export function disconnectGoogleAccount() {
  if (accessToken) {
    try {
      const google = (window as unknown as { google?: GoogleGlobal }).google;
      google?.accounts?.oauth2?.revoke?.(accessToken, () => {});
    } catch {
      // Ignore revoke error
    }
  }
  accessToken = null;
  cachedDriveFileId = null;
  clearAllPentavowCookies();
  accountState = {
    ...accountState,
    chosen: true,
    mode: 'guest',
    googleUser: null,
    syncStatus: 'idle',
    errorMessage: null,
  };
  emit();
}
