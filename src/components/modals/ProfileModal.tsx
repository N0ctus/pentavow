import React, { useState } from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { soundManager } from '../../utils/audioManager';
import { JOB_DEFINITIONS, EXP_TABLE } from '../../data/jobs';
import { SpriteRenderer } from '../common/SpriteRenderer';
import { ClassIcon } from '../common/ClassIcon';
import { User, Edit2, Check, X, Shield, Swords, Sparkles, Heart, Award } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const store = useGameStore();
  const player = store.player;
  const currentJob = player.currentJob;
  const jobDef = JOB_DEFINITIONS[currentJob];
  const jobProgress = player.jobs[currentJob] || { level: 1, exp: 0 };
  const maxExpForLevel = EXP_TABLE[jobProgress.level] || 100;
  const expPercent = Math.min(100, Math.floor((jobProgress.exp / maxExpForLevel) * 100));

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(player.name);
  const [toastMessage, setToastMessage] = useState('');

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    soundManager.playClick();
    gameActions.setPlayerName(trimmed);
    setIsEditingName(false);
    setToastMessage('Name updated successfully!');
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setNameInput(player.name);
      setIsEditingName(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="w-full max-w-[380px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-4 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
              <User className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-100">Hunter Passport</h3>
              <p className="text-[10px] text-slate-400">Character Identity & Combat Dossier</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Character Visual Showcase */}
        <div className="mt-3 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 rounded-xl p-3 flex items-center space-x-3 shadow-inner">
          <div className="w-16 h-20 bg-slate-950 rounded-xl border border-amber-500/40 flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative">
            <SpriteRenderer
              job={currentJob}
              skin={player.equippedSkins?.[currentJob]}
              scale={0.8}
              isPlayer={true}
              name={player.name}
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
              [{player.customization?.title || 'Novice Hunter'}]
            </span>

            {/* Editable Name Field */}
            {isEditingName ? (
              <div className="flex items-center space-x-1.5 mt-1">
                <input
                  type="text"
                  maxLength={16}
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  placeholder="Enter name..."
                  className="w-full bg-slate-950 border border-amber-400 rounded px-2 py-0.5 text-xs font-bold text-amber-300 outline-none focus:ring-1 focus:ring-amber-400"
                />
                <button
                  onClick={handleSaveName}
                  disabled={!nameInput.trim()}
                  className="p-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow"
                  title="Confirm"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setNameInput(player.name);
                    setIsEditingName(false);
                  }}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-sm font-black text-slate-100 truncate">{player.name}</span>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 border border-slate-700/80 px-1.5 py-0.5 rounded shadow-inner" title="Unique Hunter Discriminator Tag">
                  #{player.hunterTag || '1000'}
                </span>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setIsEditingName(true);
                  }}
                  className="p-1 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors"
                  title="Change Name"
                >
                  <Edit2 className="w-3 h-3 text-amber-400" />
                </button>
              </div>
            )}

            {/* Class & Level */}
            <div className="flex items-center space-x-1.5 mt-1.5">
              <ClassIcon job={currentJob} size="xs" showTooltip={false} />
              <span className="text-[10px] font-bold text-amber-300 leading-none">{jobDef.name}</span>
              <span className="text-[9px] font-bold text-slate-950 bg-amber-400 px-1.5 py-0.2 rounded-full leading-none">
                Lv.{jobProgress.level}
              </span>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-1 rounded-lg flex items-center space-x-1.5">
            <Check className="w-3 h-3" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Change Name Quick Action (if not inline editing) */}
        {!isEditingName && (
          <div className="mt-3">
            <button
              onClick={() => {
                soundManager.playClick();
                setIsEditingName(true);
              }}
              className="w-full py-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow active:scale-98"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Character Name</span>
            </button>
          </div>
        )}

        {/* Hunter Stats Dossier */}
        <div className="mt-3 bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Award className="w-3 h-3 text-amber-400" />
            <span>Combat Dossier</span>
          </span>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center space-x-1.5 bg-slate-900/70 p-1.5 rounded-lg border border-slate-800">
              <Heart className="w-3 h-3 text-rose-400" />
              <div className="flex flex-col">
                <span className="text-slate-400 text-[8px]">Max Health</span>
                <span className="font-bold text-slate-200">{store.maxHp.toLocaleString()} HP</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-900/70 p-1.5 rounded-lg border border-slate-800">
              <Swords className="w-3 h-3 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-slate-400 text-[8px]">Base Attack</span>
                <span className="font-bold text-slate-200">
                  {jobDef.baseAtk + (jobProgress.level - 1) * 8} ATK
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-900/70 p-1.5 rounded-lg border border-slate-800">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-slate-400 text-[8px]">Magic Attack</span>
                <span className="font-bold text-slate-200">
                  {jobDef.baseMatk + (jobProgress.level - 1) * 8} MATK
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-900/70 p-1.5 rounded-lg border border-slate-800">
              <Shield className="w-3 h-3 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-slate-400 text-[8px]">Physical Def</span>
                <span className="font-bold text-slate-200">
                  {jobDef.baseDef + (jobProgress.level - 1) * 6} DEF
                </span>
              </div>
            </div>
          </div>

          {/* EXP Progress */}
          <div className="mt-1">
            <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
              <span>Class Mastery Experience</span>
              <span className="font-mono text-amber-400">
                {jobProgress.exp} / {maxExpForLevel} EXP ({expPercent}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-3 pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shadow active:scale-98"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
