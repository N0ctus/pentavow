import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { BattleInstance, Combatant, DamagePopupItem, Weapon, ElementType, WeaponCategory } from '../../types/game';
import { SpriteRenderer } from '../common/SpriteRenderer';
import { PmdWeatherOverlay } from '../map/PmdWeatherOverlay';
import { ClassIcon } from '../common/ClassIcon';
import { DamagePopup } from './DamagePopup';
import { BottomDock } from '../layout/BottomDock';
import { getElementalMultiplier, getElementBgClass, getElementColor, ANIME_ELEMENTS, getWeaponRefinementPerks, getWeaknessElement } from '../../utils/combatUtils';
import { AttackArchetype } from './AnimeElementalSlash';
import { WeaponStrikeVisual, WeaponStrikeData } from './WeaponStrikeVisual';
import { BossStrikeVisual, BossStrikeData } from './BossStrikeVisual';
import { SpriteCastHitEffect, SpriteCastHitProps } from './SpriteCastHitEffect';
import { Shield, Sparkles, Swords, Trophy, AlertTriangle, UserPlus, Heart, Zap, Flame, Crosshair } from 'lucide-react';
import { WEAPON_MAP } from '../../data/weapons';
import { ENEMY_TEMPLATES } from '../../data/enemies';
import { soundManager } from '../../utils/audioManager';
import { getBattlegroundForCombat } from '../../data/battlegrounds';
import { getBigMapForRealm } from '../../data/bigMaps';
import {
  broadcastBattleHeal,
  broadcastBattleHit,
  broadcastCoopEmote,
  subscribeCoopEmotes,
  subscribeCoopHeals,
  subscribeCoopHits,
} from '../../services/coopMultiplayer';

interface BattleArenaProps {
  battleId: string;
}

function getUnarmedFallbackWeapon(job: string): Weapon {
  const isMage = job === 'MAGE' || job === 'ARCHMAGE' || job === 'WARLOCK' || job === 'SPELLWEAVER';
  const isPriest = job === 'PRIEST' || job === 'PALADIN' || job === 'DRUID' || job === 'SHAMAN' || job === 'EVOKER' || job === 'LIGHTBEARER';
  return {
    id: '__unarmed__',
    name: isMage ? 'Arcane Spark' : isPriest ? 'Sacred Palm' : 'Unarmed Strike',
    rarity: 1,
    element: isMage ? 'FIRE' : isPriest ? 'LIGHT' : 'WIND',
    category: isMage ? 'STAFF' : isPriest ? 'MACE' : 'GREATBLADE',
    baseAtk: 0,
    baseMatk: 0,
    cooldownSec: 1.5,
    etherGain: 0,
    activeSkillName: isMage ? 'Arcane Spark' : isPriest ? 'Sacred Palm' : 'Unarmed Strike',
    activeMultiplier: 1.0,
    ultimateSkillName: 'Novice Focus',
    ultimateMultiplier: 1.0,
    effectType: 'DAMAGE',
  };
}

export const BattleArena: React.FC<BattleArenaProps> = ({ battleId }) => {
  const store = useGameStore();
  const battle = store.battles[battleId];
  const [popups, setPopups] = useState<DamagePopupItem[]>([]);
  const [animatingAttackerId, setAnimatingAttackerId] = useState<string | null>(null);
  const [weaponStrikes, setWeaponStrikes] = useState<WeaponStrikeData[]>([]);
  const [bossStrikes, setBossStrikes] = useState<BossStrikeData[]>([]);
  const [spriteCastHits, setSpriteCastHits] = useState<SpriteCastHitProps[]>([]);
  const [bossHitReaction, setBossHitReaction] = useState(false);
  const [hunterHitReaction, setHunterHitReaction] = useState<Record<string, boolean>>({});
  const [battleResult, setBattleResult] = useState<'VICTORY' | 'DEFEAT' | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [screenShakeMode, setScreenShakeMode] = useState<'LIGHT' | 'HEAVY' | 'CRIT' | null>(null);
  const [hitstopActive, setHitstopActive] = useState(false);
  const [playerEmote, setPlayerEmote] = useState<string | null>(null);
  const [waveClearNotice, setWaveClearNotice] = useState<string | null>(null);
  const [ultimateCutIn, setUltimateCutIn] = useState<{ weaponName: string; skillName: string; element: ElementType } | null>(null);
  
  // Samkin-inspired Combat State: Combo Streaks & Boss Stance Break
  const [comboCount, setComboCount] = useState<number>(0);
  const comboTimerRef = useRef<number>(0);
  const [bossStagger, setBossStagger] = useState<number>(0); // 0 to 100
  const [isBossStaggered, setIsBossStaggered] = useState<boolean>(false);
  const hasEnragedRef = useRef<boolean>(false);
  const dropInTimerRef = useRef<number>(0);

  // Pillar 1: Boss Multi-Phase Stagger Break & Counterplay States
  const [breakPhaseActive, setBreakPhaseActive] = useState<boolean>(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState<number>(0);
  const [breakDamageRequired, setBreakDamageRequired] = useState<number>(0);
  const [breakDamageAccumulated, setBreakDamageAccumulated] = useState<number>(0);
  const breakPhaseTriggeredRef = useRef<boolean>(false);

  // Active Reaction Counterplay (Parry / Guard)
  const [isPlayerGuarded, setIsPlayerGuarded] = useState<boolean>(false);
  const [guardCooldown, setGuardCooldown] = useState<number>(0);
  const [parryFeedback, setParryFeedback] = useState<string | null>(null);

  // Pillar 3: Cross-Class Elemental Afflictions & Combos + Party Target
  const [elementalAffliction, setElementalAffliction] = useState<{
    element: ElementType;
    type: 'CHILLED' | 'OILED';
    durationSec: number;
  } | null>(null);
  const [activeBurnTicks, setActiveBurnTicks] = useState<number>(0);
  const burnTimerRef = useRef<number>(0);
  const [selectedAllyId, setSelectedAllyId] = useState<string | null>(null);
  const [holyAuraTimer, setHolyAuraTimer] = useState<number>(0); // Holy Cross buff duration
  const [arenaGroundTileUrl, setArenaGroundTileUrl] = useState<string>('');

  const currentRealmTilesetId = getBigMapForRealm(store.currentRealmId).tilesetId;

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const c = document.createElement('canvas');
      c.width = 24;
      c.height = 24;
      const ctx = c.getContext('2d');
      if (ctx) {
        // Slice center interior Ground tile (col 4, row 3) directly from this map's Tiles/ atlas
        ctx.drawImage(img, 96, 72, 24, 24, 0, 0, 24, 24);
        setArenaGroundTileUrl(c.toDataURL('image/png'));
      }
    };
    img.src = `/pmd_tilesets/${currentRealmTilesetId}/atlas.png`;
    return () => {
      cancelled = true;
    };
  }, [currentRealmTilesetId]);

  // Helper to map weapon category to visual archetype (SpriteCast enhanced)
  const getArchetype = (cat?: WeaponCategory): AttackArchetype => {
    if (cat === 'GREATBLADE') return 'HEAVY_SLAM';
    if (cat === 'DAGGERS') return 'IAIDO_SLASH';
    if (cat === 'MACE' || cat === 'SHIELD') return 'BLOW';
    if (cat === 'BOW') return 'ARROW';
    if (cat === 'STAFF' || cat === 'TOME') return 'FLUID_WHIP';
    if (cat === 'RELIC') return 'SPIN_SLASH';
    return 'SLASH';
  };

  // Helper to spawn SpriteCast physics-based PVFX hit impacts
  const spawnSpriteCastHit = useCallback((
    type: SpriteCastHitProps['type'],
    x: number,
    y: number,
    element: ElementType = 'FIRE',
    scale: number = 1
  ) => {
    const id = `sc-hit-${Date.now()}-${Math.random()}`;
    const newHit: SpriteCastHitProps = { id, type, x, y, element, scale };
    setSpriteCastHits(prev => [...prev.slice(-6), newHit]);
    const timeoutMs = type === 'CRIT_BURST' || type === 'GROUND_SLAM' ? 550 : 380;
    setTimeout(() => {
      setSpriteCastHits(prev => prev.filter(h => h.id !== id));
    }, timeoutMs);
  }, []);

  // Check victory or advance dungeon wave
  const checkEnemyDefeated = useCallback(() => {
    if (battle?.isDungeon && battle.currentWave && battle.totalWaves && battle.currentWave < battle.totalWaves) {
      soundManager.playHeal();
      setWaveClearNotice(`WAVE ${battle.currentWave} CLEARED! +30% Party HP`);
      setTimeout(() => setWaveClearNotice(null), 1800);
      gameActions.advanceDungeonWave(battle.id);
    } else {
      soundManager.playVictory();
      setBattleResult('VICTORY');
    }
  }, [battle]);

  // Auto-dismiss drop-in notifications after 1.8s
  useEffect(() => {
    if (store.dropInNotifications.length > 0) {
      const timer = setTimeout(() => {
        gameActions.clearNotification();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [store.dropInNotifications]);

  // Quick Emote Trigger
  const sendEmote = (emoteText: string) => {
    soundManager.playClick();
    setPlayerEmote(emoteText);
    battle?.combatLogs.push(`[${store.player.name}]: ${emoteText}`);
    broadcastCoopEmote(store.currentRealmId, emoteText, store.player.name);
    setTimeout(() => setPlayerEmote(null), 2000);
  };

  // Helper to add floating damage/heal popup
  const addPopup = useCallback((value: number | string, type: DamagePopupItem['type'], x: number, y: number, element?: ElementType) => {
    const id = `popup-${Date.now()}-${Math.random()}`;
    setPopups(prev => [...prev.slice(-15), { id, value, type, x, y, element, createdAt: Date.now() }]);
  }, []);

  // Helper to compute hunter coordinates in battle arena percentages
  const getHunterCoords = useCallback((hunterId: string): { x: number; y: number } => {
    if (!battle) return { x: 76, y: 45 };
    const idx = battle.participants.findIndex(p => p.id === hunterId);
    if (idx === -1) return { x: 76, y: 45 };

    const total = battle.participants.length;
    const staggerOffset = (idx % 2) * 2.5;
    const x = 76 - staggerOffset;

    if (total === 1) return { x, y: 45 };
    const startY = total <= 3 ? 32 : 24;
    const endY = total <= 3 ? 58 : 64;
    const step = (endY - startY) / (total - 1);
    const y = startY + idx * step;

    return { x, y };
  }, [battle]);

  // Handler for boss attacks landing directly on targeted hunter(s)
  const executeBossAttackOnHunter = useCallback((
    target: Combatant,
    incomingDmg: number,
    element: ElementType,
    isAoE: boolean = false,
    isHeavy: boolean = false
  ) => {
    const coords = getHunterCoords(target.id);
    const strikeId = `boss-strike-${Date.now()}-${Math.random()}`;
    const newStrike: BossStrikeData = {
      id: strikeId,
      targetHunterId: target.id,
      element,
      x: coords.x,
      y: coords.y,
      isAoE,
      isHeavy
    };

    setBossStrikes(prev => [...prev.slice(-6), newStrike]);
    setTimeout(() => {
      setBossStrikes(prev => prev.filter(s => s.id !== strikeId));
    }, isHeavy || isAoE ? 500 : 380);

    // SpriteCast Impact VFX: Guard lens on active parry, Ground slam on heavy blow, hit spark otherwise
    if (target.isPlayer && isPlayerGuarded) {
      spawnSpriteCastHit('BLOCK_GUARD', coords.x, coords.y, 'LIGHT', 1.25);
    } else if (isHeavy) {
      spawnSpriteCastHit('GROUND_SLAM', coords.x, coords.y + 6, element, 1.1);
    } else {
      spawnSpriteCastHit('HIT_SPARK', coords.x, coords.y, element, 0.95);
    }

    // Trigger hunter physical shudder & damage flash recoil
    setHunterHitReaction(prev => ({ ...prev, [target.id]: true }));
    setTimeout(() => {
      setHunterHitReaction(prev => ({ ...prev, [target.id]: false }));
    }, 280);

    // Spawn damage popup directly above this character's head on the right side
    addPopup(incomingDmg, 'damage', coords.x, coords.y - 6, element);
  }, [getHunterCoords, addPopup]);

  // Pillar 2: Micro-hitstop & Dynamic Screen Shake Triggers (Snappy, non-disorienting)
  const triggerHitstop = useCallback((durationMs: number = 60) => {
    setHitstopActive(true);
    setTimeout(() => setHitstopActive(false), durationMs);
  }, []);

  const lastShakeTimeRef = useRef<number>(0);
  const triggerShake = useCallback((mode: 'LIGHT' | 'HEAVY' | 'CRIT' = 'LIGHT') => {
    const now = Date.now();
    const minGap = mode === 'LIGHT' ? 220 : 380;
    if (now - lastShakeTimeRef.current < minGap) return;
    lastShakeTimeRef.current = now;

    setScreenShakeMode(mode);
    setScreenShake(true);
    const dur = mode === 'HEAVY' ? 180 : mode === 'CRIT' ? 220 : 140;
    setTimeout(() => {
      setScreenShakeMode(null);
      setScreenShake(false);
    }, dur);
  }, []);

  // Pillar 1: Active Reaction Counterplay (Parry / Guard)
  const executeReactionCounter = useCallback(() => {
    if (!battle || !battle.active || battleResult || guardCooldown > 0) return;
    const enemy = battle.enemy;
    const currentCast = enemy.currentCast;

    // Check if within the active window (last 0.85s of the cast)
    if (currentCast && (currentCast.totalSec - currentCast.elapsedSec) <= 0.85) {
      soundManager.playParry();
      setIsPlayerGuarded(true);
      gameActions.completeNoviceStep(4);
      triggerHitstop(80);
      triggerShake('CRIT');
      setParryFeedback('⚡ PERFECT GUARD! +35% ETHER');
      setTimeout(() => setParryFeedback(null), 900);
      setTimeout(() => setIsPlayerGuarded(false), 900);

      // Award +35 Ether to all player weapons!
      const player = battle.participants.find(p => p.isPlayer);
      if (player) {
        player.equippedWeapons.forEach(w => {
          player.ether[w.id] = Math.min(100, (player.ether[w.id] || 0) + 35);
        });
        const coords = getHunterCoords(player.id);
        spawnSpriteCastHit('BLOCK_GUARD', coords.x, coords.y, 'LIGHT', 1.35);
        addPopup('⚡ PERFECT GUARD! +35% ETHER', 'guard', coords.x, coords.y - 10, 'LIGHT');
      }
      battle.combatLogs.push(`[PARRY] ⚡ ${store.player.name} executed a PERFECT GUARD! Damage negated & Ether surged!`);
      // Interrupt and clear the boss cast so boss attack is negated
      battle.enemy.currentCast = undefined;
    } else {
      // Mistimed: 1.2s lockout
      soundManager.playDebuff();
      setGuardCooldown(1.2);
      setParryFeedback('MISTIMED!');
      setTimeout(() => setParryFeedback(null), 700);
    }
  }, [battle, battleResult, guardCooldown, store.player.name, getHunterCoords, addPopup, triggerHitstop, triggerShake]);

  // Centralized Enemy Damage Application (Combos, Stagger Break & Defeat Checks)
  const applyDamageToEnemy = useCallback((rawDmg: number, element: ElementType, isCrit: boolean, weaponCat?: WeaponCategory, broadcastCoop: boolean = false): number => {
    if (!battle || battle.enemy.hp <= 0) return 0;

    let finalDmg = rawDmg;

    // Pillar 3: Cross-Class Elemental Affliction Combos
    if (elementalAffliction) {
      if (elementalAffliction.type === 'CHILLED' && (weaponCat === 'GREATBLADE' || element === 'WIND')) {
        finalDmg = Math.floor(finalDmg * 1.5);
        addPopup('SHATTER BURST! +50%', 'crit', 19, 30, 'WATER');
        soundManager.playWeaknessHit();
        battle.combatLogs.push(`[COMBO] ❄️ Shatter Burst! Greatblade shattered frozen defenses!`);
        setElementalAffliction(null);
      } else if (elementalAffliction.type === 'OILED' && element === 'FIRE') {
        finalDmg = Math.floor(finalDmg * 1.4);
        addPopup('CONFLAGRATION! 🔥', 'crit', 19, 30, 'FIRE');
        soundManager.playSlash('FIRE');
        setActiveBurnTicks(4);
        battle.combatLogs.push(`[COMBO] 🔥 Conflagration ignited! Target engulfed in flames!`);
        setElementalAffliction(null);
      }
    } else {
      if (element === 'WATER') {
        setElementalAffliction({ element: 'WATER', type: 'CHILLED', durationSec: 6 });
      } else if (element === 'DARK') {
        setElementalAffliction({ element: 'DARK', type: 'OILED', durationSec: 6 });
      }
    }

    battle.enemy.hp = Math.max(0, battle.enemy.hp - finalDmg);

    // Pillar 1: Accumulate Break damage during Break Phase
    if (breakPhaseActive) {
      setBreakDamageAccumulated(prev => {
        const next = prev + finalDmg;
        if (next >= breakDamageRequired && !isBossStaggered) {
          setBreakPhaseActive(false);
          setIsBossStaggered(true);
          hasEnragedRef.current = true;
          soundManager.playBossBreak();
          triggerShake('HEAVY');
          addPopup('STAGGER BROKEN!', 'crit', 19, 32);
          battle.combatLogs.push(`[BREAK SUCCESS] ⚡ Boss Stance Ruptured! ${battle.enemy.name} is STAGGERED for 6s (+50% DMG VULNERABILITY)!`);
          setTimeout(() => setIsBossStaggered(false), 6000);
          return next;
        }
        return next;
      });
    }

    if (battle.enemy.hp <= 0 && !battleResult) {
      checkEnemyDefeated();
    }

    if (broadcastCoop && !battle.isDungeon && finalDmg > 0) {
      broadcastBattleHit(store.currentRealmId, battle.enemyId, finalDmg, store.player.name, isCrit);
    }

    return finalDmg;
  }, [battle, battleResult, elementalAffliction, breakPhaseActive, breakDamageRequired, isBossStaggered, addPopup, checkEnemyDefeated, triggerShake, store.currentRealmId, store.player.name]);

  // Clean expired popups and decay combo
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setPopups(prev => prev.filter(p => now - p.createdAt < 1200));

      // Decay combo streak if idle for > 3.5s
      if (comboTimerRef.current > 0 && now > comboTimerRef.current) {
        setComboCount(0);
        comboTimerRef.current = 0;
      }
    }, 250);
    return () => clearInterval(interval);
  }, []);

  // Common Attack Trigger Handler (Wires SFX, VFX, Combo, and Stagger)
  const executeAttackFeedback = useCallback((
    weapon: Weapon,
    targetX: number,
    targetY: number,
    elemMult: number,
    isCrit: boolean,
    isUlt: boolean = false
  ) => {
    const isWeakness = elemMult > 1.2;
    const arch = isUlt ? 'ULTIMATE_BURST' : getArchetype(weapon.category);

    // Audio Dispatching: Enhanced Elemental Spell Attack based on sword element
    soundManager.playElementalSpellAttack(weapon.element, isCrit, isUlt, false);

    if (isWeakness) {
      soundManager.playWeaknessHit();
      // Increase boss stagger stance
      setBossStagger(prev => {
        const next = prev + (isUlt ? 35 : 20);
        if (next >= 100 && !isBossStaggered) {
          setIsBossStaggered(true);
          soundManager.playBossBreak();
          triggerShake('HEAVY');
          setTimeout(() => setIsBossStaggered(false), 4500);
          return 0;
        }
        return Math.min(100, next);
      });
    }

    if (arch === 'BLOW') {
      soundManager.playHeavyBlow(weapon.element);
    } else if (arch === 'ARROW') {
      soundManager.playArrowVolley();
    }

    if (isCrit) {
      triggerHitstop(65);
      triggerShake('CRIT');
    } else if (isUlt) {
      triggerHitstop(80);
      triggerShake('HEAVY');
    }

    // Trigger Weapon Physical Strike Visual (Weapon appears & hits boss with elemental aura)
    const strikeId = `strike-${Date.now()}-${Math.random()}`;
    const newStrike: WeaponStrikeData = {
      id: strikeId,
      weaponIcon: weapon.icon || '/swords/sword_1.png',
      animatedIcon: weapon.animatedIcon,
      animFrames: weapon.animFrames,
      weaponName: weapon.name,
      element: weapon.element,
      x: targetX,
      y: targetY,
      isUltimate: isUlt,
      isCrit: isCrit,
      angleOffset: (Math.random() - 0.5) * 30
    };

    setWeaponStrikes(prev => [...prev.slice(-4), newStrike]);
    setTimeout(() => {
      setWeaponStrikes(prev => prev.filter(s => s.id !== strikeId));
    }, isUlt ? 600 : 450);

    // Boss physical shudder reaction upon taking weapon hit
    setBossHitReaction(true);
    setTimeout(() => setBossHitReaction(false), 200);

    // SpriteCast PVFX Hit Impact Dispatcher (Crit Starburst, Ground Slam Shockwave, or Hit Spark Core)
    if (isCrit) {
      spawnSpriteCastHit('CRIT_BURST', targetX, targetY, weapon.element, isUlt ? 1.4 : 1.15);
    } else if (arch === 'HEAVY_SLAM') {
      spawnSpriteCastHit('GROUND_SLAM', targetX, targetY + 10, weapon.element, 1.1);
    } else {
      spawnSpriteCastHit('HIT_SPARK', targetX, targetY, weapon.element, isUlt ? 1.25 : 1.0);
    }

    // Increment Combo Counter with dynamic ascending tick
    setComboCount(prev => {
      const next = prev + 1;
      soundManager.playComboTick(next);
      return next;
    });
    comboTimerRef.current = Date.now() + 3500;
  }, [isBossStaggered, triggerHitstop, triggerShake, spawnSpriteCastHit]);

  // Direct Tap-to-Strike on Boss/Enemy (Interactive Attack UX)
  const lastManualTapRef = useRef<number>(0);
  const handleManualBossTap = useCallback(() => {
    const now = Date.now();
    if (now - lastManualTapRef.current < 280) return; // Prevent excessive spam
    lastManualTapRef.current = now;

    if (!battle || !battle.active || battleResult) return;
    const playerCombatant = battle.participants.find(p => p.isPlayer);
    if (!playerCombatant || playerCombatant.isDead) return;

    const mainWeaponId = store.player.equippedWeaponIds[0];
    const mainWeapon = (mainWeaponId && WEAPON_MAP[mainWeaponId]) || getUnarmedFallbackWeapon(playerCombatant.job);

    const upg = mainWeapon.id === '__unarmed__' ? 0 : (store.player.weaponUpgrades[mainWeapon.id] || 0);
    const perks = getWeaponRefinementPerks(upg);
    const elemMult = getElementalMultiplier(mainWeapon.element, battle.enemy.element, playerCombatant.job);
    const comboBonus = 1.0 + Math.min(0.30, comboCount * 0.01);
    const staggerBonus = isBossStaggered ? 2.0 : 1.0;
    const holyCrit = holyAuraTimer > 0 ? 0.25 : 0;
    const isCrit = Math.random() < (playerCombatant.critRate + holyCrit);
    const critMult = 1.5 + perks.critDamageBonus;
    const offensivePower = mainWeapon.id === '__unarmed__' ? Math.max(playerCombatant.atk, playerCombatant.matk) : playerCombatant.atk;
    const rawDmg = Math.max(5, Math.floor(offensivePower * elemMult * comboBonus * staggerBonus * (isCrit ? critMult : 1.0)));
    const dmg = applyDamageToEnemy(rawDmg, mainWeapon.element, isCrit, mainWeapon.category, true);

    playerCombatant.threat += dmg * (playerCombatant.job === 'VANGUARD' ? 2.5 : 1.0);
    const isWeak = elemMult > 1.2;
    const isResist = elemMult < 0.9;
    const popupType = isWeak ? 'weakness' : isResist ? 'resist' : isCrit ? 'crit' : 'damage';

    addPopup(dmg, popupType, 20 + (Math.random() - 0.5) * 4, 50 + (Math.random() - 0.5) * 4, mainWeapon.element);
    executeAttackFeedback(mainWeapon, 20, 50, elemMult, isCrit, false);

    setAnimatingAttackerId(playerCombatant.id);
    setTimeout(() => setAnimatingAttackerId(null), 250);

    if (battle.enemy.hp <= 0 && !battleResult) {
      checkEnemyDefeated();
    }
  }, [battle, battleResult, store.player.equippedWeaponIds, store.player.weaponUpgrades, comboCount, isBossStaggered, holyAuraTimer, applyDamageToEnemy, addPopup, executeAttackFeedback, checkEnemyDefeated]);

  // Trigger weapon skill (Active or Ultimate)
  const triggerSkill = useCallback((weaponId: string) => {
    if (!battle || !battle.active || battleResult) return;
    const playerCombatant = battle.participants.find(p => p.isPlayer);
    if (!playerCombatant || playerCombatant.isDead) return;

    gameActions.completeNoviceStep(3);

    if (weaponId === '__unarmed__') {
      handleManualBossTap();
      return;
    }

    const weapon = WEAPON_MAP[weaponId];
    if (!weapon) return;

    const currentEther = playerCombatant.ether[weaponId] || 0;
    const currentCd = playerCombatant.cooldowns[weaponId] || 0;

    const weaponUpg = store.player.weaponUpgrades[weaponId] || 0;
    const perks = getWeaponRefinementPerks(weaponUpg);

    // Check if Ultimate is ready (100% Ether)
    if (currentEther >= 100) {
      // Cast Ultimate Skill with weapon element!
      soundManager.playUltimate(weapon.element);
      triggerShake('HEAVY');
      setUltimateCutIn({ weaponName: weapon.name, skillName: weapon.ultimateSkillName, element: weapon.element });
      setTimeout(() => setUltimateCutIn(null), 1400);
      playerCombatant.ether[weaponId] = 0;
      setAnimatingAttackerId(playerCombatant.id);
      setTimeout(() => setAnimatingAttackerId(null), 400);

      if (weapon.effectType === 'HEAL') {
        soundManager.playHeal();
        setHolyAuraTimer(12.0); // Party holy crit buff
        const healAmt = Math.floor(playerCombatant.maxHp * weapon.ultimateMultiplier);
        battle.participants.forEach(p => {
          if (p.isDead) {
            p.isDead = false;
            p.hp = healAmt;
          } else {
            p.hp = Math.min(p.maxHp, p.hp + healAmt);
          }
          const c = getHunterCoords(p.id);
          addPopup(healAmt, 'heal', c.x - 2, c.y - 8, 'LIGHT');
        });
        battle.combatLogs.push(`[HOLY CROSS] ✨ Full party empowered with Holy Cross (+25% Crit Rate for 12s)!`);
        battle.combatLogs.push(`[HEAL] ${playerCombatant.name} cast ULTIMATE ${weapon.ultimateSkillName}! Full party healed!`);
        gameActions.syncPlayerHp(playerCombatant.hp);
        if (!battle.isDungeon) broadcastBattleHeal(store.currentRealmId, battle.enemyId, healAmt, playerCombatant.name);
      } else if (weapon.effectType === 'BUFF_DEF') {
        soundManager.playShield();
        playerCombatant.buffs.push({
          id: `buff-${Date.now()}`,
          name: weapon.ultimateSkillName,
          type: 'SHIELD',
          value: 0.50,
          durationSec: 10,
          remainingSec: 10,
          shieldHp: Math.floor(playerCombatant.maxHp * 0.4)
        });
        const pCoords = getHunterCoords(playerCombatant.id);
        addPopup('SHIELD +50%', 'shield', pCoords.x - 2, pCoords.y - 8, 'LIGHT');
        battle.combatLogs.push(`[SHIELD] ${playerCombatant.name} cast ULTIMATE ${weapon.ultimateSkillName}! Massive shield activated!`);
      } else {
        // Damage Ultimate
        const hits = weapon.ultHits || 5;
        const elemMult = getElementalMultiplier(weapon.element, battle.enemy.element, playerCombatant.job);
        const comboBonus = 1.0 + Math.min(0.30, comboCount * 0.01);
        const staggerBonus = isBossStaggered ? 2.0 : 1.0;
        const baseDmg = Math.max(10, Math.floor((playerCombatant.atk + playerCombatant.matk * 0.8) * (weapon.ultimateMultiplier / hits) * elemMult * comboBonus * staggerBonus));

        for (let i = 0; i < hits; i++) {
          setTimeout(() => {
            const holyCrit = holyAuraTimer > 0 ? 0.25 : 0;
            const isCrit = Math.random() < (playerCombatant.critRate + 0.25 + holyCrit);
            const critMult = 1.75 + perks.critDamageBonus;
            const rawHitDmg = Math.floor(baseDmg * (isCrit ? critMult : 1.0));
            const hitDmg = applyDamageToEnemy(rawHitDmg, weapon.element, isCrit, weapon.category, true);

            const isWeak = elemMult > 1.2;
            const isResist = elemMult < 0.9;
            const popupType = isWeak ? 'weakness' : isResist ? 'resist' : isCrit ? 'crit' : 'damage';

            addPopup(hitDmg, popupType, 20 + (Math.random() - 0.5) * 5, 50 + (Math.random() - 0.5) * 5, weapon.element);
            executeAttackFeedback(weapon, 20, 50, elemMult, isCrit, true);

            const threatMod = playerCombatant.job === 'VANGUARD' ? 2.5 : 1.0;
            playerCombatant.threat += hitDmg * threatMod;
          }, i * 120);
        }

        battle.combatLogs.push(`[ULTIMATE] ${playerCombatant.name} unleashed [${weapon.ultimateSkillName}]!`);
      }

      return;
    }

    // Active Skill
    if (currentCd <= 0) {
      soundManager.playElementalSpellCast(weapon.element);
      const effCd = Math.max(1.0, weapon.cooldownSec - perks.cooldownReductionSec);
      playerCombatant.cooldowns[weaponId] = effCd;
      playerCombatant.ether[weaponId] = Math.min(100, currentEther + weapon.etherGain);

      setAnimatingAttackerId(playerCombatant.id);
      setTimeout(() => setAnimatingAttackerId(null), 350);

      if (weapon.effectType === 'HEAL') {
        soundManager.playHeal();
        setHolyAuraTimer(8.0); // Holy Cross buff
        const healAmt = Math.floor(playerCombatant.maxHp * weapon.activeMultiplier);

        // Prioritize targeted ally if set
        const targeted = battle.participants.find(p => p.id === selectedAllyId && !p.isDead);
        if (targeted) {
          const bonusHeal = Math.floor(healAmt * 1.5);
          targeted.hp = Math.min(targeted.maxHp, targeted.hp + bonusHeal);
          const c = getHunterCoords(targeted.id);
          addPopup(bonusHeal, 'heal', c.x - 2, c.y - 8, 'LIGHT');
        }

        battle.participants.forEach(p => {
          if (!p.isDead && p.id !== selectedAllyId) {
            p.hp = Math.min(p.maxHp, p.hp + healAmt);
            const c = getHunterCoords(p.id);
            addPopup(healAmt, 'heal', c.x - 2, c.y - 8, 'LIGHT');
          }
        });
        battle.combatLogs.push(`[HOLY CROSS] ✨ Divine radiance empowers the party (+25% Crit Rate for 8s)!`);
        battle.combatLogs.push(`[HEAL] ${playerCombatant.name} used ${weapon.activeSkillName} (+${healAmt} HP)`);
        gameActions.syncPlayerHp(playerCombatant.hp);
        if (!battle.isDungeon) broadcastBattleHeal(store.currentRealmId, battle.enemyId, healAmt, playerCombatant.name);
      } else if (weapon.effectType === 'BUFF_DEF') {
        soundManager.playShield();
        playerCombatant.buffs.push({
          id: `buff-${Date.now()}`,
          name: weapon.activeSkillName,
          type: 'DEF',
          value: 0.30,
          durationSec: 8,
          remainingSec: 8
        });
        const pCoords = getHunterCoords(playerCombatant.id);
        addPopup('DEF +30%', 'buff', pCoords.x - 2, pCoords.y - 8, 'LIGHT');
        battle.combatLogs.push(`[SHIELD] ${playerCombatant.name} activated ${weapon.activeSkillName}!`);
      } else {
        // Damage Active
        const elemMult = getElementalMultiplier(weapon.element, battle.enemy.element, playerCombatant.job);
        const holyCrit = holyAuraTimer > 0 ? 0.25 : 0;
        const isCrit = Math.random() < (playerCombatant.critRate + holyCrit);
        const critMult = 1.5 + perks.critDamageBonus;
        const comboBonus = 1.0 + Math.min(0.30, comboCount * 0.01);
        const staggerBonus = isBossStaggered ? 2.0 : 1.0;
        const rawDmg = Math.max(10, Math.floor((playerCombatant.atk + playerCombatant.matk * 0.7) * weapon.activeMultiplier * elemMult * comboBonus * staggerBonus * (isCrit ? critMult : 1.0)));

        const dmg = applyDamageToEnemy(rawDmg, weapon.element, isCrit, weapon.category, true);
        const threatMod = playerCombatant.job === 'VANGUARD' ? 2.5 : 1.0;
        playerCombatant.threat += dmg * threatMod;

        const isWeak = elemMult > 1.2;
        const isResist = elemMult < 0.9;
        const popupType = isWeak ? 'weakness' : isResist ? 'resist' : isCrit ? 'crit' : 'damage';

        addPopup(dmg, popupType, 20 + (Math.random() - 0.5) * 4, 50 + (Math.random() - 0.5) * 4, weapon.element);
        executeAttackFeedback(weapon, 20, 50, elemMult, isCrit, false);

        battle.combatLogs.push(`[ATTACK] ${playerCombatant.name} used ${weapon.activeSkillName} (${dmg} DMG)`);

        // Refinement Milestone Perk +10: Awakened Double-Strike
        if (perks.awakenedDoubleStrike && Math.random() < 0.15) {
          setTimeout(() => {
            const echoDmg = Math.floor(dmg * 0.7);
            applyDamageToEnemy(echoDmg, weapon.element, true, weapon.category);
            addPopup(`⚡ ECHO: ${echoDmg}`, 'crit', 20, 46, weapon.element);
            soundManager.playCrit();
            battle.combatLogs.push(`[AWAKENED] ⚡ ${weapon.name} triggered an Awakened Double-Strike!`);
          }, 180);
        }
      }
    }
  }, [battle, battleResult, comboCount, isBossStaggered, getHunterCoords, addPopup, executeAttackFeedback, checkEnemyDefeated, applyDamageToEnemy, selectedAllyId, holyAuraTimer, store.player.weaponUpgrades, triggerShake]);

  // Main Combat Loop Tick (Runs every 100ms)
  useEffect(() => {
    if (!battle || !battle.active || battleResult) return;

    const interval = setInterval(() => {
      const dt = 0.1; // 100ms

      // Tick Reaction Guard cooldown & Holy Cross Aura
      setGuardCooldown(prev => Math.max(0, prev - dt));
      setHolyAuraTimer(prev => Math.max(0, prev - dt));

      // Tick Elemental Affliction duration
      setElementalAffliction(prev => {
        if (!prev) return null;
        const remaining = prev.durationSec - dt;
        return remaining > 0 ? { ...prev, durationSec: remaining } : null;
      });

      // Tick Conflagration burn ticks on enemy
      burnTimerRef.current += dt;
      if (burnTimerRef.current >= 1.0 && activeBurnTicks > 0) {
        burnTimerRef.current = 0;
        setActiveBurnTicks(prev => prev - 1);
        const burnDmg = Math.max(25, Math.floor(battle.enemy.maxHp * 0.012));
        applyDamageToEnemy(burnDmg, 'FIRE', false);
        addPopup(burnDmg, 'damage', 19, 36, 'FIRE');
        soundManager.playSlash('FIRE');
      }

      // Check Boss Stagger Break Phase trigger (<50% HP)
      if (battle.enemy.isBoss && !breakPhaseTriggeredRef.current && battle.enemy.hp <= battle.enemy.maxHp * 0.5) {
        breakPhaseTriggeredRef.current = true;
        soundManager.playBossRoar();
        setBreakPhaseActive(true);
        setBreakTimeRemaining(5.0);
        const req = Math.max(3000, Math.floor(battle.enemy.maxHp * 0.22));
        setBreakDamageRequired(req);
        setBreakDamageAccumulated(0);
        triggerShake('HEAVY');
        battle.combatLogs.push(`[PHASE 2 BREAK] ⚠️ ${battle.enemy.name} channels [Cataclysmic Rupture]! Deal ${req.toLocaleString()} DMG within 5s to STAGGER!`);
      }

      // Tick Break Phase countdown
      if (breakPhaseActive) {
        setBreakTimeRemaining(prev => {
          const next = Math.max(0, prev - dt);
          if (next <= 0) {
            // Break phase expired: boss detonates Cataclysmic Rupture!
            setBreakPhaseActive(false);
            hasEnragedRef.current = true;
            soundManager.playHeavyBlow(battle.enemy.element);
            triggerShake('HEAVY');
            battle.participants.forEach(p => {
              if (!p.isDead) {
                const nukeDmg = Math.floor(p.hp * 0.45);
                p.hp = Math.max(1, p.hp - nukeDmg);
                const c = getHunterCoords(p.id);
                addPopup(nukeDmg, 'damage', c.x - 2, c.y - 8, battle.enemy.element);
              }
            });
            battle.combatLogs.push(`[BREAK FAILED] 💥 ${battle.enemy.name} detonates [Cataclysmic Rupture] dealing 45% HP damage! Berserk Enrage unleashed!`);
          }
          return next;
        });
      }

      // 1. Tick Drop-In mechanism for AI Allies
      dropInTimerRef.current += dt;
      if (dropInTimerRef.current >= 4.5 && battle.participants.length < 5) {
        dropInTimerRef.current = 0;
        const freeAI = store.aiHunters.find(h => h.state !== 'IN_BATTLE');
        if (freeAI) {
          gameActions.aiJoinBattle(freeAI.id, battle.id);
          soundManager.playDropIn();
        }
      }

      // 2. Tick Player & AI Combatants
      battle.participants.forEach(hunter => {
        if (hunter.isDead) return;

        // Tick buffs
        hunter.buffs.forEach(b => {
          b.remainingSec -= dt;
        });
        hunter.buffs = hunter.buffs.filter(b => b.remainingSec > 0);

        // Tick cooldowns
        Object.keys(hunter.cooldowns).forEach(wId => {
          if (hunter.cooldowns[wId] > 0) {
            hunter.cooldowns[wId] = Math.max(0, hunter.cooldowns[wId] - dt);
          }
        });

        // Tick Auto-Attack (scales with refinement Haste perk, falls back cleanly to Unarmed Strike)
        const mainWeapon = hunter.equippedWeapons[0] || getUnarmedFallbackWeapon(hunter.job);
        const upg = hunter.isPlayer && mainWeapon.id !== '__unarmed__' ? (store.player.weaponUpgrades[mainWeapon.id] || 0) : 0;
        const perks = getWeaponRefinementPerks(upg);
        const attackInterval = 2.0 * (1 - perks.hasteBonus);

        hunter.autoAttackTimer += dt;
        if (hunter.autoAttackTimer >= attackInterval) {
          hunter.autoAttackTimer = 0;
          const elemMult = getElementalMultiplier(mainWeapon.element, battle.enemy.element, hunter.job);
          const comboBonus = 1.0 + Math.min(0.30, comboCount * 0.01);
          const staggerBonus = isBossStaggered ? 2.0 : 1.0;

          // Shadowblade hits twice per passive
          const hits = hunter.job === 'SHADOWBLADE' ? 2 : 1;
          const baseStat = mainWeapon.id === '__unarmed__' ? Math.max(hunter.atk, hunter.matk) : hunter.atk;
          for (let h = 0; h < hits; h++) {
            const holyCrit = holyAuraTimer > 0 ? 0.25 : 0;
            const isCrit = Math.random() < (hunter.critRate + holyCrit);
            const critMult = 1.5 + perks.critDamageBonus;
            const rawDmg = Math.max(5, Math.floor(baseStat * elemMult * comboBonus * staggerBonus * (isCrit ? critMult : 1.0)));
            const dmg = applyDamageToEnemy(rawDmg, mainWeapon.element, isCrit, mainWeapon.category, hunter.isPlayer);

            const threatMod = hunter.job === 'VANGUARD' ? 2.5 : 1.0;
            hunter.threat += dmg * threatMod;

            const isWeak = elemMult > 1.2;
            const isResist = elemMult < 0.9;
            const popupType = isWeak ? 'weakness' : isResist ? 'resist' : isCrit ? 'crit' : 'damage';

            addPopup(dmg, popupType, 20 + (Math.random() - 0.5) * 4, 50 + (Math.random() - 0.5) * 4, mainWeapon.element);
            executeAttackFeedback(mainWeapon, 20, 50, elemMult, isCrit, false);
          }

          setAnimatingAttackerId(hunter.id);
          setTimeout(() => setAnimatingAttackerId(null), 250);

          if (battle.enemy.hp <= 0 && !battleResult) {
            checkEnemyDefeated();
            return;
          }
        }

        // Auto-Battle for Player OR Autonomous behavior for AI
        if ((hunter.isPlayer && store.autoBattle) || (!hunter.isPlayer)) {
          hunter.equippedWeapons.forEach(w => {
            const eth = hunter.ether[w.id] || 0;
            const cd = hunter.cooldowns[w.id] || 0;

            if (eth >= 100) {
              if (hunter.isPlayer) {
                triggerSkill(w.id);
              } else {
                // AI casts Ultimate
                hunter.ether[w.id] = 0;
                if (w.effectType === 'HEAL') {
                  soundManager.playHeal();
                  const healAmt = Math.floor(hunter.maxHp * w.ultimateMultiplier);
                  battle.participants.forEach(p => {
                    p.hp = Math.min(p.maxHp, p.hp + healAmt);
                    const c = getHunterCoords(p.id);
                    addPopup(healAmt, 'heal', c.x - 2, c.y - 8, 'LIGHT');
                  });
                  battle.combatLogs.push(`[HEAL] Ally ${hunter.name} cast ULTIMATE ${w.ultimateSkillName}!`);
                } else {
                  const elemMult = getElementalMultiplier(w.element, battle.enemy.element, hunter.job);
                  const rawDmg = Math.floor((hunter.atk + hunter.matk) * w.ultimateMultiplier * elemMult * (isBossStaggered ? 2.0 : 1.0));
                  const dmg = applyDamageToEnemy(rawDmg, w.element, true, w.category);
                  hunter.threat += dmg;
                  addPopup(dmg, 'crit', 20, 50, w.element);
                  executeAttackFeedback(w, 20, 50, elemMult, true, true);
                  battle.combatLogs.push(`[ULTIMATE] Ally ${hunter.name} cast ULTIMATE ${w.ultimateSkillName} (${dmg} DMG)!`);
                }
              }
            } else if (cd <= 0 && Math.random() < 0.25) {
              if (hunter.isPlayer) {
                triggerSkill(w.id);
              } else {
                // AI casts active skill
                hunter.cooldowns[w.id] = w.cooldownSec;
                hunter.ether[w.id] = Math.min(100, eth + w.etherGain);
                const elemMult = getElementalMultiplier(w.element, battle.enemy.element, hunter.job);
                const rawDmg = Math.floor(hunter.atk * w.activeMultiplier * elemMult * (isBossStaggered ? 2.0 : 1.0));
                const dmg = applyDamageToEnemy(rawDmg, w.element, false, w.category);
                hunter.threat += dmg * (hunter.job === 'VANGUARD' ? 2.5 : 1.0);
                addPopup(dmg, elemMult > 1.2 ? 'weakness' : 'damage', 20, 50, w.element);
                executeAttackFeedback(w, 20, 50, elemMult, false, false);
              }
            }
          });
        }
      });

      // 3. Tick Enemy Attack & Telegraphing Cast Bar
      const enemy = battle.enemy;
      const tmpl = ENEMY_TEMPLATES[enemy.templateId] || ENEMY_TEMPLATES['moss-slime'];

      // If currently casting a telegraphed skill
      if (enemy.currentCast) {
        enemy.currentCast.elapsedSec += dt;
        if (enemy.currentCast.elapsedSec >= enemy.currentCast.totalSec) {
          // Cast finished! Execute heavy skill attack!
          const skill = enemy.currentCast;
          enemy.currentCast = undefined;

          const aliveHunters = battle.participants.filter(p => !p.isDead);
          if (aliveHunters.length === 0) {
            setBattleResult('DEFEAT');
            return;
          }

          if (skill.isAoE) {
            aliveHunters.forEach(h => {
              let dmgRed = h.job === 'VANGUARD' ? 0.20 : 0.0;
              const defBuff = h.buffs.find(b => b.type === 'DEF');
              if (defBuff) dmgRed += defBuff.value;

              let incomingDmg = Math.max(10, Math.floor(enemy.matk * skill.multiplier * (1 - dmgRed)));

              // Perfect Guard / Evade Reaction mitigation
              if (h.isPlayer && isPlayerGuarded) {
                incomingDmg = Math.max(1, Math.floor(incomingDmg * 0.10));
                const c = getHunterCoords(h.id);
                addPopup('GUARDED! -90%', 'shield', c.x - 2, c.y - 12, 'LIGHT');
              }

              h.hp = Math.max(0, h.hp - incomingDmg);
              if (h.hp <= 0) h.isDead = true;

              executeBossAttackOnHunter(h, incomingDmg, enemy.element, true, true);
            });
            soundManager.playHeavyBlow(enemy.element);
            triggerShake('LIGHT');
            battle.combatLogs.push(`[AOE] ${enemy.name} unleashed [${skill.skillName}] AoE on all hunters!`);
          } else {
            const target = [...aliveHunters].sort((a, b) => b.threat - a.threat)[0];
            if (target) {
              let dmgRed = target.job === 'VANGUARD' ? 0.20 : 0.0;
              const defBuff = target.buffs.find(b => b.type === 'DEF');
              if (defBuff) dmgRed += defBuff.value;

              let incomingDmg = Math.max(10, Math.floor(enemy.atk * skill.multiplier * (1 - dmgRed)));

              // Perfect Guard / Evade Reaction mitigation
              if (target.isPlayer && isPlayerGuarded) {
                incomingDmg = Math.max(1, Math.floor(incomingDmg * 0.10));
                const c = getHunterCoords(target.id);
                addPopup('GUARDED! -90%', 'guard', c.x, c.y - 8, 'LIGHT');
              }

              target.hp = Math.max(0, target.hp - incomingDmg);
              if (target.hp <= 0) target.isDead = true;

              soundManager.playHeavyBlow(enemy.element);
              triggerShake('LIGHT');
              executeBossAttackOnHunter(target, incomingDmg, enemy.element, false, true);
              battle.combatLogs.push(`[HEAVY] ${enemy.name} slammed [${target.name}] with ${skill.skillName}!`);
            }
          }

          if (battle.participants.every(p => p.isDead)) {
            setBattleResult('DEFEAT');
          }
        }
      } else {
        // Tick regular enemy attack
        enemy.attackTimer += dt;
        const intervalModifier = hasEnragedRef.current ? 0.75 : 1.0;
        if (enemy.attackTimer >= (tmpl.attackInterval || 2.5) * intervalModifier) {
          enemy.attackTimer = 0;

          // Check if boss starts casting a telegraphed skill
          if (tmpl.skills && tmpl.skills.length > 0 && Math.random() < 0.4) {
            const skill = tmpl.skills[Math.floor(Math.random() * tmpl.skills.length)];
            soundManager.playTelegraphWarning();
            enemy.currentCast = {
              skillName: skill.name,
              totalSec: skill.castTime,
              elapsedSec: 0,
              isAoE: skill.isAoE,
              multiplier: skill.multiplier
            };
            battle.combatLogs.push(`[WARNING] ${enemy.name} is preparing [${skill.name}]! (${skill.castTime}s cast)`);
          } else {
            const aliveHunters = battle.participants.filter(p => !p.isDead);
            if (aliveHunters.length === 0) {
              soundManager.playDefeat();
              setBattleResult('DEFEAT');
              return;
            }

            const target = [...aliveHunters].sort((a, b) => b.threat - a.threat)[0];
            if (target) {
              let dmgRed = target.job === 'VANGUARD' ? 0.20 : 0.0;
              const dmg = Math.max(5, Math.floor(enemy.atk * (1 - dmgRed)));
              target.hp = Math.max(0, target.hp - dmg);
              if (target.hp <= 0) target.isDead = true;

              soundManager.playSlash(enemy.element);
              executeBossAttackOnHunter(target, dmg, enemy.element, false, false);
              battle.combatLogs.push(`${enemy.name} attacked ${target.name} for ${dmg} DMG`);

              if (battle.participants.every(p => p.isDead)) {
                soundManager.playDefeat();
                setBattleResult('DEFEAT');
              }
            }
          }
        }
      }

      // Sync live player battle HP with TopHud bar every combat tick
      const playerPart = battle.participants.find(p => p.isPlayer);
      if (playerPart) {
        gameActions.syncPlayerHp(playerPart.hp);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [battle, battleResult, comboCount, isBossStaggered, store.autoBattle, store.aiHunters, triggerSkill, addPopup, executeAttackFeedback, executeBossAttackOnHunter, getHunterCoords, checkEnemyDefeated]);

  // Listen for live P2P / Multi-Tab Co-op teammate hits, heals & emotes
  useEffect(() => {
    if (!battle || !battle.active || battleResult || battle.isDungeon) return;
    const unsubHits = subscribeCoopHits(ev => {
      if (ev.realmId !== store.currentRealmId || ev.enemyId !== battle.enemyId || battle.enemy.hp <= 0) return;
      battle.enemy.hp = Math.max(0, battle.enemy.hp - ev.damage);
      addPopup(`[CO-OP] ${ev.damage}`, ev.isCrit ? 'crit' : 'damage', 20 + (Math.random() - 0.5) * 4, 46, 'LIGHT');
      battle.combatLogs.push(`[CO-OP] 🤝 ${ev.playerName} struck ${battle.enemy.name} for ${ev.damage} DMG!`);
      if (battle.enemy.hp <= 0) {
        checkEnemyDefeated();
      }
    });
    const unsubHeals = subscribeCoopHeals(ev => {
      if (ev.realmId !== store.currentRealmId || ev.enemyId !== battle.enemyId) return;
      const p = battle.participants.find(part => part.isPlayer);
      if (p && !p.isDead) {
        p.hp = Math.min(p.maxHp, p.hp + ev.amount);
        gameActions.syncPlayerHp(p.hp);
        const c = getHunterCoords(p.id);
        addPopup(ev.amount, 'heal', c.x - 2, c.y - 8, 'LIGHT');
        battle.combatLogs.push(`[CO-OP HEAL] ✨ ${ev.healerName} healed you (+${ev.amount} HP)!`);
      }
    });
    const unsubEmotes = subscribeCoopEmotes(ev => {
      if (ev.realmId !== store.currentRealmId) return;
      battle.combatLogs.push(`[CO-OP ${ev.playerName}]: ${ev.text}`);
    });
    return () => {
      unsubHits();
      unsubHeals();
      unsubEmotes();
    };
  }, [battle, battleResult, store.currentRealmId, addPopup, checkEnemyDefeated, getHunterCoords]);

  if (!battle) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        Battle concluded.
      </div>
    );
  }

  const playerCombatant = battle.participants.find(p => p.isPlayer);
  const tmpl = ENEMY_TEMPLATES[battle.enemy.templateId] || ENEMY_TEMPLATES['moss-slime'];
  const enemyHpPercent = Math.max(0, Math.min(100, (battle.enemy.hp / battle.enemy.maxHp) * 100));
  const bossWeakness = getWeaknessElement(battle.enemy.element);
  const shouldShake = screenShake && (store.player.settings?.screenShake ?? true);
  const isCastingSkill = !!ultimateCutIn || !!animatingAttackerId;

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between bg-slate-950 relative overflow-hidden select-none">
      
      {/* ======================================================== */}
      {/* 4-LAYER 2.5D PARALLAX BATTLEFIELD (Senran Samurai Kingdom) */}
      {/* ======================================================== */}
      <div className={`absolute inset-0 pointer-events-none overflow-hidden ${shouldShake ? (screenShakeMode === 'CRIT' ? 'animate-heavy-shake' : 'animate-subtle-shake') : ''}`}>
        
        {/* LAYER 0: AUTHENTIC HIGH-RES BATTLEGROUND (Final Fantasy Brave Exvius) */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={battle.background || getBattlegroundForCombat(store.currentRealmId, battle.isBoss, battle.enemyElement)}
            alt={battle.enemyName}
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
            style={{
              filter: 'brightness(0.82) contrast(1.1) saturate(1.15)',
              imageRendering: 'auto'
            }}
          />
          {/* Subtle Dynamic Ambient Lighting Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/80" />
          {battle.isBoss && (
            <div className="absolute inset-0 bg-radial-vignette opacity-60 mix-blend-multiply" />
          )}
        </div>

        {/* LAYER 1: ATMOSPHERIC DRIFT & STEAM/HAZE (BG_B_yuge inspired) */}
        <div
          className="absolute bottom-[38%] w-[200%] h-16 bg-gradient-to-t from-white/10 via-amber-200/5 to-transparent opacity-50 animate-pulse pointer-events-none"
          style={{
            transform: 'translateX(-20%)',
            filter: 'blur(8px)'
          }}
        />

        {/* LAYER 2: AUTHENTIC PMD WEATHER OVERLAY */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <PmdWeatherOverlay
            weatherEffect={getBigMapForRealm(store.currentRealmId).weatherEffect}
            width={640}
            height={480}
            variant="battle"
          />
        </div>

        {/* LAYER 3: 2.5D PIXEL-MATCHED ARENA GROUND STAGE */}
        <div className="absolute bottom-0 w-full h-[42%] overflow-hidden pointer-events-none">
          {/* Subtle 16-bit native Tiles/ ground texture strip harmonizing combat floor with current map */}
          {arenaGroundTileUrl && (
            <div
              className="absolute inset-x-0 bottom-0 h-full opacity-25"
              style={{
                backgroundImage: `url(${arenaGroundTileUrl})`,
                backgroundSize: '24px 24px',
                imageRendering: 'pixelated',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 90%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 90%)',
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent">
            <div
              className="absolute left-1/2 bottom-8 w-[380px] h-[130px] rounded-[50%] border border-amber-400/30 transform -translate-x-1/2 pointer-events-none animate-pulse"
              style={{
                boxShadow: '0 0 35px rgba(245, 158, 11, 0.25), inset 0 0 25px rgba(245, 158, 11, 0.15)'
              }}
            >
              <div className="absolute inset-2 rounded-[50%] border border-amber-300/20 border-dashed" />
            </div>
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          </div>
        </div>

        {/* LAYER 4: COMBAT FOCUS DIMMER VIGNETTE (SamkinAttackBackgroundAnim_back) */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            isCastingSkill ? 'opacity-70 bg-black/75' : 'opacity-0'
          }`}
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,0.92) 85%)'
          }}
        />

        {/* SIDE LACQUER BORDER FRAMING (bg_side inspired - frames wide desktop displays) */}
        <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-600/30 via-amber-400/20 to-transparent border-r border-amber-500/30" />
        <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-amber-600/30 via-amber-400/20 to-transparent border-l border-amber-500/30" />
      </div>

      {/* Floating Damage & Healing Popups */}
      <DamagePopup
        popups={popups}
        damageTextMode={store.player.settings?.damageTextMode}
      />

      {/* SpriteCast PVFX Hit Sparks, Critical Bursts, Guard Barriers & Ground Slams */}
      {spriteCastHits.map(hit => (
        <SpriteCastHitEffect key={hit.id} {...hit} />
      ))}

      {/* Cinematic Anime Ultimate Cut-In Banner */}
      {ultimateCutIn && (
        <div className="absolute inset-x-0 top-16 z-40 pointer-events-none flex flex-col items-center animate-fadeIn">
          <div className="w-full bg-gradient-to-r from-transparent via-slate-950/95 to-transparent py-2.5 px-4 border-y-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.7)] flex flex-col items-center text-center backdrop-blur-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 animate-pulse flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{ANIME_ELEMENTS[ultimateCutIn.element]?.breathingStyle || 'ELEMENTAL TECHNIQUE'} - {ultimateCutIn.element}</span>
              <Zap className="w-3 h-3 text-amber-400" />
            </span>
            <h2 className="text-base font-black text-white tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {ultimateCutIn.skillName}
            </h2>
            <span className="text-[8px] font-bold text-slate-300">
              {ultimateCutIn.weaponName}
            </span>
          </div>
        </div>
      )}

      {/* Header: Battle Name + Afflictions + Combo Counter + Drop-In Party Counter */}
      <div className="relative z-20 px-3 pt-2 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded-full shadow">
          <span className={`text-[10px] font-bold px-1.5 rounded ${getElementBgClass(battle.enemy.element)}`}>
            {battle.enemy.element}
          </span>
          <span className="text-xs font-bold text-slate-100">{battle.enemy.name}</span>
          {battle.isDungeon ? (
            <span className="text-[9px] font-black uppercase text-purple-300 bg-purple-950/80 border border-purple-500/50 px-1.5 rounded">
              WAVE {battle.currentWave}/{battle.totalWaves}
            </span>
          ) : battle.isBoss ? (
            <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-950/60 border border-amber-500/40 px-1 rounded flex items-center space-x-0.5">
              <Flame className="w-2.5 h-2.5 text-amber-400" />
              <span>WORLD BOSS</span>
            </span>
          ) : null}

          {/* Elemental Affliction Status Pill */}
          {elementalAffliction && (
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border animate-pulse ${
              elementalAffliction.type === 'CHILLED'
                ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400'
                : 'bg-purple-950/90 text-purple-300 border-purple-400'
            }`}>
              {elementalAffliction.type === 'CHILLED' ? '❄️ CHILLED (Weak to Greatblade)' : '💧 OILED (Weak to Fire)'}
            </span>
          )}

          {/* Holy Cross Party Aura Buff */}
          {holyAuraTimer > 0 && (
            <span className="text-[8px] font-black uppercase text-amber-300 bg-amber-950/80 border border-amber-400/80 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse flex items-center space-x-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>HOLY CROSS: +25% CRIT</span>
            </span>
          )}
        </div>

        {/* Right: Hunter Party Counter */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-blue-950/80 border border-blue-500/40 px-2 py-0.5 rounded-full shadow">
            <UserPlus className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-300">
              {battle.participants.length}/5
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Combat Floating Combo Counter (Prominently centered in upper battlefield) */}
      {comboCount > 1 && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none flex items-center space-x-1.5 bg-gradient-to-r from-amber-950/90 via-yellow-950/95 to-amber-950/90 border-2 border-amber-400/90 px-3 py-0.5 rounded-full shadow-[0_0_16px_rgba(245,158,11,0.8)] animate-bounce">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-black text-amber-300 font-mono tracking-wider">
            {comboCount} HITS! (+{Math.min(30, Math.floor(comboCount * 1.5))}%)
          </span>
        </div>
      )}

      {/* Mid-Battle Wave Clear Notice */}
      {waveClearNotice && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-xl shadow-2xl z-40 text-xs animate-bounce border-2 border-white">
          {waveClearNotice}
        </div>
      )}

      {/* Mid-Battle Drop-In Toast Alerts */}
      {store.dropInNotifications.length > 0 && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center space-y-1">
          {store.dropInNotifications.slice(-1).map((msg, i) => (
            <div
              key={i}
              className="bg-cyan-950/95 border border-cyan-400/80 text-cyan-200 text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-bounce"
            >
              {msg}
            </div>
          ))}
        </div>
      )}

      {/* Side-View JRPG Battle Field */}
      <div className={`relative flex-1 w-full flex items-center justify-between px-3 z-10 ${shouldShake ? (screenShakeMode === 'CRIT' ? 'animate-heavy-shake' : 'animate-subtle-shake') : ''}`}>
        
        {/* Boss / Monster Floating Status (Pinned cleanly at top-left) */}
        <div className="absolute top-1.5 left-3 z-20 w-full max-w-[170px] flex flex-col items-center pointer-events-none">
          {/* Boss 50% HP Stagger Break Phase Bar */}
          {breakPhaseActive && (
            <div className="w-full bg-gradient-to-r from-red-950/90 via-rose-900/80 to-amber-950/90 border border-rose-500 rounded-lg p-1.5 shadow-[0_0_15px_rgba(244,63,94,0.7)] animate-pulse mb-1.5 pointer-events-auto">
              <div className="flex items-center justify-between text-[8px] font-black text-rose-300">
                <span className="flex items-center space-x-1">
                  <Flame className="w-2.5 h-2.5 text-rose-400 animate-bounce" />
                  <span>STAGGER BREAK</span>
                </span>
                <span className="font-mono text-amber-300">{breakTimeRemaining.toFixed(1)}s</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full border border-rose-500/60 overflow-hidden mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-150"
                  style={{ width: `${Math.min(100, (breakDamageAccumulated / Math.max(1, breakDamageRequired)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[7px] text-slate-300 font-mono mt-0.5">
                <span>BREAK GAUGE</span>
                <span>{breakDamageAccumulated.toLocaleString()} / {breakDamageRequired.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Boss Name + Percentage */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-300 px-0.5 mb-0.5 pointer-events-auto">
            <span className="font-bold truncate text-[11px] text-white drop-shadow">{battle.enemy.name}</span>
            <span className="font-bold text-slate-400">{Math.floor(enemyHpPercent)}%</span>
          </div>

          {/* Elemental Affinities & Weakness Clue Badge */}
          <div className="w-full flex items-center space-x-1.5 mb-1 px-0.5 pointer-events-auto">
            <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full border shadow-sm ${getElementBgClass(battle.enemy.element)}`}>
              {battle.enemy.element}
            </span>
            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">WEAK:</span>
            <span
              className="text-[8px] font-black px-1.5 py-0.2 rounded-full border shadow-sm animate-pulse flex items-center space-x-0.5"
              style={{
                backgroundColor: `${getElementColor(bossWeakness)}22`,
                color: getElementColor(bossWeakness),
                borderColor: `${getElementColor(bossWeakness)}80`
              }}
            >
              <span>{bossWeakness}</span>
              <span className="text-[7px]">1.5x</span>
            </span>
          </div>

          {/* Boss HP Bar */}
          <div className="w-full h-3.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden shadow-inner relative pointer-events-auto">
            <div
              className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 transition-all duration-300"
              style={{ width: `${enemyHpPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {battle.enemy.hp.toLocaleString()} / {battle.enemy.maxHp.toLocaleString()}
            </span>
          </div>

          {/* Boss Stance Break Gauge (GvcBossDown from Samkin) */}
          <div className="w-full mt-1 flex flex-col pointer-events-auto">
            <div className="flex items-center justify-between text-[7.5px] text-slate-400 font-mono px-0.5">
              <span>{isBossStaggered ? 'STAGGER VULNERABILITY' : 'STAGGER GAUGE'}</span>
              <span className={isBossStaggered ? 'text-cyan-300 font-black' : 'text-amber-400 font-bold'}>
                {isBossStaggered ? 'STAGGERED!' : `${bossStagger}%`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden mt-0.5">
              <div
                className={`h-full transition-all duration-200 ${
                  isBossStaggered ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]' : 'bg-gradient-to-r from-amber-600 to-amber-400'
                }`}
                style={{ width: `${isBossStaggered ? 100 : bossStagger}%` }}
              />
            </div>
            {isBossStaggered && (
              <span className="text-[7.5px] font-black uppercase text-cyan-300 tracking-wider text-center animate-bounce mt-0.5 bg-cyan-950/80 border border-cyan-400/60 rounded px-1 py-0.2">
                ⚡ BREAK! 2.0x DMG (STAGGERED)
              </span>
            )}
          </div>

          {/* Warning Cast Bar (Telegraphing) */}
          {battle.enemy.currentCast && (
            <div className="w-full mt-1.5 flex flex-col items-center animate-pulse pointer-events-auto">
              <div className="w-full flex items-center justify-between text-[9px] text-amber-400 font-bold px-0.5">
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="w-2.5 h-2.5 text-amber-400 animate-bounce" />
                  <span className="truncate">{battle.enemy.currentCast.skillName}</span>
                </div>
                <span className="font-mono">
                  {(battle.enemy.currentCast.totalSec - battle.enemy.currentCast.elapsedSec).toFixed(1)}s
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full border border-amber-500/80 overflow-hidden shadow-[0_0_8px_rgba(245,158,11,0.8)] mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all"
                  style={{
                    width: `${(battle.enemy.currentCast.elapsedSec / battle.enemy.currentCast.totalSec) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Left Side: Boss / Monster Combatant (40% width, vertically centered on platform facing player) */}
        <div className="w-[40%] flex flex-col items-center justify-center relative pt-16">
          {/* Interactive Monster Sprite with Direct Tap-to-Strike (Grounded, No Vertical Jump) */}
          <div
            onClick={handleManualBossTap}
            className={`cursor-pointer group relative flex flex-col items-center ${isBossStaggered ? 'opacity-90' : ''} ${bossHitReaction ? 'animate-boss-hit' : ''}`}
            title="Tap boss to strike with Main Weapon!"
          >
            {/* Invisible click target wrapper (no red border or reticle) */}
            <div className="relative flex items-center justify-center">
              <SpriteRenderer
                spriteType={battle.enemy.spriteType}
                element={battle.enemy.element}
                scale={battle.isBoss ? 1.4 : 1.2}
                isEnraged={battle.enemy.isBoss && (battle.enemy.hp < battle.enemy.maxHp * 0.5 || hasEnragedRef.current)}
                isAttacking={!!battle.enemy.currentCast || battle.enemy.attackTimer <= 0.4}
                isDead={battle.enemy.hp <= 0}
              />

              {/* Direct Sword Strikes: Always 100% centered on Boss Sprite */}
              {weaponStrikes.map(strike => (
                <WeaponStrikeVisual key={strike.id} strike={strike} centered={true} />
              ))}
            </div>

            {/* Direct Tap Attack Cue */}
            <div className="mt-1 flex items-center space-x-1 text-[7.5px] font-bold text-slate-400 bg-slate-900/80 border border-slate-700/60 px-2 py-0.5 rounded-full shadow group-hover:text-amber-300 group-hover:border-amber-400/60 transition-colors">
              <Swords className="w-2.5 h-2.5 text-amber-400" />
              <span>TAP TO STRIKE</span>
            </div>
          </div>
        </div>

        {/* Right Side: Player + AI Allies Formation (60% width) */}
        <div className="w-[60%] flex flex-col items-end space-y-2.5 pr-1">
          {battle.participants.map((hunter, idx) => {
            const isHighestThreat =
              !hunter.isDead &&
              hunter.threat > 0 &&
              battle.participants.filter(p => !p.isDead).every(p => hunter.threat >= p.threat);

            const hpPct = Math.max(0, Math.min(100, (hunter.hp / hunter.maxHp) * 100));

            const isTargeted = selectedAllyId === hunter.id;

            return (
              <div
                key={hunter.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedAllyId(prev => prev === hunter.id ? null : hunter.id);
                }}
                className={`flex items-center space-x-2 transition-all cursor-pointer rounded-lg p-1 ${
                  isTargeted
                    ? 'bg-cyan-950/70 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                    : 'hover:bg-slate-900/50 border border-transparent'
                } ${hunter.isPlayer ? 'scale-105' : 'scale-95'}`}
                style={{
                  transform: `translateX(-${(idx % 2) * 12}px)`
                }}
              >
                {/* Hunter Status Bar (Fixed width to prevent horizontal layout reflow) */}
                <div className="flex flex-col items-end w-32 shrink-0">
                  <div className="h-3 flex items-center justify-end w-full mb-0.5">
                    {isTargeted ? (
                      <span className="text-[7px] font-black text-cyan-300 bg-cyan-950/95 border border-cyan-400 px-1 rounded flex items-center space-x-0.5 animate-pulse">
                        <Crosshair className="w-2 h-2 text-cyan-400" />
                        <span>PRIORITY TARGET</span>
                      </span>
                    ) : hunter.isPlayer && store.player.customization?.title ? (
                      <span className="text-[7px] font-bold text-amber-300 leading-none truncate max-w-[120px]">
                        [{store.player.customization.title}]
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center space-x-1 justify-end w-full">
                    <ClassIcon job={hunter.job} size="sm" showTooltip={false} />
                    {isHighestThreat && (
                      <span className="text-[7px] font-black text-rose-300 bg-rose-950 border border-rose-500 px-1 rounded animate-pulse shrink-0">
                        AGGRO
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-200 truncate max-w-[65px]">
                      {hunter.name}
                    </span>
                    {hunter.isPlayer && (
                      <span className="text-[7px] font-black text-amber-300 bg-amber-950 px-1 rounded shrink-0">
                        YOU
                      </span>
                    )}
                  </div>

                  {/* HP Bar */}
                  <div className="w-full h-1.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden shadow-inner mt-0.5">
                    <div
                      className={`h-full transition-all duration-300 ${
                        hpPct > 50
                           ? 'bg-emerald-500'
                           : hpPct > 20
                           ? 'bg-amber-500'
                           : 'bg-rose-500'
                      }`}
                      style={{ width: `${hpPct}%` }}
                    />
                  </div>
                </div>

                {/* Hunter Chibi Sprite */}
                <div className={`relative transition-transform duration-150 ${hunterHitReaction[hunter.id] ? 'animate-hunter-hit' : ''}`}>
                  {hunter.isPlayer && playerEmote && (
                    <div className="absolute -top-7 -right-2 bg-white text-slate-900 font-bold text-[9px] px-2 py-0.5 rounded-full shadow-lg border border-slate-300 animate-bounce whitespace-nowrap z-30">
                      {playerEmote}
                    </div>
                  )}
                  <SpriteRenderer
                    job={hunter.job}
                    skin={hunter.isPlayer ? store.player.equippedSkins?.[hunter.job] : undefined}
                    scale={hunter.isPlayer ? 0.9 : 0.75}
                    mirrored={true}
                    isPlayer={hunter.isPlayer}
                    isDead={hunter.isDead}
                    isAttacking={animatingAttackerId === hunter.id}
                    name={hunter.name}
                  />

                  {/* Incoming Boss Attack VFX directly on this character */}
                  {bossStrikes
                    .filter(s => s.targetHunterId === hunter.id)
                    .map(strike => (
                      <BossStrikeVisual key={strike.id} strike={strike} />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick-Chat Emotes Bar */}
      <div className="relative z-20 w-full px-2 py-1 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[9px]">
        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Chat Emotes:</span>
        <div className="flex items-center space-x-1">
          {['Heal Me!', 'Aggro On Me!', 'Ult Ready!', 'Great Job!'].map(em => (
            <button
              key={em}
              onClick={() => sendEmote(em)}
              className="bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700/80 transition-all active:scale-95"
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Combat Activity Log Marquee */}
      <div className="relative z-20 w-full bg-slate-950/80 border-t border-slate-800/80 px-2 py-0.5 text-[9px] text-slate-400 font-mono truncate flex items-center space-x-1">
        <Swords className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
        <span className="truncate">
          {battle.combatLogs[battle.combatLogs.length - 1] || 'Battle in progress...'}
        </span>
      </div>

      {/* Active Reaction Counterplay Button (Floating Overlay - Zero Layout Reflow) */}
      {(battle.enemy.currentCast || parryFeedback) && (
        <div className="absolute bottom-[212px] inset-x-4 z-30 flex items-center justify-center pointer-events-auto animate-fadeIn">
          {(() => {
            const timeRemaining = battle.enemy.currentCast
              ? battle.enemy.currentCast.totalSec - battle.enemy.currentCast.elapsedSec
              : 0;
            const isTimingWindow = battle.enemy.currentCast && timeRemaining <= 0.85;
            const isParrySuccess = parryFeedback && parryFeedback.includes('PERFECT');
            const isParryFail = parryFeedback === 'MISTIMED!';

            return (
              <button
                onClick={executeReactionCounter}
                disabled={guardCooldown > 0 && !isTimingWindow}
                className={`w-full max-w-sm py-2 px-3 rounded-xl border-2 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-xl active:scale-95 ${
                  isParrySuccess
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.9)] animate-pulse'
                    : isParryFail
                    ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                    : isTimingWindow
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-bounce'
                    : guardCooldown > 0
                    ? 'bg-slate-900 text-slate-600 border-slate-800'
                    : 'bg-slate-900/95 text-amber-400 border-amber-500/60 hover:border-amber-400 backdrop-blur-md shadow-2xl'
                }`}
              >
                <Shield className={`w-4 h-4 ${isTimingWindow ? 'text-slate-950 animate-spin' : isParrySuccess ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>
                  {parryFeedback
                    ? parryFeedback
                    : isTimingWindow
                    ? '⚡ PERFECT GUARD! TAP NOW! (0.4s)'
                    : battle.enemy.currentCast
                    ? `INCOMING: ${battle.enemy.currentCast.skillName} (${timeRemaining.toFixed(1)}s)`
                    : 'READY'}
                </span>
              </button>
            );
          })()}
        </div>
      )}

      {/* 5-Slot Weapon Hotbar & Battle Dock */}
      <BottomDock
        onTriggerSkill={triggerSkill}
        playerCombatantCooldowns={playerCombatant?.cooldowns}
        playerCombatantEther={playerCombatant?.ether}
      />

      {/* Victory / Defeat Modal Overlay */}
      {battleResult && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 select-none animate-fadeIn">
          {battleResult === 'VICTORY' ? (
            <div className="w-full max-w-xs bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400 rounded-2xl p-5 shadow-[0_0_30px_rgba(245,158,11,0.5)] flex flex-col items-center text-center">
              <Trophy className="w-14 h-14 text-amber-400 mb-2 animate-bounce" />
              <h2 className="text-xl font-black text-amber-300 tracking-wider uppercase mb-1">
                VICTORY!
              </h2>
              <p className="text-xs text-slate-400 mb-4">{battle.enemy.name} has been vanquished!</p>

              {/* Rewards Summary */}
              <div className="w-full bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex justify-around mb-5">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400">EXP</span>
                  <span className="text-xs font-bold text-cyan-400">+{tmpl.expReward}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400">GOLD</span>
                  <span className="text-xs font-bold text-amber-400">+{tmpl.goldReward}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400">SHARDS</span>
                  <span className="text-xs font-bold text-emerald-400">+{tmpl.shardReward}</span>
                </div>
              </div>

              {(battle.isBoss || battle.isCornerGuardian || battle.isDungeon) && (
                <div className="w-full mb-4 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-400/70 text-[10px] font-black text-amber-200 tracking-wide">
                  {battle.isCornerGuardian
                    ? '👑 Guaranteed 5★ Corner Guardian Sword Loot!'
                    : '🏆 Guaranteed 5★ World Boss Sword Loot!'}
                </div>
              )}

              <button
                onClick={() => gameActions.endBattle(battle.id, true)}
                className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                Claim Rewards & Continue
              </button>
            </div>
          ) : (
            <div className="w-full max-w-xs bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-600 rounded-2xl p-5 shadow-[0_0_30px_rgba(239,68,68,0.5)] flex flex-col items-center text-center">
              <Shield className="w-14 h-14 text-rose-500 mb-2" />
              <h2 className="text-xl font-black text-rose-400 tracking-wider uppercase mb-1">
                DEFEATED
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                The party was overwhelmed. Retreating to the Safe Haven to recuperate...
              </p>

              <button
                onClick={() => {
                  gameActions.endBattle(battle.id, false);
                  gameActions.setPlayerPosition(1452, 2628);
                }}
                className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-lg active:scale-95 transition-all"
              >
                Return to Sanctuary
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
