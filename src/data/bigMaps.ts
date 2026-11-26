import {
  ALL_BATTLEGROUNDS,
  BattlegroundDefinition,
  getBattlegroundById,
  MapArchetype,
  PmdTilesetId,
  PropTheme,
  WeatherEffect,
} from './battlegrounds';
import {
  MAP_GRID_COLS,
  MAP_GRID_ROWS,
  MAP_TILE_SIZE,
  TILE_BRIDGE,
  TILE_COURTYARD,
  TILE_GROUND,
  TILE_ROAD,
  TILE_WALL,
  TILE_WATER,
} from '../utils/pmdTileEngine';

export type MapPropKind =
  | 'TREE_OAK'
  | 'TREE_OAK_ROUND'
  | 'TREE_PINE'
  | 'TREE_DEAD'
  | 'TREE_MAPLE'
  | 'TREE_MYSTIC'
  | 'TREE_SUMMER_OAK'
  | 'TREE_SUMMER_MAPLE'
  | 'TREE_PALM'
  | 'TREE_PALM_TALL'
  | 'TREE_AUTUMN_OAK'
  | 'TREE_AUTUMN_PINE'
  | 'TREE_AUTUMN_FERN'
  | 'TREE_WINTER_OAK'
  | 'TREE_WINTER_PINE'
  | 'TREE_WINTER_DEAD'
  | 'TREE_WINTER_MAHOGANY'
  | 'TREE_WINTER_FERN'
  | 'TREE_SCORCHED'
  | 'TREE_MUSHROOM'
  | 'TREE_MOSSY_MUSHROOM'
  | 'TREE_MAHOGANY'
  | 'TREE_AUTUMN_MAHOGANY'
  | 'TREE_WINTER_MAPLE'
  | 'TREE_FERN'
  | 'STUMP_OAK'
  | 'STUMP_MOSSY'
  | 'STUMP_WINTER'
  | 'STUMP_AUTUMN'
  | 'STUMP_PALM'
  | 'PILLAR_MUSHROOM'
  | 'LOG_OAK'
  | 'LOG_AUTUMN'
  | 'LOG_WINTER'
  | 'LOG_MYSTIC'
  | 'LOG_FERN'
  | 'LOG_PALM'
  | 'LOG_MUSHROOM'
  | 'SAPLING_GREEN'
  | 'SAPLING_SUMMER'
  | 'SAPLING_AUTUMN'
  | 'SAPLING_WINTER'
  | 'SAPLING_MYSTIC'
  | 'SAPLING_MUSHROOM'
  | 'SAPLING_PALM'
  | 'SPROUT_SPRING'
  | 'SPROUT_SUMMER'
  | 'SPROUT_AUTUMN'
  | 'SPROUT_PINE'
  | 'SPROUT_WINTER'
  | 'SPROUT_FERN'
  | 'SPROUT_MYSTIC'
  | 'SPROUT_MUSHROOM'
  | 'SPROUT_PALM'
  | 'BAMBOO_CLUSTER'
  | 'LANTERN'
  | 'STREET_LAMP'
  | 'BRAZIER'
  | 'SHRINE_PILLAR_CLEAN'
  | 'SHRINE_PILLAR_FLUTED'
  | 'SHRINE_PILLAR_CRACKED'
  | 'LOTUS'
  | 'LILYPAD'
  | 'REED';

export interface MapPropPlacement {
  kind: MapPropKind;
  x: number; // world px
  y: number; // world px
  w: number;
  h: number;
}

export interface GeneratedBigMap {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  mapBlueprint: string;
  battlegroundImage: string;
  tilesetId: PmdTilesetId;
  archetype: MapArchetype;
  propTheme: PropTheme;
  weatherEffect: WeatherEffect;
  accentColor: string;
  bridgeStyle: 'WOOD' | 'RED_LACQUER' | 'STONE';
  cols: number;
  rows: number;
  tileSize: number;
  seed: number;
  grid: Uint8Array;
  props: MapPropPlacement[];
  mobSpawns: { x: number; y: number }[];
  cornerSpawns: { x: number; y: number }[];
  bossCoords: { x: number; y: number };
  spawnCoords: { x: number; y: number };
  dungeonCoords: { x: number; y: number };
  zoneLabels: { text: string; x: number; y: number }[];
}

function createRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CORE_REALM_SPECS: Record<string, { bgId: string; name: string; subtitle: string }> = {
  'whispering-glade': {
    bgId: 'earth-shrine',
    name: 'Whispering Glade',
    subtitle: 'Emerald Plains & Earth Shrine Sanctum',
  },
  'infernal-caldera': {
    bgId: 'golzas-canyon',
    name: 'Infernal Caldera',
    subtitle: 'Volcanic Canyons & Molten Lava Veins',
  },
  'sunken-abyss': {
    bgId: 'lake-dorr',
    name: 'Sunken Abyss',
    subtitle: 'Lake Dorr Basin & Luminous Waters',
  },
  'galebreak-crags': {
    bgId: 'galebreak',
    name: 'Galebreak Crags',
    subtitle: 'Storm-Swept Highland Summits',
  },
  'sunken-sands': {
    bgId: 'floating-sands',
    name: 'Golden Mirage Sands',
    subtitle: 'Shifting Desert & Levitating Mesa Ruins',
  },
  'celestial-farplane': {
    bgId: 'farplane',
    name: 'The Farplane Nexus',
    subtitle: 'Astral Void & Crystal Spire',
  },
};

const generatedMapCache = new Map<string, GeneratedBigMap>();

export function getBigMapForRealm(realmId: string): GeneratedBigMap {
  const existing = generatedMapCache.get(realmId);
  if (existing) return existing;

  const coreSpec = CORE_REALM_SPECS[realmId];
  const bg: BattlegroundDefinition =
    (coreSpec ? getBattlegroundById(coreSpec.bgId) : getBattlegroundById(realmId)) ||
    ALL_BATTLEGROUNDS[0];

  const built = buildBigMap(realmId, bg, coreSpec?.name, coreSpec?.subtitle);
  generatedMapCache.set(realmId, built);
  return built;
}

interface TileBiomePropPalette {
  trees: Array<{ kind: MapPropKind; w: number; h: number }>;
  companions: Array<{ kind: MapPropKind; w: number; h: number }>;
  cornerTree: { kind: MapPropKind; w: number; h: number };
  allowAquatic: boolean;
  allowBraziers?: boolean;
  urbanLightsOnly?: boolean;
}

const FROST_TILESETS = new Set<PmdTilesetId>([
  'frosty-forest', 'ice-maze', 'mt-freeze', 'snow-path', 'mt-faraway-2', 'northern-range-2',
]);
const VOLCANIC_TILESETS = new Set<PmdTilesetId>([
  'magma-cavern-1', 'magma-cavern-2', 'mt-blaze', 'meteor-cave',
]);
const MUSHROOM_VIOLET_TILESETS = new Set<PmdTilesetId>([
  'poison-maze', 'uproar-forest', 'sinister-woods', 'joyous-tower',
]);
const COSMIC_VIOLET_TILESETS = new Set<PmdTilesetId>([
  'southern-cavern-1', 'southern-cavern-2', 'northwind-field', 'wish-cave-1', 'electric-maze',
]);
const DESERT_GOLD_TILESETS = new Set<PmdTilesetId>([
  'desert-region', 'solar-cave', 'buried-relic-1', 'buried-relic-2', 'buried-relic-3',
]);
const AUTUMN_GOLD_TILESETS = new Set<PmdTilesetId>([
  'darknight-relic', 'great-canyon', 'pitfall-valley', 'rock-path', 'rescue-team-maze',
  'wish-cave-2', 'lightning-field', 'mt-thunder', 'mt-steel-1', 'silent-chasm',
]);
const COASTAL_AQUA_TILESETS = new Set<PmdTilesetId>([
  'waterfall-pond', 'water-maze', 'stormy-sea-1', 'stormy-sea-2', 'silver-trench',
]);
const SKY_AQUA_TILESETS = new Set<PmdTilesetId>([
  'lapis-cave', 'sky-tower', 'mt-faraway-1', 'mt-steel-2', 'northern-range-1', 'western-cave-2',
]);

function getTilesetBiomePalette(bg: BattlegroundDefinition): TileBiomePropPalette {
  const ts = bg.tilesetId;
  const we = bg.weatherEffect;

  if (FROST_TILESETS.has(ts) || we === 'SNOW' || we === 'BLIZZARD' || we === 'HAIL' || bg.propTheme === 'GLACIAL_ICE') {
    return {
      trees: [
        { kind: 'TREE_WINTER_PINE', w: 86, h: 146 },
        { kind: 'TREE_WINTER_OAK', w: 80, h: 146 },
        { kind: 'TREE_WINTER_MAPLE', w: 76, h: 146 },
        { kind: 'TREE_WINTER_MAHOGANY', w: 82, h: 138 },
        { kind: 'TREE_WINTER_DEAD', w: 80, h: 140 },
        { kind: 'TREE_WINTER_FERN', w: 54, h: 138 },
      ],
      companions: [
        { kind: 'STUMP_WINTER', w: 28, h: 38 },
        { kind: 'LOG_WINTER', w: 28, h: 28 },
        { kind: 'SAPLING_WINTER', w: 22, h: 42 },
        { kind: 'SPROUT_WINTER', w: 24, h: 26 },
      ],
      cornerTree: { kind: 'TREE_WINTER_PINE', w: 96, h: 160 },
      allowAquatic: false,
    };
  }

  if (VOLCANIC_TILESETS.has(ts) || we === 'EMBERS' || bg.propTheme === 'VOLCANIC_EMBER') {
    return {
      trees: [
        { kind: 'TREE_SCORCHED', w: 82, h: 140 },
        { kind: 'TREE_DEAD', w: 80, h: 140 },
        { kind: 'TREE_AUTUMN_OAK', w: 84, h: 140 },
        { kind: 'TREE_AUTUMN_MAHOGANY', w: 84, h: 138 },
      ],
      companions: [
        { kind: 'STUMP_AUTUMN', w: 28, h: 36 },
        { kind: 'LOG_AUTUMN', w: 28, h: 28 },
        { kind: 'SAPLING_AUTUMN', w: 28, h: 48 },
        { kind: 'SPROUT_AUTUMN', w: 26, h: 26 },
      ],
      cornerTree: { kind: 'TREE_SCORCHED', w: 92, h: 154 },
      allowAquatic: false,
      allowBraziers: true,
    };
  }

  if (MUSHROOM_VIOLET_TILESETS.has(ts) || we === 'FIREFLIES' || bg.propTheme === 'FAIRY_GLOW') {
    return {
      trees: [
        { kind: 'TREE_MYSTIC', w: 86, h: 148 },
        { kind: 'TREE_MUSHROOM', w: 84, h: 120 },
        { kind: 'TREE_MOSSY_MUSHROOM', w: 84, h: 120 },
        { kind: 'TREE_MAPLE', w: 82, h: 136 },
      ],
      companions: [
        { kind: 'PILLAR_MUSHROOM', w: 24, h: 42 },
        { kind: 'LOG_MUSHROOM', w: 26, h: 28 },
        { kind: 'LOG_MYSTIC', w: 28, h: 28 },
        { kind: 'SAPLING_MUSHROOM', w: 28, h: 44 },
        { kind: 'SAPLING_MYSTIC', w: 28, h: 52 },
        { kind: 'SPROUT_MUSHROOM', w: 20, h: 26 },
        { kind: 'SPROUT_MYSTIC', w: 26, h: 26 },
      ],
      cornerTree: { kind: 'TREE_MYSTIC', w: 96, h: 164 },
      allowAquatic: true,
    };
  }

  if (COSMIC_VIOLET_TILESETS.has(ts) || we === 'VOID_STARS' || bg.propTheme === 'VOID_CRYSTAL') {
    return {
      trees: [
        { kind: 'TREE_MYSTIC', w: 86, h: 148 },
        { kind: 'TREE_WINTER_MAPLE', w: 76, h: 146 },
        { kind: 'TREE_MAPLE', w: 82, h: 136 },
        { kind: 'TREE_WINTER_OAK', w: 80, h: 146 },
      ],
      companions: [
        { kind: 'LOG_MYSTIC', w: 28, h: 28 },
        { kind: 'SAPLING_MYSTIC', w: 28, h: 52 },
        { kind: 'SPROUT_MYSTIC', w: 26, h: 26 },
        { kind: 'SHRINE_PILLAR_FLUTED', w: 26, h: 48 },
      ],
      cornerTree: { kind: 'TREE_MYSTIC', w: 96, h: 164 },
      allowAquatic: false,
    };
  }

  if (DESERT_GOLD_TILESETS.has(ts) || we === 'SANDSTORM' || bg.archetype === 'DESERT_DUNES' || bg.propTheme === 'DESERT_RUIN') {
    return {
      trees: [
        { kind: 'TREE_PALM', w: 82, h: 112 },
        { kind: 'TREE_PALM_TALL', w: 80, h: 140 },
        { kind: 'TREE_DEAD', w: 80, h: 138 },
        { kind: 'TREE_SCORCHED', w: 80, h: 138 },
      ],
      companions: [
        { kind: 'STUMP_PALM', w: 28, h: 36 },
        { kind: 'LOG_PALM', w: 28, h: 28 },
        { kind: 'SAPLING_PALM', w: 28, h: 50 },
        { kind: 'SPROUT_PALM', w: 26, h: 26 },
      ],
      cornerTree: { kind: 'TREE_PALM_TALL', w: 92, h: 156 },
      allowAquatic: false,
      allowBraziers: bg.propTheme === 'DESERT_RUIN',
    };
  }

  if (we === 'SAKURA') {
    return {
      trees: [
        { kind: 'TREE_MYSTIC', w: 86, h: 142 },
        { kind: 'TREE_MAPLE', w: 84, h: 136 },
        { kind: 'TREE_AUTUMN_OAK', w: 84, h: 140 },
        { kind: 'TREE_OAK_ROUND', w: 82, h: 134 },
      ],
      companions: [
        { kind: 'STUMP_AUTUMN', w: 28, h: 36 },
        { kind: 'LOG_AUTUMN', w: 28, h: 28 },
        { kind: 'SAPLING_AUTUMN', w: 28, h: 48 },
        { kind: 'SPROUT_AUTUMN', w: 26, h: 26 },
      ],
      cornerTree: { kind: 'TREE_MYSTIC', w: 94, h: 156 },
      allowAquatic: true,
    };
  }

  if (AUTUMN_GOLD_TILESETS.has(ts) || bg.propTheme === 'AUTUMN_FESTIVAL') {
    return {
      trees: [
        { kind: 'TREE_AUTUMN_OAK', w: 86, h: 140 },
        { kind: 'TREE_MAPLE', w: 84, h: 136 },
        { kind: 'TREE_AUTUMN_MAHOGANY', w: 86, h: 138 },
        { kind: 'TREE_AUTUMN_PINE', w: 86, h: 146 },
        { kind: 'TREE_AUTUMN_FERN', w: 54, h: 138 },
      ],
      companions: [
        { kind: 'STUMP_AUTUMN', w: 28, h: 36 },
        { kind: 'LOG_AUTUMN', w: 28, h: 28 },
        { kind: 'SAPLING_AUTUMN', w: 28, h: 48 },
        { kind: 'SPROUT_AUTUMN', w: 26, h: 26 },
      ],
      cornerTree: { kind: 'TREE_AUTUMN_OAK', w: 96, h: 158 },
      allowAquatic: true,
    };
  }

  if (COASTAL_AQUA_TILESETS.has(ts)) {
    return {
      trees: [
        { kind: 'TREE_SUMMER_OAK', w: 84, h: 140 },
        { kind: 'TREE_SUMMER_MAPLE', w: 84, h: 136 },
        { kind: 'TREE_PALM', w: 82, h: 112 },
        { kind: 'TREE_PALM_TALL', w: 80, h: 140 },
        { kind: 'TREE_FERN', w: 54, h: 138 },
      ],
      companions: [
        { kind: 'STUMP_PALM', w: 28, h: 36 },
        { kind: 'LOG_PALM', w: 28, h: 28 },
        { kind: 'SAPLING_SUMMER', w: 28, h: 52 },
        { kind: 'SPROUT_SUMMER', w: 26, h: 28 },
        { kind: 'SPROUT_FERN', w: 24, h: 28 },
      ],
      cornerTree: { kind: 'TREE_SUMMER_MAPLE', w: 94, h: 152 },
      allowAquatic: true,
    };
  }

  if (SKY_AQUA_TILESETS.has(ts)) {
    return {
      trees: [
        { kind: 'TREE_SUMMER_MAPLE', w: 84, h: 136 },
        { kind: 'TREE_SUMMER_OAK', w: 84, h: 140 },
        { kind: 'TREE_MYSTIC', w: 86, h: 148 },
        { kind: 'TREE_WINTER_FERN', w: 54, h: 138 },
        { kind: 'TREE_PINE', w: 86, h: 146 },
      ],
      companions: [
        { kind: 'STUMP_MOSSY', w: 28, h: 36 },
        { kind: 'LOG_MYSTIC', w: 28, h: 28 },
        { kind: 'SAPLING_SUMMER', w: 28, h: 52 },
        { kind: 'SPROUT_SUMMER', w: 26, h: 28 },
        { kind: 'SPROUT_PINE', w: 22, h: 26 },
      ],
      cornerTree: { kind: 'TREE_SUMMER_OAK', w: 94, h: 154 },
      allowAquatic: true,
      urbanLightsOnly: bg.propTheme === 'CYBER_CITY',
    };
  }

  // Lush Forest / Emerald Plains (rain/mist shift slightly deeper teal + fern)
  const isRainy = we === 'RAIN' || we === 'MIST';
  return {
    trees: isRainy
      ? [
          { kind: 'TREE_SUMMER_OAK', w: 84, h: 140 },
          { kind: 'TREE_SUMMER_MAPLE', w: 84, h: 136 },
          { kind: 'TREE_FERN', w: 54, h: 138 },
          { kind: 'TREE_PINE', w: 86, h: 146 },
          { kind: 'TREE_MAHOGANY', w: 84, h: 138 },
        ]
      : [
          { kind: 'TREE_OAK', w: 86, h: 140 },
          { kind: 'TREE_OAK_ROUND', w: 84, h: 136 },
          { kind: 'TREE_PINE', w: 86, h: 146 },
          { kind: 'TREE_MAHOGANY', w: 84, h: 138 },
          { kind: 'TREE_FERN', w: 54, h: 138 },
        ],
    companions: [
      { kind: isRainy ? 'STUMP_MOSSY' : 'STUMP_OAK', w: 28, h: 36 },
      { kind: 'LOG_OAK', w: 28, h: 28 },
      { kind: 'LOG_FERN', w: 28, h: 38 },
      { kind: isRainy ? 'SAPLING_SUMMER' : 'SAPLING_GREEN', w: 28, h: 52 },
      { kind: isRainy ? 'SPROUT_SUMMER' : 'SPROUT_SPRING', w: 26, h: 28 },
      { kind: 'SPROUT_PINE', w: 22, h: 26 },
      { kind: 'SPROUT_FERN', w: 24, h: 28 },
    ],
    cornerTree: isRainy
      ? { kind: 'TREE_SUMMER_OAK', w: 94, h: 154 }
      : { kind: 'TREE_OAK_ROUND', w: 94, h: 152 },
    allowAquatic: true,
    urbanLightsOnly: bg.propTheme === 'CYBER_CITY' || bg.propTheme === 'CASTLE_TORCH',
  };
}

function buildBigMap(
  mapId: string,
  bg: BattlegroundDefinition,
  overrideName?: string,
  overrideSubtitle?: string
): GeneratedBigMap {
  const cols = MAP_GRID_COLS; // 120
  const rows = MAP_GRID_ROWS; // 120
  const ts = MAP_TILE_SIZE;   // 24 -> 2880 x 2880 px
  const grid = new Uint8Array(cols * rows);
  const rng = createRng(bg.seed * 997 + 1337);

  const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < cols && y < rows;
  const get = (x: number, y: number) => (inBounds(x, y) ? grid[y * cols + x] : TILE_WALL);
  const set = (x: number, y: number, val: number) => {
    if (inBounds(x, y)) grid[y * cols + x] = val;
  };
  const fill = (val: number) => grid.fill(val);
  const fillRect = (x0: number, y0: number, w: number, h: number, val: number) => {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) set(x, y, val);
    }
  };
  const fillEllipse = (cx: number, cy: number, rx: number, ry: number, val: number) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) set(x, y, val);
      }
    }
  };
  const drawRoadOrBridge = (x0: number, y0: number, x1: number, y1: number, halfWidth: number) => {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = Math.round(x0 + (x1 - x0) * t);
      const py = Math.round(y0 + (y1 - y0) * t);
      for (let dy = -halfWidth; dy <= halfWidth; dy++) {
        for (let dx = -halfWidth; dx <= halfWidth; dx++) {
          const cur = get(px + dx, py + dy);
          if (cur === TILE_WATER || cur === TILE_BRIDGE) {
            set(px + dx, py + dy, TILE_BRIDGE);
          } else {
            set(px + dx, py + dy, TILE_ROAD);
          }
        }
      }
    }
  };

  // Key Landmarks on Huge 120x120 Map (2880 x 2880 px):
  // - Boss Sanctum sits at the FAR NORTH END (ty = 16 -> y = 396px)!
  // - Celestial Dungeon Torii sits right behind Boss at ty = 6 -> y = 156px!
  // - Spacious Safe Haven Sanctuary sits at the FAR SOUTH END (ty = 98..117, spawn = 109 -> y = 2628px)!
  const cx = 60;
  const bossY = 17;
  const midY = 56;
  const havenY = 109;

  // ------------------------------------------------------------------
  // 1. LARGE-SCALE 120x120 ARCHETYPE TERRAIN GENERATION
  // ------------------------------------------------------------------
  switch (bg.archetype) {
    case 'SHRINE_COURTYARD': {
      fill(TILE_GROUND);
      fillRect(0, 0, cols, 3, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 3, rows, TILE_WALL);
      fillRect(cols - 3, 0, 3, rows, TILE_WALL);

      // Mirrored Shrine Perimeter Rock Formations
      for (let i = 0; i < 14; i++) {
        const wx = Math.floor(6 + rng() * 26);
        const wy = Math.floor(8 + rng() * 82);
        const rx = 2.5 + rng() * 3.0;
        const ry = 2.5 + rng() * 2.5;
        fillEllipse(wx, wy, rx, ry, TILE_WALL);
        fillEllipse(cols - wx, wy, rx, ry, TILE_WALL);
      }

      // Symmetrical Twin Eastern & Western Lotus Rivers + Pools
      for (let y = 3; y <= rows - 3; y++) {
        const offset = Math.round(28 + Math.cos((y - midY) * 0.09 + bg.seed) * 3);
        for (let dx = -2; dx <= 2; dx++) {
          set(offset + dx, y, TILE_WATER);
          set(cols - offset - dx, y, TILE_WATER);
        }
      }
      fillEllipse(26, 58, 8, 5, TILE_WATER);
      fillEllipse(cols - 26, 58, 8, 5, TILE_WATER);

      // Midground Waystation Shrine Courtyard
      fillRect(49, 49, 22, 17, TILE_COURTYARD);
      // Grand End-of-Map Boss Shrine Sanctum (North End)
      fillRect(45, 9, 30, 18, TILE_COURTYARD);
      fillRect(45, 9, 2, 2, TILE_WALL);
      fillRect(73, 9, 2, 2, TILE_WALL);
      fillRect(45, 25, 2, 2, TILE_WALL);
      fillRect(73, 25, 2, 2, TILE_WALL);

      drawRoadOrBridge(14, midY, 106, midY, 1);
      drawRoadOrBridge(14, bossY + 2, 106, bossY + 2, 1);
      break;
    }

    case 'PLAINS_RIVER': {
      fill(TILE_GROUND);
      for (let x = 0; x < cols; x++) {
        const h = 3 + Math.round(Math.cos((x - cx) * 0.14) * 1.5);
        fillRect(x, 0, 1, h, TILE_WALL);
      }
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 3, rows, TILE_WALL);
      fillRect(cols - 3, 0, 3, rows, TILE_WALL);

      // Symmetrical Cross-Map River + Mirrored Side Tributaries & Ponds
      for (let x = 4; x < cols - 4; x++) {
        const wy = Math.round(36 + Math.cos((x - cx) * 0.09) * 4);
        for (let dy = -3; dy <= 3; dy++) set(x, wy + dy, TILE_WATER);
      }
      for (let y = 3; y <= rows - 3; y++) {
        const off = Math.round(28 + Math.cos((y - midY) * 0.08 + bg.seed * 0.4) * 3.5);
        for (let dx = -2; dx <= 2; dx++) {
          set(off + dx, y, TILE_WATER);
          set(cols - off - dx, y, TILE_WATER);
        }
      }
      fillEllipse(28, 72, 8, 5, TILE_WATER);
      fillEllipse(cols - 28, 72, 8, 5, TILE_WATER);

      for (let i = 0; i < 10; i++) {
        const rx = Math.floor(8 + rng() * 38);
        const ry = Math.floor(24 + rng() * 64);
        const erx = 2.8 + rng() * 2.5;
        const ery = 2.2 + rng() * 2.0;
        fillEllipse(rx, ry, erx, ery, TILE_WALL);
        fillEllipse(cols - rx, ry, erx, ery, TILE_WALL);
      }
      drawRoadOrBridge(14, 66, 106, 66, 1);
      drawRoadOrBridge(18, 22, 102, 22, 1);
      break;
    }

    case 'FOREST_GROVE': {
      fill(TILE_WALL);
      // Vast interconnected forest glades leading north to the End-of-Map Boss Arena
      fillEllipse(cx, bossY, 15, 11, TILE_GROUND);
      const glades = [
        [24, 24, 12, 9], [96, 24, 12, 9],
        [cx, 44, 14, 10],
        [22, 56, 12, 10], [98, 56, 12, 10],
        [34, 78, 12, 9], [86, 78, 12, 9],
        [cx, 76, 13, 9],
      ];
      for (const [gx, gy, grx, gry] of glades) {
        fillEllipse(gx, gy, grx, gry, TILE_GROUND);
      }

      // Forest streams
      for (let x = 8; x < cols - 8; x++) {
        const wy = Math.round(32 + Math.sin(x * 0.12 + bg.seed) * 3);
        fillEllipse(x, wy, 2, 2, TILE_WATER);
      }

      drawRoadOrBridge(24, 24, cx, bossY, 1);
      drawRoadOrBridge(96, 24, cx, bossY, 1);
      drawRoadOrBridge(22, 56, 24, 24, 1);
      drawRoadOrBridge(98, 56, 96, 24, 1);
      drawRoadOrBridge(22, 56, cx, 44, 1);
      drawRoadOrBridge(98, 56, cx, 44, 1);
      drawRoadOrBridge(34, 78, 22, 56, 1);
      drawRoadOrBridge(86, 78, 98, 56, 1);
      drawRoadOrBridge(34, 78, cx, 96, 1);
      drawRoadOrBridge(86, 78, cx, 96, 1);
      break;
    }

    case 'LAKESIDE_SHORE': {
      fill(TILE_GROUND);
      fillRect(0, 0, cols, 3, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 3, rows, TILE_WALL);
      fillRect(cols - 3, 0, 3, rows, TILE_WALL);

      // Enormous sweeping symmetrical lake centered on axis cx=60 with island & boss headland
      for (let y = 10; y < 90; y++) {
        for (let x = 5; x < cols - 5; x++) {
          const d = Math.hypot((x - cx) * 0.68, (y - 52) * 1.0);
          const wave = Math.cos((y - 52) * 0.16) * 4 + Math.cos((x - cx) * 0.14) * 4;
          if (d + wave < 34) set(x, y, TILE_WATER);
        }
      }
      // Mid-lake Lotus Island & Northern Boss Pier Island
      fillEllipse(cx, midY, 12, 9, TILE_GROUND);
      fillEllipse(cx, midY, 7, 5, TILE_COURTYARD);
      fillEllipse(cx, bossY, 15, 11, TILE_COURTYARD);

      drawRoadOrBridge(14, midY, 106, midY, 1);
      drawRoadOrBridge(24, 34, 96, 34, 1);
      break;
    }

    case 'LAVA_CANYON': {
      fill(TILE_GROUND);
      fillRect(0, 0, cols, 4, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 4, rows, TILE_WALL);
      fillRect(cols - 4, 0, 4, rows, TILE_WALL);

      // Symmetrical Volcanic Pillars
      for (let i = 0; i < 12; i++) {
        const mx = Math.floor(8 + rng() * 38);
        const my = Math.floor(22 + rng() * 68);
        const rx = 2.8 + rng() * 3.2;
        const ry = 2.4 + rng() * 2.6;
        fillEllipse(mx, my, rx, ry, TILE_WALL);
        fillEllipse(cols - mx, my, rx, ry, TILE_WALL);
      }

      // Symmetrical Twin Magma Rivers
      for (let x = 4; x < cols - 4; x++) {
        const r1 = Math.round(34 + Math.cos((x - cx) * 0.1) * 4);
        const r2 = Math.round(68 + Math.cos((x - cx) * 0.08) * 4);
        for (let dy = -2; dy <= 2; dy++) {
          set(x, r1 + dy, TILE_WATER);
          set(x, r2 + dy, TILE_WATER);
        }
      }
      fillEllipse(cx, bossY, 15, 11, TILE_COURTYARD);
      drawRoadOrBridge(16, midY, 104, midY, 1);
      drawRoadOrBridge(26, 26, 94, 26, 1);
      break;
    }

    case 'SUNKEN_RUINS': {
      fill(TILE_WATER);
      fillRect(0, 0, cols, 3, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 3, rows, TILE_WALL);
      fillRect(cols - 3, 0, 3, rows, TILE_WALL);

      const plats = [
        [cx, bossY, 15, 11],
        [24, 34, 9, 8], [96, 34, 9, 8],
        [cx, midY, 12, 9],
        [22, 62, 10, 8], [98, 62, 10, 8],
        [26, 82, 9, 7], [94, 82, 9, 7],
      ];
      for (const [px, py, prx, pry] of plats) {
        fillEllipse(px, py, prx, pry, TILE_COURTYARD);
      }
      // Ruined sunken towers
      fillRect(22, 32, 3, 3, TILE_WALL);
      fillRect(95, 32, 3, 3, TILE_WALL);
      fillRect(20, 60, 3, 3, TILE_WALL);
      fillRect(97, 60, 3, 3, TILE_WALL);

      drawRoadOrBridge(24, 34, cx, bossY, 1);
      drawRoadOrBridge(96, 34, cx, bossY, 1);
      drawRoadOrBridge(22, 62, 24, 34, 1);
      drawRoadOrBridge(98, 62, 96, 34, 1);
      drawRoadOrBridge(22, 62, cx, midY, 1);
      drawRoadOrBridge(98, 62, cx, midY, 1);
      drawRoadOrBridge(26, 82, 22, 62, 1);
      drawRoadOrBridge(94, 82, 98, 62, 1);
      drawRoadOrBridge(26, 82, cx, 96, 1);
      drawRoadOrBridge(94, 82, cx, 96, 1);
      break;
    }

    case 'ROOT_TUNNEL': {
      fill(TILE_WALL);
      fillEllipse(cx, bossY, 15, 11, TILE_GROUND);
      const chambers = [
        [22, 28, 10, 8], [98, 28, 10, 8],
        [cx, 44, 12, 9],
        [22, 58, 11, 9], [98, 58, 11, 9],
        [cx, 74, 11, 8],
        [28, 84, 10, 7], [92, 84, 10, 7],
      ];
      for (const [rx, ry, rw, rh] of chambers) {
        fillEllipse(rx, ry, rw, rh, TILE_GROUND);
      }
      fillEllipse(22, 58, 4, 3, TILE_WATER);
      fillEllipse(98, 58, 4, 3, TILE_WATER);

      drawRoadOrBridge(22, 28, cx, bossY, 1);
      drawRoadOrBridge(98, 28, cx, bossY, 1);
      drawRoadOrBridge(22, 58, 22, 28, 1);
      drawRoadOrBridge(98, 58, 98, 28, 1);
      drawRoadOrBridge(22, 58, cx, 44, 1);
      drawRoadOrBridge(98, 58, cx, 44, 1);
      drawRoadOrBridge(28, 84, 22, 58, 1);
      drawRoadOrBridge(92, 84, 98, 58, 1);
      drawRoadOrBridge(28, 84, cx, 96, 1);
      drawRoadOrBridge(92, 84, cx, 96, 1);
      break;
    }

    case 'CRYSTAL_SANCTUM': {
      fill(TILE_GROUND);
      fillRect(0, 0, cols, 3, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 3, rows, TILE_WALL);
      fillRect(cols - 3, 0, 3, rows, TILE_WALL);

      // Symmetrical Crystal Ring Clusters around Central Sanctum
      for (let i = 0; i < 10; i++) {
        const ang = (i / 9 - 0.5) * Math.PI * 0.85;
        const rad = 30 + (i % 3) * 5;
        const dx = Math.round(Math.cos(ang) * rad);
        const wy = Math.round(54 + Math.sin(ang) * rad * 0.9);
        if (wy < 92 && wy > 25) {
          fillEllipse(cx + dx, wy, 4, 3.5, TILE_WALL);
          fillEllipse(cx - dx, wy, 4, 3.5, TILE_WALL);
        }
      }
      // Mana moat around northern Boss Spire
      fillEllipse(cx, bossY, 19, 13, TILE_WATER);
      fillEllipse(cx, bossY, 14, 10, TILE_COURTYARD);
      fillEllipse(cx, midY, 11, 8, TILE_COURTYARD);
      drawRoadOrBridge(18, bossY, 102, bossY, 1);
      drawRoadOrBridge(18, midY, 102, midY, 1);
      break;
    }

    case 'CITY_AVENUE': {
      fill(TILE_GROUND);
      fillRect(0, 0, cols, 3, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 3, rows, TILE_WALL);
      fillRect(cols - 3, 0, 3, rows, TILE_WALL);

      // Urban district blocks flanking the grand avenues
      const blocks = [
        [8, 10, 22, 16], [90, 10, 22, 16],
        [8, 32, 22, 18], [36, 32, 14, 18], [70, 32, 14, 18], [90, 32, 22, 18],
        [8, 56, 22, 18], [90, 56, 22, 18],
        [8, 78, 22, 14], [36, 78, 14, 14], [70, 78, 14, 14], [90, 78, 22, 14],
      ];
      for (const [bx, by, bw, bh] of blocks) fillRect(bx, by, bw, bh, TILE_WALL);

      // Mid-City Fountain Square & North End Imperial Boss Plaza
      fillRect(36, 52, 48, 20, TILE_COURTYARD);
      fillEllipse(cx, 62, 5, 4, TILE_WATER);
      fillRect(42, 8, 36, 18, TILE_COURTYARD);

      drawRoadOrBridge(8, 28, 112, 28, 1);
      drawRoadOrBridge(8, 53, 112, 53, 1);
      drawRoadOrBridge(8, 74, 112, 74, 1);
      drawRoadOrBridge(32, 10, 32, 94, 1);
      drawRoadOrBridge(87, 10, 87, 94, 1);
      break;
    }

    case 'CASTLE_HALL': {
      fill(TILE_COURTYARD);
      fillRect(0, 0, cols, 4, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 5, rows, TILE_WALL);
      fillRect(cols - 5, 0, 5, rows, TILE_WALL);

      // Dividing fortress ramparts with arched passages
      fillRect(5, 29, 44, 3, TILE_WALL);
      fillRect(71, 29, 44, 3, TILE_WALL);
      fillRect(5, 62, 44, 3, TILE_WALL);
      fillRect(71, 62, 44, 3, TILE_WALL);

      // Grand nave stone pillars
      for (let py = 35; py <= 88; py += 7) {
        if (Math.abs(py - 62) <= 3) continue;
        fillRect(38, py, 3, 3, TILE_WALL);
        fillRect(79, py, 3, 3, TILE_WALL);
        fillRect(16, py, 3, 3, TILE_WALL);
        fillRect(101, py, 3, 3, TILE_WALL);
      }
      fillRect(24, 35, 3, 24, TILE_WATER);
      fillRect(93, 35, 3, 24, TILE_WATER);
      drawRoadOrBridge(12, 46, 108, 46, 1);
      drawRoadOrBridge(12, 78, 108, 78, 1);
      break;
    }

    case 'FROZEN_CITADEL': {
      fill(TILE_GROUND);
      fillRect(0, 0, cols, 3, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 3, rows, TILE_WALL);
      fillRect(cols - 3, 0, 3, rows, TILE_WALL);

      // Giant frozen moat surrounding the Northern Castle Boss Island!
      fillEllipse(cx, 32, 42, 24, TILE_WATER);
      fillEllipse(cx, bossY, 16, 12, TILE_COURTYARD);
      fillRect(45, 9, 3, 3, TILE_WALL);
      fillRect(72, 9, 3, 3, TILE_WALL);
      fillRect(45, 25, 3, 3, TILE_WALL);
      fillRect(72, 25, 3, 3, TILE_WALL);

      // Southern Glacial Crossing
      fillEllipse(24, 68, 14, 9, TILE_WATER);
      fillEllipse(96, 68, 14, 9, TILE_WATER);
      drawRoadOrBridge(10, bossY, 110, bossY, 1);
      drawRoadOrBridge(10, 68, 110, 68, 1);
      break;
    }

    case 'SNOW_PEAKS': {
      fill(TILE_GROUND);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (y < 4 || y > rows - 3 || x < 3 || x > cols - 4) {
            set(x, y, TILE_WALL);
          } else if (y < 93 && y > 26) {
            const ridge = Math.cos((x - cx) * 0.13) + Math.cos((y - midY) * 0.11);
            if (ridge > 1.25 && Math.abs(x - cx) > 10) set(x, y, TILE_WALL);
          }
        }
      }
      fillEllipse(cx, bossY, 16, 11, TILE_GROUND);
      fillEllipse(24, 48, 9, 6, TILE_WATER);
      fillEllipse(96, 48, 9, 6, TILE_WATER);
      drawRoadOrBridge(24, 58, cx, bossY, 1);
      drawRoadOrBridge(96, 58, cx, bossY, 1);
      break;
    }

    case 'DESERT_DUNES': {
      fill(TILE_GROUND);
      fillRect(0, 0, cols, 3, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 3, rows, TILE_WALL);
      fillRect(cols - 3, 0, 3, rows, TILE_WALL);

      // Symmetrical Sandstone Butte Outcrops
      for (let i = 0; i < 10; i++) {
        const mx = Math.floor(8 + rng() * 38);
        const my = Math.floor(24 + rng() * 64);
        fillRect(mx, my - 2, 7, 4, TILE_WALL);
        fillRect(cols - mx - 7, my - 2, 7, 4, TILE_WALL);
      }
      // Symmetrical Twin Desert Oases
      fillEllipse(28, 56, 9, 6, TILE_WATER);
      fillEllipse(cols - 28, 56, 9, 6, TILE_WATER);
      fillEllipse(26, 36, 7, 5, TILE_WATER);
      fillEllipse(cols - 26, 36, 7, 5, TILE_WATER);
      fillEllipse(cx, bossY, 15, 11, TILE_COURTYARD);
      drawRoadOrBridge(16, 56, 104, 56, 1);
      drawRoadOrBridge(16, bossY + 2, 104, bossY + 2, 1);
      break;
    }

    case 'MARSH_BOARDWALK': {
      fill(TILE_WATER);
      fillRect(0, 0, cols, 3, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 3, rows, TILE_WALL);
      fillRect(cols - 3, 0, 3, rows, TILE_WALL);

      const islands = [
        [cx, bossY, 14, 10],
        [24, 34, 9, 7], [96, 34, 9, 7],
        [cx, 54, 11, 8],
        [24, 62, 9, 7], [96, 62, 9, 7],
        [28, 84, 9, 7], [92, 84, 9, 7],
      ];
      for (const [ix, iy, irx, iry] of islands) fillEllipse(ix, iy, irx, iry, TILE_GROUND);
      fillRect(22, 32, 3, 3, TILE_WALL);
      fillRect(95, 32, 3, 3, TILE_WALL);

      drawRoadOrBridge(24, 34, cx, bossY, 1);
      drawRoadOrBridge(96, 34, cx, bossY, 1);
      drawRoadOrBridge(24, 62, 24, 34, 1);
      drawRoadOrBridge(96, 62, 96, 34, 1);
      drawRoadOrBridge(24, 62, cx, 54, 1);
      drawRoadOrBridge(96, 62, cx, 54, 1);
      drawRoadOrBridge(28, 84, 24, 62, 1);
      drawRoadOrBridge(92, 84, 96, 62, 1);
      drawRoadOrBridge(28, 84, cx, 96, 1);
      drawRoadOrBridge(92, 84, cx, 96, 1);
      break;
    }

    case 'COLOSSEUM_ARENA': {
      fill(TILE_COURTYARD);
      fillRect(0, 0, cols, 3, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 3, rows, TILE_WALL);
      fillRect(cols - 3, 0, 3, rows, TILE_WALL);

      // Massive Outer & Northern Boss Colosseum Amphitheater!
      for (let y = 6; y <= 88; y++) {
        for (let x = 14; x <= 106; x++) {
          const dMid = Math.hypot(x - cx, (y - 54) * 1.08);
          if (dMid >= 24 && dMid <= 29) set(x, y, TILE_WALL);
          else if (dMid < 24) set(x, y, TILE_GROUND);
        }
      }
      // Northern Boss Throne Ring at the top end
      fillEllipse(cx, bossY, 16, 12, TILE_GROUND);
      drawRoadOrBridge(12, 54, 108, 54, 2);
      break;
    }

    case 'VOID_ISLANDS': {
      fill(TILE_WATER);
      fillRect(0, 0, cols, 2, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 2, rows, TILE_WALL);
      fillRect(cols - 2, 0, 2, rows, TILE_WALL);

      fillEllipse(cx, bossY, 15, 11, TILE_COURTYARD);
      fillEllipse(24, 34, 9, 7, TILE_GROUND);
      fillEllipse(96, 34, 9, 7, TILE_GROUND);
      fillEllipse(cx, midY, 12, 9, TILE_COURTYARD);
      fillEllipse(24, 68, 10, 7, TILE_GROUND);
      fillEllipse(96, 68, 10, 7, TILE_GROUND);
      fillEllipse(34, 86, 8, 6, TILE_GROUND);
      fillEllipse(86, 86, 8, 6, TILE_GROUND);

      drawRoadOrBridge(24, 34, cx, bossY, 1);
      drawRoadOrBridge(96, 34, cx, bossY, 1);
      drawRoadOrBridge(24, 68, 24, 34, 1);
      drawRoadOrBridge(96, 68, 96, 34, 1);
      drawRoadOrBridge(24, 68, cx, midY, 1);
      drawRoadOrBridge(96, 68, cx, midY, 1);
      drawRoadOrBridge(34, 86, cx, 96, 1);
      drawRoadOrBridge(86, 86, cx, 96, 1);
      drawRoadOrBridge(34, 86, 24, 68, 1);
      drawRoadOrBridge(86, 86, 96, 68, 1);
      break;
    }

    case 'VERANDA_PAGODA': {
      fill(TILE_WATER);
      fillRect(0, 0, cols, 3, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 3, rows, TILE_WALL);
      fillRect(cols - 3, 0, 3, rows, TILE_WALL);

      fillRect(3, 3, cols - 6, 8, TILE_GROUND);
      fillRect(3, 28, 14, 62, TILE_GROUND);
      fillRect(cols - 17, 28, 14, 62, TILE_GROUND);
      fillEllipse(cx, bossY, 15, 11, TILE_COURTYARD);
      fillEllipse(cx, midY, 12, 9, TILE_COURTYARD);

      drawRoadOrBridge(12, midY, 108, midY, 1);
      drawRoadOrBridge(28, 34, 92, 34, 1);
      drawRoadOrBridge(28, 34, 28, 76, 1);
      drawRoadOrBridge(92, 34, 92, 76, 1);
      drawRoadOrBridge(28, 76, 92, 76, 1);
      break;
    }

    case 'COASTAL_CLIFFS': {
      fill(TILE_GROUND);
      fillRect(0, 0, cols, 3, TILE_WALL);
      fillRect(0, rows - 2, cols, 2, TILE_WALL);
      fillRect(0, 0, 3, rows, TILE_WALL);
      fillRect(cols - 3, 0, 3, rows, TILE_WALL);

      // Symmetrical East & West Coastal Sea Cliffs flanking central promontory
      for (let y = 5; y < 92; y++) {
        const edgeDist = 24 + Math.round(Math.cos((y - midY) * 0.14) * 5);
        for (let x = 3; x < edgeDist; x++) set(x, y, TILE_WATER);
        for (let x = cols - edgeDist; x < cols - 3; x++) set(x, y, TILE_WATER);
      }
      fillEllipse(34, 34, 7, 5, TILE_WALL);
      fillEllipse(cols - 34, 34, 7, 5, TILE_WALL);
      fillEllipse(36, 68, 6, 5, TILE_WALL);
      fillEllipse(cols - 36, 68, 6, 5, TILE_WALL);
      fillEllipse(cx, bossY, 15, 11, TILE_COURTYARD);
      drawRoadOrBridge(16, midY, 104, midY, 1);
      break;
    }
  }

  // Picture-specific signature details
  if (bg.id === 'kudalaska-pass') {
    fillRect(16, 28, 30, 5, TILE_WALL);
    fillRect(74, 28, 30, 5, TILE_WALL);
  } else if (bg.id === 'kopan-ruins') {
    fillEllipse(cx, 7, 14, 4, TILE_WATER);
  } else if (bg.id === 'elmaul-archives') {
    fillRect(36, 28, 48, 6, TILE_WALL);
  }

  // ------------------------------------------------------------------
  // 2. EXTRA-SPACIOUS SAFE HAVEN SANCTUARY (South End: tx 36..84, ty 96..117)
  //    Width = 1,152 px, Height = 504 px -> NPCs spaced 350-420px apart!
  // ------------------------------------------------------------------
  fillRect(34, 95, 53, 24, TILE_GROUND);
  fillRect(37, 97, 47, 20, TILE_COURTYARD);
  // Courtyard northern parapet leaving wide central Torii threshold (tx 55..65)
  fillRect(37, 96, 17, 1, TILE_WALL);
  fillRect(67, 96, 17, 1, TILE_WALL);

  // Far-North Boss Arena (tx 46..74, ty 9..24) + Dungeon Torii Dais behind it (tx 53..67, ty 3..9)
  fillRect(46, 10, 29, 15, TILE_COURTYARD);
  fillRect(52, 3, 17, 7, TILE_COURTYARD);

  // Guaranteed Continuous Central Grand Spine: Safe Haven (98) -> Midlands -> Boss End (17) -> Dungeon (6)
  drawRoadOrBridge(cx, 6, cx, 98, 2);

  // Keep Boss Spawn & Surroundings cleanly walkable
  for (let y = bossY - 5; y <= bossY + 5; y++) {
    for (let x = cx - 6; x <= cx + 6; x++) {
      if (get(x, y) === TILE_WALL || get(x, y) === TILE_WATER) {
        set(x, y, TILE_COURTYARD);
      }
    }
  }

  // ------------------------------------------------------------------
  // 2B. 4 CORNER GUARDIAN ARENAS (Hold Exclusive 5★ Corner Swords!)
  // ------------------------------------------------------------------
  const cornerTiles: Array<[number, number]> = [
    [11, 12],   // NW Corner
    [109, 12],  // NE Corner
    [11, 107],  // SW Corner
    [109, 107], // SE Corner
  ];
  cornerTiles.forEach(([kx, ky]) => {
    fillRect(kx - 3, ky - 3, 7, 7, TILE_COURTYARD);
  });
  drawRoadOrBridge(14, 12, 46, 17, 1);
  drawRoadOrBridge(106, 12, 74, 17, 1);
  drawRoadOrBridge(14, 107, 35, 92, 1);
  drawRoadOrBridge(106, 107, 85, 92, 1);

  const cornerSpawns = cornerTiles.map(([kx, ky]) => ({
    x: kx * ts + 12,
    y: ky * ts + 12,
  }));

  // ------------------------------------------------------------------
  // 3. GENERATE 20 GUARANTEED WALKABLE MOB SPAWN PADS ("MORE ADDS")
  //    Spread throughout the journey + elite vanguard right before Boss!
  // ------------------------------------------------------------------
  const candidateCoords = [
    // South Midlands (First encounters outside Safe Haven)
    [34, 84], [86, 84], [46, 78], [74, 78],
    // Lower Midlands
    [22, 68], [98, 68], [38, 64], [82, 64],
    // Central Midlands
    [20, 52], [100, 52], [42, 50], [78, 50],
    // Upper Midlands
    [24, 38], [96, 38], [44, 36], [76, 36],
    // Northern Boss Approach (4 Elite Guard Adds near end of map)
    [32, 26], [88, 26], [48, 25], [72, 25],
  ];

  const mobSpawns: { x: number; y: number }[] = [];
  for (const [tx, ty] of candidateCoords) {
    let found: { x: number; y: number } | null = null;
    for (let rad = 0; rad <= 8 && !found; rad++) {
      for (let dy = -rad; dy <= rad && !found; dy++) {
        for (let dx = -rad; dx <= rad && !found; dx++) {
          const nx = tx + dx;
          const ny = ty + dy;
          if (ny < 93 && ny > 21 && nx > 6 && nx < cols - 7) {
            const t = get(nx, ny);
            if (t === TILE_GROUND || t === TILE_ROAD || t === TILE_COURTYARD || t === TILE_BRIDGE) {
              const wx = nx * ts + 12;
              const wy = ny * ts + 12;
              const tooCloseToOther = mobSpawns.some(m => Math.hypot(m.x - wx, m.y - wy) < 180);
              if (!tooCloseToOther && Math.hypot(nx - cx, ny - bossY) > 7) {
                found = { x: wx, y: wy };
              }
            }
          }
        }
      }
    }
    if (found) mobSpawns.push(found);
  }
  while (mobSpawns.length < 20) {
    const idx = mobSpawns.length;
    mobSpawns.push({
      x: (cx + (idx % 2 === 0 ? -5 : 5)) * ts,
      y: (86 - idx * 3) * ts,
    });
  }

  // ------------------------------------------------------------------
  // 4. BIOME PROPS (Spaced cleanly outside Haven NPCs)
  // ------------------------------------------------------------------
  const props: MapPropPlacement[] = [];
  const addProp = (kind: MapPropKind, tx: number, ty: number, w: number, h: number) => {
    props.push({ kind, x: tx * ts + 12 - w / 2, y: ty * ts + 20 - h, w, h });
  };

  const roadLightKind: MapPropKind =
    bg.propTheme === 'CYBER_CITY'
      ? 'STREET_LAMP'
      : bg.propTheme === 'VOLCANIC_EMBER' || bg.propTheme === 'CASTLE_TORCH'
      ? 'BRAZIER'
      : 'LANTERN';

  const lightSize = roadLightKind === 'BRAZIER' ? { w: 28, h: 36 } : { w: 28, h: 50 };
  for (const ly of [93, 76, 58, 40, 26]) {
    addProp(roadLightKind, cx - 4, ly, lightSize.w, lightSize.h);
    addProp(roadLightKind, cx + 4, ly, lightSize.w, lightSize.h);
  }

  // Boss Sanctum perimeter beacons at North End
  const pillarCoords = [
    [50, 11], [70, 11],
    [50, 22], [70, 22],
  ];
  for (let pi = 0; pi < pillarCoords.length; pi++) {
    const [px, py] = pillarCoords[pi];
    if (bg.propTheme === 'VOLCANIC_EMBER') addProp('BRAZIER', px, py, 28, 36);
    else if (bg.propTheme === 'DESERT_RUIN') addProp('BRAZIER', px, py, 28, 36);
    else if (bg.propTheme === 'CYBER_CITY') addProp('STREET_LAMP', px, py, 28, 52);
    else if (bg.propTheme === 'FAIRY_GLOW') addProp(pi % 2 === 0 ? 'PILLAR_MUSHROOM' : 'SAPLING_MUSHROOM', px, py, 26, 44);
    else addProp(pi % 2 === 0 ? 'SHRINE_PILLAR_CLEAN' : 'SHRINE_PILLAR_FLUTED', px, py, 28, 52);
  }

  if (bg.id === 'kopan-ruins') {
    addProp('SHRINE_PILLAR_FLUTED', cx - 4, 10, 28, 52);
    addProp('SHRINE_PILLAR_FLUTED', cx + 4, 10, 28, 52);
  } else if (bg.propTheme === 'BAMBOO_SHRINE') {
    // Symmetrical Twin Bamboo Shrine Groves (West & East)
    addProp('BAMBOO_CLUSTER', 22, 54, 76, 108);
    addProp('BAMBOO_CLUSTER', 26, 54, 76, 108);
    addProp('LANTERN', 24, 56, 28, 50);
    addProp('BAMBOO_CLUSTER', cols - 22, 54, 76, 108);
    addProp('BAMBOO_CLUSTER', cols - 26, 54, 76, 108);
    addProp('LANTERN', cols - 24, 56, 28, 50);
  }

  const palette = getTilesetBiomePalette(bg);
  const entityClearancePoints = [
    ...mobSpawns,
    ...cornerSpawns,
    { x: cx * ts + 12, y: bossY * ts + 12 },
  ];
  const isClearOfEntities = (tileX: number, tileY: number, propW = 96, propH = 156) => {
    const px = tileX * ts + 12;
    const py = tileY * ts + 20;
    return !entityClearancePoints.some(
      pt =>
        Math.abs(pt.x - px) < propW / 2 + 56 &&
        pt.y >= py - propH - 48 &&
        pt.y <= py + 44
    );
  };

  const placedTreeCoords: Array<[number, number]> = [];
  const addMirroredProp = (kind: MapPropKind, tx: number, ty: number, w: number, h: number) => {
    const mirrorTx = cols - tx;
    addProp(kind, tx, ty, w, h);
    if (mirrorTx !== tx) {
      addProp(kind, mirrorTx, ty, w, h);
    }
  };

  let placedPairs = 0;
  for (let attempt = 0; attempt < 320 && placedPairs < 24; attempt++) {
    // Generate strictly in West half (5..cx-8) then mirror symmetrically to East half
    const tx = Math.floor(5 + rng() * (cx - 13));
    const mirrorTx = cols - tx;
    const ty = Math.floor(8 + rng() * 82);
    if (Math.hypot(tx - cx, ty - bossY) < 12) continue;
    if (!isClearOfEntities(tx, ty) || !isClearOfEntities(mirrorTx, ty)) continue;

    const tLeft = get(tx, ty);
    const tRight = get(mirrorTx, ty);

    // Symmetrical Aquatic Lotus / Lilypads on water tiles
    if (tLeft === TILE_WATER && tRight === TILE_WATER && palette.allowAquatic) {
      if (rng() < 0.45) {
        addMirroredProp(rng() < 0.45 ? 'LOTUS' : 'LILYPAD', tx, ty, 30, 30);
        placedPairs++;
      }
      continue;
    }

    if ((tLeft === TILE_GROUND || tLeft === TILE_WALL) && (tRight === TILE_GROUND || tRight === TILE_WALL)) {
      if (placedTreeCoords.some(([px, py]) => Math.hypot(px - tx, py - ty) < 6.5)) continue;

      if ((bg.propTheme === 'CYBER_CITY' || bg.propTheme === 'CASTLE_TORCH') && tLeft === TILE_GROUND && tRight === TILE_GROUND) {
        addMirroredProp(roadLightKind, tx, ty, 26, 46);
        placedTreeCoords.push([tx, ty]);
        placedPairs++;
        continue;
      }

      if (palette.allowBraziers && rng() < 0.25) {
        addMirroredProp('BRAZIER', tx, ty, 28, 36);
        placedTreeCoords.push([tx, ty]);
        placedPairs++;
        continue;
      }

      const chosenTree = palette.trees[Math.floor(rng() * palette.trees.length)];
      addMirroredProp(chosenTree.kind, tx, ty, chosenTree.w, chosenTree.h);
      placedTreeCoords.push([tx, ty]);
      placedPairs++;

      // Place mirrored Stardew companion components (logs, stumps, pillars, saplings, young sprouts)
      const compCount = rng() < 0.72 ? (rng() < 0.45 ? 2 : 1) : 0;
      const offsets: Array<[number, number]> = [[-2, 1], [2, 1], [0, 2], [-3, 0], [3, 0]];
      let compPlaced = 0;
      for (let oi = 0; oi < offsets.length && compPlaced < compCount; oi++) {
        const [dx, dy] = offsets[(oi + Math.floor(rng() * offsets.length)) % offsets.length];
        const ox = tx + dx;
        const mox = cols - ox;
        const oy = ty + dy;
        if (ox <= 3 || ox >= cx - 5 || oy <= 6 || oy >= 93) continue;
        const comp = palette.companions[Math.floor(rng() * palette.companions.length)];
        if (!isClearOfEntities(ox, oy, comp.w, comp.h) || !isClearOfEntities(mox, oy, comp.w, comp.h)) continue;
        const ntL = get(ox, oy);
        const ntR = get(mox, oy);
        if ((ntL === TILE_GROUND || ntL === TILE_WALL) && (ntR === TILE_GROUND || ntR === TILE_WALL)) {
          addMirroredProp(comp.kind, ox, oy, comp.w, comp.h);
          compPlaced++;
        }
      }
    }
  }

  // Symmetrical Safe Haven corner trees themed to the map tileset
  addProp(palette.cornerTree.kind, 36, 98, palette.cornerTree.w, palette.cornerTree.h);
  addProp(palette.cornerTree.kind, 84, 98, palette.cornerTree.w, palette.cornerTree.h);

  const bridgeStyle: 'WOOD' | 'RED_LACQUER' | 'STONE' =
    bg.archetype === 'VERANDA_PAGODA'
      ? 'RED_LACQUER'
      : bg.archetype === 'MARSH_BOARDWALK' || bg.archetype === 'PLAINS_RIVER' || bg.archetype === 'LAKESIDE_SHORE'
      ? 'WOOD'
      : 'STONE';

  return {
    id: mapId,
    name: overrideName || bg.name,
    subtitle: overrideSubtitle || bg.description,
    description: bg.description,
    mapBlueprint: bg.mapBlueprint,
    battlegroundImage: `/battlegrounds/${bg.filename}`,
    tilesetId: bg.tilesetId,
    archetype: bg.archetype,
    propTheme: bg.propTheme,
    weatherEffect: bg.weatherEffect,
    accentColor: bg.accentColor,
    bridgeStyle,
    cols,
    rows,
    tileSize: ts,
    seed: bg.seed,
    grid,
    props,
    mobSpawns,
    cornerSpawns,
    bossCoords: { x: cx * ts + 12, y: bossY * ts + 12 },       // { x: 1452, y: 420 } - End of Map!
    spawnCoords: { x: cx * ts + 12, y: havenY * ts + 12 },     // { x: 1452, y: 2628 } - South Safe Haven!
    dungeonCoords: { x: cx * ts + 12, y: 6 * ts + 12 },        // { x: 1452, y: 156 } - Behind Boss at North Tip!
    zoneLabels: [
      { text: (overrideName || bg.name).toUpperCase(), x: cx * ts + 12, y: (bossY + 8) * ts },
    ],
  };
}
