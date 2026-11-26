import { joinRoom, Room } from 'trystero';
import { JobType } from '../types/game';
import { AuthMode } from './googleSyncService';

export type RemotePeerState = {
  peerId: string;
  name: string;
  title: string;
  job: JobType;
  skin?: string;
  level: number;
  realmId: string;
  x: number;
  y: number;
  isWalking: boolean;
  facingLeft: boolean;
  authMode: AuthMode;
  activeEnemyId: string | null;
  hp: number;
  maxHp: number;
  lastSeen: number;
};

export type CoopBattleHitEvent = {
  peerId: string;
  playerName: string;
  realmId: string;
  enemyId: string;
  damage: number;
  isCrit: boolean;
  ts: number;
};

export type CoopBattleHealEvent = {
  peerId: string;
  healerName: string;
  realmId: string;
  enemyId: string;
  amount: number;
  ts: number;
};

export type CoopEmoteEvent = {
  peerId: string;
  playerName: string;
  realmId: string;
  text: string;
  ts: number;
};

export interface CoopState {
  roomCode: string;
  localPeerId: string;
  transportMode: 'local+p2p' | 'local-only';
  peers: Record<string, RemotePeerState>;
}

const PEER_ID_KEY = 'tessera_coop_peer_id_v1';
const ROOM_STORAGE_KEY = 'tessera_coop_room_v1';
const APP_ID = 'tessera-legacy-coop-v1';
const PEER_STALE_MS = 7000;

function getOrCreatePeerId(): string {
  try {
    const existing = sessionStorage.getItem(PEER_ID_KEY);
    if (existing) return existing;
    const created = `hunter-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(PEER_ID_KEY, created);
    return created;
  } catch {
    return `hunter-${Math.random().toString(36).slice(2, 8)}`;
  }
}

function getInitialRoomCode(): string {
  if (typeof window !== 'undefined') {
    const urlRoom = new URLSearchParams(window.location.search).get('room');
    if (urlRoom && urlRoom.trim()) {
      return urlRoom.trim().toUpperCase().slice(0, 24);
    }
    try {
      const saved = localStorage.getItem(ROOM_STORAGE_KEY);
      if (saved && saved.trim()) return saved.trim().toUpperCase().slice(0, 24);
    } catch {
      // Ignore
    }
  }
  return 'TESSERA-1';
}

type LocalPayload =
  | { type: 'presence'; data: RemotePeerState }
  | { type: 'hit'; data: CoopBattleHitEvent }
  | { type: 'heal'; data: CoopBattleHealEvent }
  | { type: 'emote'; data: CoopEmoteEvent }
  | { type: 'leave'; peerId: string };

let state: CoopState = {
  roomCode: getInitialRoomCode(),
  localPeerId: typeof window !== 'undefined' ? getOrCreatePeerId() : 'hunter-ssr',
  transportMode: 'local-only',
  peers: {},
};

let bc: BroadcastChannel | null = null;
let nostrRoom: Room | null = null;
let sendP2PPresence: ((data: RemotePeerState) => void) | null = null;
let sendP2PHit: ((data: CoopBattleHitEvent) => void) | null = null;
let sendP2PHeal: ((data: CoopBattleHealEvent) => void) | null = null;
let sendP2PEmote: ((data: CoopEmoteEvent) => void) | null = null;
let lastPresencePayload: RemotePeerState | null = null;

const stateListeners = new Set<() => void>();
const hitListeners = new Set<(ev: CoopBattleHitEvent) => void>();
const healListeners = new Set<(ev: CoopBattleHealEvent) => void>();
const emoteListeners = new Set<(ev: CoopEmoteEvent) => void>();

function notifyCoop() {
  stateListeners.forEach(fn => fn());
}

function handleIncomingPresence(peer: RemotePeerState) {
  if (!peer || !peer.peerId || peer.peerId === state.localPeerId) return;
  state = {
    ...state,
    peers: {
      ...state.peers,
      [peer.peerId]: { ...peer, lastSeen: Date.now() },
    },
  };
  notifyCoop();
}

function handleIncomingLeave(peerId: string) {
  if (!state.peers[peerId]) return;
  const next = { ...state.peers };
  delete next[peerId];
  state = { ...state, peers: next };
  notifyCoop();
}

function teardownTransports() {
  if (bc) {
    try {
      bc.postMessage({ type: 'leave', peerId: state.localPeerId } satisfies LocalPayload);
      bc.close();
    } catch {
      // Ignore
    }
    bc = null;
  }
  if (nostrRoom) {
    try {
      nostrRoom.leave();
    } catch {
      // Ignore
    }
    nostrRoom = null;
  }
  sendP2PPresence = null;
  sendP2PHit = null;
  sendP2PHeal = null;
  sendP2PEmote = null;
}

export function initCoopRoom(roomCodeInput?: string) {
  if (typeof window === 'undefined') return;
  const roomCode = (roomCodeInput || state.roomCode || 'TESSERA-1')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 24) || 'TESSERA-1';

  teardownTransports();

  try {
    localStorage.setItem(ROOM_STORAGE_KEY, roomCode);
  } catch {
    // Ignore
  }

  state = {
    ...state,
    roomCode,
    peers: {},
    transportMode: 'local-only',
  };

  // 1. Instant zero-cost same-browser multi-tab channel (works even offline)
  if ('BroadcastChannel' in window) {
    bc = new BroadcastChannel(`tessera_coop_${roomCode}`);
    bc.onmessage = (event: MessageEvent<LocalPayload>) => {
      const msg = event.data;
      if (!msg) return;
      if (msg.type === 'presence') handleIncomingPresence(msg.data);
      else if (msg.type === 'leave') handleIncomingLeave(msg.peerId);
      else if (msg.type === 'hit' && msg.data.peerId !== state.localPeerId) {
        hitListeners.forEach(fn => fn(msg.data));
      } else if (msg.type === 'heal' && msg.data.peerId !== state.localPeerId) {
        healListeners.forEach(fn => fn(msg.data));
      } else if (msg.type === 'emote' && msg.data.peerId !== state.localPeerId) {
        emoteListeners.forEach(fn => fn(msg.data));
      }
    };
  }

  // 2. Serverless P2P WebRTC over free Nostr relays (zero server cost)
  try {
    nostrRoom = joinRoom({ appId: APP_ID }, roomCode);
    const presAction = nostrRoom.makeAction<RemotePeerState>('presence');
    const hitAction = nostrRoom.makeAction<CoopBattleHitEvent>('hit');
    const healAction = nostrRoom.makeAction<CoopBattleHealEvent>('heal');
    const emoteAction = nostrRoom.makeAction<CoopEmoteEvent>('emote');

    sendP2PPresence = data => {
      void presAction.send(data).catch(() => {});
    };
    sendP2PHit = data => {
      void hitAction.send(data).catch(() => {});
    };
    sendP2PHeal = data => {
      void healAction.send(data).catch(() => {});
    };
    sendP2PEmote = data => {
      void emoteAction.send(data).catch(() => {});
    };

    presAction.onMessage(data => handleIncomingPresence(data));
    hitAction.onMessage(data => {
      if (data.peerId !== state.localPeerId) hitListeners.forEach(fn => fn(data));
    });
    healAction.onMessage(data => {
      if (data.peerId !== state.localPeerId) healListeners.forEach(fn => fn(data));
    });
    emoteAction.onMessage(data => {
      if (data.peerId !== state.localPeerId) emoteListeners.forEach(fn => fn(data));
    });

    nostrRoom.onPeerJoin(() => {
      if (lastPresencePayload) sendP2PPresence?.(lastPresencePayload);
    });
    nostrRoom.onPeerLeave(({ peerId: rtPeerId }) => {
      // Stale pruning handles cleanup if peerId differs
      if (state.peers[rtPeerId]) handleIncomingLeave(rtPeerId);
    });

    state = { ...state, transportMode: 'local+p2p' };
  } catch {
    state = { ...state, transportMode: 'local-only' };
  }

  notifyCoop();
  if (lastPresencePayload) {
    broadcastPresence(lastPresencePayload);
  }
}

export function broadcastPresence(payload: Omit<RemotePeerState, 'peerId' | 'lastSeen'>) {
  const full: RemotePeerState = {
    ...payload,
    peerId: state.localPeerId,
    lastSeen: Date.now(),
  };
  lastPresencePayload = full;

  if (bc) {
    try {
      bc.postMessage({ type: 'presence', data: full } satisfies LocalPayload);
    } catch {
      // Ignore
    }
  }
  if (sendP2PPresence) {
    try {
      sendP2PPresence(full);
    } catch {
      // Ignore
    }
  }
}

export function broadcastBattleHit(realmId: string, enemyId: string, damage: number, playerName: string, isCrit: boolean) {
  if (!enemyId || damage <= 0) return;
  const ev: CoopBattleHitEvent = {
    peerId: state.localPeerId,
    playerName,
    realmId,
    enemyId,
    damage,
    isCrit,
    ts: Date.now(),
  };
  bc?.postMessage({ type: 'hit', data: ev } satisfies LocalPayload);
  try {
    sendP2PHit?.(ev);
  } catch {
    // Ignore
  }
}

export function broadcastBattleHeal(realmId: string, enemyId: string, amount: number, healerName: string) {
  if (!enemyId || amount <= 0) return;
  const ev: CoopBattleHealEvent = {
    peerId: state.localPeerId,
    healerName,
    realmId,
    enemyId,
    amount,
    ts: Date.now(),
  };
  bc?.postMessage({ type: 'heal', data: ev } satisfies LocalPayload);
  try {
    sendP2PHeal?.(ev);
  } catch {
    // Ignore
  }
}

export function broadcastCoopEmote(realmId: string, text: string, playerName: string) {
  const ev: CoopEmoteEvent = {
    peerId: state.localPeerId,
    playerName,
    realmId,
    text,
    ts: Date.now(),
  };
  bc?.postMessage({ type: 'emote', data: ev } satisfies LocalPayload);
  try {
    sendP2PEmote?.(ev);
  } catch {
    // Ignore
  }
}

export function getCoopState(): CoopState {
  return state;
}

export function subscribeCoopState(listener: () => void): () => void {
  stateListeners.add(listener);
  return () => stateListeners.delete(listener);
}

export function subscribeCoopHits(listener: (ev: CoopBattleHitEvent) => void): () => void {
  hitListeners.add(listener);
  return () => hitListeners.delete(listener);
}

export function subscribeCoopHeals(listener: (ev: CoopBattleHealEvent) => void): () => void {
  healListeners.add(listener);
  return () => healListeners.delete(listener);
}

export function subscribeCoopEmotes(listener: (ev: CoopEmoteEvent) => void): () => void {
  emoteListeners.add(listener);
  return () => emoteListeners.delete(listener);
}

if (typeof window !== 'undefined') {
  initCoopRoom();
  setInterval(() => {
    const now = Date.now();
    let changed = false;
    const nextPeers: Record<string, RemotePeerState> = {};
    for (const [id, peer] of Object.entries(state.peers)) {
      if (now - peer.lastSeen <= PEER_STALE_MS) {
        nextPeers[id] = peer;
      } else {
        changed = true;
      }
    }
    if (changed) {
      state = { ...state, peers: nextPeers };
      notifyCoop();
    }
  }, 2000);

  window.addEventListener('beforeunload', () => {
    teardownTransports();
  });
}
