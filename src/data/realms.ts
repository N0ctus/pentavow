import { RealmDefinition } from '../types/game';
import { ALL_BATTLEGROUNDS, BattlegroundDefinition, getBattlegroundById, PmdTilesetId } from './battlegrounds';
export type { RealmDefinition };

export const REALMS: RealmDefinition[] = [
  {
    id: 'whispering-glade',
    name: 'Whispering Glade',
    jpName: '翠緑の林 - 大地の神殿',
    title: 'Emerald Plains & Earth Shrine',
    description: 'Verdant grassy knolls and overgrown Earth Shrine colonnades beside sacred lotus rivers.',
    element: 'WIND',
    recommendedLevel: 5,
    battleground: '/battlegrounds/FFBE Dalnakya Plains.jpg',
    bossBattleground: '/battlegrounds/FFBE Earth Shrine.jpg',
    bossTemplateId: 'boss-estoque',
    normalMobTemplateIds: ['wind-tiger', 'gray-ulse', 'grizzly-bear', 'wolf'],
    ambientColor: '#163824',
    accentColor: '#34d399',
    mapSvgTheme: 'MEADOW',
    spawnCoords: { x: 1452, y: 2628 },
    bossCoords: { x: 1452, y: 420 }
  },
  {
    id: 'infernal-caldera',
    name: 'Infernal Caldera',
    jpName: '灼熱の渓谷 - ゴルザス',
    title: 'Volcanic Canyons & Magma Rivers',
    description: 'A scorched canyon gorge of jagged basalt cliffs and winding molten lava rivers.',
    element: 'FIRE',
    recommendedLevel: 15,
    battleground: '/battlegrounds/FFBE Golzas Canyon.jpg',
    bossBattleground: '/battlegrounds/FFBE Golzas Peak.jpg',
    bossTemplateId: 'boss-redulse-b',
    normalMobTemplateIds: ['lava-snail', 'demon-dog', 'nightmare', 'bird-knight'],
    ambientColor: '#250909',
    accentColor: '#f97316',
    mapSvgTheme: 'VOLCANO',
    spawnCoords: { x: 1452, y: 2628 },
    bossCoords: { x: 1452, y: 420 }
  },
  {
    id: 'sunken-abyss',
    name: 'Sunken Abyss',
    jpName: '蒼海の湖畔 - ドール湖',
    title: 'Lake Dorr & Luminous Shores',
    description: 'A tranquil sunlit crystal lake bordered by sandy shores and sunken caverns.',
    element: 'WATER',
    recommendedLevel: 25,
    battleground: '/battlegrounds/FFBE Lake Dorr.jpg',
    bossBattleground: '/battlegrounds/FFBE Lake Dorr 2.jpg',
    bossTemplateId: 'master-onmyoji',
    normalMobTemplateIds: ['slime-snail', 'eau-mouton', 'bonbon', 'blade-bull'],
    ambientColor: '#071e2e',
    accentColor: '#38bdf8',
    mapSvgTheme: 'ABYSS',
    spawnCoords: { x: 1452, y: 2628 },
    bossCoords: { x: 1452, y: 420 }
  },
  {
    id: 'galebreak-crags',
    name: 'Galebreak Crags',
    jpName: '裂風の断崖 - 天裂きの峰',
    title: 'Wind-Swept Peaks & Stormy Summits',
    description: 'Precipitous highland plateaus beneath sweeping storm fronts and ancient cliff bastions.',
    element: 'WIND',
    recommendedLevel: 35,
    battleground: '/battlegrounds/FFBE Galebreak.jpg',
    bossBattleground: '/battlegrounds/FFBE Heavensplit Peaks.jpg',
    bossTemplateId: 'boss-redulse-a',
    normalMobTemplateIds: ['white-tiger', 'roc', 'eagle-man', 'blade-bull'],
    ambientColor: '#131722',
    accentColor: '#a855f7',
    mapSvgTheme: 'PEAKS',
    spawnCoords: { x: 1452, y: 2628 },
    bossCoords: { x: 1452, y: 420 }
  },
  {
    id: 'sunken-sands',
    name: 'Golden Mirage Sands',
    jpName: '黄金の砂漠 - 浮遊砂丘',
    title: 'Shifting Desert & Levitating Mesas',
    description: 'Endless rolling dunes of golden sand beneath levitating mesas and buried ribcage ruins.',
    element: 'LIGHT',
    recommendedLevel: 45,
    battleground: '/battlegrounds/FFBE Floating Sands.jpg',
    bossBattleground: '/battlegrounds/FFBE Brown Sands.jpg',
    bossTemplateId: 'boss-hideyoshi',
    normalMobTemplateIds: ['keraunos', 'roar-wolf', 'furfur', 'electric-snail'],
    ambientColor: '#261608',
    accentColor: '#fbbf24',
    mapSvgTheme: 'DESERT',
    spawnCoords: { x: 1452, y: 2628 },
    bossCoords: { x: 1452, y: 420 }
  },
  {
    id: 'celestial-farplane',
    name: 'The Farplane Nexus',
    jpName: '異界の天蓋 - 遥かなる彼方',
    title: 'Astral Void & Crystal Spire',
    description: 'An ethereal cosmic expanse where floating amethyst shrines drift before spiral galaxies.',
    element: 'DARK',
    recommendedLevel: 60,
    battleground: '/battlegrounds/FFBE Farplane.jpg',
    bossBattleground: '/battlegrounds/FFBE Crystal Tower Entrance.jpg',
    bossTemplateId: 'boss-dairokuten',
    normalMobTemplateIds: ['crystal-shield', 'poison-spider', 'shadow-dog', 'phantom'],
    ambientColor: '#0b0717',
    accentColor: '#c084fc',
    mapSvgTheme: 'FARPLANE',
    spawnCoords: { x: 1452, y: 2628 },
    bossCoords: { x: 1452, y: 420 }
  }
];

const FROST_TILESETS = new Set<PmdTilesetId>([
  'frosty-forest', 'ice-maze', 'mt-freeze', 'snow-path', 'mt-faraway-2', 'northern-range-2',
]);
const VOLCANIC_TILESETS = new Set<PmdTilesetId>([
  'magma-cavern-1', 'magma-cavern-2', 'mt-blaze', 'meteor-cave',
]);
const OCEAN_TILESETS = new Set<PmdTilesetId>([
  'lapis-cave', 'water-maze', 'waterfall-pond', 'silver-trench', 'stormy-sea-1', 'stormy-sea-2',
  'sky-tower', 'mt-faraway-1', 'mt-steel-2', 'northern-range-1', 'western-cave-2',
]);
const VIOLET_DARK_TILESETS = new Set<PmdTilesetId>([
  'poison-maze', 'southern-cavern-1', 'southern-cavern-2', 'uproar-forest', 'sinister-woods',
  'northwind-field', 'wish-cave-1', 'joyous-tower', 'murky-cave',
]);
const GOLD_ELECTRIC_TILESETS = new Set<PmdTilesetId>([
  'desert-region', 'solar-cave', 'buried-relic-1', 'buried-relic-2', 'buried-relic-3',
  'darknight-relic', 'great-canyon', 'pitfall-valley', 'rock-path', 'rescue-team-maze',
  'wish-cave-2', 'lightning-field', 'mt-thunder', 'mt-steel-1', 'silent-chasm', 'electric-maze',
]);

function getBossAndMobsForBattleground(
  bg: BattlegroundDefinition,
  realmIndex: number
): { boss: string; mobs: string[]; theme: RealmDefinition['mapSvgTheme'] } {
  const ts = bg.tilesetId;

  if (FROST_TILESETS.has(ts) || bg.weatherEffect === 'SNOW' || bg.weatherEffect === 'BLIZZARD' || bg.weatherEffect === 'HAIL') {
    const bosses = ['boss-redulse-a', 'boss-kenshin', 'master-onmyoji'];
    const mobs = realmIndex % 2 === 0
      ? ['white-tiger', 'eau-mouton', 'blade-bull', 'frost-sasquatch']
      : ['eau-mouton', 'white-tiger', 'bonbon', 'blade-bull'];
    return { boss: bosses[realmIndex % bosses.length], mobs, theme: 'ABYSS' };
  }

  if (VOLCANIC_TILESETS.has(ts) || bg.weatherEffect === 'EMBERS' || bg.propTheme === 'VOLCANIC_EMBER') {
    const bosses = ['boss-redulse-b', 'boss-nobunaga', 'scarlet-akazonae'];
    const mobs = realmIndex % 2 === 0
      ? ['lava-snail', 'demon-dog', 'nightmare', 'bird-knight']
      : ['nightmare', 'lava-snail', 'demon-dog', 'gunner-giroro'];
    return { boss: bosses[realmIndex % bosses.length], mobs, theme: 'VOLCANO' };
  }

  if (OCEAN_TILESETS.has(ts)) {
    const bosses = ['boss-kenshin', 'master-onmyoji', 'boss-estoque'];
    const mobs = realmIndex % 2 === 0
      ? ['slime-snail', 'eau-mouton', 'bonbon', 'phantom']
      : ['bonbon', 'slime-snail', 'shadow-dog', 'blade-bull'];
    return { boss: bosses[realmIndex % bosses.length], mobs, theme: 'ABYSS' };
  }

  if (VIOLET_DARK_TILESETS.has(ts) || bg.weatherEffect === 'VOID_STARS') {
    const bosses = ['boss-redulse-b', 'boss-dairokuten', 'boss-tenzen', 'boss-dairokuten-maou'];
    const mobs = realmIndex % 2 === 0
      ? ['crystal-shield', 'poison-spider', 'shadow-dog', 'black-tiger']
      : ['phantom', 'crow-tengu', 'poison-spider', 'black-tiger'];
    return { boss: bosses[realmIndex % bosses.length], mobs, theme: 'FARPLANE' };
  }

  if (GOLD_ELECTRIC_TILESETS.has(ts) || bg.weatherEffect === 'SANDSTORM' || bg.element === 'LIGHT') {
    const bosses = ['boss-hideyoshi', 'boss-taishogun', 'boss-ieyasu'];
    const mobs = realmIndex % 2 === 0
      ? ['keraunos', 'roar-wolf', 'electric-snail', 'furfur']
      : ['eagle-man', 'roc', 'electric-snail', 'wolf'];
    return { boss: bosses[realmIndex % bosses.length], mobs, theme: 'DESERT' };
  }

  // Emerald Forest / Lush Plains / Mountain Wind
  const bosses = ['boss-estoque', 'guardian-seiryu', 'dark-horseman'];
  const mobs = realmIndex % 2 === 0
    ? ['wind-tiger', 'gray-ulse', 'grizzly-bear', 'wolf']
    : ['gray-ulse', 'wind-tiger', 'roc', 'eagle-man'];
  return { boss: bosses[realmIndex % bosses.length], mobs, theme: 'MEADOW' };
}

export function battlegroundToRealm(bg: BattlegroundDefinition, idx = 0): RealmDefinition {
  const roster = getBossAndMobsForBattleground(bg, idx);
  return {
    id: bg.id,
    name: bg.name,
    jpName: bg.category,
    title: bg.category,
    description: bg.description,
    element: bg.element,
    recommendedLevel: bg.recommendedLevel,
    battleground: `/battlegrounds/${bg.filename}`,
    bossBattleground: `/battlegrounds/${bg.filename}`,
    bossTemplateId: roster.boss,
    normalMobTemplateIds: roster.mobs,
    ambientColor: '#0f172a',
    accentColor: bg.accentColor,
    mapSvgTheme: roster.theme,
    spawnCoords: { x: 1452, y: 2628 },
    bossCoords: { x: 1452, y: 420 },
  };
}

export const ALL_BATTLEGROUND_REALMS: RealmDefinition[] = ALL_BATTLEGROUNDS.map((bg, idx) => battlegroundToRealm(bg, idx));

export const REALM_MAP = new Map<string, RealmDefinition>([
  ...REALMS.map(realm => [realm.id, realm] as const),
  ...ALL_BATTLEGROUND_REALMS.map(realm => [realm.id, realm] as const),
]);

export function getRealmById(realmId: string): RealmDefinition {
  const direct = REALM_MAP.get(realmId);
  if (direct) return direct;
  const bg = getBattlegroundById(realmId);
  if (bg) return battlegroundToRealm(bg);
  return REALMS[0];
}
