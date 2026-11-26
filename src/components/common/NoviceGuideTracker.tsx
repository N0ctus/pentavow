import React, { useState } from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { NOVICE_GUIDE_STEPS } from '../../data/noviceGuide';
import { soundManager } from '../../utils/audioManager';
import {
  Compass,
  CheckCircle2,
  Gift,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';

interface NoviceGuideTrackerProps {
  onOpenCodex: () => void;
}

export const NoviceGuideTracker: React.FC<NoviceGuideTrackerProps> = ({ onOpenCodex }) => {
  const store = useGameStore();
  const player = store.player;
  const guide = player.noviceGuide || {
    currentStep: 1,
    completedSteps: [],
    claimedSteps: [],
    isMinimized: false,
    isCompleted: false,
  };

  const [isMinimized, setIsMinimized] = useState(Boolean(guide.isMinimized));

  // If completed and all claimed, optionally hide or show completed state
  if (guide.isCompleted && guide.claimedSteps.length >= 6) {
    return null;
  }

  const currentStepDef = NOVICE_GUIDE_STEPS.find(s => s.step === guide.currentStep) || NOVICE_GUIDE_STEPS[0];
  const isCurrentCompleted = guide.completedSteps.includes(currentStepDef.step);
  const isCurrentClaimed = guide.claimedSteps.includes(currentStepDef.step);
  const progressPercent = Math.min(100, Math.round((guide.claimedSteps.length / 6) * 100));

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playVictory();
    gameActions.claimNoviceReward(currentStepDef.step);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    if (currentStepDef.tabTarget) {
      gameActions.setActiveTab(currentStepDef.tabTarget);
    }
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    const next = !isMinimized;
    setIsMinimized(next);
    gameActions.toggleNoviceGuide(next);
  };

  return (
    <div className="w-full px-2.5 pt-2 z-20 pointer-events-none select-none animate-fadeIn">
      <div
        className={`w-full pointer-events-auto rounded-xl border transition-all duration-300 shadow-xl backdrop-blur-md ${
          isCurrentCompleted && !isCurrentClaimed
            ? 'bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-amber-950/90 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
            : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
        }`}
      >
        {/* Top Header Row */}
        <div
          onClick={toggleMinimize}
          className="flex items-center justify-between px-3 py-1.5 cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                isCurrentCompleted && !isCurrentClaimed
                  ? 'bg-amber-400 text-slate-950 animate-bounce'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isCurrentCompleted && !isCurrentClaimed ? (
                <Gift className="w-3 h-3" />
              ) : (
                <Compass className="w-3 h-3" />
              )}
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                Novice Guide
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-slate-950/70 border border-slate-800 text-slate-400">
                Step {guide.currentStep}/6
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Quick Open Codex Button */}
            <button
              onClick={e => {
                e.stopPropagation();
                soundManager.playClick();
                onOpenCodex();
              }}
              title="Open Hunter's Codex Guidebook"
              className="px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30 flex items-center gap-1 transition-colors"
            >
              <BookOpen className="w-2.5 h-2.5" />
              <span>Codex</span>
            </button>

            {/* Minimize / Expand Toggle */}
            <button
              onClick={toggleMinimize}
              className="p-1 text-slate-400 hover:text-slate-200 rounded"
              title={isMinimized ? 'Expand Guide' : 'Collapse Guide'}
            >
              {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Body */}
        {!isMinimized && (
          <div className="px-3 pb-2.5 pt-0.5 border-t border-slate-800/60 flex flex-col space-y-1.5">
            {/* Objective & Description */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-[11px] font-bold text-slate-100 flex items-center gap-1">
                  <span>{currentStepDef.title}</span>
                  {isCurrentCompleted && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
                  )}
                </h4>
                <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
                  {currentStepDef.shortDesc}
                </p>
                <p className="text-[9px] text-amber-300/80 italic mt-0.5">
                  💡 {currentStepDef.hint}
                </p>
              </div>

              {/* Action / Claim Button */}
              <div className="shrink-0 flex flex-col items-end">
                {isCurrentCompleted && !isCurrentClaimed ? (
                  <button
                    onClick={handleClaim}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md animate-pulse active:scale-95 transition-transform flex items-center gap-1"
                  >
                    <Gift className="w-3 h-3" />
                    <span>Claim</span>
                  </button>
                ) : currentStepDef.tabTarget && currentStepDef.tabTarget !== store.activeTab ? (
                  <button
                    onClick={handleActionClick}
                    className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-900/60 text-cyan-300 text-[9px] font-bold flex items-center gap-1 transition-colors active:scale-95"
                  >
                    <span>Go to {currentStepDef.tabTarget}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                ) : (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    Reward: {currentStepDef.rewardLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full flex items-center space-x-1.5 pt-0.5">
              <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[8px] font-mono text-slate-400 font-bold shrink-0">
                {guide.claimedSteps.length}/6 Claimed
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
