import React, { useState, useEffect } from 'react';
import {
  AccountSyncState,
  chooseGuestMode,
  connectGoogleAndSync,
  disconnectGoogleAccount,
  getAccountState,
  setGoogleClientId,
  subscribeAccountState,
} from '../../services/googleSyncService';
import { gameActions, useGameStore } from '../../state/useGameStore';
import { soundManager } from '../../utils/audioManager';
import { PlayerProfile } from '../../types/game';
import { Cloud, CloudOff, User, Check, KeyRound, Upload, X, Sparkles, ShieldCheck } from 'lucide-react';

interface AccountChoiceModalProps {
  onClose?: () => void;
  forceOpen?: boolean;
}

export const AccountChoiceModal: React.FC<AccountChoiceModalProps> = ({ onClose, forceOpen = false }) => {
  const store = useGameStore();
  const [acct, setAcct] = useState<AccountSyncState>(getAccountState);
  const [clientIdInput, setClientIdInput] = useState(acct.clientId || '');
  const [showSetup, setShowSetup] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  useEffect(() => {
    return subscribeAccountState(() => {
      const next = getAccountState();
      setAcct(next);
      if (next.syncStatus === 'needs_client_id') {
        setShowSetup(true);
      }
    });
  }, []);

  if (acct.chosen && !forceOpen) return null;

  const handleGuest = () => {
    soundManager.playClick();
    chooseGuestMode();
    onClose?.();
  };

  const handleGoogleSync = async () => {
    soundManager.playClick();
    if (clientIdInput.trim() && clientIdInput.trim() !== acct.clientId) {
      setGoogleClientId(clientIdInput.trim());
    }
    const res = await connectGoogleAndSync(
      () => ({ player: store.player, currentRealmId: store.currentRealmId }),
      (cloudPlayer: PlayerProfile, realmId: string) => {
        gameActions.importSaveData(cloudPlayer, realmId);
      }
    );
    setStatusNote(res.message);
    if (res.ok) {
      soundManager.playVictory();
      setTimeout(() => onClose?.(), 900);
    }
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJson.trim());
      const playerObj = parsed.player ? parsed.player : parsed;
      if (!playerObj?.name || !playerObj?.jobs) {
        setStatusNote('Invalid save JSON format.');
        return;
      }
      gameActions.importSaveData(playerObj, parsed.currentRealmId);
      chooseGuestMode();
      soundManager.playVictory();
      setStatusNote('Save imported successfully!');
      setTimeout(() => onClose?.(), 700);
    } catch {
      setStatusNote('Invalid JSON string.');
    }
  };

  return (
    <div className="absolute inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="w-full max-w-[390px] max-h-[92%] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-4 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-black text-amber-300 tracking-wide uppercase">
                Account & Save Mode
              </h2>
              <p className="text-[10px] text-slate-400">
                Choose how to keep your progression ($0 free)
              </p>
            </div>
          </div>
          {onClose && acct.chosen && (
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-3 space-y-2.5">
          {/* Option 1: Play as Guest */}
          <button
            type="button"
            onClick={handleGuest}
            className={`w-full text-left p-3 rounded-xl border transition-all active:scale-[0.99] ${
              acct.chosen && acct.mode === 'guest'
                ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                : 'bg-slate-900/90 border-slate-700 hover:border-cyan-400/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-black text-slate-100">Play as Guest (Local Save)</span>
              </div>
              {acct.chosen && acct.mode === 'guest' && (
                <span className="text-[9px] font-black text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 px-1.5 py-0.5 rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="mt-1 text-[10px] text-slate-400 leading-snug">
              Start immediately with zero sign-in. Saves locally in this browser with full Co-op Multiplayer support.
            </p>
          </button>

          {/* Option 2: Sync with Google Account ($0 Google Drive AppData) */}
          <div
            className={`p-3 rounded-xl border space-y-2 ${
              acct.mode === 'google' && acct.googleUser
                ? 'bg-emerald-950/35 border-emerald-400/70'
                : 'bg-slate-900/90 border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-black text-amber-200">
                  Sync with Google Account ($0)
                </span>
              </div>
              {acct.mode === 'google' && acct.googleUser && (
                <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" />
                  SYNCED
                </span>
              )}
            </div>

            {acct.mode === 'google' && acct.googleUser ? (
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-100 truncate">{acct.googleUser.name}</p>
                  <p className="text-[9px] text-slate-400 truncate">{acct.googleUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    disconnectGoogleAccount();
                    setStatusNote('Switched back to Guest mode.');
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950 border border-slate-700 hover:border-rose-500/60 text-[9px] font-bold text-slate-300 hover:text-rose-200 shrink-0 flex items-center gap-1"
                >
                  <CloudOff className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 leading-snug">
                Stores your advancement privately in your own Google Drive AppData folder (zero server cost).
              </p>
            )}

            <button
              type="button"
              onClick={handleGoogleSync}
              disabled={acct.syncStatus === 'syncing'}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 disabled:opacity-60 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {acct.syncStatus === 'syncing'
                  ? 'Connecting Google Drive...'
                  : acct.mode === 'google' && acct.googleUser
                  ? 'Sync Now with Google Drive'
                  : 'Sign In & Sync with Google'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowSetup(prev => !prev)}
              className="w-full text-[9px] font-bold text-slate-400 hover:text-amber-300 flex items-center justify-center gap-1 pt-0.5"
            >
              <KeyRound className="w-2.5 h-2.5" />
              <span>{showSetup ? 'Hide Google Client ID Setup' : 'Configure Free Google OAuth Client ID'}</span>
            </button>

            {showSetup && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 space-y-1.5 text-[9px] text-slate-400">
                <p className="text-slate-300 font-semibold">
                  Free $0 setup (Google Cloud Console → OAuth Web Client ID):
                </p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Create a free OAuth 2.0 Web Client ID (no credit card).</li>
                  <li>
                    Add <code className="text-cyan-300">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}</code> to Authorized JS Origins &amp; enable Google Drive API.
                  </li>
                  <li>Paste Client ID below (or set <code className="text-cyan-300">VITE_GOOGLE_CLIENT_ID</code> in <code className="text-cyan-300">.env</code>):</li>
                </ol>
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={e => setClientIdInput(e.target.value)}
                    placeholder="123456-abc.apps.googleusercontent.com"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleClientId(clientIdInput);
                      setStatusNote('Google Client ID saved locally.');
                    }}
                    className="px-2.5 py-1 rounded bg-cyan-500 text-slate-950 font-black text-[9px] uppercase"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Local Save JSON Import Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowImport(prev => !prev)}
              className="w-full text-[10px] text-slate-400 hover:text-cyan-300 font-semibold flex items-center justify-center gap-1"
            >
              <Upload className="w-3 h-3" />
              <span>{showImport ? 'Hide Save Import' : 'Restore from Exported Save JSON'}</span>
            </button>
            {showImport && (
              <div className="mt-1.5 space-y-1.5">
                <textarea
                  value={importJson}
                  onChange={e => setImportJson(e.target.value)}
                  rows={3}
                  placeholder="Paste exported JSON from Settings -> Copy Save JSON..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-[10px] text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase"
                >
                  Import &amp; Continue
                </button>
              </div>
            )}
          </div>

          {(statusNote || acct.errorMessage) && (
            <p className="text-center text-[10px] font-semibold text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-lg px-2 py-1.5">
              {statusNote || acct.errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
