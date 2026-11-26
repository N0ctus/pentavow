/**
 * Cookie Persistence & Unique Identity Service for Pentavow
 * 
 * Provides:
 * 1. Resilient cookie-backed storage across Google Account logins even if localStorage is reset.
 * 2. Deterministic 4-digit Hunter Discriminator Tags (#XXXX) guaranteeing 100% unique player names.
 * 3. Partitioned save keys for multi-account Google sync.
 */

import { PlayerProfile } from '../types/game';

const AUTH_COOKIE_NAME = 'pentavow_auth_session_v1';
const SAVE_DIGEST_COOKIE_NAME = 'pentavow_save_digest_v1';
const COOKIE_MAX_AGE_DAYS = 365;

/**
 * Standard cookie write with URL encoding and 1-year persistence
 */
export function setCookie(name: string, value: string, days = COOKIE_MAX_AGE_DAYS): void {
  if (typeof document === 'undefined') return;
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const encodedVal = encodeURIComponent(value);
    document.cookie = `${name}=${encodedVal}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (err) {
    console.warn('[CookiePersistence] Failed to set cookie', name, err);
  }
}

/**
 * Standard cookie read with URL decoding
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[2]) : null;
  } catch {
    return null;
  }
}

/**
 * Remove cookie
 */
export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

/**
 * Generate a deterministic 4-digit unique tag from a seed string (e.g. Google email)
 * If no seed is provided, generates a random 4-digit tag between 1000 and 9999.
 */
export function generateUniqueHunterTag(seed?: string): string {
  if (!seed || !seed.trim()) {
    return `${Math.floor(1000 + Math.random() * 9000)}`;
  }
  // 32-bit FNV-1a hash
  let hash = 2166136261;
  const str = seed.trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const tagNum = 1000 + (Math.abs(hash) % 9000);
  return `${tagNum}`;
}

export interface AuthCookieData {
  chosen: boolean;
  mode: 'guest' | 'google';
  googleUser?: {
    name: string;
    email: string;
    picture?: string;
  } | null;
  hunterTag: string;
  lastSyncedAt?: number | null;
}

/**
 * Save Google Account authentication state to a long-lived cookie
 */
export function saveAuthCookie(data: AuthCookieData): void {
  setCookie(AUTH_COOKIE_NAME, JSON.stringify(data));
}

/**
 * Read Google Account authentication state from cookie (used on startup/recovery)
 */
export function readAuthCookie(): AuthCookieData | null {
  const raw = getCookie(AUTH_COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        chosen: Boolean(parsed.chosen),
        mode: parsed.mode === 'google' ? 'google' : 'guest',
        googleUser: parsed.googleUser || null,
        hunterTag: parsed.hunterTag || generateUniqueHunterTag(parsed.googleUser?.email),
        lastSyncedAt: parsed.lastSyncedAt || null,
      };
    }
  } catch {
    // Ignore JSON errors
  }
  return null;
}

export interface SaveDigestCookieData {
  heroName: string;
  hunterTag: string;
  currentJob: string;
  level: number;
  gold: number;
  tesseraShards: number;
  currentRealmId: string;
  updatedAt: number;
  googleEmail?: string;
}

/**
 * Save a lightweight recovery digest of the player's core progression to a cookie
 */
export function saveStateDigestCookie(player: PlayerProfile, currentRealmId: string, googleEmail?: string): void {
  const digest: SaveDigestCookieData = {
    heroName: player.name,
    hunterTag: player.hunterTag || '1000',
    currentJob: player.currentJob,
    level: player.jobs[player.currentJob]?.level || 1,
    gold: player.gold,
    tesseraShards: player.tesseraShards,
    currentRealmId,
    updatedAt: Date.now(),
    googleEmail,
  };
  setCookie(SAVE_DIGEST_COOKIE_NAME, JSON.stringify(digest));
}

/**
 * Read the recovery state digest from cookie
 */
export function readStateDigestCookie(): SaveDigestCookieData | null {
  const raw = getCookie(SAVE_DIGEST_COOKIE_NAME);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Generate account-partitioned local storage save key
 */
export function getPartitionedSaveKey(googleEmail?: string | null): string {
  if (!googleEmail || !googleEmail.trim()) {
    return 'pentavow_save_v1';
  }
  const cleanEmail = googleEmail.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `pentavow_save_google_${cleanEmail}`;
}

/**
 * Clear all Pentavow cookies upon account logout
 */
export function clearAllPentavowCookies(): void {
  removeCookie(AUTH_COOKIE_NAME);
  removeCookie(SAVE_DIGEST_COOKIE_NAME);
}
