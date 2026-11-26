import React, { useState } from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { ALL_WEAPONS } from '../../data/weapons';
import { QUEST_LOCKED_WEAPON_ID_SET } from '../../data/quests';
import { Weapon, Rarity } from '../../types/game';
import { ALL_HERO_SKINS, HeroSkin } from '../../data/skins';
import { Sparkles, Gem, Swords, Award, RotateCcw, Feather, Shirt, Shield, Compass, ShoppingBag, Check } from 'lucide-react';
import { getElementBgClass, getElementColor, getRarityBorderClass } from '../../utils/combatUtils';
import { soundManager } from '../../utils/audioManager';
import { SpriteRenderer } from '../common/SpriteRenderer';
import { AstralSummonsAltar } from '../common/AstralSummonsAltar';
import { ClassIcon } from '../common/ClassIcon';
import { AnimatedWeaponIcon } from '../common/AnimatedWeaponIcon';

export const GachaModal: React.FC = () => {
  const store = useGameStore();
  const player = store.player;
  const shards = player.tesseraShards;
  const feathers = player.heroFeathers || 0;

  const [activeBanner, setActiveBanner] = useState<'HERO_SKINS' | 'WEAPONS'>('HERO_SKINS');
  const [isSummoning, setIsSummoning] = useState(false);
  const [summonSkinResults, setSummonSkinResults] = useState<{ skin: HeroSkin; isNew: boolean; feathersGranted: number }[] | null>(null);
  const [summonWeaponResults, setSummonWeaponResults] = useState<Weapon[] | null>(null);
  const [showFeatherShop, setShowFeatherShop] = useState(false);
  const [featherFilterClass, setFeatherFilterClass] = useState<string>('ALL');

  // -------------------------------------------------------------
  // 1. HERO SKIN SUMMON LOGIC (70% 3-Star, 25% 4-Star, 5% 5-Star FOCUS)
  // -------------------------------------------------------------
  const rollHeroSkin = (): HeroSkin => {
    const roll = Math.random() * 100;
    let targetRarity: Rarity = 3;
    if (roll < 5) {
      targetRarity = 5;
    } else if (roll < 30) {
      targetRarity = 4;
    } else {
      targetRarity = 3;
    }

    const pool = ALL_HERO_SKINS.filter(s => s.rarity === targetRarity);
    return pool[Math.floor(Math.random() * pool.length)] || ALL_HERO_SKINS[0];
  };

  const handleSummonSkins = (count: number, cost: number) => {
    if (shards < cost || isSummoning) return;
    if (!gameActions.spendShards(cost)) return;

    setIsSummoning(true);
    setSummonSkinResults(null);
    setSummonWeaponResults(null);
    soundManager.playGachaSpin();

    setTimeout(() => {
      const pulled: HeroSkin[] = [];
      for (let i = 0; i < count; i++) {
        pulled.push(rollHeroSkin());
      }

      const results = gameActions.addPulledSkins(pulled);
      gameActions.completeNoviceStep(6);
      setIsSummoning(false);
      setSummonSkinResults(results);

      const has5Star = pulled.some(s => s.rarity === 5);
      const has4Star = pulled.some(s => s.rarity === 4);
      if (has5Star) {
        soundManager.playGachaRarity(5);
      } else if (has4Star) {
        soundManager.playGachaRarity(4);
      } else {
        soundManager.playGachaRarity(3);
      }
    }, 1300);
  };

  // -------------------------------------------------------------
  // 2. WEAPON SUMMON LOGIC (Excludes Quest-Locked Mythics & Artifacts)
  // -------------------------------------------------------------
  const rollWeapon = (): Weapon => {
    const roll = Math.random() * 100;
    let targetRarity: Rarity = 1;
    if (roll < 8) {
      targetRarity = 5;
    } else if (roll < 28) {
      targetRarity = 4;
    } else if (roll < 58) {
      targetRarity = 3;
    } else if (roll < 82) {
      targetRarity = 2;
    } else {
      targetRarity = 1;
    }

    const pool = ALL_WEAPONS.filter(
      w =>
        !w.isMythic &&
        !QUEST_LOCKED_WEAPON_ID_SET.has(w.id) &&
        w.rarity === targetRarity &&
        w.rewardSource !== 'BOUNTY_100' &&
        w.rewardSource !== 'CORNER_DROP'
    );
    const fallback = ALL_WEAPONS.filter(
      w => !w.isMythic && !QUEST_LOCKED_WEAPON_ID_SET.has(w.id) && w.rarity === targetRarity
    );
    const activePool = pool.length > 0 ? pool : fallback;
    return activePool[Math.floor(Math.random() * activePool.length)] || ALL_WEAPONS.find(w => !w.isMythic)!;
  };

  const handleSummonWeapons = (count: number, cost: number) => {
    if (shards < cost || isSummoning) return;
    if (!gameActions.spendShards(cost)) return;

    setIsSummoning(true);
    setSummonSkinResults(null);
    setSummonWeaponResults(null);
    soundManager.playGachaSpin();

    setTimeout(() => {
      const results: Weapon[] = [];
      for (let i = 0; i < count; i++) {
        results.push(rollWeapon());
      }

      gameActions.addPulledWeapons(results);
      gameActions.completeNoviceStep(6);
      setIsSummoning(false);
      setSummonWeaponResults(results);

      const has5Star = results.some(w => w.rarity === 5);
      const has4Star = results.some(w => w.rarity === 4);
      if (has5Star) {
        soundManager.playGachaRarity(5);
      } else if (has4Star) {
        soundManager.playGachaRarity(4);
      } else {
        soundManager.playGachaRarity(3);
      }
    }, 1300);
  };

  // -------------------------------------------------------------
  // 3. HERO FEATHER EXCHANGE DIRECT UNLOCK
  // -------------------------------------------------------------
  const handleBuySkinWithFeathers = (skin: HeroSkin, featherCost: number) => {
    if (feathers < featherCost) return;
    if (gameActions.unlockSkinWithFeathers(skin.id, featherCost)) {
      soundManager.playLevelUp();
    }
  };

  const getRarityStarColor = (rarity: Rarity) => {
    switch (rarity) {
      case 5: return 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]';
      case 4: return 'text-purple-400';
      case 3: return 'text-sky-400';
      case 2: return 'text-emerald-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-slate-950 p-3 overflow-y-auto select-none">
      {/* Top Currency Status Bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center space-x-2">
          {/* Shards Currency */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-cyan-500/40 px-2.5 py-1 rounded-full shadow-sm">
            <Gem className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-black text-cyan-300 font-mono">
              {shards.toLocaleString()}
            </span>
          </div>

          {/* Hero Feathers Currency (Astral) */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-amber-500/40 px-2.5 py-1 rounded-full shadow-sm">
            <Feather className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-black text-amber-300 font-mono">
              {feathers.toLocaleString()} Feathers
            </span>
          </div>
        </div>

        {/* Quick Feather Shop Toggle */}
        <button
          onClick={() => {
            soundManager.playClick();
            setShowFeatherShop(!showFeatherShop);
          }}
          className={`flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
            showFeatherShop
              ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
              : 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-slate-800'
          }`}
        >
          <ShoppingBag className="w-3 h-3" />
          <span>Feather Exchange</span>
        </button>
      </div>

      {/* Banner Selection Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveBanner('HERO_SKINS');
            setShowFeatherShop(false);
          }}
          className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
            activeBanner === 'HERO_SKINS' && !showFeatherShop
              ? 'bg-gradient-to-r from-red-950 via-purple-950 to-indigo-950 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Hero Skin Summon</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveBanner('WEAPONS');
            setShowFeatherShop(false);
          }}
          className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
            activeBanner === 'WEAPONS' && !showFeatherShop
              ? 'bg-gradient-to-r from-indigo-950 to-slate-900 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Swords className="w-3.5 h-3.5 text-cyan-400" />
          <span>Celestial Relic Weapons</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* VIEW A: HERO FEATHER EXCHANGE SHOP                            */}
      {/* ============================================================== */}
      {showFeatherShop ? (
        <div className="flex-1 flex flex-col bg-slate-900/90 rounded-2xl p-3 border border-amber-500/40 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-black text-amber-300 flex items-center space-x-1">
                <Feather className="w-4 h-4 text-amber-400" />
                <span>Hero Feather Direct Exchange</span>
              </h3>
              <p className="text-[9px] text-slate-400">Unlock any Samurai Hero Skin directly using Hero Feathers!</p>
            </div>
            <button
              onClick={() => setShowFeatherShop(false)}
              className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {ALL_HERO_SKINS.map(skin => {
              const isUnlocked = !!player.unlockedSkins?.[skin.id];
              const cost = skin.rarity === 5 ? 180 : skin.rarity === 4 ? 80 : 30;

              return (
                <div
                  key={skin.id}
                  className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                    isUnlocked
                      ? 'bg-slate-950/60 border-slate-800 opacity-60'
                      : 'bg-slate-950 border-amber-500/30 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-12 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      <SpriteRenderer job={skin.classType} skin={skin.folderName} scale={0.65} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <ClassIcon job={skin.classType} size="xs" />
                        <span className="text-[11px] font-black text-slate-100">{skin.name}</span>
                        <span className={`text-[9px] font-bold ${getRarityStarColor(skin.rarity)}`}>
                          {skin.rarity}-Star
                        </span>
                      </div>
                      <span className="text-[9px] text-amber-300 font-semibold">{skin.title}</span>
                      <p className="text-[8px] text-slate-400 line-clamp-1">{skin.description}</p>
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                        Acquired
                      </span>
                    ) : (
                      <button
                        disabled={feathers < cost}
                        onClick={() => handleBuySkinWithFeathers(skin, cost)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 border cursor-pointer ${
                          feathers >= cost
                            ? 'bg-amber-500 text-slate-950 border-amber-300 hover:brightness-110 active:scale-95'
                            : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        <Feather className="w-3 h-3" />
                        <span>{cost} Feathers</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : isSummoning ? (
        /* VIEW B: SUMMONING OVERDRIVE RITUAL */
        <div className="flex-1 flex flex-col items-center justify-center py-6 bg-slate-950/95 rounded-2xl border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.5)] relative overflow-hidden animate-fadeIn">
          <div className="relative mb-2">
            <AstralSummonsAltar
              size={180}
              isSummoning={true}
              interactive={false}
              showRiftAura={true}
              showParticles={true}
            />
          </div>
          <p className="text-xs font-black text-amber-300 tracking-wider animate-pulse flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Resonating with the Astral Summon Altar...</span>
          </p>
          <span className="text-[10px] text-cyan-300 mt-1 font-mono">
            Opening celestial stargate • Calling forth heroic echoes...
          </span>
        </div>
      ) : summonSkinResults ? (
        /* VIEW C: HERO SKIN SUMMON RESULTS */
        <div className="flex-1 flex flex-col bg-slate-900/95 rounded-2xl p-3 border-2 border-amber-400/60 shadow-2xl animate-fadeIn overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-800 pb-2 shrink-0">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <div>
                <h3 className="font-black text-sm text-amber-200">Hero Skin Summon Results</h3>
                <span className="text-[9px] text-purple-300">
                  {summonSkinResults.length} Samurai Hero Echo{summonSkinResults.length > 1 ? 'es' : ''} Awakened
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setSummonSkinResults(null);
              }}
              className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 grid grid-cols-1 gap-2.5 overflow-y-auto pr-1">
            {summonSkinResults.map((item, i) => {
              const skin = item.skin;
              const isEquipped = player.equippedSkins?.[skin.classType] === skin.folderName;

              return (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border bg-slate-950 flex items-center space-x-3 overflow-hidden shadow-md transition-all ${
                    skin.rarity === 5
                      ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)] bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950'
                      : skin.rarity === 4
                      ? 'border-purple-400/70 shadow-sm bg-gradient-to-r from-purple-950/30 via-slate-950 to-slate-950'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Animated Character Sprite */}
                  <div className="w-14 h-16 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-inner">
                    <SpriteRenderer job={skin.classType} skin={skin.folderName} scale={0.7} />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                    {/* Row 1: Class + Rarity */}
                    <div className="flex items-center justify-between text-[8px] mb-0.5">
                      <div className="flex items-center space-x-1 shrink-0">
                        <ClassIcon job={skin.classType} size="xs" />
                        <span className="text-[7.5px] text-cyan-300 font-bold uppercase tracking-wider">{skin.classType}</span>
                      </div>
                      <span className={`font-black text-[9px] shrink-0 ${getRarityStarColor(skin.rarity)}`}>
                        {skin.rarity}-Star
                      </span>
                    </div>

                    {/* Row 2: Name */}
                    <span className="text-xs font-black text-slate-100 truncate block leading-tight">{skin.name}</span>
                    {/* Row 3: Title */}
                    <span className="text-[9px] text-amber-300/90 font-medium truncate block leading-tight">{skin.title}</span>

                    {/* Row 4: Status + Equip Button (Never overflows!) */}
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                      <div className="shrink-0 overflow-hidden">
                        {item.isNew ? (
                          <span className="text-[7.5px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-full flex items-center space-x-1 animate-pulse">
                            <span>NEW UNLOCKED!</span>
                          </span>
                        ) : (
                          <span className="text-[7.5px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <Feather className="w-2.5 h-2.5 text-amber-400" />
                            <span>+{item.feathersGranted} Feathers</span>
                          </span>
                        )}
                      </div>

                      <div className="shrink-0">
                        {isEquipped ? (
                          <span className="text-[8px] font-black text-emerald-400 bg-emerald-950/90 border border-emerald-500/50 px-2.5 py-0.5 rounded-lg flex items-center space-x-1 shadow-sm">
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Equipped</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              gameActions.equipSkin(skin.classType, skin.folderName);
                            }}
                            className="text-[8px] font-black text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 px-3 py-0.5 rounded-lg transition-all shadow-md cursor-pointer flex items-center space-x-1 shrink-0"
                          >
                            <span>Equip</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Footer: Summon Again or Done */}
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <button
              onClick={() => {
                soundManager.playClick();
                setSummonSkinResults(null);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer text-center"
            >
              Done
            </button>
            <button
              disabled={shards < 100}
              onClick={() => handleSummonSkins(1, 100)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg ${
                shards >= 100
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Summon Again (100)</span>
            </button>
          </div>
        </div>
      ) : summonWeaponResults ? (
        /* VIEW D: WEAPON SUMMON RESULTS */
        <div className="flex-1 flex flex-col bg-slate-900/95 rounded-2xl p-3 border-2 border-cyan-400/60 shadow-2xl animate-fadeIn overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-800 pb-2 shrink-0">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <div>
                <h3 className="font-black text-sm text-cyan-200">Relic Weapon Summon Results</h3>
                <span className="text-[9px] text-slate-400">
                  {summonWeaponResults.length} Celestial Relic{summonWeaponResults.length > 1 ? 's' : ''} Acquired
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setSummonWeaponResults(null);
              }}
              className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pr-1">
            {summonWeaponResults.map((w, i) => {
              return (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border bg-slate-950 flex flex-col justify-between overflow-hidden shadow-sm ${getRarityBorderClass(
                    w.rarity,
                    w.isMythic
                  )}`}
                >
                  <div className="flex items-center justify-between text-[8px] mb-1">
                    <span className={`px-1.5 py-0.2 rounded font-bold ${getElementBgClass(w.element)}`}>
                      {w.element}
                    </span>
                    <span className={`font-black text-[9px] ${w.isMythic ? 'text-rose-300 drop-shadow-[0_0_6px_rgba(244,63,94,0.85)]' : getRarityStarColor(w.rarity)}`}>
                      {w.isMythic ? '✦ MYTHIC' : `${w.rarity}-Star`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 my-1">
                    <AnimatedWeaponIcon
                      weapon={w}
                      className="w-8 h-8 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.4)] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs text-slate-100 truncate block leading-tight">{w.name}</span>
                      <span className="text-[8px] text-cyan-300 font-medium truncate block">{w.category}</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[8px] text-slate-400">
                    <span className="truncate">Skill: {w.activeSkillName}</span>
                    <span className="text-amber-300 font-bold shrink-0">Ult: {w.ultimateSkillName}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Footer: Summon Again or Done */}
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <button
              onClick={() => {
                soundManager.playClick();
                setSummonWeaponResults(null);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer text-center"
            >
              Done
            </button>
            <button
              disabled={shards < 100}
              onClick={() => handleSummonWeapons(1, 100)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg ${
                shards >= 100
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:brightness-110 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Summon Again (100)</span>
            </button>
          </div>
        </div>
      ) : activeBanner === 'HERO_SKINS' ? (
        /* ============================================================== */
        /* VIEW B: HERO SKIN SUMMON BANNER                                */
        /* ============================================================== */
        <div className="flex-1 flex flex-col">
          {/* Hero Skin Portal Banner with Animated Astral Altar */}
          <div className="relative rounded-2xl bg-gradient-to-br from-red-950 via-purple-950 to-slate-950 border-2 border-amber-400/60 p-3 shadow-2xl mb-3 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1 pr-2">
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest bg-amber-500/20 border border-amber-400/50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    <span>CELESTIAL HERO PORTAL</span>
                  </span>
                  <span className="text-[10px] font-bold text-cyan-300">
                    Rate-Up: Focus Heroes
                  </span>
                </div>

                <h2 className="text-base font-black text-white tracking-wide">
                  Samurai Hero Skins Summon
                </h2>
                <p className="text-[10px] text-purple-200/90 mt-0.5">
                  Summon authentic anime samurai skins for all 17 classes! Duplicate pulls grant Hero Feathers.
                </p>

                {/* Rates */}
                <div className="flex flex-wrap gap-2 mt-2 text-[9px] font-bold">
                  <span className="text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30">5-Star: 5%</span>
                  <span className="text-purple-400 bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-500/30">4-Star: 25%</span>
                  <span className="text-blue-400 bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-500/30">3-Star: 70%</span>
                </div>
              </div>

              {/* Animated Astral Summons Altar */}
              <div className="shrink-0 pl-1 flex flex-col items-center">
                <AstralSummonsAltar
                  size={92}
                  interactive={false}
                  showRiftAura={false}
                  showParticles={true}
                />
              </div>
            </div>

            {/* 5-Element Astral Summoning Circle */}
            <div className="mt-2 pt-2 border-t border-purple-500/30 flex items-center justify-center space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-red-600 border border-red-300 shadow-[0_0_8px_#ef4444] animate-pulse" />
                <span className="text-[7px] text-red-300 mt-0.5 font-bold">Warrior</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-blue-600 border border-blue-300 shadow-[0_0_8px_#3b82f6] animate-pulse" />
                <span className="text-[7px] text-blue-300 mt-0.5 font-bold">Guardian</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-600 border border-emerald-300 shadow-[0_0_8px_#10b981] animate-pulse" />
                <span className="text-[7px] text-emerald-300 mt-0.5 font-bold">Hunter</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-purple-600 border border-purple-300 shadow-[0_0_8px_#a855f7] animate-pulse" />
                <span className="text-[7px] text-purple-300 mt-0.5 font-bold">Mage</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border border-amber-200 shadow-[0_0_12px_#f59e0b] animate-bounce" />
                <span className="text-[7px] text-amber-300 mt-0.5 font-bold">Priest</span>
              </div>
            </div>
          </div>

          {/* Featured 5-Star Showcase */}
          <div className="mb-3">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>5-Star Focus Spotlight</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Musashi Miyamoto', classType: 'WARRIOR' as const, skin: 'warrior_musashi', title: 'Niten Grandmaster', rarity: 5 },
                { name: 'Neptune', classType: 'MAGE' as const, skin: 'mage_neptune', title: 'Planeptune Star', rarity: 5 },
                { name: 'Masamune Date', classType: 'DEMON_HUNTER' as const, skin: 'demon_hunter_masamune', title: 'Six-Claw Dragon', rarity: 5 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 rounded-xl p-2 border border-amber-400/40 shadow-sm flex flex-col items-center text-center justify-between"
                >
                  <div className="w-full flex items-center justify-between text-[8px] mb-1">
                    <span className="text-amber-400 font-black">5-Star</span>
                    <ClassIcon job={item.classType} size="xs" />
                  </div>
                  <div className="w-14 h-16 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center p-0.5 my-1">
                    <SpriteRenderer job={item.classType} skin={item.skin} scale={0.65} />
                  </div>
                  <span className="text-[10px] font-black text-slate-100 truncate w-full">{item.name}</span>
                  <span className="text-[8px] text-amber-300/90 truncate w-full">{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summon Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              disabled={isSummoning || shards < 100}
              onClick={() => handleSummonSkins(1, 100)}
              className={`py-2.5 px-2 rounded-xl font-bold flex flex-col items-center justify-center border transition-all cursor-pointer ${
                shards >= 100
                  ? 'bg-gradient-to-r from-slate-900 to-indigo-950 border-purple-500/60 text-white hover:brightness-110 active:scale-95 shadow-md'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="text-xs">Single Summon</span>
              <div className="flex items-center space-x-1 mt-0.5 text-[11px] text-cyan-300 font-mono">
                <Gem className="w-3 h-3 text-cyan-400" />
                <span>100 Shards</span>
              </div>
            </button>

            <button
              disabled={isSummoning || shards < 450}
              onClick={() => handleSummonSkins(5, 450)}
              className={`py-2.5 px-2 rounded-xl font-bold flex flex-col items-center justify-center border transition-all relative overflow-hidden cursor-pointer ${
                shards >= 450
                  ? 'bg-gradient-to-r from-purple-800 via-amber-700 to-amber-600 border-amber-400 text-white hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="absolute top-0 right-1 text-[7px] font-black uppercase text-amber-200 bg-amber-950/80 px-1 rounded-b">
                10% OFF
              </span>
              <span className="text-xs">Full Circle (5x Summon)</span>
              <div className="flex items-center space-x-1 mt-0.5 text-[11px] text-amber-200 font-mono">
                <Gem className="w-3 h-3 text-cyan-400" />
                <span>450 Shards</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* VIEW C: WEAPON RELIC SUMMON BANNER                             */
        /* ============================================================== */
        <div className="flex-1 flex flex-col">
          <div className="relative rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-cyan-500/40 p-3 shadow-xl mb-3 overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1 pr-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  Celestial Relic Weapon Summon
                </h2>
                <p className="text-[10px] text-cyan-200/80 mt-0.5">
                  Summon signature weapons! (✦ Mythic & Class 5★ Artifacts are earned from Quests)
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2 text-[9px] font-bold">
                  <span className="text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-400/50">✦ Mythic & Artifacts: Quests</span>
                  <span className="text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30">5★ Legend: 8%</span>
                  <span className="text-purple-400 bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-500/30">4★ Epic: 20%</span>
                  <span className="text-sky-400 bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-500/30">3★ Rare: 30%</span>
                  <span className="text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30">2★ Unc: 24%</span>
                  <span className="text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-600/40">1★ Com: 18%</span>
                </div>
              </div>
              <div className="shrink-0 pl-1 flex flex-col items-center">
                <AstralSummonsAltar
                  size={92}
                  interactive={false}
                  showRiftAura={false}
                  showParticles={true}
                />
              </div>
            </div>
          </div>

          {/* Featured 5-Star Summon Weapons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {ALL_WEAPONS.filter(w => w.rarity === 5 && !w.isMythic && !QUEST_LOCKED_WEAPON_ID_SET.has(w.id))
              .slice(0, 4)
              .map(w => {
              return (
                <div
                  key={w.id}
                  className={`bg-slate-900/80 rounded-xl p-2 border shadow-sm flex flex-col justify-between ${
                    w.isMythic ? 'border-rose-400/70 mythic-card-glow' : 'border-amber-400/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[8px] mb-1">
                    <span className={`px-1 rounded font-bold ${getElementBgClass(w.element)}`}>
                      {w.element}
                    </span>
                    <span className={`font-black ${w.isMythic ? 'text-rose-300' : 'text-amber-400'}`}>
                      {w.isMythic ? '✦ MYTHIC' : '5-Star'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 my-0.5">
                    <AnimatedWeaponIcon
                      weapon={w}
                      className="w-7 h-7 filter drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
                    />
                    <span className="text-[10px] font-bold text-slate-100 truncate">{w.name}</span>
                  </div>
                  <span className="text-[8px] text-cyan-300 font-semibold truncate">Ult: {w.ultimateSkillName}</span>
                </div>
              );
            })}
          </div>

          {/* Weapon Summon Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              disabled={isSummoning || shards < 100}
              onClick={() => handleSummonWeapons(1, 100)}
              className={`py-2.5 px-2 rounded-xl font-bold flex flex-col items-center justify-center border transition-all cursor-pointer ${
                shards >= 100
                  ? 'bg-gradient-to-r from-slate-900 to-indigo-950 border-purple-500/60 text-white hover:brightness-110 active:scale-95 shadow-md'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="text-xs">Single Summon</span>
              <div className="flex items-center space-x-1 mt-0.5 text-[11px] text-cyan-300 font-mono">
                <Gem className="w-3 h-3 text-cyan-400" />
                <span>100 Shards</span>
              </div>
            </button>

            <button
              disabled={isSummoning || shards < 900}
              onClick={() => handleSummonWeapons(10, 900)}
              className={`py-2.5 px-2 rounded-xl font-bold flex flex-col items-center justify-center border transition-all relative overflow-hidden cursor-pointer ${
                shards >= 900
                  ? 'bg-gradient-to-r from-purple-700 to-amber-600 border-amber-400 text-white hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="absolute top-0 right-1 text-[7px] font-black uppercase text-amber-200 bg-amber-950/80 px-1 rounded-b">
                10% OFF
              </span>
              <span className="text-xs">10x Summon</span>
              <div className="flex items-center space-x-1 mt-0.5 text-[11px] text-amber-200 font-mono">
                <Gem className="w-3 h-3 text-cyan-400" />
                <span>900 Shards</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Dev Faucet for testing if needed */}
      {shards < 100 && (
        <div className="mb-3 p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[10px]">Need shards to test hero summons?</span>
          <button
            onClick={() => {
              soundManager.playLevelUp();
              gameActions.addRewards(1000, 200, 1000);
            }}
            className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded hover:bg-amber-900 cursor-pointer"
          >
            +1,000 Shards (Grant)
          </button>
        </div>
      )}
    </div>
  );
};
