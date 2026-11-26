import React, { useState } from 'react';
import { JOB_DEFINITIONS } from '../../data/jobs';
import { gameActions } from '../../state/useGameStore';
import { soundManager } from '../../utils/audioManager';
import { SpriteRenderer } from '../common/SpriteRenderer';
import { ClassIcon } from '../common/ClassIcon';
import { BookOpen, ChevronLeft, ChevronRight, Shield, Sparkles, Swords, User } from 'lucide-react';

type BaseJobChoice = 'WARRIOR' | 'MAGE' | 'PRIEST';

const MAIN_CLASSES: Array<{
  job: BaseJobChoice;
  pathLabel: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  summary: string;
}> = [
  {
    job: 'WARRIOR',
    pathLabel: 'Martial Path • 5 Evolutions',
    accentBorder: 'border-amber-400',
    accentBg: 'bg-amber-950/35',
    accentText: 'text-amber-300',
    summary: 'Frontline blade & shield master with high HP, heavy steel cleaves, and strong threat control.',
  },
  {
    job: 'MAGE',
    pathLabel: 'Arcane Path • 4 Evolutions',
    accentBorder: 'border-cyan-400',
    accentBg: 'bg-cyan-950/35',
    accentText: 'text-cyan-300',
    summary: 'Elemental spellcaster wielding Fire, Water & Wind staves to shatter enemy elemental weaknesses.',
  },
  {
    job: 'PRIEST',
    pathLabel: 'Divine Path • 5 Evolutions',
    accentBorder: 'border-emerald-400',
    accentBg: 'bg-emerald-950/35',
    accentText: 'text-emerald-300',
    summary: 'Sacred guardian who restores party HP, empowers ally attacks, and evolves into Paladin or Evoker.',
  },
];

export const HeroOnboardingModal: React.FC = () => {
  const [step, setStep] = useState<'STORY' | 'NAME' | 'CLASS'>('STORY');
  const [heroName, setHeroName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedClass, setSelectedClass] = useState<BaseJobChoice>('WARRIOR');

  const handleContinueFromName = () => {
    const trimmed = heroName.trim();
    if (!trimmed) {
      setNameError('Please enter a hero name before continuing.');
      return;
    }
    soundManager.playClick();
    setNameError('');
    setStep('CLASS');
  };

  const handleFinish = () => {
    const trimmed = heroName.trim();
    if (!trimmed) {
      setStep('NAME');
      setNameError('Please enter a hero name.');
      return;
    }
    soundManager.playUltimate();
    gameActions.completeHeroOnboarding(trimmed, selectedClass);
  };

  return (
    <div className="absolute inset-0 z-[65] bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="w-full max-w-[400px] max-h-[92%] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/70 rounded-2xl p-4 shadow-[0_0_45px_rgba(245,158,11,0.3)] flex flex-col overflow-y-auto">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider pb-3 border-b border-slate-800 shrink-0">
          <span className={step === 'STORY' ? 'text-amber-300' : 'text-emerald-400'}>
            1. Hero Calling
          </span>
          <span className="text-slate-600">→</span>
          <span className={step === 'NAME' ? 'text-amber-300' : step === 'CLASS' ? 'text-emerald-400' : 'text-slate-500'}>
            2. Name
          </span>
          <span className="text-slate-600">→</span>
          <span className={step === 'CLASS' ? 'text-amber-300' : 'text-slate-500'}>
            3. Main Class
          </span>
        </div>

        {/* STEP 1: WELCOME STORY */}
        {step === 'STORY' && (
          <div className="mt-3 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-amber-300 uppercase tracking-wide">
                    Awakening in Kamigawa Sanctuary
                  </h2>
                  <p className="text-[10px] text-slate-400">Prologue of the Astral Realms</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-[11px] text-slate-200 leading-relaxed shadow-inner">
                <p>
                  Welcome, <strong className="text-amber-300">Hero</strong>. Ancient rifts have torn open across{' '}
                  <strong className="text-cyan-300">6 Story Realms</strong> and{' '}
                  <strong className="text-cyan-300">72 Battleground Worlds</strong>, unleashing roaming monsters,
                  Corner Wardens, and colossal <strong className="text-rose-300">World Bosses</strong>.
                </p>
                <p>
                  From the safe grounds of Kamigawa Sanctuary, you will venture into wild territories, master elemental
                  weapons, clear multi-wave Dungeons, and conquer trials to forge{' '}
                  <strong className="text-amber-300">5-Star Legendary Artifacts</strong> and{' '}
                  <strong className="text-fuchsia-300">Mythic Blades</strong>—alone or alongside fellow hunters in Co-op.
                </p>
                <p className="text-amber-200/95 font-semibold">
                  Step forward, claim your name, and choose the combat path that will define your legend.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setStep('NAME');
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              <span>Accept Your Calling</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: CHOOSE HERO NAME */}
        {step === 'NAME' && (
          <div className="mt-3 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-cyan-200 uppercase tracking-wide">
                    Name Your Hero
                  </h2>
                  <p className="text-[10px] text-slate-400">Visible in Sanctuary &amp; Co-op Raids</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  Hero Name (1–16 characters)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  autoFocus
                  value={heroName}
                  onChange={e => {
                    setHeroName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleContinueFromName();
                  }}
                  placeholder="Enter your hero name..."
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-bold text-amber-200 placeholder-slate-500 outline-none transition-colors"
                />
                {nameError && (
                  <p className="text-[10px] font-semibold text-rose-400">{nameError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setStep('STORY');
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleContinueFromName}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <span>Choose Class</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE ONE OF THE 3 MAIN CLASSES */}
        {step === 'CLASS' && (
          <div className="mt-3 flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-amber-400" />
                    <span>Choose Your Starting Class</span>
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    Hero: <strong className="text-cyan-300">{heroName.trim()}</strong> • Advance at Lv. 10 into 14+ specializations
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {MAIN_CLASSES.map(cfg => {
                  const def = JOB_DEFINITIONS[cfg.job];
                  const isSelected = selectedClass === cfg.job;
                  const defaultSkin = `${cfg.job.toLowerCase()}_default`;

                  return (
                    <button
                      key={cfg.job}
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedClass(cfg.job);
                      }}
                      className={`w-full text-left rounded-xl border-2 p-2.5 transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? `${cfg.accentBorder} ${cfg.accentBg} shadow-[0_0_16px_rgba(245,158,11,0.25)]`
                          : 'border-slate-800 bg-slate-900/75 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-14 h-16 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        <SpriteRenderer
                          job={cfg.job}
                          skin={defaultSkin}
                          scale={0.7}
                          isPlayer={false}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <ClassIcon job={cfg.job} size="sm" showTooltip={false} />
                            <span className="text-xs font-black text-white">{def.name}</span>
                            <span className={`text-[9px] font-bold ${cfg.accentText}`}>{def.role}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{cfg.pathLabel}</p>
                        <p className="text-[10px] text-slate-300 leading-snug mt-0.5">{cfg.summary}</p>
                        <p className="text-[9px] text-amber-300/90 mt-0.5 flex items-center gap-1">
                          {cfg.job === 'WARRIOR' ? (
                            <Shield className="w-2.5 h-2.5 shrink-0" />
                          ) : (
                            <Sparkles className="w-2.5 h-2.5 shrink-0" />
                          )}
                          <span className="truncate">Passive: {def.passiveName}</span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setStep('NAME');
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
              >
                Start Adventure as {JOB_DEFINITIONS[selectedClass].name}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
