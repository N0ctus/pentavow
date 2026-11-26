import { useState, useEffect } from 'react';
import { 
  PlayerProfile, 
  JobType, 
  Weapon, 
  BattleInstance, 
  AIHunter, 
  OverworldEnemy,
  Combatant,
  EnemyCombatant
} from '../types/game';
import { ALL_WEAPONS, WEAPON_MAP, STARTER_LOADOUTS } from '../data/weapons';
import { MYTHIC_WEAPON_BY_JOB } from '../data/mythicWeapons';
import { JOB_DEFINITIONS, EXP_TABLE, MAX_JOB_LEVEL } from '../data/jobs';
import { ENEMY_TEMPLATES } from '../data/enemies';
import { DUNGEONS } from '../data/dungeons';
import { NOVICE_GUIDE_STEPS } from '../data/noviceGuide';
import {
  QUESTS,
  QUEST_LOCKED_WEAPON_ID_SET,
  QuestTargetType,
  WEAPON_TO_QUEST_ID,
} from '../data/quests';
import { CustomizationPart, PartCategory, DEFAULT_UNLOCKED_PARTS } from '../data/customizationParts';
import { HeroSkin, DEFAULT_UNLOCKED_SKINS, DEFAULT_EQUIPPED_SKINS } from '../data/skins';
import { REALMS, getRealmById } from '../data/realms';
import { getBattlegroundForCombat } from '../data/battlegrounds';
import { getBigMapForRealm } from '../data/bigMaps';
import { getScaledBossHp } from '../utils/combatUtils';
import {
  findNearestWalkableTile,
  findTilePath,
  isBoxWalkable,
  MAP_TILE_SIZE,
  pickRandomWalkableTarget,
  resolveEntityMove,
} from '../utils/pmdTileEngine';
import { scheduleGoogleCloudUpload } from '../services/googleSyncService';

const aiPaths = new Map<string, Array<{ x: number; y: number }>>();

const STORAGE_KEY = 'tessera_legacy_save_v1';

const INITIAL_AI_HUNTERS: AIHunter[] = [
  {
    id: 'ai-aiden',
    name: 'Aiden',
    job: 'VANGUARD',
    level: 14,
    x: 1320,
    y: 2380,
    targetX: 1360,
    targetY: 2220,
    state: 'WANDERING',
    equippedWeaponIds: STARTER_LOADOUTS['VANGUARD'],
    avatarSeed: 1,
    isWalking: true,
    facingLeft: false,
    idleTimer: 0
  },
  {
    id: 'ai-seraphina',
    name: 'Seraphina',
    job: 'SPELLWEAVER',
    level: 16,
    x: 1560,
    y: 2360,
    targetX: 1500,
    targetY: 2180,
    state: 'WANDERING',
    equippedWeaponIds: STARTER_LOADOUTS['SPELLWEAVER'],
    avatarSeed: 2,
    isWalking: true,
    facingLeft: true,
    idleTimer: 0
  },
  {
    id: 'ai-lyra',
    name: 'Lyra',
    job: 'LIGHTBEARER',
    level: 15,
    x: 1220,
    y: 2520,
    targetX: 1260,
    targetY: 2440,
    state: 'WANDERING',
    equippedWeaponIds: STARTER_LOADOUTS['LIGHTBEARER'],
    avatarSeed: 3,
    isWalking: false,
    facingLeft: false,
    idleTimer: 1.5
  },
  {
    id: 'ai-orion',
    name: 'Orion',
    job: 'ROGUE',
    level: 18,
    x: 1680,
    y: 2480,
    targetX: 1620,
    targetY: 2280,
    state: 'WANDERING',
    equippedWeaponIds: STARTER_LOADOUTS['ROGUE'] || STARTER_LOADOUTS['SHADOWBLADE'],
    avatarSeed: 4,
    isWalking: true,
    facingLeft: false,
    idleTimer: 0
  },
  {
    id: 'ai-kael',
    name: 'Kael',
    job: 'VANGUARD',
    level: 12,
    x: 1140,
    y: 2560,
    targetX: 1240,
    targetY: 2320,
    state: 'WANDERING',
    equippedWeaponIds: STARTER_LOADOUTS['VANGUARD'],
    avatarSeed: 5,
    isWalking: true,
    facingLeft: false,
    idleTimer: 0
  }
];

export function generateRealmEnemies(realmId: string): OverworldEnemy[] {
  const realm = getRealmById(realmId);
  const bossTemplate = ENEMY_TEMPLATES[realm.bossTemplateId] || ENEMY_TEMPLATES['guardian-seiryu'];

  const enemies: OverworldEnemy[] = [
    // Dedicated Realm World Boss stationed at the FAR END (North Sanctum) of the 120x120 map
    {
      id: `mob-boss-${realm.id}`,
      templateId: bossTemplate.id,
      name: bossTemplate.name,
      element: bossTemplate.element,
      x: realm.bossCoords.x,
      y: realm.bossCoords.y,
      currentHp: bossTemplate.maxHp,
      maxHp: bossTemplate.maxHp,
      isBoss: true,
      spriteType: bossTemplate.spriteType
    }
  ];

  // 20 guaranteed walkable add packs across the 120x120 world (final 4 are Vanguard Elites)
  const bigMap = getBigMapForRealm(realm.id);
  const FIELD_SPAWNS = bigMap.mobSpawns;

  FIELD_SPAWNS.forEach((pos, idx) => {
    const templateId = realm.normalMobTemplateIds[idx % realm.normalMobTemplateIds.length];
    const tmpl = ENEMY_TEMPLATES[templateId] || ENEMY_TEMPLATES['frog-keroro'];
    const isVanguardElite = idx >= 16;
    const hp = isVanguardElite ? Math.round(tmpl.maxHp * 1.65) : tmpl.maxHp;
    enemies.push({
      id: `mob-${realm.id}-${idx + 1}`,
      templateId: tmpl.id,
      name: isVanguardElite ? `Elite ${tmpl.name}` : tmpl.name,
      element: tmpl.element,
      x: pos.x,
      y: pos.y,
      currentHp: hp,
      maxHp: hp,
      isBoss: false,
      spriteType: tmpl.spriteType
    });
  });

  // 4 Corner Guardians positioned at the 4 corners of the 120x120 map (drop exclusive 5★ Corner Swords!)
  bigMap.cornerSpawns.forEach((pos, cIdx) => {
    const templateId = realm.normalMobTemplateIds[cIdx % realm.normalMobTemplateIds.length];
    const tmpl = ENEMY_TEMPLATES[templateId] || ENEMY_TEMPLATES['thorn-wolf'];
    const cornerHp = Math.round(tmpl.maxHp * 2.8);
    enemies.push({
      id: `mob-corner-${realm.id}-${cIdx + 1}`,
      templateId: tmpl.id,
      name: `Corner Warden ${tmpl.name}`,
      element: tmpl.element,
      x: pos.x,
      y: pos.y,
      currentHp: cornerHp,
      maxHp: cornerHp,
      isBoss: false,
      isCornerGuardian: true,
      spriteType: tmpl.spriteType,
    });
  });

  return enemies;
}

const STARTER_WEAPON_ID_SET = new Set<string>(Object.values(STARTER_LOADOUTS).flat());

const INITIAL_ENEMIES: OverworldEnemy[] = generateRealmEnemies('whispering-glade');

function getInitialProfile(): PlayerProfile {
  // New players start completely unarmed and must farm/summon their weapons in battle
  const initialInventory: Weapon[] = [];
  const initialEquipped: string[] = [];

  return {
    name: 'Valerius',
    currentJob: 'WARRIOR',
    jobs: {
      // 1. Martial Path
      WARRIOR: { level: 1, exp: 0 },
      GUARDIAN: { level: 1, exp: 0 },
      BERSERKER: { level: 1, exp: 0 },
      ROGUE: { level: 1, exp: 0 },
      ASSASSIN: { level: 1, exp: 0 },
      HUNTER: { level: 1, exp: 0 },
      // 2. Arcane Path
      MAGE: { level: 1, exp: 0 },
      ARCHMAGE: { level: 1, exp: 0 },
      WARLOCK: { level: 1, exp: 0 },
      DEATH_KNIGHT: { level: 1, exp: 0 },
      DEMON_HUNTER: { level: 1, exp: 0 },
      // 3. Divine & Primal Path
      PRIEST: { level: 1, exp: 0 },
      PALADIN: { level: 1, exp: 0 },
      DRUID: { level: 1, exp: 0 },
      SHAMAN: { level: 1, exp: 0 },
      MONK: { level: 1, exp: 0 },
      EVOKER: { level: 1, exp: 0 },
      // Legacy Aliases
      VANGUARD: { level: 1, exp: 0 },
      SPELLWEAVER: { level: 1, exp: 0 },
      LIGHTBEARER: { level: 1, exp: 0 },
      SHADOWBLADE: { level: 1, exp: 0 },
    },
    gold: 2500,
    tesseraShards: 500, // starting currency for gacha pulls!
    heroFeathers: 200, // astral summoning feather currency
    unlockedParts: { ...DEFAULT_UNLOCKED_PARTS },
    unlockedSkins: { ...DEFAULT_UNLOCKED_SKINS },
    equippedSkins: { ...DEFAULT_EQUIPPED_SKINS },
    inventory: initialInventory,
    weaponUpgrades: {},
    materials: {
      'mat-slime-essence': 8,
      'mat-thorn-fang': 4,
      'mat-gale-feather': 2,
      'mat-abyssal-core': 1,
    },
    questProgress: {
      'q-slime-cleanse': 0,
      'q-thorn-hunt': 0,
      'q-dungeon-trial': 0,
      'q-boss-calamity': 0,
    },
    questSecondaryProgress: {},
    completedQuests: [],
    customization: {
      hairstyle: 'spiky',
      hairColor: '#ef4444',
      skinTone: '#fed7aa',
      eyeStyle: 'determined',
      eyeColor: '#3b82f6',
      outfit: 'outfit_novice',
      cape: 'none',
      accessory: 'none',
      aura: 'none',
      title: 'Novice Hunter',
    },
    settings: {
      masterVolume: 80,
      sfxVolume: 85,
      bgmVolume: 65,
      screenShake: true,
      damageTextMode: 'ALL',
      controlMode: 'JOYSTICK',
    },
    equippedWeaponIds: initialEquipped,
    defeatedRealmBosses: {},
    hasCompletedOnboarding: false,
    noviceGuide: {
      currentStep: 1,
      completedSteps: [],
      claimedSteps: [],
      isMinimized: false,
      isCompleted: false,
    },
    x: 1452,
    y: 2628, // Spacious South Safe Haven courtyard spawn
  };
}

export interface GameState {
  player: PlayerProfile;
  currentHp: number; // player's current HP
  maxHp: number;
  currentRealmId: string;
  view: 'OVERWORLD' | 'BATTLE';
  activeTab: 'MAP' | 'EQUIP' | 'JOBS' | 'SUMMON';
  equipSubTab?: 'EQUIP' | 'FORGE';
  activeBattleId: string | null;
  battles: Record<string, BattleInstance>;
  aiHunters: AIHunter[];
  enemies: OverworldEnemy[];
  autoBattle: boolean;
  isInSafeHaven: boolean;
  dropInNotifications: string[];
}

// Global Singleton State & Listeners
let state: GameState = loadInitialState();
const listeners = new Set<() => void>();

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let isResettingSave = false;

export function flushSaveState() {
  if (isResettingSave) return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      player: state.player,
      currentRealmId: state.currentRealmId,
    }));
    scheduleGoogleCloudUpload(state.player, state.currentRealmId);
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

function saveState(immediate = false) {
  if (immediate) {
    flushSaveState();
    return;
  }
  if (!saveTimer) {
    saveTimer = setTimeout(() => {
      saveTimer = null;
      flushSaveState();
    }, 450);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushSaveState();
  });
}

function notify(immediateSave = false) {
  listeners.forEach(listener => listener());
  saveState(immediateSave);
}

function calculateMaxHp(profile: PlayerProfile): number {
  const jobDef = JOB_DEFINITIONS[profile.currentJob] || JOB_DEFINITIONS['WARRIOR'];
  const level = profile.jobs[profile.currentJob]?.level || 1;
  let hp = jobDef.baseHp + (level - 1) * 65;

  // Add passive bonuses from all jobs
  Object.entries(profile.jobs).forEach(([jType, prog]) => {
    const def = JOB_DEFINITIONS[jType as JobType];
    if (def && def.unlockedLevelPassive) {
      const p = def.unlockedLevelPassive(prog.level);
      if (p && p.stat === 'Max HP') {
        hp = Math.floor(hp * (1 + p.bonus / 100));
      }
    }
  });

  return hp;
}

function loadInitialState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate and sanitize parsed
      if (parsed.player) {
        if (!parsed.player.completedQuests) {
          parsed.player.completedQuests = [];
        }
        if (!parsed.player.questSecondaryProgress) {
          parsed.player.questSecondaryProgress = {};
        }
        const completedQuestSet = new Set<string>(parsed.player.completedQuests);

        // Restore strictly weapons actually owned in saved inventory (Quest Artifacts & Mythics still require quest completion)
        const invMap = new Map<string, Weapon>();
        if (Array.isArray(parsed.player.inventory)) {
          parsed.player.inventory.forEach((w: Weapon) => {
            if (!WEAPON_MAP[w.id]) return;
            if (QUEST_LOCKED_WEAPON_ID_SET.has(w.id)) {
              const reqQid = WEAPON_TO_QUEST_ID[w.id];
              if (!reqQid || !completedQuestSet.has(reqQid)) return;
            }
            invMap.set(w.id, WEAPON_MAP[w.id]);
          });
        }
        parsed.player.inventory = Array.from(invMap.values());
        if (Array.isArray(parsed.player.equippedWeaponIds)) {
          parsed.player.equippedWeaponIds = parsed.player.equippedWeaponIds.filter(
            (wid: string) => invMap.has(wid)
          );
        } else {
          parsed.player.equippedWeaponIds = [];
        }

        if (!parsed.player.weaponUpgrades) {
          parsed.player.weaponUpgrades = {};
        }
        if (!parsed.player.materials) {
          parsed.player.materials = {
            'mat-slime-essence': 8,
            'mat-thorn-fang': 4,
            'mat-gale-feather': 2,
            'mat-abyssal-core': 1,
          };
        }
        if (!parsed.player.questProgress) {
          parsed.player.questProgress = {
            'q-slime-cleanse': 1,
            'q-thorn-hunt': 0,
            'q-dungeon-trial': 0,
            'q-boss-calamity': 0,
          };
        }
        if (!parsed.player.completedQuests) {
          parsed.player.completedQuests = [];
        }
        if (!parsed.player.defeatedRealmBosses) {
          parsed.player.defeatedRealmBosses = {};
        }
        if (parsed.player.hasCompletedOnboarding === undefined) {
          parsed.player.hasCompletedOnboarding = true;
        }
        if (!parsed.player.noviceGuide) {
          parsed.player.noviceGuide = {
            currentStep: 1,
            completedSteps: [],
            claimedSteps: [],
            isMinimized: false,
            isCompleted: false,
          };
        }
        if (parsed.player.heroFeathers === undefined) {
          parsed.player.heroFeathers = 200;
        }
        if (typeof parsed.player.name !== 'string' || !parsed.player.name.trim()) {
          parsed.player.name = 'Hero';
        }
        if (typeof parsed.player.gold !== 'number' || !Number.isFinite(parsed.player.gold)) {
          parsed.player.gold = 2500;
        }
        if (typeof parsed.player.tesseraShards !== 'number' || !Number.isFinite(parsed.player.tesseraShards)) {
          parsed.player.tesseraShards = 500;
        }
        if (typeof parsed.player.x !== 'number' || !Number.isFinite(parsed.player.x)) {
          parsed.player.x = 1452;
        }
        if (typeof parsed.player.y !== 'number' || !Number.isFinite(parsed.player.y)) {
          parsed.player.y = 2628;
        }
        if (!parsed.player.unlockedSkins) {
          parsed.player.unlockedSkins = { ...DEFAULT_UNLOCKED_SKINS };
        } else {
          // Guarantee all default class skins are always unlocked
          Object.keys(DEFAULT_UNLOCKED_SKINS).forEach(id => {
            parsed.player.unlockedSkins[id] = true;
          });
        }
        if (!parsed.player.equippedSkins) {
          parsed.player.equippedSkins = { ...DEFAULT_EQUIPPED_SKINS };
        }
        if (!parsed.player.unlockedParts) {
          parsed.player.unlockedParts = { ...DEFAULT_UNLOCKED_PARTS };
        } else {
          // Ensure all categories exist
          parsed.player.unlockedParts = {
            OUTFIT: parsed.player.unlockedParts.OUTFIT || [...DEFAULT_UNLOCKED_PARTS.OUTFIT],
            HAIRSTYLE: parsed.player.unlockedParts.HAIRSTYLE || [...DEFAULT_UNLOCKED_PARTS.HAIRSTYLE],
            CAPE: parsed.player.unlockedParts.CAPE || [...DEFAULT_UNLOCKED_PARTS.CAPE],
            ACCESSORY: parsed.player.unlockedParts.ACCESSORY || [...DEFAULT_UNLOCKED_PARTS.ACCESSORY],
            AURA: parsed.player.unlockedParts.AURA || [...DEFAULT_UNLOCKED_PARTS.AURA],
          };
        }
        if (!parsed.player.customization) {
          parsed.player.customization = {
            hairstyle: 'spiky',
            hairColor: '#ef4444',
            skinTone: '#fed7aa',
            eyeStyle: 'determined',
            eyeColor: '#3b82f6',
            outfit: 'outfit_novice',
            cape: 'none',
            accessory: 'none',
            aura: 'none',
            title: 'Novice Hunter',
          };
        } else {
          if (!parsed.player.customization.outfit) parsed.player.customization.outfit = 'outfit_novice';
          if (!parsed.player.customization.cape) parsed.player.customization.cape = 'none';
          if (!parsed.player.customization.accessory) parsed.player.customization.accessory = 'none';
          if (!parsed.player.customization.aura) parsed.player.customization.aura = 'none';
          if (!parsed.player.customization.eyeColor) parsed.player.customization.eyeColor = '#3b82f6';
        }
        if (!parsed.player.settings) {
          parsed.player.settings = {
            masterVolume: 80,
            sfxVolume: 85,
            bgmVolume: 65,
            screenShake: true,
            damageTextMode: 'ALL',
            controlMode: 'JOYSTICK',
          };
        }

        // Ensure all 17 classes exist in player.jobs
        if (!parsed.player.jobs) {
          parsed.player.jobs = {};
        }
        const allJobKeys: JobType[] = [
          'WARRIOR', 'GUARDIAN', 'BERSERKER', 'ROGUE', 'ASSASSIN', 'HUNTER',
          'MAGE', 'ARCHMAGE', 'WARLOCK', 'DEATH_KNIGHT', 'DEMON_HUNTER',
          'PRIEST', 'PALADIN', 'DRUID', 'SHAMAN', 'MONK', 'EVOKER',
          'VANGUARD', 'SPELLWEAVER', 'LIGHTBEARER', 'SHADOWBLADE'
        ];
        allJobKeys.forEach(jk => {
          if (!parsed.player.jobs[jk]) {
            parsed.player.jobs[jk] = { level: 1, exp: 0 };
          }
        });
        if (parsed.player.currentJob === 'VANGUARD' || !parsed.player.currentJob) {
          parsed.player.currentJob = 'WARRIOR';
          parsed.player.jobs['WARRIOR'] = { level: 10, exp: 120 };
        }

        // Migrate any legacy part identifiers
        const legacyHeroine = ['f', 'e', 'h', '_heroine'].join('');
        const legacyRoyal = ['f', 'e', 'h', '_royal'].join('');
        const legacyOwl = ['acc_', 'f', 'e', 'h', '_owl'].join('');

        if (parsed.player.customization) {
          if ((parsed.player.customization as any).hairstyle === legacyHeroine) parsed.player.customization.hairstyle = 'anime_heroine';
          if ((parsed.player.customization as any).eyeStyle === legacyRoyal) parsed.player.customization.eyeStyle = 'anime_royal';
          if ((parsed.player.customization as any).accessory === legacyOwl) parsed.player.customization.accessory = 'acc_spirit_kitsune';
        }
        if (parsed.player.unlockedParts) {
          if (parsed.player.unlockedParts.HAIRSTYLE?.includes(legacyHeroine as any)) {
            parsed.player.unlockedParts.HAIRSTYLE = parsed.player.unlockedParts.HAIRSTYLE.map((h: any) => h === legacyHeroine ? 'anime_heroine' : h);
          }
          if (parsed.player.unlockedParts.ACCESSORY?.includes(legacyOwl as any)) {
            parsed.player.unlockedParts.ACCESSORY = parsed.player.unlockedParts.ACCESSORY.map((a: any) => a === legacyOwl ? 'acc_spirit_kitsune' : a);
          }
        }

        const maxHp = calculateMaxHp(parsed.player);
        const realmId = parsed.currentRealmId || 'whispering-glade';
        const initMap = getBigMapForRealm(realmId);
        if (!isBoxWalkable(parsed.player.x, parsed.player.y, 7, 7, initMap.grid, initMap.cols, initMap.rows)) {
          const snap = findNearestWalkableTile(
            Math.floor(parsed.player.x / MAP_TILE_SIZE),
            Math.floor(parsed.player.y / MAP_TILE_SIZE),
            initMap.grid,
            initMap.cols,
            initMap.rows,
            16
          );
          parsed.player.x = snap.tx * MAP_TILE_SIZE + 12;
          parsed.player.y = snap.ty * MAP_TILE_SIZE + 12;
        }
        return {
          player: parsed.player,
          currentHp: maxHp,
          maxHp: maxHp,
          currentRealmId: realmId,
          view: 'OVERWORLD',
          activeTab: 'MAP',
          equipSubTab: 'EQUIP',
          activeBattleId: null,
          battles: {},
          aiHunters: INITIAL_AI_HUNTERS,
          enemies: generateRealmEnemies(realmId),
          autoBattle: true,
          isInSafeHaven: true,
          dropInNotifications: [],
        };
      }
    }
  } catch (e) {
    console.error('Failed to load save state', e);
  }

  const initialPlayer = getInitialProfile();
  const maxHp = calculateMaxHp(initialPlayer);
  return {
    player: initialPlayer,
    currentHp: maxHp,
    maxHp: maxHp,
    currentRealmId: 'whispering-glade',
    view: 'OVERWORLD',
    activeTab: 'MAP',
    equipSubTab: 'EQUIP',
    activeBattleId: null,
    battles: {},
    aiHunters: INITIAL_AI_HUNTERS,
    enemies: INITIAL_ENEMIES,
    autoBattle: true,
    isInSafeHaven: true,
    dropInNotifications: [],
  };
}

// Helpers to create combatants
export function createPlayerCombatant(profile: PlayerProfile, currentHp: number): Combatant {
  const jobDef = JOB_DEFINITIONS[profile.currentJob];
  const level = profile.jobs[profile.currentJob].level;
  
  let atk = jobDef.baseAtk + (level - 1) * 8;
  let matk = jobDef.baseMatk + (level - 1) * 8;
  let def = jobDef.baseDef + (level - 1) * 6;
  let mdef = jobDef.baseMdef + (level - 1) * 6;
  let critRate = jobDef.baseCrit;

  const equippedWeapons = profile.equippedWeaponIds
    .map(id => WEAPON_MAP[id])
    .filter(Boolean);

  // Add stats from equipped weapons & upgrade levels
  equippedWeapons.forEach(w => {
    const upg = profile.weaponUpgrades[w.id] || 0;
    const statMult = 0.4 + upg * 0.06; // scales with enhancement
    atk += Math.floor(w.baseAtk * statMult);
    matk += Math.floor(w.baseMatk * statMult);
    if (w.critBonus) critRate += w.critBonus * 0.1;
    if (upg >= 5) critRate += 0.03; // +5 Refined Edge bonus
  });

  // Check passive bonuses from all jobs
  Object.entries(profile.jobs).forEach(([jType, prog]) => {
    const jDef = JOB_DEFINITIONS[jType as JobType];
    if (jDef && jDef.unlockedLevelPassive) {
      const p = jDef.unlockedLevelPassive(prog.level);
      if (p) {
        if (p.stat === 'ATK') atk = Math.floor(atk * (1 + p.bonus / 100));
        if (p.stat === 'MATK') matk = Math.floor(matk * (1 + p.bonus / 100));
        if (p.stat === 'DEF') def = Math.floor(def * (1 + p.bonus / 100));
        if (p.stat === 'MDEF') mdef = Math.floor(mdef * (1 + p.bonus / 100));
        if (p.stat === 'Crit Rate') critRate += p.bonus / 100;
      }
    }
  });

  const maxHp = calculateMaxHp(profile);

  const cooldowns: Record<string, number> = {};
  const ether: Record<string, number> = {};
  equippedWeapons.forEach(w => {
    cooldowns[w.id] = 0;
    ether[w.id] = 0;
  });

  return {
    id: 'player-combatant',
    name: profile.name,
    isPlayer: true,
    job: profile.currentJob,
    hp: currentHp,
    maxHp: maxHp,
    atk,
    matk,
    def,
    mdef,
    critRate,
    threat: 0,
    equippedWeapons,
    cooldowns,
    ether,
    buffs: [],
    autoAttackTimer: 0,
    isDead: false,
    avatarSeed: 0
  };
}

export function createAICombatant(ai: AIHunter): Combatant {
  const jobDef = JOB_DEFINITIONS[ai.job];
  const level = ai.level;
  const maxHp = jobDef.baseHp + (level - 1) * 55;
  const atk = jobDef.baseAtk + (level - 1) * 7;
  const matk = jobDef.baseMatk + (level - 1) * 7;
  const def = jobDef.baseDef + (level - 1) * 5;
  const mdef = jobDef.baseMdef + (level - 1) * 5;

  const equippedWeapons = ai.equippedWeaponIds
    .map(id => WEAPON_MAP[id])
    .filter(Boolean);

  const cooldowns: Record<string, number> = {};
  const ether: Record<string, number> = {};
  equippedWeapons.forEach(w => {
    cooldowns[w.id] = 0;
    ether[w.id] = 20;
  });

  return {
    id: ai.id,
    name: ai.name,
    isPlayer: false,
    job: ai.job,
    hp: maxHp,
    maxHp,
    atk,
    matk,
    def,
    mdef,
    critRate: jobDef.baseCrit,
    threat: 0,
    equippedWeapons,
    cooldowns,
    ether,
    buffs: [],
    autoAttackTimer: Math.random() * 1.5,
    isDead: false,
    avatarSeed: ai.avatarSeed
  };
}

export function createEnemyCombatant(templateId: string, currentHp?: number): EnemyCombatant {
  const tmpl = ENEMY_TEMPLATES[templateId] || ENEMY_TEMPLATES['moss-slime'];
  return {
    id: `enemy-${Date.now()}-${Math.random()}`,
    templateId: tmpl.id,
    name: tmpl.name,
    element: tmpl.element,
    hp: currentHp ?? tmpl.maxHp,
    maxHp: tmpl.maxHp,
    atk: tmpl.atk,
    matk: tmpl.matk,
    def: tmpl.def,
    isBoss: tmpl.isBoss,
    size: tmpl.size,
    spriteType: tmpl.spriteType,
    attackTimer: 0,
    threatTable: {},
    buffs: []
  };
}

export const gameActions = {
  getState(): GameState {
    return state;
  },

  setPlayerName(newName: string) {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const cleanName = trimmed.slice(0, 16);
    state.player.name = cleanName;
    // Update player combatant in all active battles
    Object.values(state.battles).forEach(b => {
      const p = b.participants.find(part => part.isPlayer);
      if (p) p.name = cleanName;
    });
    saveState();
    notify();
  },


  setPlayerPosition(x: number, y: number) {
    const bigMap = getBigMapForRealm(state.currentRealmId);
    const resolved = resolveEntityMove(state.player.x, state.player.y, x, y, bigMap.grid, bigMap.cols, bigMap.rows, 7);
    state.player.x = resolved.x;
    state.player.y = resolved.y;

    // Check Safe Haven (Spacious south courtyard on 120x120 map: x 900..1980, y 2320..2830)
    const inSafe = resolved.y >= 2320 && resolved.y <= 2830 && resolved.x >= 900 && resolved.x <= 1980;
    state.isInSafeHaven = inSafe;

    if (inSafe && state.currentHp < state.maxHp) {
      state.currentHp = state.maxHp; // Instant full heal in sanctuary!
    }

    notify();
  },

  spawnWildEnemy(enemy: OverworldEnemy) {
    if (!state.enemies.some(e => e.id === enemy.id)) {
      state.enemies = [...state.enemies, enemy];
      notify();
    }
  },


  addNotification(msg: string, durationMs: number = 1800) {
    state.dropInNotifications = [...state.dropInNotifications.slice(-2), msg];
    notify();
    setTimeout(() => {
      state.dropInNotifications = state.dropInNotifications.filter(n => n !== msg);
      notify();
    }, durationMs);
  },

  clearNotification(msg?: string) {
    if (msg) {
      state.dropInNotifications = state.dropInNotifications.filter(n => n !== msg);
    } else {
      state.dropInNotifications = [];
    }
    notify();
  },


  setActiveTab(tab: 'MAP' | 'EQUIP' | 'JOBS' | 'SUMMON', subTab?: 'EQUIP' | 'FORGE') {
    state.activeTab = tab;
    if (tab === 'EQUIP' && subTab) {
      state.equipSubTab = subTab;
    }
    notify();
  },


  setEquipSubTab(subTab: 'EQUIP' | 'FORGE') {
    state.equipSubTab = subTab;
    notify();
  },


  healPlayerFull() {
    state.currentHp = state.maxHp;
    notify();
  },

  syncPlayerHp(hp: number) {
    const clamped = Math.max(0, Math.min(state.maxHp, Math.round(hp)));
    if (state.currentHp !== clamped) {
      state.currentHp = clamped;
      notify();
    }
  },


  setView(view: 'OVERWORLD' | 'BATTLE') {
    state.view = view;
    notify();
  },


  changeRealm(realmId: string) {
    const realm = getRealmById(realmId);
    if (!realm) return;

    state.currentRealmId = realm.id;
    state.player.x = realm.spawnCoords.x;
    state.player.y = realm.spawnCoords.y;
    state.isInSafeHaven = true;
    state.currentHp = state.maxHp;

    // Reset overworld enemies to this realm's specific boss and mobs
    state.enemies = generateRealmEnemies(realm.id);

    // Relocate wandering AI hunters near the safe zone on guaranteed walkable tiles
    aiPaths.clear();
    const bigMap = getBigMapForRealm(realm.id);
    state.aiHunters.forEach((ai, idx) => {
      ai.state = 'WANDERING';
      ai.currentBattleId = undefined;
      const rawX = realm.spawnCoords.x + (idx - 2) * 48;
      const rawY = realm.spawnCoords.y - 72 + (idx % 2) * 28;
      const snap = findNearestWalkableTile(
        Math.floor(rawX / MAP_TILE_SIZE),
        Math.floor(rawY / MAP_TILE_SIZE),
        bigMap.grid,
        bigMap.cols,
        bigMap.rows,
        8
      );
      ai.x = snap.tx * MAP_TILE_SIZE + 12;
      ai.y = snap.ty * MAP_TILE_SIZE + 12;
      ai.targetX = ai.x;
      ai.targetY = ai.y;
    });

    // Clear active overworld battles from prior realm
    Object.keys(state.battles).forEach(bId => {
      const b = state.battles[bId];
      if (!b.isDungeon) {
        delete state.battles[bId];
      }
    });

    if (state.view === 'BATTLE' && state.activeBattleId && !state.battles[state.activeBattleId]?.isDungeon) {
      state.view = 'OVERWORLD';
      state.activeBattleId = null;
    }

    gameActions.addNotification(`Traveled to: [${realm.name}]!`, 1800);
    saveState();
    notify();
  },


  toggleAutoBattle() {
    state.autoBattle = !state.autoBattle;
    notify();
  },


  switchJob(newJob: JobType): boolean {
    if (state.player.currentJob === newJob) return true;

    // Enforce Class Mastery rule: player cannot change class until current class reaches MAX_JOB_LEVEL (Lv. 10)
    const currentProg = state.player.jobs[state.player.currentJob];
    const currentLvl = currentProg ? currentProg.level : 1;
    if (currentLvl < MAX_JOB_LEVEL) {
      gameActions.addNotification(`Class Locked: Master current class at Lv. ${MAX_JOB_LEVEL} to switch! (Current: Lv. ${currentLvl})`, 1800);
      return false;
    }

    state.player.currentJob = newJob;
    if (!state.player.jobs[newJob]) {
      state.player.jobs[newJob] = { level: 1, exp: 0 };
    }

    const jobDef = JOB_DEFINITIONS[newJob] || JOB_DEFINITIONS['WARRIOR'];
    const allowed = jobDef.allowedWeapons;
    const ownedIds = new Set(state.player.inventory.map(w => w.id));

    const filtered = state.player.equippedWeaponIds.filter(id => {
      const w = WEAPON_MAP[id];
      return w && ownedIds.has(id) && allowed.includes(w.category);
    });

    if (filtered.length === 0) {
      const ownedStarter = (STARTER_LOADOUTS[newJob] || STARTER_LOADOUTS['WARRIOR'] || []).filter(id =>
        ownedIds.has(id)
      );
      const fallbackOwned = state.player.inventory
        .filter(w => allowed.includes(w.category))
        .map(w => w.id);
      state.player.equippedWeaponIds = [...ownedStarter, ...fallbackOwned]
        .filter((id, i, arr) => arr.indexOf(id) === i)
        .slice(0, 5);
    } else {
      state.player.equippedWeaponIds = filtered;
    }

    state.maxHp = calculateMaxHp(state.player);
    state.currentHp = state.maxHp;
    const mythicSword = MYTHIC_WEAPON_BY_JOB[newJob];
    const hasMythic = mythicSword ? ownedIds.has(mythicSword.id) : true;
    gameActions.addNotification(
      hasMythic
        ? `Class Advanced: ${jobDef.name} (${jobDef.jpName})!`
        : `Class Advanced: ${jobDef.name} — Complete Bounty Quests to forge its Artifact & ✦ Mythic Blade!`,
      2200
    );
    notify();
    return true;
  },

  equipWeapon(weaponId: string, slotIndex: number) {
    const weapon = WEAPON_MAP[weaponId];
    if (!weapon) return;
    const allowed = JOB_DEFINITIONS[state.player.currentJob].allowedWeapons;
    if (!allowed.includes(weapon.category)) return;

    const list = [...state.player.equippedWeaponIds];
    // Remove if already equipped in another slot
    const existingIdx = list.indexOf(weaponId);
    if (existingIdx !== -1) {
      list.splice(existingIdx, 1);
    }

    if (slotIndex >= list.length) {
      list.push(weaponId);
    } else {
      list[slotIndex] = weaponId;
    }

    state.player.equippedWeaponIds = list.slice(0, 5);
    notify();
  },


  unequipWeapon(slotIndex: number) {
    const list = [...state.player.equippedWeaponIds];
    if (slotIndex < 0 || slotIndex >= list.length) return;
    list.splice(slotIndex, 1);
    state.player.equippedWeaponIds = list;
    notify();
  },


  addRewards(gold: number, exp: number, shards: number) {
    state.player.gold += gold;
    state.player.tesseraShards += shards;

    // Award EXP to current job
    const curProg = state.player.jobs[state.player.currentJob];
    let newExp = curProg.exp + exp;
    let newLevel = curProg.level;

    while (newLevel < 50 && newExp >= EXP_TABLE[newLevel]) {
      newExp -= EXP_TABLE[newLevel];
      newLevel += 1;
    }

    state.player.jobs[state.player.currentJob] = {
      level: newLevel,
      exp: newExp
    };

    state.maxHp = calculateMaxHp(state.player);
    state.currentHp = Math.min(state.currentHp + Math.floor(exp * 2), state.maxHp);
    notify();
  },


  updateCustomization(customization: Partial<PlayerProfile['customization']>) {
    state.player.customization = {
      ...state.player.customization,
      ...customization
    };
    notify();
  },


  updateSettings(settings: Partial<PlayerProfile['settings']>) {
    state.player.settings = {
      ...state.player.settings,
      ...settings
    };
    notify();
  },

  completeHeroOnboarding(heroName: string, chosenJob: 'WARRIOR' | 'MAGE' | 'PRIEST') {
    const cleanName = heroName.trim().slice(0, 16) || 'Hero';
    state.player.name = cleanName;
    state.player.currentJob = chosenJob;
    if (!state.player.jobs[chosenJob]) {
      state.player.jobs[chosenJob] = { level: 1, exp: 0 };
    }

    const jobDef = JOB_DEFINITIONS[chosenJob];
    const allowed = jobDef.allowedWeapons;
    const ownedIds = new Set(state.player.inventory.map(w => w.id));
    const starterIds = (STARTER_LOADOUTS[chosenJob] || []).filter(id => ownedIds.has(id));
    const fallbackIds = state.player.inventory
      .filter(w => allowed.includes(w.category))
      .map(w => w.id);
    state.player.equippedWeaponIds = [...starterIds, ...fallbackIds]
      .filter((id, i, arr) => arr.indexOf(id) === i)
      .slice(0, 5);

    state.player.hasCompletedOnboarding = true;
    state.maxHp = calculateMaxHp(state.player);
    state.currentHp = state.maxHp;
    notify(true);
  },

  completeNoviceStep(stepNum: number) {
    if (!state.player.noviceGuide) {
      state.player.noviceGuide = {
        currentStep: 1,
        completedSteps: [],
        claimedSteps: [],
        isMinimized: false,
        isCompleted: false,
      };
    }
    const guide = state.player.noviceGuide;
    if (guide.isCompleted) return;
    if (!guide.completedSteps.includes(stepNum)) {
      guide.completedSteps.push(stepNum);
      const stepDef = NOVICE_GUIDE_STEPS.find(s => s.step === stepNum);
      if (stepDef) {
        gameActions.addNotification(`Novice Goal Complete: ${stepDef.title}! Tap [Claim] for ${stepDef.rewardLabel}`, 2800);
      }
      notify();
    }
  },

  claimNoviceReward(stepNum: number) {
    if (!state.player.noviceGuide) return;
    const guide = state.player.noviceGuide;
    if (guide.claimedSteps.includes(stepNum)) return;
    if (!guide.completedSteps.includes(stepNum)) return;

    const stepDef = NOVICE_GUIDE_STEPS.find(s => s.step === stepNum);
    if (!stepDef) return;

    guide.claimedSteps.push(stepNum);

    if (stepDef.rewardType === 'GOLD') {
      state.player.gold += stepDef.rewardAmount;
    } else if (stepDef.rewardType === 'SHARDS') {
      state.player.tesseraShards += stepDef.rewardAmount;
    } else if (stepDef.rewardType === 'FEATHERS') {
      state.player.heroFeathers = (state.player.heroFeathers || 0) + stepDef.rewardAmount;
    } else if (stepDef.rewardType === 'MATERIAL') {
      state.player.materials['mat-slime-essence'] = (state.player.materials['mat-slime-essence'] || 0) + stepDef.rewardAmount;
    } else if (stepDef.rewardType === 'TITLE') {
      state.player.tesseraShards += stepDef.rewardAmount;
      state.player.customization.title = 'Sanctuary Pioneer';
    }

    if (guide.currentStep === stepNum) {
      let nextStep = stepNum + 1;
      while (nextStep <= 6 && guide.claimedSteps.includes(nextStep)) {
        nextStep++;
      }
      guide.currentStep = nextStep;
      if (guide.claimedSteps.length >= 6) {
        guide.isCompleted = true;
      }
    }

    gameActions.addNotification(`Claimed: ${stepDef.rewardLabel}!`, 2200);
    notify(true);
  },

  toggleNoviceGuide(minimized?: boolean) {
    if (!state.player.noviceGuide) {
      state.player.noviceGuide = {
        currentStep: 1,
        completedSteps: [],
        claimedSteps: [],
        isMinimized: false,
        isCompleted: false,
      };
    }
    state.player.noviceGuide.isMinimized = minimized !== undefined ? minimized : !state.player.noviceGuide.isMinimized;
    notify();
  },

  importSaveData(playerData: PlayerProfile, realmId?: string) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      player: { ...playerData, hasCompletedOnboarding: playerData.hasCompletedOnboarding ?? true },
      currentRealmId: realmId || state.currentRealmId,
    }));
    const reloaded = loadInitialState();
    state = reloaded;
    notify(true);
  },

  resetSaveData() {
    isResettingSave = true;
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('tessera_auth_choice_v1');
    } catch {
      // Ignore
    }
    window.location.reload();
  },


  addPulledWeapons(newWeapons: Weapon[]) {
    const existingIds = new Set(state.player.inventory.map(w => w.id));
    const added: Weapon[] = [];
    let dupeGold = 0;
    let dupeShards = 0;

    newWeapons.forEach(w => {
      if (existingIds.has(w.id)) {
        // Duplicate compensation!
        dupeGold += w.rarity === 5 ? 5000 : w.rarity === 4 ? 1000 : 300;
        dupeShards += w.rarity === 5 ? 50 : w.rarity === 4 ? 15 : 5;
      } else {
        existingIds.add(w.id);
        added.push(w);
      }
    });

    state.player.inventory = [...state.player.inventory, ...added];
    const allowedCats = JOB_DEFINITIONS[state.player.currentJob]?.allowedWeapons || [];
    added.forEach(w => {
      if (state.player.equippedWeaponIds.length < 5 && allowedCats.includes(w.category) && !state.player.equippedWeaponIds.includes(w.id)) {
        state.player.equippedWeaponIds.push(w.id);
      }
    });
    state.player.gold += dupeGold;
    state.player.tesseraShards += dupeShards;
    notify();
  },


  spendShards(amount: number): boolean {
    if (state.player.tesseraShards < amount) return false;
    state.player.tesseraShards -= amount;
    notify();
    return true;
  },

  spendFeathers(amount: number): boolean {
    if (state.player.heroFeathers < amount) return false;
    state.player.heroFeathers -= amount;
    notify();
    return true;
  },

  unlockPart(category: PartCategory, partId: string) {
    if (!state.player.unlockedParts[category]) {
      state.player.unlockedParts[category] = [];
    }
    if (!state.player.unlockedParts[category].includes(partId)) {
      state.player.unlockedParts[category] = [...state.player.unlockedParts[category], partId];
      notify();
    }
  },

  addPulledParts(newParts: CustomizationPart[]) {
    const results: { part: CustomizationPart; isNew: boolean; feathersGranted: number }[] = [];
    let dupeFeathers = 0;
    let dupeShards = 0;

    newParts.forEach(p => {
      const catList = state.player.unlockedParts[p.category] || [];
      const alreadyHas = catList.includes(p.id);

      if (alreadyHas) {
        // Astral Hero Feathers duplicate compensation!
        const feathers = p.rarity === 5 ? 100 : p.rarity === 4 ? 30 : 10;
        const shards = p.rarity === 5 ? 50 : p.rarity === 4 ? 15 : 5;
        dupeFeathers += feathers;
        dupeShards += shards;
        results.push({ part: p, isNew: false, feathersGranted: feathers });
      } else {
        // Unlock new part!
        state.player.unlockedParts[p.category] = [...catList, p.id];
        results.push({ part: p, isNew: true, feathersGranted: 0 });
      }
    });

    state.player.heroFeathers += dupeFeathers;
    state.player.tesseraShards += dupeShards;
    notify();
    return results;
  },

  equipSkin(job: JobType, skinFolderName: string) {
    if (!state.player.equippedSkins) {
      state.player.equippedSkins = {};
    }
    state.player.equippedSkins[job] = skinFolderName;
    notify();
  },


  addPulledSkins(newSkins: HeroSkin[]) {
    const results: { skin: HeroSkin; isNew: boolean; feathersGranted: number }[] = [];
    let dupeFeathers = 0;
    let dupeShards = 0;

    if (!state.player.unlockedSkins) {
      state.player.unlockedSkins = { ...DEFAULT_UNLOCKED_SKINS };
    }
    const unlocked = state.player.unlockedSkins;

    newSkins.forEach(skin => {
      const alreadyHas = !!unlocked[skin.id];
      if (alreadyHas) {
        // Astral Hero Feathers duplicate compensation
        const feathers = skin.rarity === 5 ? 120 : skin.rarity === 4 ? 40 : 15;
        const shards = skin.rarity === 5 ? 60 : skin.rarity === 4 ? 20 : 10;
        dupeFeathers += feathers;
        dupeShards += shards;
        results.push({ skin, isNew: false, feathersGranted: feathers });
      } else {
        unlocked[skin.id] = true;
        results.push({ skin, isNew: true, feathersGranted: 0 });
      }
    });

    state.player.heroFeathers += dupeFeathers;
    state.player.tesseraShards += dupeShards;
    notify();
    return results;
  },

  unlockSkinWithFeathers(skinId: string, cost: number): boolean {
    if (state.player.heroFeathers < cost) return false;
    if (!state.player.unlockedSkins) {
      state.player.unlockedSkins = { ...DEFAULT_UNLOCKED_SKINS };
    }
    state.player.heroFeathers -= cost;
    state.player.unlockedSkins[skinId] = true;
    notify();
    return true;
  },

  upgradeWeapon(weaponId: string): boolean {
    const curLevel = state.player.weaponUpgrades[weaponId] || 0;
    if (curLevel >= 10) return false;

    const goldCost = (curLevel + 1) * 350;
    if (state.player.gold < goldCost) return false;

    let reqMatId = 'mat-slime-essence';
    let reqCount = 2;
    if (curLevel >= 8) {
      reqMatId = 'mat-abyssal-core';
      reqCount = 1;
    } else if (curLevel >= 5) {
      reqMatId = 'mat-gale-feather';
      reqCount = 2;
    } else if (curLevel >= 3) {
      reqMatId = 'mat-thorn-fang';
      reqCount = 2;
    }

    const currentMatCount = state.player.materials[reqMatId] || 0;
    if (currentMatCount < reqCount) return false;

    // Deduct resources
    state.player.gold -= goldCost;
    state.player.materials[reqMatId] -= reqCount;
    state.player.weaponUpgrades[weaponId] = curLevel + 1;
    notify();
    return true;
  },

  // Start a Multi-Wave Elemental Dungeon Raid
  startDungeonBattle(dungeonId: string) {
    const dungeon = DUNGEONS.find(d => d.id === dungeonId) || DUNGEONS[0];
    const wave = dungeon.waves[0];
    const battleId = `dungeon-${Date.now()}`;
    const enemyCombatant = createEnemyCombatant(wave.enemyTemplateId, wave.enemyHp);
    enemyCombatant.name = wave.enemyName;
    enemyCombatant.element = wave.enemyElement;
    enemyCombatant.isBoss = wave.isBoss;
    enemyCombatant.spriteType = wave.spriteType;

    const playerCombatant = createPlayerCombatant(state.player, state.currentHp);

    // Pick 1-2 AI hunters who are wandering to join the dungeon expedition!
    const availableAIs = state.aiHunters.filter(h => h.state !== 'IN_BATTLE').slice(0, 2);
    const participants: Combatant[] = [playerCombatant];
    availableAIs.forEach(ai => {
      const aiCombatant = createAICombatant(ai);
      ai.state = 'IN_BATTLE';
      ai.currentBattleId = battleId;
      participants.push(aiCombatant);
    });

    if (enemyCombatant.isBoss && participants.length > 1) {
      enemyCombatant.maxHp = getScaledBossHp(enemyCombatant.maxHp, participants.length);
      enemyCombatant.hp = enemyCombatant.maxHp;
    }

    const bg = getBattlegroundForCombat(state.currentRealmId, wave.isBoss, wave.enemyElement);
    const battle: BattleInstance = {
      id: battleId,
      enemyId: `dungeon-mob-${wave.waveNumber}`,
      enemyName: wave.enemyName,
      enemyElement: wave.enemyElement,
      enemyHp: wave.enemyHp,
      enemyMaxHp: wave.enemyHp,
      isBoss: wave.isBoss,
      participants,
      mapX: 800,
      mapY: 200,
      active: true,
      combatLogs: [
        `Entered [${dungeon.name}]! Wave 1/${dungeon.waves.length}: ${wave.enemyName}`,
        availableAIs.length > 0 ? `Allies ${availableAIs.map(a => a.name).join(', ')} entered the raid!` : 'Solo assault initiated!'
      ],
      enemy: enemyCombatant,
      background: bg,
      isDungeon: true,
      dungeonId: dungeon.id,
      currentWave: 1,
      totalWaves: dungeon.waves.length
    };

    state.battles[battleId] = battle;
    state.activeBattleId = battleId;
    state.view = 'BATTLE';
    notify();
  },


  advanceDungeonWave(battleId: string): boolean {
    const battle = state.battles[battleId];
    if (!battle || !battle.isDungeon || !battle.dungeonId) return false;
    const dungeon = DUNGEONS.find(d => d.id === battle.dungeonId);
    if (!dungeon) return false;

    const nextWaveNum = (battle.currentWave || 1) + 1;
    if (nextWaveNum > dungeon.waves.length) {
      // Dungeon completely cleared!
      this.addRewards(dungeon.rewardGold, dungeon.rewardExp, dungeon.rewardShards);
      return false; // No more waves
    }

    const nextWave = dungeon.waves[nextWaveNum - 1];
    battle.currentWave = nextWaveNum;
    battle.enemyName = nextWave.enemyName;
    battle.enemyElement = nextWave.enemyElement;
    battle.enemyHp = nextWave.enemyHp;
    battle.enemyMaxHp = nextWave.enemyHp;
    battle.isBoss = nextWave.isBoss;

    const nextEnemyCombatant = createEnemyCombatant(nextWave.enemyTemplateId, nextWave.enemyHp);
    nextEnemyCombatant.name = nextWave.enemyName;
    nextEnemyCombatant.element = nextWave.enemyElement;
    nextEnemyCombatant.isBoss = nextWave.isBoss;
    nextEnemyCombatant.spriteType = nextWave.spriteType;

    if (nextEnemyCombatant.isBoss && battle.participants.length > 1) {
      nextEnemyCombatant.maxHp = getScaledBossHp(nextEnemyCombatant.maxHp, battle.participants.length);
      nextEnemyCombatant.hp = nextEnemyCombatant.maxHp;
      battle.enemyMaxHp = nextEnemyCombatant.maxHp;
      battle.enemyHp = nextEnemyCombatant.hp;
    }

    battle.enemy = nextEnemyCombatant;
    battle.background = getBattlegroundForCombat(state.currentRealmId, nextWave.isBoss, nextWave.enemyElement);

    // Heal party by 30% between waves
    battle.participants.forEach(p => {
      if (!p.isDead) {
        p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.3));
      }
    });
    const playerPart = battle.participants.find(p => p.isPlayer);
    if (playerPart) {
      state.currentHp = Math.max(0, Math.min(state.maxHp, Math.round(playerPart.hp)));
    }

    battle.combatLogs.push(`Wave ${nextWaveNum}/${dungeon.waves.length} Inbound: [${nextWave.enemyName}]!`);
    notify();
    return true;
  },

  // Start a new battle from player engaging an overworld enemy
  startPlayerBattle(enemyId: string) {
    const enemy = state.enemies.find(e => e.id === enemyId);
    if (!enemy) return;

    // Check if enemy is already in a battle
    if (enemy.battleInstanceId && state.battles[enemy.battleInstanceId]) {
      this.playerJoinBattle(enemy.battleInstanceId);
      return;
    }

    const battleId = `battle-${Date.now()}`;
    const enemyCombatant = createEnemyCombatant(enemy.templateId, enemy.currentHp);
    if (enemy.isCornerGuardian) {
      enemyCombatant.name = enemy.name;
      enemyCombatant.atk = Math.round(enemyCombatant.atk * 1.45);
      enemyCombatant.matk = Math.round(enemyCombatant.matk * 1.45);
    }
    const playerCombatant = createPlayerCombatant(state.player, state.currentHp);
    const bg = getBattlegroundForCombat(state.currentRealmId, enemy.isBoss || Boolean(enemy.isCornerGuardian), enemy.element);

    const battle: BattleInstance = {
      id: battleId,
      enemyId: enemy.id,
      enemyName: enemy.name,
      enemyElement: enemy.element,
      enemyHp: enemy.currentHp,
      enemyMaxHp: enemy.maxHp,
      isBoss: enemy.isBoss,
      isCornerGuardian: Boolean(enemy.isCornerGuardian),
      participants: [playerCombatant],
      mapX: enemy.x,
      mapY: enemy.y,
      active: true,
      combatLogs: [`${playerCombatant.name} engaged ${enemy.name}!`],
      enemy: enemyCombatant,
      background: bg
    };

    enemy.battleInstanceId = battleId;
    state.battles[battleId] = battle;
    state.activeBattleId = battleId;
    state.view = 'BATTLE';
    notify();
  },


  // Player clicks "Battle in Progress" drop-in marker
  playerJoinBattle(battleId: string) {
    const battle = state.battles[battleId];
    if (!battle || !battle.active) return;

    // Check if player already in
    const already = battle.participants.some(p => p.isPlayer);
    if (!already && battle.participants.length < 5) {
      const playerCombatant = createPlayerCombatant(state.player, state.currentHp);
      battle.participants.push(playerCombatant);

      if (battle.enemy.isBoss) {
        const prevRatio = battle.enemy.hp / battle.enemy.maxHp;
        const tmpl = ENEMY_TEMPLATES[battle.enemy.templateId];
        const baseHp = tmpl ? tmpl.maxHp : battle.enemy.maxHp;
        battle.enemy.maxHp = getScaledBossHp(baseHp, battle.participants.length);
        battle.enemy.hp = Math.max(1, Math.round(battle.enemy.maxHp * prevRatio));
        battle.enemyMaxHp = battle.enemy.maxHp;
        battle.enemyHp = battle.enemy.hp;
      }

      battle.combatLogs.push(`>> ${playerCombatant.name} joined the fray! (${battle.participants.length}/5)`);
    }

    state.activeBattleId = battleId;
    state.view = 'BATTLE';
    notify();
  },


  // AI hunter initiates battle with an enemy
  aiStartBattle(aiId: string, enemyId: string) {
    const ai = state.aiHunters.find(h => h.id === aiId);
    const enemy = state.enemies.find(e => e.id === enemyId);
    if (!ai || !enemy || ai.state === 'IN_BATTLE') return;

    // If enemy is already in battle, join it!
    if (enemy.battleInstanceId && state.battles[enemy.battleInstanceId]) {
      this.aiJoinBattle(aiId, enemy.battleInstanceId);
      return;
    }

    const battleId = `battle-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const enemyCombatant = createEnemyCombatant(enemy.templateId, enemy.currentHp);
    const aiCombatant = createAICombatant(ai);
    const bg = getBattlegroundForCombat(state.currentRealmId, enemy.isBoss, enemy.element);

    const battle: BattleInstance = {
      id: battleId,
      enemyId: enemy.id,
      enemyName: enemy.name,
      enemyElement: enemy.element,
      enemyHp: enemy.currentHp,
      enemyMaxHp: enemy.maxHp,
      isBoss: enemy.isBoss,
      participants: [aiCombatant],
      mapX: enemy.x,
      mapY: enemy.y,
      active: true,
      combatLogs: [`${ai.name} challenged ${enemy.name}!`],
      enemy: enemyCombatant,
      background: bg
    };

    enemy.battleInstanceId = battleId;
    ai.state = 'IN_BATTLE';
    ai.currentBattleId = battleId;
    state.battles[battleId] = battle;
    notify();
  },


  // AI drops into an existing ongoing battle
  aiJoinBattle(aiId: string, battleId: string) {
    const ai = state.aiHunters.find(h => h.id === aiId);
    const battle = state.battles[battleId];
    if (!ai || !battle || !battle.active || battle.participants.length >= 5) return;
    if (battle.participants.some(p => p.id === ai.id)) return;

    const aiCombatant = createAICombatant(ai);
    battle.participants.push(aiCombatant);
    ai.state = 'IN_BATTLE';
    ai.currentBattleId = battleId;

    if (battle.enemy.isBoss) {
      const prevRatio = battle.enemy.hp / battle.enemy.maxHp;
      const tmpl = ENEMY_TEMPLATES[battle.enemy.templateId];
      const baseHp = tmpl ? tmpl.maxHp : battle.enemy.maxHp;
      battle.enemy.maxHp = getScaledBossHp(baseHp, battle.participants.length);
      battle.enemy.hp = Math.max(1, Math.round(battle.enemy.maxHp * prevRatio));
      battle.enemyMaxHp = battle.enemy.maxHp;
      battle.enemyHp = battle.enemy.hp;
    }

    battle.combatLogs.push(`>> Hunter ${ai.name} dropped into battle! (${battle.participants.length}/5)`);

    // Show drop-in toast notification (auto-deleted after 1.8s)
    gameActions.addNotification(`Ally ${ai.name} (${ai.job}) joined the battle!`, 1800);
  },

  endBattle(battleId: string, victory: boolean) {
    const battle = state.battles[battleId];
    if (!battle) return;

    battle.active = false;

    // Find overworld enemy and handle respawn or HP sync
    const enemy = state.enemies.find(e => e.id === battle.enemyId);
    if (enemy) {
      if (victory) {
        enemy.currentHp = 0;
        enemy.respawnTimer = enemy.isBoss ? 30 : 10; // Boss respawns in 30s per GDD
      } else {
        enemy.currentHp = battle.enemy.hp;
      }
      enemy.battleInstanceId = undefined;
    }

    // Release AI hunters
    state.aiHunters.forEach(ai => {
      if (ai.currentBattleId === battleId) {
        ai.state = 'WANDERING';
        ai.currentBattleId = undefined;
      }
    });

    // If player was in this battle and won, award rewards & materials!
    const playerPart = battle.participants.find(p => p.isPlayer);
    if (playerPart && victory) {
      const tmpl = ENEMY_TEMPLATES[enemy?.templateId || 'moss-slime'];
      if (tmpl) {
        this.addRewards(tmpl.goldReward, tmpl.expReward, tmpl.shardReward);

        // Monster material drops
        let dropMatId = 'mat-slime-essence';
        let dropCount = 1;
        if (tmpl.id === 'thorn-wolf') {
          dropMatId = 'mat-thorn-fang';
          dropCount = Math.random() < 0.6 ? 2 : 1;
        } else if (tmpl.id === 'gale-hawk') {
          dropMatId = 'mat-gale-feather';
          dropCount = Math.random() < 0.6 ? 2 : 1;
        } else if (tmpl.id === 'abyssal-stag' || tmpl.id === 'guardian-seiryu' || tmpl.id === 'scarlet-akazonae' || tmpl.id === 'master-onmyoji' || tmpl.id === 'dark-horseman') {
          dropMatId = 'mat-abyssal-core';
          dropCount = 1;
        }

        state.player.materials[dropMatId] = (state.player.materials[dropMatId] || 0) + dropCount;

        const ownedIds = new Set(state.player.inventory.map(w => w.id));
        const allowedCats = JOB_DEFINITIONS[state.player.currentJob]?.allowedWeapons || [];
        const awardLootWeapon = (loot: Weapon, toastPrefix: string, dupShards: number, dupGold: number) => {
          if (!ownedIds.has(loot.id)) {
            state.player.inventory.push(loot);
            ownedIds.add(loot.id);
            let equippedTag = '';
            if (
              state.player.equippedWeaponIds.length < 5 &&
              allowedCats.includes(loot.category) &&
              !state.player.equippedWeaponIds.includes(loot.id)
            ) {
              state.player.equippedWeaponIds.push(loot.id);
              equippedTag = ' (Equipped!)';
            }
            gameActions.addNotification(`${toastPrefix}: ${loot.name} [${loot.rarity}★]${equippedTag}`, 3000);
          } else {
            state.player.tesseraShards += dupShards;
            state.player.gold += dupGold;
            gameActions.addNotification(`⚔️ ${tmpl.name} Slayed! (+${dupShards} Bonus Shards)`, 2200);
          }
        };

        // Unlock Celestial Dungeon + Grant 5★ Boss Legendary Sword Drop on Hard Bosses / Dungeons
        if (tmpl.isBoss || battle.isBoss || enemy?.isBoss || battle.isDungeon) {
          if (!battle.isDungeon) {
            if (!state.player.defeatedRealmBosses) {
              state.player.defeatedRealmBosses = {};
            }
            state.player.defeatedRealmBosses[state.currentRealmId] = true;
          }

          const bossPoolUnowned = ALL_WEAPONS.filter(
            w => w.rarity === 5 && w.rewardSource === 'BOSS_DROP' && !ownedIds.has(w.id)
          );
          const bossPool = bossPoolUnowned.length > 0
            ? bossPoolUnowned
            : ALL_WEAPONS.filter(w => w.rarity === 5 && w.rewardSource === 'BOSS_DROP');
          if (bossPool.length > 0) {
            const loot = bossPool[Math.floor(Math.random() * bossPool.length)];
            awardLootWeapon(loot, '🏆 5★ BOSS LOOT', 150, 500);
          } else {
            gameActions.addNotification(`⚔️ ${tmpl.name} Slayed! Celestial Dungeon Unlocked!`, 2000);
          }
        } else if (battle.isCornerGuardian || enemy?.isCornerGuardian) {
          // Corner Guardians at the 4 corners of the map award exclusive 5★ Corner Swords!
          this.addRewards(600, 450, 60);
          const cornerPoolUnowned = ALL_WEAPONS.filter(
            w => w.rarity === 5 && w.rewardSource === 'CORNER_DROP' && !ownedIds.has(w.id)
          );
          const cornerPool = cornerPoolUnowned.length > 0
            ? cornerPoolUnowned
            : ALL_WEAPONS.filter(w => w.rarity === 5 && w.rewardSource === 'CORNER_DROP');
          if (cornerPool.length > 0) {
            const loot = cornerPool[Math.floor(Math.random() * cornerPool.length)];
            awardLootWeapon(loot, '👑 5★ CORNER LOOT', 120, 400);
          }
        } else {
          // Regular & Elite Field Monsters drop 1★-4★ farmable weapons!
          const isElite = Boolean(enemy?.name.startsWith('Elite '));
          const needsFirstGear = state.player.inventory.length < 2;
          const dropChance = needsFirstGear ? 1.0 : isElite ? 0.7 : 0.45;
          if (Math.random() < dropChance) {
            const roll = Math.random();
            const targetRarity: 1 | 2 | 3 | 4 = needsFirstGear
              ? roll < 0.65 ? 1 : 2
              : isElite
              ? roll < 0.35 ? 2 : roll < 0.8 ? 3 : 4
              : roll < 0.5 ? 1 : roll < 0.85 ? 2 : 3;

            const farmPoolAll = ALL_WEAPONS.filter(
              w =>
                !w.isMythic &&
                !QUEST_LOCKED_WEAPON_ID_SET.has(w.id) &&
                w.rewardSource !== 'BOSS_DROP' &&
                w.rewardSource !== 'CORNER_DROP' &&
                w.rarity === targetRarity
            );
            const unownedClassPool = farmPoolAll.filter(w => !ownedIds.has(w.id) && allowedCats.includes(w.category));
            const unownedAnyPool = farmPoolAll.filter(w => !ownedIds.has(w.id));
            const pool =
              unownedClassPool.length > 0 && (needsFirstGear || Math.random() < 0.65)
                ? unownedClassPool
                : unownedAnyPool.length > 0
                ? unownedAnyPool
                : farmPoolAll;
            if (pool.length > 0) {
              const loot = pool[Math.floor(Math.random() * pool.length)];
              awardLootWeapon(loot, isElite ? '⚔️ ELITE DROP' : '🗡️ WEAPON DROP', loot.rarity * 25, loot.rarity * 120);
            }
          }
        }

        // Update all matching commissions, Legendary Artifact quests, Mythic Trials & 100-Enemy Bounties
        const isBossVictory = !battle.isDungeon && (tmpl.isBoss || battle.isBoss || Boolean(enemy?.isBoss));
        const SLIME_IDS = new Set([
          'moss-slime', 'frog-keroro', 'frost-sasquatch', 'striker-tamama',
          'slime-snail', 'lava-snail', 'electric-snail', 'bonbon', 'furfur', 'eau-mouton', 'crystal-shield',
        ]);
        const WOLF_IDS = new Set([
          'thorn-wolf', 'shadowclaw-felicia', 'spearman-keiji', 'gunner-giroro',
          'wind-tiger', 'white-tiger', 'black-tiger', 'wolf', 'roar-wolf',
          'demon-dog', 'shadow-dog', 'gray-ulse', 'grizzly-bear', 'blade-bull',
          'keraunos', 'poison-spider', 'nightmare', 'phantom',
        ]);
        const HAWK_IDS = new Set([
          'gale-hawk', 'ninja-dororo', 'ninja-hotarubi', 'kunoichi-akeginu',
          'tech-kululu', 'vector-accelerator', 'bird-knight', 'crow-tengu', 'eagle-man', 'roc',
        ]);
        const matchesObjective = (targetType: QuestTargetType): boolean => {
          if (targetType === 'ANY_ENEMY') return true;
          if (battle.isDungeon && targetType === 'DUNGEON') return true;
          if (isBossVictory) return targetType === 'BOSS';
          if (!battle.isDungeon) {
            if (targetType === 'SLIME') return SLIME_IDS.has(tmpl.id);
            if (targetType === 'WOLF') return WOLF_IDS.has(tmpl.id);
            if (targetType === 'HAWK') return HAWK_IDS.has(tmpl.id);
          }
          return false;
        };

        if (!state.player.questSecondaryProgress) {
          state.player.questSecondaryProgress = {};
        }
        QUESTS.forEach(q => {
          if (matchesObjective(q.targetType)) {
            state.player.questProgress[q.id] = (state.player.questProgress[q.id] || 0) + 1;
          }
          if (q.secondaryTargetType && matchesObjective(q.secondaryTargetType)) {
            state.player.questSecondaryProgress![q.id] = (state.player.questSecondaryProgress![q.id] || 0) + 1;
          }
        });
      }
    }

    if (playerPart) {
      // Sync remaining HP back to player
      state.currentHp = Math.max(1, playerPart.hp);
    }

    if (state.activeBattleId === battleId) {
      state.activeBattleId = null;
      state.view = 'OVERWORLD';
    }

    delete state.battles[battleId];
    notify();
  },


  claimQuestReward(questId: string): boolean {
    const q = QUESTS.find(quest => quest.id === questId);
    if (!q) return false;
    if (state.player.completedQuests.includes(questId)) return false;

    const prog = state.player.questProgress[questId] || 0;
    const secProg = state.player.questSecondaryProgress?.[questId] || 0;
    if (prog < q.requiredCount) return false;
    if (q.secondaryRequiredCount && secProg < q.secondaryRequiredCount) return false;

    // Grant rewards
    state.player.gold += q.rewardGold;
    state.player.tesseraShards += q.rewardShards;
    Object.entries(q.rewardMaterials).forEach(([matId, count]) => {
      state.player.materials[matId] = (state.player.materials[matId] || 0) + count;
    });

    // Grant Legendary Artifact or Animated Mythic Weapon reward
    if (q.rewardWeaponId && WEAPON_MAP[q.rewardWeaponId]) {
      const weapon = WEAPON_MAP[q.rewardWeaponId];
      if (!state.player.inventory.some(w => w.id === weapon.id)) {
        state.player.inventory.push(weapon);
      }
      gameActions.addNotification(
        weapon.isMythic
          ? `✦ MYTHIC BLADE AWAKENED: ${weapon.name}!`
          : `★ LEGENDARY ARTIFACT CLAIMED: ${weapon.name}!`,
        2800
      );
    }

    state.player.completedQuests.push(questId);
    notify();
    return true;
  },

  fleeBattle() {
    if (!state.activeBattleId) return;
    const battle = state.battles[state.activeBattleId];
    if (battle) {
      // Remove player from battle
      battle.participants = battle.participants.filter(p => !p.isPlayer);
      if (battle.participants.length === 0) {
        this.endBattle(battle.id, false);
      }
    }
    state.activeBattleId = null;
    state.view = 'OVERWORLD';
    notify();
  },


  updateAIStates(deltaSec: number) {
    let changed = false;

    // Tick enemy respawns
    state.enemies.forEach(enemy => {
      if (enemy.respawnTimer && enemy.respawnTimer > 0) {
        enemy.respawnTimer -= deltaSec;
        if (enemy.respawnTimer <= 0) {
          enemy.respawnTimer = undefined;
          enemy.currentHp = enemy.maxHp;
          changed = true;
        }
      }
    });

    // Tick AI hunters with A* pathfinding & solid wall collision
    const bigMap = getBigMapForRealm(state.currentRealmId);

    const stepAlongWaypoints = (ai: AIHunter, speed: number): boolean => {
      let path = aiPaths.get(ai.id) || [];
      while (path.length > 0 && Math.hypot(path[0].x - ai.x, path[0].y - ai.y) < 10) {
        path.shift();
      }
      if (path.length === 0) {
        aiPaths.delete(ai.id);
        return false;
      }
      aiPaths.set(ai.id, path);

      const wp = path[0];
      const dx = wp.x - ai.x;
      const dy = wp.y - ai.y;
      const dist = Math.hypot(dx, dy) || 1;
      const stepX = ai.x + (dx / dist) * Math.min(speed, dist);
      const stepY = ai.y + (dy / dist) * Math.min(speed, dist);

      const resolved = resolveEntityMove(ai.x, ai.y, stepX, stepY, bigMap.grid, bigMap.cols, bigMap.rows, 7);
      if (Math.hypot(resolved.x - ai.x, resolved.y - ai.y) < 0.25) {
        // Blocked by corner/wall: clear stale path cleanly
        aiPaths.delete(ai.id);
        return false;
      }

      ai.x = resolved.x;
      ai.y = resolved.y;
      ai.targetX = wp.x;
      ai.targetY = wp.y;
      ai.isWalking = true;
      if (dx < -1.5) ai.facingLeft = true;
      else if (dx > 1.5) ai.facingLeft = false;
      return true;
    };

    state.aiHunters.forEach(ai => {
      // Ensure AI never remains clipped inside a wall
      if (!isBoxWalkable(ai.x, ai.y, 7, 7, bigMap.grid, bigMap.cols, bigMap.rows)) {
        const snap = findNearestWalkableTile(
          Math.floor(ai.x / MAP_TILE_SIZE),
          Math.floor(ai.y / MAP_TILE_SIZE),
          bigMap.grid,
          bigMap.cols,
          bigMap.rows,
          10,
          true
        );
        ai.x = snap.tx * MAP_TILE_SIZE + 12;
        ai.y = snap.ty * MAP_TILE_SIZE + 12;
        aiPaths.delete(ai.id);
      }

      if (ai.state === 'IN_BATTLE') {
        ai.isWalking = false;
        aiPaths.delete(ai.id);
        if (!ai.currentBattleId || !state.battles[ai.currentBattleId]?.active) {
          ai.state = 'WANDERING';
          ai.currentBattleId = undefined;
          ai.idleTimer = 1.0;
          changed = true;
        }
        return;
      }

      // Check if World Boss is currently in battle and party < 5: A* pathfind and join!
      const bossEnemy = state.enemies.find(e => e.isBoss);
      if (bossEnemy?.battleInstanceId && state.battles[bossEnemy.battleInstanceId]?.active) {
        const bossBattle = state.battles[bossEnemy.battleInstanceId];
        if (bossBattle.participants.length < 5) {
          const dist = Math.hypot(bossEnemy.x - ai.x, bossEnemy.y - ai.y);
          if (dist < 80) {
            ai.isWalking = false;
            aiPaths.delete(ai.id);
            this.aiJoinBattle(ai.id, bossBattle.id);
            changed = true;
            return;
          } else {
            let path = aiPaths.get(ai.id);
            if (!path || path.length === 0 || Math.hypot(path[path.length - 1].x - bossEnemy.x, path[path.length - 1].y - bossEnemy.y) > 48) {
              path = findTilePath(ai.x, ai.y, bossEnemy.x, bossEnemy.y, bigMap.grid, bigMap.cols, bigMap.rows);
              aiPaths.set(ai.id, path);
            }
            if (stepAlongWaypoints(ai, 95 * deltaSec)) {
              changed = true;
              return;
            }
          }
        }
      }

      // WANDERING state: rest or follow A* path along dry ground & bridges
      if (ai.idleTimer !== undefined && ai.idleTimer > 0) {
        ai.idleTimer -= deltaSec;
        ai.isWalking = false;
        if (ai.idleTimer <= 0) {
          ai.idleTimer = 0;
          const dest = pickRandomWalkableTarget(ai.x, ai.y, bigMap.grid, bigMap.cols, bigMap.rows);
          const path = findTilePath(ai.x, ai.y, dest.x, dest.y, bigMap.grid, bigMap.cols, bigMap.rows);
          if (path.length > 0) {
            aiPaths.set(ai.id, path);
            ai.targetX = dest.x;
            ai.targetY = dest.y;
          } else {
            ai.idleTimer = 1.5;
          }
        }
        changed = true;
      } else {
        const moved = stepAlongWaypoints(ai, 68 * deltaSec);
        if (!moved) {
          ai.isWalking = false;
          ai.idleTimer = 1.8 + Math.random() * 2.0;
        }
        changed = true;
      }

      // Check proximity to roaming enemies to engage
      const aliveEnemies = state.enemies.filter(e => e.currentHp > 0);
      for (const enemy of aliveEnemies) {
        const distToEnemy = Math.hypot(enemy.x - ai.x, enemy.y - ai.y);
        if (distToEnemy < 60) {
          ai.isWalking = false;
          aiPaths.delete(ai.id);
          if (enemy.battleInstanceId && state.battles[enemy.battleInstanceId]?.active) {
            this.aiJoinBattle(ai.id, enemy.battleInstanceId);
          } else {
            this.aiStartBattle(ai.id, enemy.id);
          }
          changed = true;
          break;
        }
      }
    });

    if (changed) {
      notify();
    }
  }
};

export function useGameStore(): GameState {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
}
