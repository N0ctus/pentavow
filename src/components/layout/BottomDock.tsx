import React from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { Map, Shield, User, Sparkles, Swords, Zap, Flag, Heart, Flame } from 'lucide-react';
import { getElementColor, getElementalMultiplier } from '../../utils/combatUtils';
import { WEAPON_MAP } from '../../data/weapons';
import { soundManager } from '../../utils/audioManager';
import { AnimatedWeaponIcon } from '../common/AnimatedWeaponIcon';

interface BottomDockProps {
  onTriggerSkill?: (weaponId: string) => void;
  playerCombatantCooldowns?: Record<string, number>;
  playerCombatantEther?: Record<string, number>;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  onTriggerSkill,
  playerCombatantCooldowns = {},
  playerCombatantEther = {}
}) => {
  const store = useGameStore();
  const isBattle = store.view === 'BATTLE';

  // If in Overworld: show the 4 Navigation Tabs
  if (!isBattle) {
    return (
      <nav className="h-20 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-2 flex items-center justify-around select-none z-30 shrink-0">
        <button
          onClick={() => {
            soundManager.playClick();
            gameActions.setActiveTab('MAP');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-lg transition-all ${
            store.activeTab === 'MAP'
              ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map className="w-5 h-5 mb-1" />
          <span className="text-[11px]">Map</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            gameActions.setActiveTab('EQUIP');
            gameActions.completeNoviceStep(2);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-lg transition-all ${
            store.activeTab === 'EQUIP'
              ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-5 h-5 mb-1" />
          <span className="text-[11px]">Equip</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            gameActions.setActiveTab('JOBS');
            gameActions.completeNoviceStep(5);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-lg transition-all ${
            store.activeTab === 'JOBS'
              ? 'text-purple-400 bg-purple-950/40 border border-purple-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-[11px]">Jobs</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            gameActions.setActiveTab('SUMMON');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-lg transition-all relative ${
            store.activeTab === 'SUMMON'
              ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-1 text-amber-400 animate-pulse" />
          <span className="text-[11px]">Astral Summon</span>
          {store.player.tesseraShards >= 100 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
      </nav>
    );
  }

  // If in Battle: Show 5-Slot Weapon Hotbar + Utility controls
  const equippedWeapons = store.player.equippedWeaponIds
    .map(id => WEAPON_MAP[id])
    .filter(Boolean);

  const activeBattle = store.activeBattleId ? store.battles[store.activeBattleId] : null;
  const enemyElement = activeBattle?.enemyElement || activeBattle?.enemy?.element;

  return (
    <div className="h-40 w-full bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex flex-col justify-between select-none z-30 shrink-0">
      {/* Top Utility Bar: Auto-Battle Toggle & Flee Button */}
      <div className="flex items-center justify-between px-2 pt-0.5">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => gameActions.toggleAutoBattle()}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center space-x-1.5 border transition-all ${
              store.autoBattle
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Zap className={`w-3 h-3 ${store.autoBattle ? 'text-amber-400 fill-amber-400 animate-bounce' : ''}`} />
            <span>AUTO: {store.autoBattle ? 'ON' : 'OFF'}</span>
          </button>
          <span className="text-[10px] text-slate-400 font-medium">
            {store.autoBattle ? 'Auto-striking every 2.0s' : '⚡ Tap cards or boss to strike!'}
          </span>
        </div>

        <button
          onClick={() => gameActions.fleeBattle()}
          className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 flex items-center space-x-1 active:scale-95 transition-transform"
        >
          <Flag className="w-3 h-3" />
          <span>Flee</span>
        </button>
      </div>

      {/* 5-Slot Weapon Hotbar */}
      <div className="grid grid-cols-5 gap-1.5 pb-1 px-1">
        {Array.from({ length: 5 }).map((_, slotIdx) => {
          const weapon = equippedWeapons[slotIdx];
          if (!weapon) {
            if (slotIdx === 0 && equippedWeapons.length === 0) {
              return (
                <button
                  key="unarmed-basic-slot"
                  onClick={() => onTriggerSkill && onTriggerSkill('__unarmed__')}
                  className="relative h-24 rounded-lg border-2 border-amber-400/70 bg-slate-900 hover:brightness-110 flex flex-col items-center justify-between p-1 transition-all active:scale-95"
                >
                  <div className="w-full flex items-center justify-between text-[7px]">
                    <span className="font-black px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      BASIC
                    </span>
                    <span className="text-emerald-400 font-bold">UNARMED</span>
                  </div>
                  <div className="flex flex-col items-center justify-center my-auto text-center">
                    <Swords className="w-6 h-6 mb-0.5 text-amber-300" />
                    <span className="text-[8.5px] font-black text-slate-100 leading-tight">
                      Basic Strike
                    </span>
                  </div>
                  <span className="text-[7px] text-emerald-400 font-mono font-bold">READY</span>
                </button>
              );
            }
            return (
              <div
                key={`empty-slot-${slotIdx}`}
                className="h-24 rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center text-slate-600"
              >
                <span className="text-[10px] font-bold">Slot {slotIdx + 1}</span>
                <span className="text-[8px] text-slate-500">Farm Mobs</span>
              </div>
            );
          }

          const cd = playerCombatantCooldowns[weapon.id] || 0;
          const ether = Math.min(100, playerCombatantEther[weapon.id] || 0);
          const isReadyUlt = ether >= 100;
          const isOnCooldown = cd > 0;
          const isReady = !isOnCooldown && !isReadyUlt;
          const elemColor = getElementColor(weapon.element);
          const isMainWeapon = slotIdx === 0;

          // Check if this weapon has an elemental advantage against the current enemy
          const isWeaknessAdvantage = enemyElement ? getElementalMultiplier(weapon.element, enemyElement) > 1.2 : false;

          // Role badge info (HEAL, DEF, DMG)
          const isHeal = weapon.effectType === 'HEAL';
          const isDef = weapon.effectType === 'BUFF_DEF';

          return (
            <button
              key={weapon.id}
              disabled={isOnCooldown && !isReadyUlt}
              onClick={() => onTriggerSkill && onTriggerSkill(weapon.id)}
              className={`relative h-24 rounded-lg flex flex-col items-center justify-between p-1 transition-all active:scale-95 overflow-hidden ${
                isReadyUlt
                  ? 'border-2 border-amber-400 bg-gradient-to-t from-amber-950 via-slate-900 to-amber-950 shadow-[0_0_18px_rgba(245,158,11,0.9)] animate-pulse'
                  : isReady
                  ? 'border bg-slate-900 hover:brightness-110'
                  : 'border border-slate-800 bg-slate-950/80 opacity-80'
              }`}
              style={{
                borderColor: isReadyUlt ? '#fbbf24' : isReady ? elemColor : '#334155',
                boxShadow: isReadyUlt
                  ? '0 0 16px rgba(245, 158, 11, 0.75)'
                  : isReady
                  ? `0 0 10px ${elemColor}44`
                  : undefined
              }}
            >
              {/* Cooldown frosted dark overlay */}
              {isOnCooldown && !isReadyUlt && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
                  <span className="text-sm font-black text-white font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {cd.toFixed(1)}s
                  </span>
                  <span className="text-[7px] text-slate-400 uppercase tracking-widest mt-0.5">COOLDOWN</span>
                </div>
              )}

              {/* Slot Header: Element + Role Badge + Slot marker */}
              <div className="w-full flex items-center justify-between text-[8px] z-10">
                <div className="flex items-center space-x-0.5">
                  <span
                    className="font-black px-1 py-0.2 rounded text-[7px] uppercase tracking-wider border shadow-sm"
                    style={{
                      backgroundColor: `${elemColor}22`,
                      color: elemColor,
                      borderColor: `${elemColor}60`
                    }}
                  >
                    {weapon.element}
                  </span>
                  {isMainWeapon && (
                    <span className="text-[6px] font-black uppercase text-amber-300 bg-amber-950/80 border border-amber-500/40 px-0.5 rounded">
                      MAIN
                    </span>
                  )}
                </div>

                {/* Role / Weakness Indicator */}
                {isWeaknessAdvantage ? (
                  <span className="text-[6px] font-black text-amber-300 bg-amber-950/90 border border-amber-400/80 px-1 rounded shadow animate-pulse">
                    ⚡1.5x
                  </span>
                ) : isHeal ? (
                  <span className="text-[6px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/60 px-0.5 rounded flex items-center">
                    <Heart className="w-1.5 h-1.5 text-emerald-400 fill-emerald-400 mr-0.5" />
                    HEAL
                  </span>
                ) : isDef ? (
                  <span className="text-[6px] font-black text-sky-300 bg-sky-950/80 border border-sky-500/60 px-0.5 rounded flex items-center">
                    <Shield className="w-1.5 h-1.5 text-sky-400 mr-0.5" />
                    DEF
                  </span>
                ) : (
                  <span className="text-[7px] font-bold text-amber-400">
                    {weapon.rarity}★
                  </span>
                )}
              </div>

              {/* Weapon Icon & Skill Name */}
              <div className="flex flex-col items-center justify-center my-auto text-center w-full z-10">
                {weapon.icon || weapon.animatedIcon ? (
                  <AnimatedWeaponIcon
                    weapon={weapon}
                    className="w-7 h-7 mb-0.5 filter drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                  />
                ) : (
                  <Swords
                    className="w-5 h-5 mb-0.5 transition-transform"
                    style={{ color: isReadyUlt ? '#fbbf24' : elemColor }}
                  />
                )}
                <span className={`text-[8.5px] font-black truncate w-full leading-tight ${isReadyUlt ? 'text-amber-200' : 'text-slate-100'}`}>
                  {isReadyUlt ? weapon.ultimateSkillName : weapon.activeSkillName}
                </span>
              </div>

              {/* Ether Gauge Fill Bar & Ready Status */}
              <div className="w-full mt-auto z-10">
                <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-700 overflow-hidden relative shadow-inner">
                  <div
                    className={`h-full transition-all duration-200 ${
                      isReadyUlt
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 animate-pulse'
                        : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                    }`}
                    style={{ width: `${ether}%` }}
                  />
                  {isReadyUlt && (
                    <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-slate-950 uppercase tracking-wider">
                      ⚡ ULTIMATE
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[7px] text-slate-400 font-mono mt-0.5">
                  <span className={isReady ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {isReady ? 'READY' : 'ETH'}
                  </span>
                  <span>{Math.floor(ether)}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
