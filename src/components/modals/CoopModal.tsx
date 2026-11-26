import React, { useState, useEffect } from 'react';
import {
  CoopState,
  getCoopState,
  initCoopRoom,
  RemotePeerState,
  subscribeCoopState,
} from '../../services/coopMultiplayer';
import { AccountSyncState, getAccountState, subscribeAccountState } from '../../services/googleSyncService';
import { gameActions, useGameStore } from '../../state/useGameStore';
import { getRealmById } from '../../data/realms';
import { ClassIcon } from '../common/ClassIcon';
import { soundManager } from '../../utils/audioManager';
import { Users, Copy, Check, Wifi, Swords, Navigation, Cloud, User, X } from 'lucide-react';

interface CoopModalProps {
  onClose: () => void;
  onOpenAccount: () => void;
}

export const CoopModal: React.FC<CoopModalProps> = ({ onClose, onOpenAccount }) => {
  const store = useGameStore();
  const [coop, setCoop] = useState<CoopState>(getCoopState);
  const [acct, setAcct] = useState<AccountSyncState>(getAccountState);
  const [roomInput, setRoomInput] = useState(coop.roomCode);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    const unsub1 = subscribeCoopState(() => setCoop(getCoopState()));
    const unsub2 = subscribeAccountState(() => setAcct(getAccountState()));
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const peers = Object.values(coop.peers);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    initCoopRoom(roomInput);
    setRoomInput(getCoopState().roomCode);
  };

  const handleCopyInvite = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('room', coop.roomCode);
      navigator.clipboard.writeText(url.toString());
      setCopiedInvite(true);
      soundManager.playClick();
      setTimeout(() => setCopiedInvite(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleJoinPeer = (peer: RemotePeerState) => {
    soundManager.playUltimate();
    if (peer.realmId !== store.currentRealmId) {
      gameActions.changeRealm(peer.realmId);
    }
    gameActions.setPlayerPosition(peer.x, peer.y);
    if (peer.activeEnemyId) {
      // Delay slightly if realm just switched so enemies generated
      setTimeout(() => {
        gameActions.startPlayerBattle(peer.activeEnemyId!);
      }, peer.realmId !== store.currentRealmId ? 60 : 0);
    }
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="w-full max-w-[390px] max-h-[88%] bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/60 rounded-2xl p-4 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-black text-sm text-cyan-200 uppercase tracking-wide">
                Co-op Multiplayer ($0 P2P)
              </h3>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>
                  {coop.transportMode === 'local+p2p'
                    ? 'P2P WebRTC + Multi-Tab Active'
                    : 'Multi-Tab Local Co-op Active'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Room Code Controls */}
        <form onSubmit={handleJoinRoom} className="mt-3 flex items-center gap-1.5">
          <input
            type="text"
            value={roomInput}
            maxLength={24}
            onChange={e => setRoomInput(e.target.value.toUpperCase())}
            placeholder="Room code (e.g. PENTAVOW-1)"
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-cyan-200 outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] uppercase shrink-0"
          >
            Join Room
          </button>
          <button
            type="button"
            onClick={handleCopyInvite}
            title="Copy co-op invite URL"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-1 shrink-0"
          >
            {copiedInvite ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedInvite ? 'Copied' : 'Invite'}</span>
          </button>
        </form>

        {/* Online Players List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Hunters in Room {coop.roomCode}</span>
            <span className="text-cyan-300">{peers.length + 1} Online</span>
          </div>

          {/* Local Player Row */}
          <div className="bg-amber-950/25 border border-amber-500/40 rounded-xl p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <ClassIcon job={store.player.currentJob} size="sm" showTooltip={false} />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-amber-200 truncate">{store.player.name}</span>
                  <span className="text-[8px] font-black px-1 rounded bg-amber-500/20 text-amber-300">YOU</span>
                  <span className="text-[8px] font-bold px-1 rounded bg-slate-900 text-slate-300">
                    {acct.mode === 'google' ? 'Google Sync' : 'Guest'}
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 truncate">
                  Lv.{store.player.jobs[store.player.currentJob]?.level || 1} • {getRealmById(store.currentRealmId).name}
                </p>
              </div>
            </div>
          </div>

          {peers.length === 0 ? (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-center space-y-1">
              <p className="text-xs font-bold text-slate-300">Waiting for teammates in {coop.roomCode}...</p>
              <p className="text-[10px] text-slate-500">
                Open another tab or share your Invite URL with a friend using the same room code.
              </p>
            </div>
          ) : (
            peers.map(peer => (
              <div
                key={peer.peerId}
                className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-2 flex items-center justify-between gap-2"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <ClassIcon job={peer.job} size="sm" showTooltip={false} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-cyan-200 truncate">{peer.name}</span>
                      <span className="text-[8px] font-bold px-1 rounded bg-slate-800 text-slate-300">
                        Lv.{peer.level}
                      </span>
                      <span className="text-[8px] px-1 rounded bg-slate-900 text-slate-400">
                        {peer.authMode === 'google' ? 'Google' : 'Guest'}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 truncate">
                      {getRealmById(peer.realmId).name}
                      {peer.activeEnemyId ? ' • Fighting Boss/Mob' : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleJoinPeer(peer)}
                  className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] font-black uppercase flex items-center gap-1 shrink-0"
                >
                  {peer.activeEnemyId ? <Swords className="w-3 h-3" /> : <Navigation className="w-3 h-3" />}
                  <span>{peer.activeEnemyId ? 'Join Fight' : 'Warp'}</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Account Sync Status Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {acct.mode === 'google' ? (
              <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            )}
            <span className="text-[10px] text-slate-300 truncate">
              {acct.mode === 'google' && acct.googleUser
                ? `Synced: ${acct.googleUser.email}`
                : 'Playing as Guest (Local Save)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
              onOpenAccount();
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-[9px] font-black uppercase shrink-0"
          >
            {acct.mode === 'google' ? 'Account' : 'Sync Google'}
          </button>
        </div>
      </div>
    </div>
  );
};
