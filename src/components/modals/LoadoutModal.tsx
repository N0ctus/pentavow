import React, { useState, useEffect } from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { JOB_DEFINITIONS } from '../../data/jobs';
import { WEAPON_MAP } from '../../data/weapons';
import { CRAFTING_MATERIALS } from '../../data/materials';
import { Weapon } from '../../types/game';
import { getElementBgClass, getElementColor, getRarityBorderClass, REFINEMENT_MILESTONES } from '../../utils/combatUtils';
import { soundManager } from '../../utils/audioManager';
import { Shield, Swords, Plus, Sparkles, Check, Hammer, Coins, Flame, ArrowDownUp, ArrowDown, ArrowUp, Search } from 'lucide-react';
import { AnimatedWeaponIcon } from '../common/AnimatedWeaponIcon';

export type InventorySortField = 'NONE' | 'ATK' | 'MATK' | 'CD';

export const LoadoutModal: React.FC = () => {
  const store = useGameStore();
  const player = store.player;
  const currentJob = player.currentJob;
  const jobDef = JOB_DEFINITIONS[currentJob];
  const [activeSubTab, setActiveSubTab] = useState<'EQUIP' | 'FORGE'>(store.equipSubTab || 'EQUIP');

  useEffect(() => {
    if (store.equipSubTab) {
      setActiveSubTab(store.equipSubTab);
    }
  }, [store.equipSubTab]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedForgeWeaponId, setSelectedForgeWeaponId] = useState<string>(
    player.equippedWeaponIds[0] || player.inventory[0]?.id || ''
  );
  const [forgeSuccessAnim, setForgeSuccessAnim] = useState(false);

  // Inventory Sorting & Filter State (ATK, MATK, CD, Search, Rarity)
  const [sortField, setSortField] = useState<InventorySortField>('NONE');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [weaponSearch, setWeaponSearch] = useState<string>('');
  const [rarityFilter, setRarityFilter] = useState<'ALL' | 'MYTHIC' | 5 | 4 | 3 | 2 | 1>('ALL');

  const handleSortClick = (field: InventorySortField) => {
    soundManager.playClick();
    if (sortField === field) {
      if (field === 'CD') {
        if (sortOrder === 'ASC') {
          setSortOrder('DESC');
        } else {
          setSortField('NONE');
        }
      } else {
        if (sortOrder === 'DESC') {
          setSortOrder('ASC');
        } else {
          setSortField('NONE');
        }
      }
    } else {
      setSortField(field);
      setSortOrder(field === 'CD' ? 'ASC' : 'DESC');
    }
  };

  const equippedWeapons = player.equippedWeaponIds
    .map(id => WEAPON_MAP[id])
    .filter(Boolean);

  // Filter player inventory by current job's allowed weapon categories + search + rarity
  const searchNorm = weaponSearch.trim().toLowerCase();
  const matchesFilter = (w: Weapon) => {
    if (rarityFilter === 'MYTHIC') {
      if (!w.isMythic) return false;
    } else if (rarityFilter !== 'ALL' && w.rarity !== rarityFilter) {
      return false;
    }
    if (!searchNorm) return true;
    return (
      w.name.toLowerCase().includes(searchNorm) ||
      w.element.toLowerCase().includes(searchNorm) ||
      w.category.toLowerCase().includes(searchNorm) ||
      w.activeSkillName.toLowerCase().includes(searchNorm)
    );
  };

  const allowedInventory = player.inventory.filter(
    w => jobDef.allowedWeapons.includes(w.category) && matchesFilter(w)
  );
  const filteredForgeInventory = player.inventory.filter(matchesFilter);

  // Apply sorting by ATK, MATK, or CD
  const sortedInventory = [...allowedInventory].sort((a, b) => {
    if (sortField === 'NONE') return 0;
    const upgA = player.weaponUpgrades[a.id] || 0;
    const upgB = player.weaponUpgrades[b.id] || 0;
    const atkA = Math.floor(a.baseAtk * (1 + upgA * 0.1));
    const atkB = Math.floor(b.baseAtk * (1 + upgB * 0.1));
    const matkA = Math.floor(a.baseMatk * (1 + upgA * 0.1));
    const matkB = Math.floor(b.baseMatk * (1 + upgB * 0.1));

    if (sortField === 'ATK') {
      const diff = atkB - atkA;
      return sortOrder === 'DESC' ? diff : -diff;
    }
    if (sortField === 'MATK') {
      const diff = matkB - matkA;
      return sortOrder === 'DESC' ? diff : -diff;
    }
    if (sortField === 'CD') {
      const diff = a.cooldownSec - b.cooldownSec;
      return sortOrder === 'ASC' ? diff : -diff;
    }
    return 0;
  });

  const selectedForgeWeapon = WEAPON_MAP[selectedForgeWeaponId] || player.inventory[0];
  const forgeUpgLevel = player.weaponUpgrades[selectedForgeWeapon?.id] || 0;

  // Forge requirements calculation
  const forgeGoldCost = (forgeUpgLevel + 1) * 350;
  let reqMatId = 'mat-slime-essence';
  let reqCount = 2;
  if (forgeUpgLevel >= 8) {
    reqMatId = 'mat-abyssal-core';
    reqCount = 1;
  } else if (forgeUpgLevel >= 5) {
    reqMatId = 'mat-gale-feather';
    reqCount = 2;
  } else if (forgeUpgLevel >= 3) {
    reqMatId = 'mat-thorn-fang';
    reqCount = 2;
  }

  const matDef = CRAFTING_MATERIALS[reqMatId];
  const currentMatStock = player.materials[reqMatId] || 0;
  const canRefine = forgeUpgLevel < 10 && player.gold >= forgeGoldCost && currentMatStock >= reqCount;

  const handleRefine = () => {
    if (!canRefine || !selectedForgeWeapon) return;
    const ok = gameActions.upgradeWeapon(selectedForgeWeapon.id);
    if (ok) {
      soundManager.playShield();
      soundManager.playCrit();
      setForgeSuccessAnim(true);
      setTimeout(() => setForgeSuccessAnim(false), 800);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-slate-950 p-3 overflow-y-auto select-none">
      {/* Header & Sub-Tab Switcher */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div>
          <h2 className="text-base font-black text-slate-100 flex items-center space-x-1.5">
            {activeSubTab === 'EQUIP' ? (
              <Swords className="w-4 h-4 text-amber-400" />
            ) : (
              <Hammer className="w-4 h-4 text-cyan-400" />
            )}
            <span>{activeSubTab === 'EQUIP' ? 'Weapon Loadout' : 'Blacksmith Forge'}</span>
          </h2>
          <p className="text-[10px] text-slate-400">
            {activeSubTab === 'EQUIP'
              ? `${jobDef.name} allowed: ${jobDef.allowedWeapons.join(', ')}`
              : 'Refine weapons up to +10 using monster drops'}
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveSubTab('EQUIP');
              gameActions.setEquipSubTab('EQUIP');
            }}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              activeSubTab === 'EQUIP'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Equip
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveSubTab('FORGE');
              gameActions.setEquipSubTab('FORGE');
            }}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              activeSubTab === 'FORGE'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Forge
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: EQUIP LOADOUT */}
      {activeSubTab === 'EQUIP' && (
        <>
          {/* 5-Slot Equipped Hotbar Layout */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Equipped Battle Slots (Tap to Change)</span>
            </h3>

            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 5 }).map((_, slotIdx) => {
                const weapon = equippedWeapons[slotIdx];
                const isMain = slotIdx === 0;
                const isTarget = selectedSlot === slotIdx;

                if (!weapon) {
                  return (
                    <button
                      key={slotIdx}
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedSlot(slotIdx);
                      }}
                      className={`h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 transition-all ${
                        isTarget
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-slate-900/40 text-slate-600 hover:border-slate-700'
                      }`}
                    >
                      <Plus className="w-5 h-5 mb-1" />
                      <span className="text-[9px] font-bold">Slot {slotIdx + 1}</span>
                    </button>
                  );
                }

                const upg = player.weaponUpgrades[weapon.id] || 0;
                const elemColor = getElementColor(weapon.element);

                return (
                  <button
                    key={weapon.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedSlot(slotIdx);
                    }}
                    className={`relative h-28 rounded-xl p-1.5 flex flex-col items-center justify-between border-2 transition-all shadow-md ${
                      isTarget
                        ? 'border-cyan-400 ring-2 ring-cyan-400 bg-slate-800'
                        : 'bg-slate-900/90 hover:brightness-110'
                    }`}
                    style={{ borderColor: isTarget ? '#22d3ee' : elemColor }}
                  >
                    {/* Header Tag */}
                    <div className="w-full flex items-center justify-between text-[8px]">
                      <span
                        className="font-bold px-1 rounded text-[8px]"
                        style={{ backgroundColor: `${elemColor}25`, color: elemColor }}
                      >
                        {weapon.element[0]}
                      </span>
                      {upg > 0 && (
                        <span className={`text-[8px] font-black px-1 rounded border ${
                          upg >= 10
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse'
                            : upg >= 5
                            ? 'text-cyan-300 bg-cyan-950/80 border-cyan-400'
                            : 'text-slate-300 bg-slate-950/80 border-slate-700'
                        }`}>
                          +{upg}
                        </span>
                      )}
                      {isMain && (
                        <span className="text-[7px] font-black uppercase text-amber-300 bg-amber-950/80 px-1 rounded">
                          MAIN
                        </span>
                      )}
                    </div>

                    {/* Weapon Icon & Name */}
                    <div className="flex flex-col items-center justify-center my-auto w-full text-center">
                      {weapon.icon || weapon.animatedIcon ? (
                        <AnimatedWeaponIcon
                          weapon={weapon}
                          className="w-7 h-7 mb-1 filter drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
                        />
                      ) : (
                        <Swords className="w-5 h-5 mb-1" style={{ color: elemColor }} />
                      )}
                      <span className="text-[9px] font-bold text-slate-100 truncate w-full leading-tight">
                        {weapon.name}
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono">
                        +{Math.floor((weapon.baseAtk || weapon.baseMatk) * (1 + upg * 0.1))}
                      </span>
                    </div>

                    {/* Category & Skill */}
                    <div className="w-full text-center border-t border-slate-800 pt-0.5">
                      <span className="text-[7px] text-cyan-400 font-semibold truncate block">
                        {weapon.activeSkillName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inventory Weapon Selection Drawer */}
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>Available Inventory</span>
                  <span className="text-cyan-400 font-mono">({sortedInventory.length})</span>
                </h3>
                {selectedSlot !== null && (
                  <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded">
                    Equipping to Slot {selectedSlot + 1} {selectedSlot === 0 ? '(MAIN)' : ''}
                  </span>
                )}
              </div>

              {/* Sorting Controls: ATK, MATK, CD */}
              <div className="flex items-center space-x-1 text-[10px] bg-slate-950/80 border border-slate-800 p-1 rounded-lg">
                <span className="text-slate-400 flex items-center space-x-0.5 px-1 font-bold text-[9px]">
                  <ArrowDownUp className="w-3 h-3 text-slate-400" />
                  <span>SORT:</span>
                </span>

                {/* Sort by Physical Attack */}
                <button
                  onClick={() => handleSortClick('ATK')}
                  className={`px-2.5 py-1 min-h-[28px] rounded-md font-bold transition-all flex items-center space-x-1 border text-[10px] ${
                    sortField === 'ATK'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title="Sort by Physical Attack (ATK)"
                >
                  <span>ATK</span>
                  {sortField === 'ATK' && (
                    sortOrder === 'DESC' ? <ArrowDown className="w-2.5 h-2.5 text-amber-400" /> : <ArrowUp className="w-2.5 h-2.5 text-amber-400" />
                  )}
                </button>

                {/* Sort by Magic Attack */}
                <button
                  onClick={() => handleSortClick('MATK')}
                  className={`px-2.5 py-1 min-h-[28px] rounded-md font-bold transition-all flex items-center space-x-1 border text-[10px] ${
                    sortField === 'MATK'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-400/80 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                      : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title="Sort by Magic Attack (MATK)"
                >
                  <span>MATK</span>
                  {sortField === 'MATK' && (
                    sortOrder === 'DESC' ? <ArrowDown className="w-2.5 h-2.5 text-purple-400" /> : <ArrowUp className="w-2.5 h-2.5 text-purple-400" />
                  )}
                </button>

                {/* Sort by Cooldown */}
                <button
                  onClick={() => handleSortClick('CD')}
                  className={`px-2.5 py-1 min-h-[28px] rounded-md font-bold transition-all flex items-center space-x-1 border text-[10px] ${
                    sortField === 'CD'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title="Sort by Cooldown (CD)"
                >
                  <span>CD</span>
                  {sortField === 'CD' && (
                    sortOrder === 'ASC' ? <ArrowDown className="w-2.5 h-2.5 text-cyan-400" /> : <ArrowUp className="w-2.5 h-2.5 text-cyan-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Search & Rarity Filter Bar */}
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={weaponSearch}
                  onChange={e => setWeaponSearch(e.target.value)}
                  placeholder="Search blades, axes, spears, bows, element..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {(['ALL', 'MYTHIC', 5, 4, 3, 2, 1] as const).map(r => (
                  <button
                    key={String(r)}
                    onClick={() => {
                      soundManager.playClick();
                      setRarityFilter(r);
                    }}
                    className={`px-1.5 py-1 rounded-lg text-[10px] font-black border transition-all ${
                      rarityFilter === r
                        ? r === 'MYTHIC'
                          ? 'bg-rose-500/25 text-rose-200 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.45)]'
                          : 'bg-amber-500/20 text-amber-300 border-amber-400'
                        : r === 'MYTHIC'
                        ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:border-rose-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {r === 'ALL' ? 'ALL' : r === 'MYTHIC' ? '✦ MYTHIC' : `${r}★`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-2 pb-6">
              {sortedInventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mb-3">
                    <Swords className="w-6 h-6 text-slate-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-300">No Weapons in Armory</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    {rarityFilter === 'MYTHIC'
                      ? 'Complete Mythic Ascension Trials on the Bounty Board to awaken animated ✦ Mythic Blades!'
                      : 'No weapons farmed yet! Defeat monsters, Elites, Corner Wardens & World Bosses on the map or summon at the Astral Altar.'}
                  </p>
                </div>
              ) : (
                sortedInventory.map(w => {
                const isEquipped = player.equippedWeaponIds.includes(w.id);
                const equippedSlot = player.equippedWeaponIds.indexOf(w.id);
                const elemColor = getElementColor(w.element);
                const upg = player.weaponUpgrades[w.id] || 0;

                return (
                  <div
                    key={w.id}
                    className={`p-2.5 rounded-xl border bg-slate-900/80 flex items-center justify-between ${getRarityBorderClass(
                      w.rarity,
                      w.isMythic
                    )}`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center border relative"
                        style={{ backgroundColor: `${elemColor}20`, borderColor: elemColor }}
                      >
                        {w.icon || w.animatedIcon ? (
                          <AnimatedWeaponIcon
                            weapon={w}
                            className="w-8 h-8 filter drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
                          />
                        ) : (
                          <Swords className="w-5 h-5" style={{ color: elemColor }} />
                        )}
                        {upg > 0 && (
                          <span className="absolute -top-1 -right-1 text-[8px] font-black text-cyan-300 bg-cyan-950 px-1 rounded border border-cyan-400">
                            +{upg}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-slate-100">{w.name}</span>
                          <span className={`text-[10px] font-bold ${w.isMythic ? 'text-rose-300' : 'text-amber-400'}`}>
                            {w.isMythic ? '✦ MYTHIC' : `${w.rarity}-Star`}
                          </span>
                          <span className={`text-[8px] font-bold px-1 rounded ${getElementBgClass(w.element)}`}>
                            {w.element}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                          <span
                            className={
                              sortField === 'ATK'
                                ? 'text-amber-300 font-bold bg-amber-950/70 border border-amber-500/50 px-1 rounded shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                                : ''
                            }
                          >
                            ATK: +{Math.floor(w.baseAtk * (1 + upg * 0.1))}
                          </span>
                          <span
                            className={
                              sortField === 'MATK'
                                ? 'text-purple-300 font-bold bg-purple-950/70 border border-purple-500/50 px-1 rounded shadow-[0_0_6px_rgba(168,85,247,0.4)]'
                                : ''
                            }
                          >
                            MATK: +{Math.floor(w.baseMatk * (1 + upg * 0.1))}
                          </span>
                          <span
                            className={
                              sortField === 'CD'
                                ? 'text-cyan-300 font-bold bg-cyan-950/70 border border-cyan-500/50 px-1 rounded shadow-[0_0_6px_rgba(6,182,212,0.4)]'
                                : ''
                            }
                          >
                            CD: {w.cooldownSec}s
                          </span>
                        </div>

                        <div className="text-[9px] text-slate-300 mt-0.5 flex items-center space-x-2">
                          <span className="text-amber-300 font-semibold">Skill: {w.activeSkillName}</span>
                          <span className="text-slate-500">|</span>
                          <span className="text-purple-300 font-semibold">Ult: {w.ultimateSkillName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Equip Action */}
                    <div className="flex flex-col items-end space-y-1">
                      {isEquipped ? (
                        <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 rounded-md">
                          <Check className="w-3 h-3" />
                          <span>Slot {equippedSlot + 1}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            const target = selectedSlot !== null ? selectedSlot : Math.min(4, player.equippedWeaponIds.length);
                            gameActions.equipWeapon(w.id, target);
                            setSelectedSlot(null);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow transition-all active:scale-95"
                        >
                          Equip
                        </button>
                      )}
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </>
      )}

      {/* SUB-TAB 2: BLACKSMITH FORGE & REFINEMENT */}
      {activeSubTab === 'FORGE' && (
        <div className="flex-1 flex flex-col space-y-3 pb-6">
          {/* Material Stock Bar */}
          <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Refinement Material Reserves
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.values(CRAFTING_MATERIALS).map(m => (
                <div key={m.id} className="bg-slate-950/80 rounded-lg p-1.5 border border-slate-800 text-center">
                  <span className="text-[9px] font-semibold text-slate-300 truncate block">{m.name}</span>
                  <span className="text-xs font-black text-cyan-400 font-mono">
                    x{player.materials[m.id] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Weapon Refinement Anvil */}
          {selectedForgeWeapon && (
            <div className={`bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-2xl p-4 border border-cyan-500/40 shadow-xl relative overflow-hidden ${
              forgeSuccessAnim ? 'animate-pulse ring-4 ring-amber-400' : ''
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border"
                    style={{
                      backgroundColor: `${getElementColor(selectedForgeWeapon.element)}20`,
                      borderColor: getElementColor(selectedForgeWeapon.element)
                    }}
                  >
                    {selectedForgeWeapon.icon || selectedForgeWeapon.animatedIcon ? (
                      <AnimatedWeaponIcon
                        weapon={selectedForgeWeapon}
                        className="w-9 h-9 filter drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                      />
                    ) : (
                      <Hammer className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-black text-sm text-slate-100">{selectedForgeWeapon.name}</h3>
                      <span className="text-xs font-black text-cyan-300 bg-cyan-950 border border-cyan-400 px-1.5 py-0.5 rounded">
                        +{forgeUpgLevel}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold ${selectedForgeWeapon.isMythic ? 'text-rose-300' : 'text-amber-400'}`}>
                      {selectedForgeWeapon.isMythic ? '✦ MYTHIC' : `${selectedForgeWeapon.rarity}-Star`} - {selectedForgeWeapon.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Next Level</span>
                  <div className="text-sm font-black text-emerald-400">
                    +{forgeUpgLevel < 10 ? forgeUpgLevel + 1 : 'MAX'}
                  </div>
                </div>
              </div>

              {/* Stats Comparison */}
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 mb-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">Physical ATK</span>
                  <div className="font-mono font-bold text-slate-100 flex items-center space-x-1">
                    <span>{Math.floor(selectedForgeWeapon.baseAtk * (1 + forgeUpgLevel * 0.1))}</span>
                    {forgeUpgLevel < 10 && (
                      <>
                        <span className="text-slate-500">-&gt;</span>
                        <span className="text-emerald-400">
                          {Math.floor(selectedForgeWeapon.baseAtk * (1 + (forgeUpgLevel + 1) * 0.1))}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px]">Magic MATK</span>
                  <div className="font-mono font-bold text-slate-100 flex items-center space-x-1">
                    <span>{Math.floor(selectedForgeWeapon.baseMatk * (1 + forgeUpgLevel * 0.1))}</span>
                    {forgeUpgLevel < 10 && (
                      <>
                        <span className="text-slate-500">-&gt;</span>
                        <span className="text-emerald-400">
                          {Math.floor(selectedForgeWeapon.baseMatk * (1 + (forgeUpgLevel + 1) * 0.1))}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Refinement Milestones Progression */}
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Refinement Milestone Perks
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {REFINEMENT_MILESTONES.map(m => {
                    const isUnlocked = forgeUpgLevel >= m.level;
                    return (
                      <div
                        key={m.level}
                        className={`rounded-lg p-2 border transition-all ${
                          isUnlocked
                            ? `${m.badgeClass} ring-1 ring-amber-400/40`
                            : 'bg-slate-950/60 text-slate-500 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-black flex items-center space-x-1">
                            <span>{m.icon}</span>
                            <span>{m.name}</span>
                          </span>
                          <span className={`text-[9px] font-black font-mono px-1 rounded ${
                            isUnlocked ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            +{m.level}
                          </span>
                        </div>
                        <p className="text-[8px] leading-tight opacity-90">{m.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cost & Refine Button */}
              {forgeUpgLevel < 10 ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <div className="flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span className={player.gold >= forgeGoldCost ? 'text-amber-300 font-mono font-bold' : 'text-rose-400 font-mono font-bold'}>
                        {forgeGoldCost.toLocaleString()} Gold
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400">{matDef?.name}:</span>
                      <span className={currentMatStock >= reqCount ? 'text-cyan-300 font-mono font-bold' : 'text-rose-400 font-mono font-bold'}>
                        {currentMatStock} / {reqCount}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={!canRefine}
                    onClick={handleRefine}
                    className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-1.5 ${
                      canRefine
                        ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-500 text-white hover:brightness-110 active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Hammer className="w-4 h-4" />
                    <span>Forge & Refine Weapon</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-2 text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-950/40 border border-amber-500/40 rounded-xl">
                  MAXIMUM REFINEMENT ACHIEVED
                </div>
              )}
            </div>
          )}

          {/* Quick Weapon Picker for Forge */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Weapon To Refine ({filteredForgeInventory.length})
              </h4>
              <div className="flex items-center gap-1 flex-wrap">
                {(['ALL', 'MYTHIC', 5, 4, 3, 2, 1] as const).map(r => (
                  <button
                    key={`forge-r-${String(r)}`}
                    onClick={() => {
                      soundManager.playClick();
                      setRarityFilter(r);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${
                      rarityFilter === r
                        ? r === 'MYTHIC'
                          ? 'bg-rose-500/25 text-rose-200 border-rose-400'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                        : r === 'MYTHIC'
                        ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {r === 'ALL' ? 'ALL' : r === 'MYTHIC' ? '✦ MYTHIC' : `${r}★`}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={weaponSearch}
                onChange={e => setWeaponSearch(e.target.value)}
                placeholder={`Search any of ${player.inventory.length} weapons to refine...`}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {filteredForgeInventory.map(w => {
                const upg = player.weaponUpgrades[w.id] || 0;
                const isSelected = selectedForgeWeaponId === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedForgeWeaponId(w.id);
                    }}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between gap-1.5 transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-slate-800 ring-2 ring-cyan-400'
                        : w.isMythic
                        ? 'border-rose-500/60 bg-rose-950/20 hover:bg-slate-900'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      {(w.icon || w.animatedIcon) && (
                        <AnimatedWeaponIcon
                          weapon={w}
                          className="w-7 h-7 shrink-0 filter drop-shadow-[0_0_3px_rgba(255,255,255,0.3)]"
                        />
                      )}
                      <div className="truncate pr-1">
                        <span className="text-[11px] font-bold text-slate-100 truncate block">
                          {w.name}
                        </span>
                        <span className={`text-[9px] font-bold ${w.isMythic ? 'text-rose-300' : 'text-amber-400'}`}>
                          {w.isMythic ? '✦ MYTHIC' : `${w.rarity}-Star`} • {w.element}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-cyan-300 font-mono shrink-0">
                      +{upg}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
