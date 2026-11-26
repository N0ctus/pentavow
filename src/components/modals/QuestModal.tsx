import React, { useState } from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { QUESTS } from '../../data/quests';
import { WEAPON_MAP } from '../../data/weapons';
import { soundManager } from '../../utils/audioManager';
import { Scroll, Check, Coins, Gem, X, Swords } from 'lucide-react';
import { AnimatedWeaponIcon } from '../common/AnimatedWeaponIcon';

interface QuestModalProps {
  onClose: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ onClose }) => {
  const store = useGameStore();
  const player = store.player;
  const [filter, setFilter] = useState<'ALL' | 'MYTHIC' | 'ARTIFACTS' | 'DAILY'>('ALL');

  const filteredQuests = QUESTS.filter(q => {
    if (filter === 'MYTHIC') return Boolean(q.isMythicQuest);
    if (filter === 'ARTIFACTS') return Boolean(q.isClassQuest && !q.isMythicQuest);
    if (filter === 'DAILY') return !q.isClassQuest;
    return true;
  });

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="w-full max-w-[420px] max-h-[92%] bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center">
              <Scroll className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-100 flex items-center space-x-1.5">
                <span>Bounty Board, Artifacts & Mythics</span>
              </h3>
              <p className="text-[10px] text-amber-300">Complete Trials to Unlock 5★ Legendaries & ✦ Mythic Blades</p>
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

        {/* Filter Pills */}
        <div className="grid grid-cols-4 gap-1 my-2 shrink-0">
          {[
            { id: 'ALL', label: 'All Quests' },
            { id: 'MYTHIC', label: '✦ Mythic' },
            { id: 'ARTIFACTS', label: '★ Legend' },
            { id: 'DAILY', label: 'Bounties' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                soundManager.playClick();
                setFilter(t.id as typeof filter);
              }}
              className={`py-1 text-[10px] font-black rounded-lg border transition-all ${
                filter === t.id
                  ? t.id === 'MYTHIC'
                    ? 'bg-rose-500/25 text-rose-200 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.45)]'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400 shadow'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Quests List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pb-2">
          {filteredQuests.map(q => {
            const isCompleted = player.completedQuests.includes(q.id);
            const currentProg = Math.min(q.requiredCount, player.questProgress[q.id] || 0);
            const hasSecondary = Boolean(q.secondaryRequiredCount && q.secondaryRequiredCount > 0);
            const secTarget = q.secondaryRequiredCount || 0;
            const currentSecProg = hasSecondary
              ? Math.min(secTarget, player.questSecondaryProgress?.[q.id] || 0)
              : 0;
            const primaryDone = currentProg >= q.requiredCount;
            const secondaryDone = !hasSecondary || currentSecProg >= secTarget;
            const isReadyToClaim = !isCompleted && primaryDone && secondaryDone;
            const rewardWeapon = q.rewardWeaponId ? WEAPON_MAP[q.rewardWeaponId] : null;
            const isMythic = Boolean(q.isMythicQuest || rewardWeapon?.isMythic);

            return (
              <div
                key={q.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/20 opacity-70'
                    : isMythic
                    ? 'border-rose-500/70 bg-gradient-to-br from-rose-950/35 via-slate-900 to-slate-950 shadow-[0_0_14px_rgba(244,63,94,0.22)]'
                    : q.isClassQuest
                    ? 'border-amber-500/70 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : isReadyToClaim
                    ? 'border-amber-400 bg-amber-950/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${isMythic ? 'text-rose-400' : 'text-amber-400'}`}>
                        {q.giver}
                      </span>
                      {isMythic ? (
                        <span className="text-[8px] font-black text-rose-200 bg-rose-950/90 border border-rose-400/60 px-1.5 rounded">
                          ✦ MYTHIC TRIAL {q.requiredJob ? `• ${q.requiredJob.replace(/_/g, ' ')}` : ''}
                        </span>
                      ) : q.isClassQuest ? (
                        <span className="text-[8px] font-black text-yellow-300 bg-yellow-950/80 border border-yellow-500/50 px-1.5 rounded">
                          ★ LEGENDARY {q.requiredJob ? `• ${q.requiredJob.replace(/_/g, ' ')}` : ''}
                        </span>
                      ) : null}
                    </div>
                    <h4 className="font-black text-xs text-slate-100 mt-0.5">{q.title}</h4>
                  </div>
                  {isCompleted && (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center space-x-1 shrink-0">
                      <Check className="w-2.5 h-2.5" />
                      <span>CLAIMED</span>
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 mt-1 leading-snug">{q.description}</p>

                {/* Legendary / Mythic Weapon Reward Box */}
                {rewardWeapon && (
                  <div
                    className={`mt-2 p-1.5 rounded-lg bg-slate-950/90 border flex items-center justify-between ${
                      isMythic ? 'border-rose-400/65' : 'border-amber-400/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {rewardWeapon.icon || rewardWeapon.animatedIcon ? (
                        <AnimatedWeaponIcon
                          weapon={rewardWeapon}
                          className="w-8 h-8 shrink-0 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.65)]"
                        />
                      ) : (
                        <Swords className="w-4 h-4 text-amber-400" />
                      )}
                      <div className="flex flex-col">
                        <span
                          className={`text-[8px] font-black uppercase tracking-widest ${
                            isMythic ? 'text-rose-300' : 'text-amber-400'
                          }`}
                        >
                          {isMythic
                            ? 'ANIMATED MYTHIC UNLOCK'
                            : q.requiredCount >= 100
                            ? '100-KILL BOUNTY 5★'
                            : 'CLASS LEGENDARY 5★'}
                        </span>
                        <span className="text-[10px] font-black text-slate-100">
                          {rewardWeapon.name}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.5 rounded border shrink-0 ${
                        isMythic
                          ? 'text-rose-200 bg-rose-950 border-rose-400/50'
                          : 'text-amber-300 bg-amber-950 border-amber-500/40'
                      }`}
                    >
                      {isMythic ? '✦ MYTHIC' : '5-STAR'}
                    </span>
                  </div>
                )}

                {/* Primary Objective Progress Bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono mb-0.5">
                    <span>{hasSecondary ? 'OBJECTIVE 1' : 'PROGRESS'}</span>
                    <span>{currentProg} / {q.requiredCount}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all ${
                        primaryDone ? (isMythic ? 'bg-rose-400' : 'bg-amber-400') : 'bg-cyan-400'
                      }`}
                      style={{ width: `${(currentProg / q.requiredCount) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Secondary Trial Objective Bar (Bosses / Dungeons / Combat Trial) */}
                {hasSecondary && (
                  <div className="mt-1.5">
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono mb-0.5">
                      <span>{q.secondaryLabel || 'TRIAL OBJECTIVE'}</span>
                      <span>{currentSecProg} / {secTarget}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all ${
                          secondaryDone ? (isMythic ? 'bg-rose-400' : 'bg-amber-400') : 'bg-purple-400'
                        }`}
                        style={{ width: `${(currentSecProg / secTarget) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Rewards & Claim Button */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[10px]">
                    <div className="flex items-center space-x-0.5 text-amber-300 font-mono font-bold">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>+{q.rewardGold}</span>
                    </div>
                    <div className="flex items-center space-x-0.5 text-cyan-300 font-mono font-bold">
                      <Gem className="w-3 h-3 text-cyan-400" />
                      <span>+{q.rewardShards}</span>
                    </div>
                  </div>

                  {isReadyToClaim && (
                    <button
                      onClick={() => {
                        const ok = gameActions.claimQuestReward(q.id);
                        if (ok) soundManager.playVictory();
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 ${
                        isMythic
                          ? 'bg-gradient-to-r from-rose-500 to-amber-400 text-slate-950 shadow-[0_0_12px_rgba(244,63,94,0.55)]'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      }`}
                    >
                      {isMythic ? 'Awaken Mythic' : 'Claim Reward'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
