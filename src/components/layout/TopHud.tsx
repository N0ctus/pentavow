import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { JOB_DEFINITIONS, EXP_TABLE } from '../../data/jobs';
import { Shield, Sparkles, Heart, Coins, Gem, Crosshair, Feather, Volume2, VolumeX, Settings, Edit2, Compass, Cloud, User, BookOpen, Monitor, Maximize2, Smartphone, Tv } from 'lucide-react';
import { soundManager } from '../../utils/audioManager';
import { getRealmById } from '../../data/realms';
import { getAccountState, subscribeAccountState } from '../../services/googleSyncService';

// Lazy-load header overlays
const SettingsModal = lazy(() => import('../modals/SettingsModal').then(m => ({ default: m.SettingsModal })));
const ProfileModal = lazy(() => import('../modals/ProfileModal').then(m => ({ default: m.ProfileModal })));
const RealmTravelModal = lazy(() => import('../modals/RealmTravelModal').then(m => ({ default: m.RealmTravelModal })));
const AccountChoiceModal = lazy(() => import('../modals/AccountChoiceModal').then(m => ({ default: m.AccountChoiceModal })));
const HuntersCodexModal = lazy(() => import('../modals/HuntersCodexModal').then(m => ({ default: m.HuntersCodexModal })));

export const TopHud: React.FC = () => {
  const store = useGameStore();
  const player = store.player;
  const currentRealm = getRealmById(store.currentRealmId);
  const currentJob = player.currentJob;
  const jobDef = JOB_DEFINITIONS[currentJob] || JOB_DEFINITIONS['WARRIOR'];
  const jobProgress = player.jobs[currentJob] || { level: 1, exp: 0 };
  const maxExpForLevel = EXP_TABLE[jobProgress.level] || 100;
  const expPercent = Math.min(100, Math.floor((jobProgress.exp / maxExpForLevel) * 100));
  const hpPercent = Math.max(0, Math.min(100, Math.floor((store.currentHp / store.maxHp) * 100)));
  const [muted, setMuted] = useState(soundManager.getMuted());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRealmModal, setShowRealmModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCodexModal, setShowCodexModal] = useState(false);
  const [acct, setAcct] = useState(getAccountState);

  useEffect(() => {
    return subscribeAccountState(() => setAcct(getAccountState()));
  }, []);

  const handleToggleSound = () => {
    const isNowMuted = soundManager.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      soundManager.playClick();
    }
  };

  return (
    <>
      <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-2.5 py-1.5 flex flex-col justify-center select-none z-30 shrink-0 shadow-lg">
        {/* Row 1: Profile & Currencies */}
        <div className="w-full flex items-center justify-between">
          {/* Left: Hunter Portrait + Job + Level */}
          <div
            onClick={() => {
              soundManager.playClick();
              setShowProfileModal(true);
            }}
            className="flex items-center space-x-2 group cursor-pointer"
            title="Open Hunter Profile & Change Name"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-amber-500/80 p-0.5 shadow-md flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center font-bold text-xs"
                  style={{
                    backgroundColor: player.customization.hairColor || '#ef4444',
                    color: '#ffffff',
                  }}
                >
                  {player.name.slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              {/* Title */}
              <span className="text-[8px] font-bold text-amber-400 truncate max-w-[95px] leading-tight">
                [{player.customization.title || 'Novice Hunter'}]
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-100 truncate max-w-[80px]">{player.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundManager.playClick();
                    setShowProfileModal(true);
                  }}
                  className="text-amber-400 hover:text-amber-300 p-0.5 rounded transition-colors"
                  title="Edit Character Name"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
                <span className="text-[9px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1 rounded">
                  Lv.{jobProgress.level}
                </span>
                <span className="text-[9px] text-amber-300 font-bold ml-1">{jobDef.name}</span>
              </div>
            </div>
          </div>

          {/* Right: Currencies & Action Buttons */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <div className="flex items-center space-x-1.5">
              <div className="flex items-center space-x-1 bg-slate-950/70 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <Coins className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[9px] font-bold text-amber-300 font-mono">
                  {player.gold.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-950/70 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                <Gem className="w-2.5 h-2.5 text-cyan-400" />
                <span className="text-[9px] font-bold text-cyan-300 font-mono">
                  {player.tesseraShards.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Account Mode Pill (Guest / Google Sync) */}
            <button
              onClick={() => {
                soundManager.playClick();
                setShowAccountModal(true);
              }}
              title={acct.mode === 'google' && acct.googleUser ? `Synced: ${acct.googleUser.email}` : 'Guest Mode (Click to Sync with Google)'}
              className={`px-1.5 py-1 rounded-full border text-[9px] font-black flex items-center gap-1 transition-all active:scale-95 ${
                acct.mode === 'google' && acct.googleUser
                  ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-400/60'
              }`}
            >
              {acct.mode === 'google' && acct.googleUser ? (
                <Cloud className="w-2.5 h-2.5 text-emerald-400" />
              ) : (
                <User className="w-2.5 h-2.5 text-cyan-400" />
              )}
              <span className="hidden sm:inline">{acct.mode === 'google' && acct.googleUser ? 'Synced' : 'Guest'}</span>
            </button>

            {/* Audio Mute/Unmute */}
            <button
              onClick={handleToggleSound}
              title={muted ? 'Unmute Sound' : 'Mute Sound'}
              className={`p-1.5 rounded-full border transition-all ${
                muted
                  ? 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                  : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
              }`}
            >
              {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>

            {/* Hunter's Codex Guidebook Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                setShowCodexModal(true);
              }}
              title="Hunter's Codex (Game Guide & Mechanics)"
              className="p-1.5 rounded-full border bg-amber-950/60 border-amber-500/50 text-amber-300 hover:text-amber-100 hover:bg-amber-900/60 transition-all active:scale-95 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
            >
              <BookOpen className="w-3 h-3" />
            </button>

            {/* Desktop Screen Size Cycle Toggle */}
            <button
              onClick={() => {
                soundManager.playClick();
                gameActions.cycleScreenSize();
              }}
              title={`Desktop Screen View: ${
                store.player.settings?.screenSize === 'COMPACT'
                  ? 'Compact (430px) - Click for Standard'
                  : store.player.settings?.screenSize === 'STANDARD'
                  ? 'Standard (680px) - Click for Widescreen'
                  : store.player.settings?.screenSize === 'EXPANDED'
                  ? 'Widescreen (980px) - Click for Full Window'
                  : 'Full Window - Click for Compact'
              }`}
              className="p-1.5 rounded-full border bg-slate-900 border-slate-700 hover:border-amber-400/80 text-amber-400 hover:text-amber-300 transition-all active:scale-95 flex items-center justify-center shadow-sm"
            >
              {store.player.settings?.screenSize === 'COMPACT' ? (
                <Smartphone className="w-3 h-3 text-slate-400" />
              ) : store.player.settings?.screenSize === 'STANDARD' ? (
                <Monitor className="w-3 h-3 text-cyan-400" />
              ) : store.player.settings?.screenSize === 'EXPANDED' ? (
                <Tv className="w-3 h-3 text-amber-400" />
              ) : (
                <Maximize2 className="w-3 h-3 text-emerald-400" />
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                setShowSettingsModal(true);
              }}
              title="System Preferences"
              className="p-1.5 rounded-full border bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
            >
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Row 2: High-Visibility Player Vitality & Progression Bars */}
        <div className="w-full flex items-center space-x-2 pt-1.5">
          {/* Dynamic HP Bar */}
          <div className="flex-[3] relative h-4 bg-slate-950 rounded-full border border-emerald-500/50 overflow-hidden shadow-[0_0_10px_rgba(16,185,129,0.25)] flex items-center">
            {/* Health fill gradient */}
            <div
              className={`h-full transition-all duration-300 ${
                hpPercent > 50
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400'
                  : hpPercent > 25
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
            {/* Subtle top gloss shine highlight */}
            <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

            {/* Clear high-contrast HP text */}
            <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] pointer-events-none">
              <span className="flex items-center space-x-1 font-bold text-emerald-200">
                <Heart className="w-3 h-3 fill-red-500 text-red-400 inline" />
                <span>HP</span>
              </span>
              <span className="font-mono tracking-tight font-black">
                {store.currentHp.toLocaleString()} / {store.maxHp.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Dynamic EXP Bar */}
          <div className="flex-[2] relative h-4 bg-slate-950 rounded-full border border-cyan-500/50 overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.25)] flex items-center">
            {/* EXP fill gradient */}
            <div
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${expPercent}%` }}
            />
            {/* Subtle top gloss shine highlight */}
            <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

            {/* Clear high-contrast EXP text */}
            <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] pointer-events-none">
              <span className="flex items-center space-x-1 font-bold text-cyan-200">
                <Sparkles className="w-2.5 h-2.5 text-cyan-300 inline" />
                <span>EXP</span>
              </span>
              <span className="font-mono tracking-tight font-bold text-cyan-100">
                {expPercent}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <Suspense fallback={null}>
        {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
        {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
        {showRealmModal && <RealmTravelModal onClose={() => setShowRealmModal(false)} />}
        {showAccountModal && <AccountChoiceModal forceOpen={true} onClose={() => setShowAccountModal(false)} />}
        {showCodexModal && <HuntersCodexModal onClose={() => setShowCodexModal(false)} />}
      </Suspense>
    </>
  );
};
