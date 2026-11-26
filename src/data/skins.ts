import { JobType, Rarity } from '../types/game';

export interface HeroSkin {
  id: string;
  name: string;
  classType: JobType;
  folderName: string;
  rarity: Rarity;
  title: string;
  description: string;
  isDefault?: boolean;
}

export const ALL_HERO_SKINS: HeroSkin[] = [
  // ==========================================
  // 1. WARRIOR SKINS
  // ==========================================
  {
    id: 'skin_warrior_default',
    name: 'Katana Swordsman',
    classType: 'WARRIOR',
    folderName: 'warrior_default',
    rarity: 3,
    title: 'Bushido Initiate',
    description: 'Disciplined wandering samurai in cobalt blue haori.',
    isDefault: true
  },
  {
    id: 'skin_warrior_saito',
    name: 'Hajime Saito',
    classType: 'WARRIOR',
    folderName: 'warrior_saito',
    rarity: 5,
    title: 'Shinsengumi Iaijutsu Master',
    description: 'Third Unit Captain of the Shinsengumi, unmatched in left-handed quick-draw strikes.'
  },
  {
    id: 'skin_warrior_swordsmith',
    name: 'Muramasa Swordsmith',
    classType: 'WARRIOR',
    folderName: 'warrior_swordsmith',
    rarity: 4,
    title: 'Blade Forger',
    description: 'Master smith who tempers steel with volcanic fire.'
  },
  {
    id: 'skin_warrior_hijikata',
    name: 'Toshizo Hijikata',
    classType: 'WARRIOR',
    folderName: 'warrior_hijikata',
    rarity: 5,
    title: 'Demon Vice-Commander',
    description: 'Ruthless tactician wielding fierce discipline and unwavering blade loyalty.'
  },

  // ==========================================
  // 2. GUARDIAN SKINS
  // ==========================================
  {
    id: 'skin_guardian_default',
    name: 'Cross Spearman',
    classType: 'GUARDIAN',
    folderName: 'guardian_default',
    rarity: 3,
    title: 'Iron Bastion',
    description: 'Heavy armor defender wielding a cross-tipped battle lance.',
    isDefault: true
  },
  {
    id: 'skin_guardian_elite',
    name: 'Imperial Royal Guard',
    classType: 'GUARDIAN',
    folderName: 'guardian_elite',
    rarity: 4,
    title: 'Golden Fortress',
    description: 'Elite imperial citadel sentry adorned in gilded dragon-crest armor.'
  },
  {
    id: 'skin_guardian_cavalry',
    name: 'Heavy War Cavalry',
    classType: 'GUARDIAN',
    folderName: 'guardian_cavalry',
    rarity: 5,
    title: 'Armored Steed Titan',
    description: 'Frontline iron vanguard mounted upon an unstoppable armored warhorse.'
  },

  // ==========================================
  // 3. BERSERKER SKINS
  // ==========================================
  {
    id: 'skin_berserker_default',
    name: 'Sword Master Champion',
    classType: 'BERSERKER',
    folderName: 'berserker_default',
    rarity: 5,
    title: 'Fury Champion',
    description: 'Fierce master of dual katanas and unchecked battle fury, delivering relentless hundred-slash strikes.',
    isDefault: true
  },
  {
    id: 'skin_berserker_saint',
    name: 'Blue Flame Sword Saint',
    classType: 'BERSERKER',
    folderName: 'berserker_saint',
    rarity: 4,
    title: 'Ethereal Sword Saint',
    description: 'Battle-hardened champion enveloped in ethereal azure flames, cleaving through enemy lines.'
  },
  {
    id: 'skin_berserker_werewolf',
    name: 'Feral Werewolf Champion',
    classType: 'BERSERKER',
    folderName: 'berserker_werewolf',
    rarity: 4,
    title: 'Beast Champion',
    description: 'Savage lycanthropic warrior tearing through frontline foes with bloodthirsty frenzy.'
  },

  // ==========================================
  // 4. ROGUE SKINS
  // ==========================================
  {
    id: 'skin_rogue_default',
    name: 'Shadow Ninja',
    classType: 'ROGUE',
    folderName: 'rogue_default',
    rarity: 3,
    title: 'Shinobi Operative',
    description: 'Masked shadow infiltrator equipped with concealed ninjato and shuriken.',
    isDefault: true
  },
  {
    id: 'skin_rogue_hanzo',
    name: 'Hanzo Hattori',
    classType: 'ROGUE',
    folderName: 'rogue_hanzo',
    rarity: 5,
    title: 'Iga Shadow Grandmaster',
    description: 'Legendary shinobi leader who commands darkness and lethal shadow clones.'
  },
  {
    id: 'skin_rogue_goemon',
    name: 'Ishikawa Goemon',
    classType: 'ROGUE',
    folderName: 'rogue_goemon',
    rarity: 4,
    title: 'Phantom Thief',
    description: 'Mounted folk hero who slips through fortress walls under cover of night.'
  },

  // ==========================================
  // 5. ASSASSIN SKINS
  // ==========================================
  {
    id: 'skin_assassin_default',
    name: 'Fuma Kunoichi',
    classType: 'ASSASSIN',
    folderName: 'assassin_default',
    rarity: 4,
    title: 'Lethal Shadowblade',
    description: 'Deadly agile assassin wielding twin poison daggers with grace.',
    isDefault: true
  },
  {
    id: 'skin_assassin_okita',
    name: 'Souji Okita',
    classType: 'ASSASSIN',
    folderName: 'assassin_okita',
    rarity: 5,
    title: 'First Unit Genius',
    description: 'Prodigious sword genius whose three-stage thrust leaves no escape.'
  },
  {
    id: 'skin_assassin_pirate',
    name: 'Corsair Assassin',
    classType: 'ASSASSIN',
    folderName: 'assassin_pirate',
    rarity: 3,
    title: 'Swashbuckler',
    description: 'Reckless maritime raider who blinds opponents with powder and cutlass.'
  },

  // ==========================================
  // 6. HUNTER SKINS
  // ==========================================
  {
    id: 'skin_hunter_default',
    name: 'Longbow Archer',
    classType: 'HUNTER',
    folderName: 'hunter_default',
    rarity: 3,
    title: 'Forest Scout',
    description: 'Keen-eyed marksman armed with a traditional yumi war bow.',
    isDefault: true
  },
  {
    id: 'skin_hunter_hawkeye',
    name: 'Hawkeye Sniper',
    classType: 'HUNTER',
    folderName: 'hunter_hawkeye',
    rarity: 4,
    title: 'Eagle-Eye Marksman',
    description: 'Deadeye ranger capable of piercing armored foes across impossible distances.'
  },
  {
    id: 'skin_hunter_greenwind',
    name: 'Green Wind Ranger',
    classType: 'HUNTER',
    folderName: 'hunter_greenwind',
    rarity: 4,
    title: 'Gale Hunter',
    description: 'Nature-attuned stalker cloaked in leaves, firing arrows laced with wind.'
  },
  {
    id: 'skin_hunter_musketeer',
    name: 'Imperial Musketeer',
    classType: 'HUNTER',
    folderName: 'hunter_musketeer',
    rarity: 5,
    title: 'Matchlock Gunslinger',
    description: 'Revolutionary rifleman wielding devastating black-powder firearms.'
  },

  // ==========================================
  // 7. MAGE SKINS
  // ==========================================
  {
    id: 'skin_mage_default',
    name: 'Heaven Messenger',
    classType: 'MAGE',
    folderName: 'mage_default',
    rarity: 3,
    title: 'Celestial Mystic',
    description: 'Apprentice elementalist wrapped in flowing ceremonial robes.',
    isDefault: true
  },
  {
    id: 'skin_mage_warden',
    name: 'Heaven Warden',
    classType: 'MAGE',
    folderName: 'mage_warden',
    rarity: 4,
    title: 'Arcane Scribe',
    description: 'Guardian of cosmic celestial scrolls wielding elemental arcane power.'
  },
  {
    id: 'skin_mage_musketeer',
    name: 'Spell-Slinger Musketeer',
    classType: 'MAGE',
    folderName: 'mage_musketeer',
    rarity: 4,
    title: 'Mana Carbineer',
    description: 'Infuses magic crystals into gun cartridges for explosive spell shots.'
  },

  // ==========================================
  // 8. ARCHMAGE SKINS
  // ==========================================
  {
    id: 'skin_archmage_default',
    name: 'Master Onmyoji',
    classType: 'ARCHMAGE',
    folderName: 'archmage_default',
    rarity: 5,
    title: 'Yin-Yang Diviner',
    description: 'Grandmaster of the five elements and master of protective barrier wards.',
    isDefault: true
  },
  {
    id: 'skin_archmage_miko',
    name: 'Celestial Star Maiden',
    classType: 'ARCHMAGE',
    folderName: 'archmage_miko',
    rarity: 4,
    title: 'Starlight Oracle',
    description: 'Channels constellations through sacred bells to shower enemies in starfire.'
  },
  {
    id: 'skin_archmage_dancer',
    name: 'Cherry Blossom Dancer',
    classType: 'ARCHMAGE',
    folderName: 'archmage_dancer',
    rarity: 4,
    title: 'Spiritual Kagura',
    description: 'Performs hypnotic spiritual fan dances evoking torrential storms.'
  },

  // ==========================================
  // 9. WARLOCK SKINS
  // ==========================================
  {
    id: 'skin_warlock_default',
    name: 'Demon God Spearman',
    classType: 'WARLOCK',
    folderName: 'warlock_default',
    rarity: 4,
    title: 'Demonic Lancer',
    description: 'Corrupted warrior channeling forbidden nether seals into battle.',
    isDefault: true
  },
  {
    id: 'skin_warlock_puppet',
    name: 'Corpse Puppet Master',
    classType: 'WARLOCK',
    folderName: 'warlock_puppet',
    rarity: 4,
    title: 'Puppeteer of Shadows',
    description: 'Animates spectral wooden puppets through dark binding strings.'
  },
  {
    id: 'skin_warlock_karakuri',
    name: 'Karakuri Demon Automaton',
    classType: 'WARLOCK',
    folderName: 'warlock_karakuri',
    rarity: 5,
    title: 'Cursed Mech',
    description: 'Ancient occult clockwork golem possessed by demonic spirits.'
  },

  // ==========================================
  // 10. DEATH KNIGHT SKINS
  // ==========================================
  {
    id: 'skin_death_knight_default',
    name: 'Purgatory Demon Spearman',
    classType: 'DEATH_KNIGHT',
    folderName: 'death_knight_default',
    rarity: 4,
    title: 'Hellfire Lancer',
    description: 'Armored reaper bound by cursed soul contracts from the underworld.',
    isDefault: true
  },
  {
    id: 'skin_death_knight_horseman',
    name: 'Dread Steed Cavalier',
    classType: 'DEATH_KNIGHT',
    folderName: 'death_knight_horseman',
    rarity: 5,
    title: 'Abyssal Rider',
    description: 'Rides an armored nightmare horse, trampling the living in frostfire.'
  },
  {
    id: 'skin_death_knight_bandit',
    name: 'Cursed Bandit Warlord',
    classType: 'DEATH_KNIGHT',
    folderName: 'death_knight_bandit',
    rarity: 3,
    title: 'Outlaw Marauder',
    description: 'Brutal mercenary who surrendered his humanity for unholy fortitude.'
  },

  // ==========================================
  // 11. DEMON HUNTER SKINS
  // ==========================================
  {
    id: 'skin_demon_hunter_default',
    name: 'Chikage Kazama',
    classType: 'DEMON_HUNTER',
    folderName: 'demon_hunter_default',
    rarity: 5,
    title: 'Pure-Blood Oni Lord',
    description: 'Chieftain of the Kazama clan wielding primordial demon swordsmanship.',
    isDefault: true
  },
  {
    id: 'skin_demon_hunter_werewolf',
    name: 'Feral Werewolf Warrior',
    classType: 'DEMON_HUNTER',
    folderName: 'demon_hunter_werewolf',
    rarity: 4,
    title: 'Blood Hunter',
    description: 'Unleashes feral lycanthropic claws in relentless close-quarters combat.'
  },
  {
    id: 'skin_demon_hunter_demon',
    name: 'Demon Sovereign',
    classType: 'DEMON_HUNTER',
    folderName: 'demon_hunter_demon',
    rarity: 4,
    title: 'Horned Titan',
    description: 'Embraces the demonic horns of sacrifice to decimate enemy lines.'
  },

  // ==========================================
  // 12. PRIEST SKINS
  // ==========================================
  {
    id: 'skin_priest_default',
    name: 'Golden Sun Princess',
    classType: 'PRIEST',
    folderName: 'priest_default',
    rarity: 5,
    title: 'Solar Shrine Maiden',
    description: 'Radiant anime shrine maiden in sacred white and gold robes, channeling divine miracles and holy light.',
    isDefault: true
  },
  {
    id: 'skin_priest_missionary',
    name: 'Apostle of Light',
    classType: 'PRIEST',
    folderName: 'priest_missionary',
    rarity: 3,
    title: 'Holy Missionary',
    description: 'Humble divine pilgrim channeling pure restorative miracles.'
  },
  {
    id: 'skin_priest_princess',
    name: 'Cherry Blossom Priestess',
    classType: 'PRIEST',
    folderName: 'priest_princess',
    rarity: 4,
    title: 'Blossom Maiden',
    description: 'Graceful shrine dancer whose sacred prayers restore vitality to all nearby hunters.'
  },

  // ==========================================
  // 13. PALADIN SKINS
  // ==========================================
  {
    id: 'skin_paladin_default',
    name: 'Blue Flame Sword Saint',
    classType: 'PALADIN',
    folderName: 'paladin_default',
    rarity: 5,
    title: 'Radiant Blade',
    description: 'Holy knight empowered by sacred blue fire that purges darkness.',
    isDefault: true
  },
  {
    id: 'skin_paladin_harada',
    name: 'Sanosuke Harada',
    classType: 'PALADIN',
    folderName: 'paladin_harada',
    rarity: 4,
    title: 'Holy Paladin Spear Saint',
    description: 'Valiant spear paladin whose sacred spear thrusts defend comrades with holy devotion.'
  },
  {
    id: 'skin_paladin_holybeast',
    name: 'Holy Beast Cavalier',
    classType: 'PALADIN',
    folderName: 'paladin_holybeast',
    rarity: 4,
    title: 'Blessed Lancer',
    description: 'Rides into the fray atop a celestial sacred stallion.'
  },

  // ==========================================
  // 14. DRUID SKINS
  // ==========================================
  {
    id: 'skin_druid_default',
    name: 'Inugami Wolf Master',
    classType: 'DRUID',
    folderName: 'druid_default',
    rarity: 4,
    title: 'Spiritual Beastmaster',
    description: 'Bonds with a sacred white inugami wolf spirit in symbiotic harmony.',
    isDefault: true
  },
  {
    id: 'skin_druid_tiger',
    name: 'Wild Tiger Shifter',
    classType: 'DRUID',
    folderName: 'druid_tiger',
    rarity: 4,
    title: 'Primal Fang',
    description: 'Transforms into a predatory tiger to pounce and rend prey.'
  },
  {
    id: 'skin_druid_whitetiger',
    name: 'Celestial White Tiger',
    classType: 'DRUID',
    folderName: 'druid_whitetiger',
    rarity: 5,
    title: 'Byakko Sovereign',
    description: 'Reincarnation of the mythical Byakko white tiger guarding sacred groves.'
  },

  // ==========================================
  // 15. SHAMAN SKINS
  // ==========================================
  {
    id: 'skin_shaman_default',
    name: 'Inari Fox Deity',
    classType: 'SHAMAN',
    folderName: 'shaman_default',
    rarity: 5,
    title: 'Kitsune Sovereign',
    description: 'Spiritual avatar of the fox goddess commanding elemental spirit orbs.',
    isDefault: true
  },
  {
    id: 'skin_shaman_blackclaw',
    name: 'Black-Claw Storm Shaman',
    classType: 'SHAMAN',
    folderName: 'shaman_blackclaw',
    rarity: 4,
    title: 'Thunder Shifter',
    description: 'Channels fierce gale and storm lightning through ancestral tiger claws.'
  },
  {
    id: 'skin_shaman_holybeast',
    name: 'Totemic Earth Walker',
    classType: 'SHAMAN',
    folderName: 'shaman_holybeast',
    rarity: 3,
    title: 'Spirit Guardian',
    description: 'Communes with the spirits of the earth to shield all allies.'
  },

  // ==========================================
  // 16. MONK SKINS
  // ==========================================
  {
    id: 'skin_monk_default',
    name: 'Ascetic Staff Monk',
    classType: 'MONK',
    folderName: 'monk_default',
    rarity: 3,
    title: 'Zen Martial Artist',
    description: 'Disciplined ascetic warrior monk wielding prayer beads and staff.',
    isDefault: true
  },
  {
    id: 'skin_monk_toudou',
    name: 'Heisuke Toudou',
    classType: 'MONK',
    folderName: 'monk_toudou',
    rarity: 4,
    title: 'Eighth Unit Spear Champion',
    description: 'Youngest captain of the Shinsengumi, nimble and spirited in melee combat.'
  },
  {
    id: 'skin_monk_combosaint',
    name: 'Grandmaster Chi Striker',
    classType: 'MONK',
    folderName: 'monk_combosaint',
    rarity: 5,
    title: 'Enlightened Palm',
    description: 'Attains supreme spiritual enlightenment, unleashing destructive chi palms.'
  },

  // ==========================================
  // 17. EVOKER SKINS
  // ==========================================
  {
    id: 'skin_evoker_default',
    name: 'Emerald Dragon Evoker',
    classType: 'EVOKER',
    folderName: 'evoker_default',
    rarity: 5,
    title: 'Primordial Dragon Rider',
    description: 'Horned draconic sovereign riding an emerald sky serpent, channeling primordial storms and astral flame.',
    isDefault: true
  },
  {
    id: 'skin_evoker_bontenmaru',
    name: 'Bontenmaru One-Eyed Dragon',
    classType: 'EVOKER',
    folderName: 'evoker_bontenmaru',
    rarity: 5,
    title: 'One-Eyed Dragon Lord',
    description: 'Legendary dragon sovereign wielding dual dragon blades engulfed in primordial cosmic fire.'
  },
  {
    id: 'skin_evoker_pegasus',
    name: 'Celestial Storm Lancer',
    classType: 'EVOKER',
    folderName: 'evoker_pegasus',
    rarity: 4,
    title: 'Storm Dragon Lancer',
    description: 'Soars through thunderstorms on celestial wings, raining draconic lightning and astral gale.'
  },

  // ==========================================
  // 18. SENRAN SAMURAI LEGENDS & CROSSOVER SKINS
  // ==========================================
  {
    id: 'skin_warrior_musashi',
    name: 'Musashi Miyamoto',
    classType: 'WARRIOR',
    folderName: 'warrior_musashi',
    rarity: 5,
    title: 'Niten Ichi-ryu Grandmaster',
    description: 'Peerless wandering duelist commanding surging azure water-dragon twin blades.'
  },
  {
    id: 'skin_guardian_tadakatsu',
    name: 'Tadakatsu Honda',
    classType: 'GUARDIAN',
    folderName: 'guardian_tadakatsu',
    rarity: 5,
    title: 'Unmatched Steel Titan',
    description: 'Unbreakable armored colossus wielding the legendary emerald-edge Tonbokiri.'
  },
  {
    id: 'skin_berserker_katsuie',
    name: 'Katsuie Shibata',
    classType: 'BERSERKER',
    folderName: 'berserker_katsuie',
    rarity: 4,
    title: 'Oni Shibata Charger',
    description: 'Fierce frontline vanguard smashing battlements with twin heavy battle axes.'
  },
  {
    id: 'skin_rogue_sarutobi',
    name: 'Sasuke Sarutobi',
    classType: 'ROGUE',
    folderName: 'rogue_sarutobi',
    rarity: 4,
    title: 'Sanada Ten Braves Shinobi',
    description: 'Supersonic shadow scout riding tempest crow winds and verdant gale kunai.'
  },
  {
    id: 'skin_assassin_gennosuke',
    name: 'Gennosuke Kouga',
    classType: 'ASSASSIN',
    folderName: 'assassin_gennosuke',
    rarity: 4,
    title: 'Kouga Eye Master',
    description: 'Master of the Mystic Eyes who turns every enemy counterattack back upon its caster.'
  },
  {
    id: 'skin_hunter_saika',
    name: 'Magoichi Saika',
    classType: 'HUNTER',
    folderName: 'hunter_saika',
    rarity: 4,
    title: 'Saika Mercenary Captain',
    description: 'Deadeye sharpshooter unleashing blistering matchlock volleys in crimson coats.'
  },
  {
    id: 'skin_mage_neptune',
    name: 'Neptune (Planeptune)',
    classType: 'MAGE',
    folderName: 'mage_neptune',
    rarity: 5,
    title: 'Dimensional Protagonist',
    description: 'Cheerful dimension-hopper channeling radiant astral sword beams and starlight slashes.'
  },
  {
    id: 'skin_archmage_noire',
    name: 'Noire (Lastation)',
    classType: 'ARCHMAGE',
    folderName: 'archmage_noire',
    rarity: 5,
    title: 'Crimson Lotus Arcanist',
    description: 'Regal obsidian duelist invoking celestial radiance bursts and rose-steel spells.'
  },
  {
    id: 'skin_warlock_oichi',
    name: 'Oichi (Abyssal Hands)',
    classType: 'WARLOCK',
    folderName: 'warlock_oichi',
    rarity: 4,
    title: 'Maid of Shadow Hands',
    description: 'Melancholic noblewoman summoning towering spectral shadow palms from dark pools.'
  },
  {
    id: 'skin_death_knight_kurozonae',
    name: 'Messhi Kurozonae',
    classType: 'DEATH_KNIGHT',
    folderName: 'death_knight_kurozonae',
    rarity: 3,
    title: 'Obsidian Horseman',
    description: 'Black-armored calamity rider cleaving lines atop a shadow warhorse.'
  },
  {
    id: 'skin_demon_hunter_masamune',
    name: 'Masamune Date (Six Claws)',
    classType: 'DEMON_HUNTER',
    folderName: 'demon_hunter_masamune',
    rarity: 5,
    title: 'One-Eyed Dragon',
    description: 'Oshu warlord wielding six lightning-charged katana claws at blinding speed.'
  },
  {
    id: 'skin_priest_vert',
    name: 'Vert (Leanbox)',
    classType: 'PRIEST',
    folderName: 'priest_vert',
    rarity: 5,
    title: 'Emerald Tempest Oracle',
    description: 'Elegant holy lance maiden radiating emerald sanctuary blessings across allies.'
  },
  {
    id: 'skin_paladin_satake',
    name: 'Yoshishige Satake',
    classType: 'PALADIN',
    folderName: 'paladin_satake',
    rarity: 3,
    title: 'Heaven-Blessed Demon Ogre',
    description: 'Golden-horned bastion knight infused with blazing solar retribution.'
  },
  {
    id: 'skin_druid_jiraiya',
    name: 'Jiraiya (Toad Sage)',
    classType: 'DRUID',
    folderName: 'druid_jiraiya',
    rarity: 4,
    title: 'Gallant Toad Hermit',
    description: 'Accompanied by giant spirit toads, invoking wild river tides and nature flame.'
  },
  {
    id: 'skin_shaman_jinrai',
    name: 'Jinrai Aozonae',
    classType: 'SHAMAN',
    folderName: 'shaman_jinrai',
    rarity: 3,
    title: 'Azure Thunder General',
    description: 'Sky-armored storm rider channeling cracking azure lightning halberds.'
  },
  {
    id: 'skin_monk_inshun',
    name: 'Inshun Hozoin',
    classType: 'MONK',
    folderName: 'monk_inshun',
    rarity: 3,
    title: 'Hozoin Spear Prodigy',
    description: 'Disciplined temple lancer unleashing silver crescent-spear flurries.'
  },
  {
    id: 'skin_evoker_seiryu',
    name: 'Seiryu Masakage',
    classType: 'EVOKER',
    folderName: 'evoker_seiryu',
    rarity: 4,
    title: 'Azure Dragon General',
    description: 'Draconic Takeda vanguard calling forth roaring cobalt dragon breath.'
  }
];

export const SKINS_BY_CLASS: Record<JobType, HeroSkin[]> = ALL_HERO_SKINS.reduce((acc, skin) => {
  if (!acc[skin.classType]) acc[skin.classType] = [];
  acc[skin.classType].push(skin);
  return acc;
}, {} as Record<JobType, HeroSkin[]>);

export const DEFAULT_UNLOCKED_SKINS: Record<string, boolean> = ALL_HERO_SKINS.reduce((acc, skin) => {
  if (skin.isDefault) {
    acc[skin.id] = true;
  }
  return acc;
}, {} as Record<string, boolean>);

export const DEFAULT_EQUIPPED_SKINS: Partial<Record<JobType, string>> = ALL_HERO_SKINS.reduce((acc, skin) => {
  if (skin.isDefault) {
    acc[skin.classType] = skin.folderName;
  }
  return acc;
}, {} as Partial<Record<JobType, string>>);

