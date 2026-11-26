export type ElementType = 'FIRE' | 'WATER' | 'WIND' | 'LIGHT' | 'DARK';

// 3 Paths, WoW-inspired classes
export type JobType =
  // 1. The Martial Path (Martial / Bushido - Base: Warrior)
  | 'WARRIOR'
  | 'GUARDIAN'
  | 'BERSERKER'
  | 'ROGUE'
  | 'ASSASSIN'
  | 'HUNTER'
  // 2. The Arcane Path (Arcane / Mage - Base: Mage)
  | 'MAGE'
  | 'ARCHMAGE'
  | 'WARLOCK'
  | 'DEATH_KNIGHT'
  | 'DEMON_HUNTER'
  // 3. The Divine & Primal Path (Divine / Priest - Base: Priest / Initiate)
  | 'PRIEST'
  | 'PALADIN'
  | 'DRUID'
  | 'SHAMAN'
  | 'MONK'
  | 'EVOKER'
  // Backward compatibility aliases
  | 'VANGUARD'
  | 'SPELLWEAVER'
  | 'LIGHTBEARER'
  | 'SHADOWBLADE';

export type ClassPath = 'MARTIAL' | 'ARCANE' | 'DIVINE';

export type WeaponCategory = 'GREATBLADE' | 'SHIELD' | 'STAFF' | 'TOME' | 'MACE' | 'RELIC' | 'DAGGERS' | 'BOW';
export type Rarity = 1 | 2 | 3 | 4 | 5;
export type WeaponRewardSource = 'STARTER' | 'GACHA' | 'BOSS_DROP' | 'CORNER_DROP' | 'BOUNTY_100' | 'MYTHIC';

export type EffectType = 'DAMAGE' | 'HEAL' | 'BUFF_DEF' | 'BUFF_ATK' | 'SHIELD' | 'CLEANSE';

export interface Weapon {
  id: string;
  name: string;
  rarity: Rarity;
  element: ElementType;
  category: WeaponCategory;
  baseAtk: number;
  baseMatk: number;
  cooldownSec: number;
  etherGain: number; // e.g., 35 means 35% per active use
  activeSkillName: string;
  activeMultiplier: number;
  ultimateSkillName: string;
  ultimateMultiplier: number;
  effectType: EffectType;
  hits?: number;
  ultHits?: number;
  description?: string;
  critBonus?: number; // e.g., 0.50
  icon?: string; // Pixel art sword icon path from swords/
  animatedIcon?: string; // Horizontal sprite strip path for animated Mythic swords
  animFrames?: number; // Frame count inside animatedIcon strip
  isMythic?: boolean; // Class-Story Animated Mythic Blade
  mythicJob?: JobType; // Bound Class ID
  rewardSource?: WeaponRewardSource;
}

export interface ActiveBuff {
  id: string;
  name: string;
  type: 'DEF' | 'ATK' | 'SHIELD' | 'CRIT';
  value: number; // percentage (e.g. 0.40 for 40% reduction or 50 for +50% ATK)
  durationSec: number;
  remainingSec: number;
  shieldHp?: number;
}

export interface Combatant {
  id: string;
  name: string;
  isPlayer: boolean;
  job: JobType;
  hp: number;
  maxHp: number;
  atk: number;
  matk: number;
  def: number;
  mdef: number;
  critRate: number; // e.g. 0.15
  threat: number;
  equippedWeapons: Weapon[];
  cooldowns: Record<string, number>; // weaponId -> remaining seconds
  ether: Record<string, number>;     // weaponId -> 0 to 100
  buffs: ActiveBuff[];
  autoAttackTimer: number;          // ticks towards 2.0s
  targetId?: string;
  isDead: boolean;
  avatarSeed?: number;
}

export type MonsterSpriteType =
  | 'slime'
  | 'wolf'
  | 'hawk'
  | 'enemy_felicia'
  | 'enemy_sasquatch'
  | 'enemy_keroro'
  | 'enemy_giroro'
  | 'enemy_dororo'
  | 'enemy_tamama'
  | 'enemy_kululu'
  | 'enemy_keiji'
  | 'enemy_hideyoshi'
  | 'enemy_dairokuten'
  | 'enemy_accelerator'
  | 'enemy_mika'
  | 'enemy_hotarubi'
  | 'enemy_akeginu'
  | 'enemy_jimushi'
  | 'enemy_kotaro'
  | 'enemy_saizo'
  | 'enemy_dartagnan'
  | 'enemy_mitsunari'
  | 'enemy_goemon'
  | 'enemy_momotaro'
  | 'enemy_hanbei'
  | 'boss_stag'
  | 'boss_seiryu'
  | 'boss_akazonae'
  | 'boss_dark_horseman'
  | 'boss_onmyoji'
  | 'boss_hideyoshi'
  | 'boss_dairokuten'
  | 'boss_nobunaga'
  | 'boss_tenzen'
  | 'boss_kenshin'
  | 'boss_taishogun'
  | 'boss_dairokuten_maou'
  | 'boss_ieyasu'
  | 'boss_estoque'
  | 'boss_redulse_a'
  | 'boss_redulse_b'
  | 'enemy_bird_knight'
  | 'enemy_black_tiger'
  | 'enemy_blade_bull'
  | 'enemy_bonbon'
  | 'enemy_crow_tengu'
  | 'enemy_crystal_shield'
  | 'enemy_demon_dog'
  | 'enemy_eagle_man'
  | 'enemy_eau_mouton'
  | 'enemy_electric_snail'
  | 'enemy_furfur'
  | 'enemy_gray_ulse'
  | 'enemy_grizzly_bear'
  | 'enemy_keraunos'
  | 'enemy_lava_snail'
  | 'enemy_nightmare'
  | 'enemy_phantom'
  | 'enemy_poison_spider'
  | 'enemy_roar_wolf'
  | 'enemy_roc'
  | 'enemy_shadow_dog'
  | 'enemy_slime_snail'
  | 'enemy_white_tiger'
  | 'enemy_wind_tiger'
  | 'enemy_wolf';

export interface EnemyTemplate {
  id: string;
  name: string;
  element: ElementType;
  maxHp: number;
  atk: number;
  matk: number;
  def: number;
  isBoss: boolean;
  attackInterval: number;
  skills: {
    name: string;
    castTime: number; // seconds
    cooldown: number;
    multiplier: number;
    isAoE: boolean;
    description: string;
  }[];
  expReward: number;
  goldReward: number;
  shardReward: number;
  size: number;
  spriteType: MonsterSpriteType;
}

export interface EnemyCombatant {
  id: string;
  templateId: string;
  name: string;
  element: ElementType;
  hp: number;
  maxHp: number;
  atk: number;
  matk: number;
  def: number;
  isBoss: boolean;
  size: number;
  spriteType: MonsterSpriteType;
  attackTimer: number;
  currentCast?: {
    skillName: string;
    totalSec: number;
    elapsedSec: number;
    isAoE: boolean;
    multiplier: number;
  };
  threatTable: Record<string, number>; // combatantId -> threat amount
  buffs: ActiveBuff[];
}

export interface DungeonWave {
  waveNumber: number;
  enemyTemplateId: string;
  enemyName: string;
  enemyHp: number;
  enemyElement: ElementType;
  isBoss: boolean;
  spriteType: MonsterSpriteType;
}

export interface DungeonDefinition {
  id: string;
  name: string;
  description: string;
  element: ElementType;
  recommendedLevel: number;
  waves: DungeonWave[];
  rewardGold: number;
  rewardExp: number;
  rewardShards: number;
}

export interface BattleInstance {
  id: string;
  enemyId: string;
  enemyName: string;
  enemyElement: ElementType;
  enemyHp: number;
  enemyMaxHp: number;
  isBoss: boolean;
  participants: Combatant[]; // Max 5
  mapX: number;
  mapY: number;
  active: boolean;
  combatLogs: string[];
  enemy: EnemyCombatant;
  background?: string;
  isCornerGuardian?: boolean;
  isDungeon?: boolean;
  dungeonId?: string;
  currentWave?: number;
  totalWaves?: number;
}

export interface DamagePopupItem {
  id: string;
  value: number | string;
  type: 'damage' | 'crit' | 'heal' | 'shield' | 'guard' | 'miss' | 'buff' | 'weakness' | 'resist';
  element?: ElementType;
  x: number; // percentage or pixel
  y: number;
  createdAt: number;
}

export interface JobDefinition {
  type: JobType;
  name: string;
  jpName: string;
  path: ClassPath;
  isBase: boolean;
  baseClass: JobType;
  evolutions?: JobType[];
  role: 'Tank' | 'Magic DPS' | 'Healer / Buff' | 'Crit DPS' | 'Ranged DPS' | 'Melee Brawler';
  description: string;
  allowedWeapons: WeaponCategory[];
  baseHp: number;
  baseAtk: number;
  baseMatk: number;
  baseDef: number;
  baseMdef: number;
  baseCrit: number;
  passiveName: string;
  passiveDescription: string;
  unlockedLevelPassive: (level: number) => { stat: string; bonus: number; desc: string } | null;
  legendaryWeaponId: string;
}

export interface OverworldEnemy {
  id: string;
  templateId: string;
  name: string;
  element: ElementType;
  x: number;
  y: number;
  currentHp: number;
  maxHp: number;
  isBoss: boolean;
  isCornerGuardian?: boolean;
  respawnTimer?: number;
  battleInstanceId?: string;
  targetX?: number;
  targetY?: number;
  spriteType: MonsterSpriteType;
}

export type AIHunterState = 'WANDERING' | 'ENGAGING' | 'IN_BATTLE';

export interface AIHunter {
  id: string;
  name: string;
  job: JobType;
  level: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: AIHunterState;
  currentBattleId?: string;
  equippedWeaponIds: string[];
  avatarSeed: number;
  isWalking?: boolean;
  facingLeft?: boolean;
  idleTimer?: number;
}

export interface PlayerJobProgress {
  level: number;
  exp: number;
}

export type Hairstyle = 
  | 'spiky' 
  | 'twintails' 
  | 'ponytail' 
  | 'wizard_flow' 
  | 'wild_rogue' 
  | 'mystic_bob'
  | 'askr_lord'
  | 'anime_heroine'
  | 'swordmaster_topknot'
  | 'pegasus_braid'
  | 'legendary_twin_spires'
  | 'draconic_locks'
  | string;

export type SkinTone = '#fed7aa' | '#fcd34d' | '#d97706' | '#854d0e' | '#ffedd5' | string;
export type EyeStyle = 'determined' | 'cheerful' | 'mystic' | 'fierce' | 'anime_royal' | 'starlight' | string;

export interface CharacterCustomization {
  hairstyle: string;
  hairColor: string;
  skinTone: string;
  eyeStyle: string;
  eyeColor?: string;
  outfit?: string;
  cape?: string;
  accessory?: string;
  aura?: string;
  title: string;
}

export type ScreenDisplayMode = 'COMPACT' | 'STANDARD' | 'EXPANDED' | 'FULL';

export interface GameSettings {
  masterVolume: number; // 0..100
  sfxVolume: number;    // 0..100
  bgmVolume: number;    // 0..100
  screenShake: boolean;
  damageTextMode: 'ALL' | 'CRITS_ONLY' | 'CONDENSED';
  controlMode: 'JOYSTICK' | 'TAP_ONLY';
  screenSize?: ScreenDisplayMode;
}

export interface PlayerProfile {
  name: string;
  currentJob: JobType;
  jobs: Record<JobType, PlayerJobProgress>;
  gold: number;
  tesseraShards: number;
  heroFeathers: number; // Hero feather summoning currency
  unlockedSkins?: Record<string, boolean>; // skinId -> true
  equippedSkins?: Partial<Record<JobType, string>>; // jobType -> skinId or folderName
  unlockedParts: {
    OUTFIT: string[];
    HAIRSTYLE: string[];
    CAPE: string[];
    ACCESSORY: string[];
    AURA: string[];
  };
  inventory: Weapon[];
  weaponUpgrades: Record<string, number>; // weaponId -> upgrade level (0..10)
  materials: Record<string, number>;      // materialId -> count
  questProgress: Record<string, number>;  // questId -> primary objective count
  questSecondaryProgress?: Record<string, number>; // questId -> secondary objective count
  completedQuests: string[];              // claimed questIds
  customization: CharacterCustomization;
  settings: GameSettings;
  equippedWeaponIds: string[]; // max 5 IDs: slot 0 is Main Weapon
  defeatedRealmBosses?: Record<string, boolean>; // realmId -> true
  hasCompletedOnboarding?: boolean;
  noviceGuide?: NoviceGuideState;
  x: number;
  y: number;
}

export interface NoviceGuideStep {
  step: number;
  title: string;
  shortDesc: string;
  hint: string;
  tabTarget?: 'MAP' | 'EQUIP' | 'JOBS' | 'SUMMON';
  rewardType: 'GOLD' | 'SHARDS' | 'FEATHERS' | 'MATERIAL' | 'TITLE';
  rewardAmount: number;
  rewardLabel: string;
}

export interface NoviceGuideState {
  currentStep: number;
  completedSteps: number[];
  claimedSteps: number[];
  isMinimized?: boolean;
  isCompleted?: boolean;
}


export interface RealmDefinition {
  id: string;
  name: string;
  jpName: string;
  title: string;
  description: string;
  element: ElementType;
  recommendedLevel: number;
  battleground: string;
  bossBattleground: string;
  bossTemplateId: string;
  normalMobTemplateIds: string[];
  ambientColor: string;
  accentColor: string;
  mapSvgTheme: 'MEADOW' | 'VOLCANO' | 'ABYSS' | 'PEAKS' | 'DESERT' | 'FARPLANE';
  spawnCoords: { x: number; y: number };
  bossCoords: { x: number; y: number };
}

