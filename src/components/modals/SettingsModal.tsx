import React, { useState } from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { soundManager } from '../../utils/audioManager';
import { Settings, Volume2, Smartphone, ShieldCheck, Download, Trash2, X, Check, User, Monitor, Tv, Maximize2 } from 'lucide-react';
import { ScreenDisplayMode } from '../../types/game';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const store = useGameStore();
  const settings = store.player.settings;

  const [playerName, setPlayerName] = useState(store.player.name);
  const [nameSavedToast, setNameSavedToast] = useState(false);

  const [masterVol, setMasterVol] = useState(settings.masterVolume);
  const [sfxVol, setSfxVol] = useState(settings.sfxVolume);
  const [bgmVol, setBgmVol] = useState(settings.bgmVolume);
  const [screenShake, setScreenShake] = useState(settings.screenShake);
  const [damageMode, setDamageMode] = useState(settings.damageTextMode);
  const [controlMode, setControlMode] = useState(settings.controlMode);
  const [screenSize, setScreenSize] = useState<ScreenDisplayMode>(settings.screenSize || 'EXPANDED');

  const [exportedToast, setExportedToast] = useState(false);

  const handleSaveName = () => {
    const trimmed = playerName.trim();
    if (!trimmed) return;
    soundManager.playClick();
    gameActions.setPlayerName(trimmed);
    setNameSavedToast(true);
    setTimeout(() => setNameSavedToast(false), 2000);
  };

  const handleSaveSettings = () => {
    soundManager.playClick();
    const trimmed = playerName.trim();
    if (trimmed && trimmed !== store.player.name) {
      gameActions.setPlayerName(trimmed);
    }
    gameActions.updateSettings({
      masterVolume: masterVol,
      sfxVolume: sfxVol,
      bgmVolume: bgmVol,
      screenShake,
      damageTextMode: damageMode,
      controlMode,
      screenSize,
    });
    onClose();
  };

  const handleExportSave = () => {
    try {
      const data = JSON.stringify(store.player, null, 2);
      navigator.clipboard.writeText(data);
      setExportedToast(true);
      soundManager.playVictory();
      setTimeout(() => setExportedToast(false), 2000);
    } catch {}
  };

  const handleResetSave = () => {
    if (window.confirm('Reset all character progress, weapons, and levels to default?')) {
      gameActions.resetSaveData();
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="w-full max-w-[400px] max-h-[90%] bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700/80 rounded-2xl p-4 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Settings className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-100">System Preferences</h3>
              <p className="text-[10px] text-slate-400">Audio, FX, Controls & Save Data</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-xs text-slate-300">
          {/* Hunter Identity */}
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Hunter Identity</span>
            </span>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-300 font-semibold">Character Name</span>
                <span className="text-[9px] text-amber-400 font-mono font-bold">Unique Tag: #{store.player.hunterTag || '1000'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  maxLength={16}
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveName();
                  }}
                  placeholder="Enter name..."
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-300 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={!playerName.trim() || playerName.trim() === store.player.name}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs transition-all shadow active:scale-95"
                >
                  Save
                </button>
              </div>
              {nameSavedToast && (
                <div className="mt-1.5 text-[9px] text-emerald-400 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Name updated to &quot;{store.player.name}&quot;</span>
                </div>
              )}
            </div>
          </div>

          {/* Audio Sliders */}
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audio Mixing</span>
            </span>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span>Master Volume</span>
                <span className="font-mono text-cyan-400">{masterVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVol}
                onChange={e => setMasterVol(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span>SFX Volume</span>
                <span className="font-mono text-cyan-400">{sfxVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVol}
                onChange={e => setSfxVol(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Combat Visual FX */}
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Combat Visuals</span>
            </span>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-[11px] text-slate-200">Ultimate Screen Shake</div>
                <div className="text-[9px] text-slate-500">Camera rumble on 5-Star Ultimate strikes</div>
              </div>
              <button
                onClick={() => setScreenShake(!screenShake)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  screenShake ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    screenShake ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Damage Number Display</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'ALL', label: 'All Hits' },
                  { id: 'CRITS_ONLY', label: 'Crits Only' },
                  { id: 'CONDENSED', label: 'Compact' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setDamageMode(opt.id as typeof damageMode)}
                    className={`py-1 text-[9px] font-bold rounded-lg border transition-all ${
                      damageMode === opt.id
                        ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Display Size */}
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Monitor className="w-3.5 h-3.5 text-amber-400" />
              <span>Desktop Screen Size</span>
            </span>
            <p className="text-[9px] text-slate-500">
              Customize the game viewport for desktop monitors & laptops (auto-saved).
            </p>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'COMPACT', label: 'Compact (430px)', desc: 'Mobile / Multi-tab', icon: Smartphone },
                { id: 'STANDARD', label: 'Standard (680px)', desc: 'Tablet / Balanced', icon: Monitor },
                { id: 'EXPANDED', label: 'Widescreen (980px)', desc: 'Wide Anime Arena', icon: Tv },
                { id: 'FULL', label: 'Full Window', desc: '100% Screen Immersion', icon: Maximize2 },
              ].map(opt => {
                const IconComponent = opt.icon;
                const isSelected = screenSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setScreenSize(opt.id as ScreenDisplayMode);
                      gameActions.updateSettings({ screenSize: opt.id as ScreenDisplayMode });
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-[10px]">
                      <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{opt.label}</span>
                    </div>
                    <div className="text-[8px] text-slate-500 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls Mode */}
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Control Scheme</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setControlMode('JOYSTICK')}
                className={`p-2 rounded-xl border text-left ${
                  controlMode === 'JOYSTICK'
                    ? 'border-purple-400 bg-purple-950/40 text-purple-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                <div className="font-bold text-[10px]">Virtual Joystick + Tap</div>
                <div className="text-[8px] text-slate-500">Touch pad & WASD</div>
              </button>
              <button
                onClick={() => setControlMode('TAP_ONLY')}
                className={`p-2 rounded-xl border text-left ${
                  controlMode === 'TAP_ONLY'
                    ? 'border-purple-400 bg-purple-950/40 text-purple-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                <div className="font-bold text-[10px]">Tap to Move Only</div>
                <div className="text-[8px] text-slate-500">Hide on-screen pad</div>
              </button>
            </div>
          </div>

          {/* Save Data Management */}
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Save Data Management
            </span>

            <div className="flex space-x-2">
              <button
                onClick={handleExportSave}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold flex items-center justify-center space-x-1 active:scale-95 transition-all"
              >
                {exportedToast ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export Save (JSON)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetSave}
                className="py-1.5 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-[10px] font-bold flex items-center space-x-1 active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Preferences Button */}
        <div className="pt-3 border-t border-slate-800 shrink-0">
          <button
            onClick={handleSaveSettings}
            className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-slate-700 to-slate-800 hover:brightness-110 active:scale-95 text-white shadow border border-slate-600"
          >
            Apply Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
