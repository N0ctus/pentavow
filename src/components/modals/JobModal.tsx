import React, { useState } from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { JOB_DEFINITIONS, EXP_TABLE, MAX_JOB_LEVEL } from '../../data/jobs';
import { WEAPON_MAP } from '../../data/weapons';
import { MYTHIC_WEAPON_BY_JOB } from '../../data/mythicWeapons';
import { JobType, ClassPath } from '../../types/game';
import { Shield, Sparkles, Crosshair, Feather, Check, Lock, Award, Flame, Swords, Crown, Compass, Shirt } from 'lucide-react';
import { SpriteRenderer } from '../common/SpriteRenderer';
import { ClassIcon } from '../common/ClassIcon';
import { AnimatedWeaponIcon } from '../common/AnimatedWeaponIcon';
import { SKINS_BY_CLASS } from '../../data/skins';
import { soundManager } from '../../utils/audioManager';

export const JobModal: React.FC = () => {
  const store = useGameStore();
  const player = store.player;
  const currentJob = player.currentJob;
  const currentProg = player.jobs[currentJob] || { level: 1, exp: 0 };
  const currentJobDef = JOB_DEFINITIONS[currentJob] || JOB_DEFINITIONS['WARRIOR'];
  const isCurrentMastered = currentProg.level >= MAX_JOB_LEVEL;

  // Selected Path Tab ('MARTIAL' | 'ARCANE' | 'DIVINE')
  const [selectedPath, setSelectedPath] = useState<ClassPath>(currentJobDef.path || 'MARTIAL');
  const [expandedSkinJob, setExpandedSkinJob] = useState<JobType | null>(null);

  // Filter jobs by selected path
  const pathJobs: JobType[] = (Object.keys(JOB_DEFINITIONS) as JobType[]).filter(k => {
    // Exclude legacy alias duplicates from display
    if (['VANGUARD', 'SPELLWEAVER', 'LIGHTBEARER', 'SHADOWBLADE'].includes(k)) return false;
    return JOB_DEFINITIONS[k].path === selectedPath;
  });

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-slate-950 p-3 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-2">
        <div>
          <h2 className="text-base font-black text-slate-100 flex items-center space-x-1.5">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Class Evolution & Specializations</span>
          </h2>
          <p className="text-[10px] text-slate-400">
            WoW-inspired classes with Japanese Samurai arts. Reach Lv. {MAX_JOB_LEVEL} (Max Level) to advance!
          </p>
        </div>
      </div>

      {/* Class Mastery Notice Banner */}
      <div className={`p-2.5 rounded-xl border mb-3 flex items-start space-x-2.5 shadow ${
        isCurrentMastered
          ? 'bg-gradient-to-r from-amber-950/80 via-yellow-950/40 to-slate-900 border-amber-500/60 text-amber-200'
          : 'bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border-rose-500/40 text-rose-200'
      }`}>
        <div className={`p-1.5 rounded-lg shrink-0 ${isCurrentMastered ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {isCurrentMastered ? <Crown className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        </div>
        <div className="flex-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-black">
              Current: {currentJobDef.name} ({currentJobDef.jpName})
            </span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
              isCurrentMastered
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_8px_#f59e0b]'
                : 'bg-rose-600 text-white'
            }`}>
              {isCurrentMastered ? 'MASTERED (LV. 10)' : `LV. ${currentProg.level}/${MAX_JOB_LEVEL}`}
            </span>
          </div>
          <p className="text-[10px] opacity-90 mt-0.5 leading-tight">
            {isCurrentMastered
              ? 'Mastery Achieved! You may now freely evolve to advanced classes or branch into new paths.'
              : `Cannot change class yet! Train your current class to Lv. ${MAX_JOB_LEVEL} to unlock Class Evolution.`}
          </p>
        </div>
      </div>

      {/* 3 Paths Tab Switcher */}
      <div className="grid grid-cols-3 gap-1.5 mb-3 shrink-0">
        {[
          { id: 'MARTIAL', label: 'Bushido', sub: 'The Martial Path (Warrior)' },
          { id: 'ARCANE', label: 'Onmyodo', sub: 'The Arcane Path (Mage)' },
          { id: 'DIVINE', label: 'Shinto', sub: 'The Divine Path (Priest)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              soundManager.playClick();
              setSelectedPath(tab.id as ClassPath);
            }}
            className={`py-1.5 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
              selectedPath === tab.id
                ? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-[11px] font-black">{tab.label}</span>
            <span className="text-[8px] opacity-80 truncate max-w-full">{tab.sub}</span>
          </button>
        ))}
      </div>

      {/* Class Cards for Selected Path */}
      <div className="flex flex-col space-y-2.5 pb-6">
        {pathJobs.map(jobType => {
          const jobDef = JOB_DEFINITIONS[jobType];
          const progress = player.jobs[jobType] || { level: 1, exp: 0 };
          const isSelected = currentJob === jobType;
          const maxExp = EXP_TABLE[progress.level] || 100;
          const expPercent = Math.min(100, Math.floor((progress.exp / maxExp) * 100));
          const legWeapon = jobDef.legendaryWeaponId ? WEAPON_MAP[jobDef.legendaryWeaponId] : null;
          const mythicWeapon = MYTHIC_WEAPON_BY_JOB[jobType] || null;
          const ownsMythic = Boolean(mythicWeapon && player.inventory.some(w => w.id === mythicWeapon.id));
          const classSkins = SKINS_BY_CLASS[jobType] || [];
          const equippedSkinFolder = player.equippedSkins?.[jobType] || `${jobType.toLowerCase()}_default`;

          return (
            <div
              key={jobType}
              className={`rounded-xl border p-3 transition-all ${
                isSelected
                  ? 'border-amber-500 bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  {/* Sprite Preview with equipped skin */}
                  <div className="w-14 h-16 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-inner">
                    <SpriteRenderer job={jobType} skin={player.equippedSkins?.[jobType]} scale={0.65} />
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <ClassIcon job={jobType} size="md" />
                      <h3 className="font-black text-sm text-slate-100">{jobDef.name}</h3>
                      {jobDef.isBase ? (
                        <span className="text-[8px] font-black text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 px-1.5 py-0.2 rounded">
                          BASE CLASS
                        </span>
                      ) : (
                        <span className="text-[8px] font-black text-purple-300 bg-purple-950/80 border border-purple-500/50 px-1.5 py-0.2 rounded">
                          EVOLUTION
                        </span>
                      )}
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 rounded border border-amber-500/30">
                        Lv.{progress.level}
                      </span>
                    </div>
                    {/* Japanese Samurai / WoW Subtitle */}
                    <p className="text-[10px] text-amber-300/90 font-medium">{jobDef.jpName}</p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[9px] text-cyan-400 font-semibold">{jobDef.role}</span>
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          setExpandedSkinJob(expandedSkinJob === jobType ? null : jobType);
                        }}
                        className="flex items-center space-x-1 text-[8px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        <Shirt className="w-2.5 h-2.5 text-amber-400" />
                        <span>
                          Skins ({classSkins.filter(s => player.unlockedSkins?.[s.id]).length}/{classSkins.length})
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Switch Button with Mastery Gating */}
                {isSelected ? (
                  <span className="flex items-center space-x-1 text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/50 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                    <Check className="w-3.5 h-3.5" />
                    <span>ACTIVE</span>
                  </span>
                ) : !isCurrentMastered ? (
                  <button
                    disabled
                    title={`Master current class at Lv. ${MAX_JOB_LEVEL} first`}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed flex items-center space-x-1 opacity-70"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      soundManager.playLevelUp();
                      gameActions.switchJob(jobType);
                    }}
                    className="text-xs font-black px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 border border-amber-300 transition-all shadow-[0_0_12px_rgba(245,158,11,0.5)] active:scale-95"
                  >
                    Advance
                  </button>
                )}
              </div>

              {/* Expandable Class Skins Selector */}
              {expandedSkinJob === jobType && (
                <div className="mt-3 p-2.5 bg-slate-950/95 rounded-xl border border-amber-500/40 shadow-inner">
                  <div className="text-[10px] font-bold text-amber-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{jobDef.name} Skins</span>
                    </span>
                    <span className="text-[8px] text-slate-400">Summon skins in the Gacha Hall</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {classSkins.map(skin => {
                      const isUnlocked = !!player.unlockedSkins?.[skin.id];
                      const isEquipped = equippedSkinFolder === skin.folderName;
                      return (
                        <div
                          key={skin.id}
                          className={`p-2 rounded-lg border flex items-center space-x-2 transition-all ${
                            isEquipped
                              ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                              : isUnlocked
                              ? 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
                              : 'bg-slate-950/80 border-slate-900 opacity-60'
                          }`}
                        >
                          <div className="w-14 h-16 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                            <SpriteRenderer job={jobType} skin={skin.folderName} scale={0.65} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] font-bold text-slate-200 truncate">{skin.name}</span>
                              <span className="text-[8px] text-amber-400 font-bold">{skin.rarity}-Star</span>
                            </div>
                            <p className="text-[8px] text-amber-300/80 font-medium truncate">{skin.title}</p>
                            <p className="text-[8px] text-slate-400 line-clamp-1">{skin.description}</p>
                            <div className="mt-1">
                              {isEquipped ? (
                                <span className="text-[8px] font-black text-amber-400 bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 rounded">
                                  EQUIPPED
                                </span>
                              ) : isUnlocked ? (
                                <button
                                  onClick={() => {
                                    soundManager.playClick();
                                    gameActions.equipSkin(jobType, skin.folderName);
                                  }}
                                  className="text-[8px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-2 py-0.5 rounded transition-all shadow cursor-pointer"
                                >
                                  Equip Skin
                                </button>
                              ) : (
                                <span className="text-[8px] font-semibold text-slate-500 flex items-center space-x-0.5">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Locked (Gacha)</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EXP Progress bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[9px] text-slate-400 mb-0.5 font-mono">
                  <span>CLASS EXP</span>
                  <span>{progress.exp} / {maxExp}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300" style={{ width: `${expPercent}%` }} />
                </div>
              </div>

              {/* Passive Description & Weapons */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-300">
                <div className="flex items-center space-x-1 text-amber-300 font-bold mb-0.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Trait: {jobDef.passiveName}</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-snug">{jobDef.passiveDescription}</p>

                {/* Class-Story Animated Mythic Sword */}
                {mythicWeapon && (
                  <div className="mt-2 p-1.5 rounded-lg bg-gradient-to-r from-rose-950/60 via-slate-950/90 to-amber-950/40 border border-rose-400/70 mythic-card-glow flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <AnimatedWeaponIcon
                        weapon={mythicWeapon}
                        className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.65)]"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-black text-rose-300 uppercase tracking-widest">
                          ✦ CLASS MYTHIC SWORD
                        </span>
                        <span className="text-[10px] font-black text-slate-100 truncate max-w-[185px]">
                          {mythicWeapon.name}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border shrink-0 ${
                      ownsMythic
                        ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/50'
                        : 'text-rose-200 bg-rose-950/80 border-rose-400/50'
                    }`}>
                      {ownsMythic ? '✦ AWAKENED' : 'AWAKENS ON ADVANCE'}
                    </span>
                  </div>
                )}

                {/* Ultimate Legendary Signature Weapon Box */}
                {legWeapon && (
                  <div className="mt-2 p-1.5 rounded-lg bg-slate-950/80 border border-amber-500/50 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {legWeapon.icon || legWeapon.animatedIcon ? (
                        <AnimatedWeaponIcon
                          weapon={legWeapon}
                          className="w-7 h-7 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                        />
                      ) : (
                        <Swords className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">
                          CLASS ARTIFACT WEAPON
                        </span>
                        <span className="text-[10px] font-black text-slate-100 truncate max-w-[190px]">
                          {legWeapon.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-amber-300 bg-amber-950 border border-amber-500/40 px-1.5 py-0.5 rounded shadow">
                      5-STAR LEGENDARY
                    </span>
                  </div>
                )}

                {/* Permanent Passive at Level 10 */}
                <div className="mt-2 flex items-center space-x-1">
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded border flex items-center space-x-1 ${
                    progress.level >= MAX_JOB_LEVEL
                      ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    {progress.level >= MAX_JOB_LEVEL ? <Check className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                    <span>Lv.{MAX_JOB_LEVEL} Mastery Bonus: {jobDef.unlockedLevelPassive(MAX_JOB_LEVEL)?.desc}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
