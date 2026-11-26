import React from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { DUNGEONS } from '../../data/dungeons';
import { soundManager } from '../../utils/audioManager';
import { getElementBgClass, getElementColor } from '../../utils/combatUtils';
import { Castle, Skull, Swords, Coins, Gem, Sparkles, X, ChevronRight } from 'lucide-react';

interface DungeonModalProps {
  onClose: () => void;
}

export const DungeonModal: React.FC<DungeonModalProps> = ({ onClose }) => {
  const store = useGameStore();

  const handleStartDungeon = (dungeonId: string) => {
    soundManager.playUltimate();
    gameActions.startDungeonBattle(dungeonId);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="w-full max-w-[400px] max-h-[90%] bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-purple-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(139,92,246,0.35)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center">
              <Castle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-100">Elemental Dungeon Trials</h3>
              <p className="text-[10px] text-purple-300">3-Wave Co-op Expeditions with Boss Raids</p>
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

        {/* Dungeons List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {DUNGEONS.map(d => {
            const elemColor = getElementColor(d.element);
            return (
              <div
                key={d.id}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getElementBgClass(d.element)}`}>
                      {d.element} ELEMENT
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      Rec. Lv.{d.recommendedLevel}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-slate-100">{d.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{d.description}</p>

                  {/* 3 Waves breakdown */}
                  <div className="mt-2.5 bg-slate-950/70 rounded-lg p-2 border border-slate-800/80">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Expedition Waves (3 Stages)
                    </span>
                    <div className="flex items-center justify-between text-[9px] text-slate-300 font-mono">
                      <span>W1: {d.waves[0].enemyName}</span>
                      <span>-&gt;</span>
                      <span>W2: {d.waves[1].enemyName}</span>
                      <span>-&gt;</span>
                      <span className="text-amber-400 font-bold">W3: {d.waves[2].enemyName}</span>
                    </div>
                  </div>
                </div>

                {/* Footer: Rewards & Launch Button */}
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[10px]">
                    <div className="flex items-center space-x-0.5 text-amber-300 font-mono font-bold">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>+{d.rewardGold}</span>
                    </div>
                    <div className="flex items-center space-x-0.5 text-cyan-300 font-mono font-bold">
                      <Gem className="w-3 h-3 text-cyan-400" />
                      <span>+{d.rewardShards}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartDungeon(d.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white shadow flex items-center space-x-1"
                  >
                    <span>Enter Raid</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
