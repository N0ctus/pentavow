import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, getPixel) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : (c >>> 1);
    }
    crcTable[n] = c >>> 0;
  }

  function makeChunk(type, chunkData) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(chunkData.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, chunkData]);
    let crc = 0xffffffff;
    for (let i = 0; i < combined.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ combined[i]) & 0xff];
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, chunkData, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Ensure public/map directory exists
if (!fs.existsSync('public/map')) {
  fs.mkdirSync('public/map', { recursive: true });
}

const TEXEL_SIZE = 4; // Each retro pixel is 4x4 screen pixels!
const GRID_SIZE = 16;  // 16x16 retro texels
const TILE_PX = GRID_SIZE * TEXEL_SIZE; // 64x64 pixels

// =========================================================================
// 1. AUTHENTIC 16-BIT CHUNKY JRPG PIXEL GRASS (64x64, 16x16 texels)
// Inspired by Chrono Trigger Guardia Meadow & Pokémon Emerald Route Grass
// Natural grass blade tufts, rich earthy shading, completely seamless
// =========================================================================
const GP = {
  soilDark:   [20, 48, 25, 255],     // Deep shadow soil #143019
  darkGrass:  [28, 68, 34, 255],     // Base shadow grass #1c4422
  midGrass:   [40, 96, 48, 255],     // Lush mid grass body #286030
  brightGrass:[58, 134, 68, 255],    // Sunlit grass blade #3a8644
  lightTip:   [88, 180, 98, 255],    // Sunlit blade tip #58b462
  cloverGold: [195, 175, 75, 255],   // Subtle wild yellow clover #c3af4b
};

// 16x16 Handcrafted Grass Matrix
// 0: soilDark, 1: darkGrass, 2: midGrass, 3: brightGrass, 4: lightTip, 5: cloverGold
const grassGrid = [
  // 0-3
  [2, 2, 2, 1, 2, 2, 3, 4, 3, 2, 2, 1, 2, 2, 2, 2],
  [2, 3, 2, 2, 2, 3, 4, 4, 3, 2, 2, 2, 2, 3, 2, 2],
  [1, 2, 2, 2, 1, 2, 3, 2, 2, 1, 2, 2, 3, 4, 3, 1],
  [2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2],
  // 4-7
  [2, 2, 2, 3, 4, 3, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2],
  [2, 1, 2, 4, 4, 3, 2, 2, 2, 3, 4, 3, 2, 2, 2, 2],
  [2, 2, 2, 3, 2, 2, 1, 2, 3, 4, 4, 3, 2, 1, 2, 2],
  [3, 4, 3, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 5, 2],
  // 8-11
  [4, 4, 3, 2, 1, 2, 2, 2, 2, 2, 2, 1, 2, 5, 5, 2],
  [3, 2, 2, 2, 2, 3, 4, 3, 2, 2, 2, 2, 2, 2, 2, 1],
  [2, 2, 1, 2, 3, 4, 4, 3, 2, 1, 2, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 3, 4, 3, 2, 1, 2],
  // 12-15
  [1, 2, 2, 2, 2, 2, 2, 1, 2, 3, 4, 4, 3, 2, 2, 2],
  [2, 3, 4, 3, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2],
  [2, 4, 4, 3, 2, 1, 2, 2, 1, 2, 2, 2, 2, 3, 4, 3],
  [2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 4, 4, 3],
];

const grassLookup = [
  GP.soilDark, GP.darkGrass, GP.midGrass, GP.brightGrass, GP.lightTip, GP.cloverGold
];

const grassPNG = createPNG(TILE_PX, TILE_PX, (x, y) => {
  const gx = Math.floor(x / TEXEL_SIZE);
  const gy = Math.floor(y / TEXEL_SIZE);
  const val = grassGrid[gy][gx];
  return grassLookup[val];
});
fs.writeFileSync('public/map/pixel_grass_tile.png', grassPNG);
console.log('Saved authentic 16-bit public/map/pixel_grass_tile.png (64x64, 4px texels)');

// =========================================================================
// 2. AUTHENTIC 16-BIT CHUNKY JRPG COBBLESTONES (64x64, 16x16 texels)
// Staggered paving stones with bold lit bevels, dark mortar crevice & moss
// =========================================================================
const CP = {
  mortar:    [24, 30, 42, 255],    // Dark mortar crevice #181e2a
  stoneDark: [52, 64, 82, 255],    // Shaded stone bottom #344052
  stoneMid:  [84, 98, 120, 255],   // Base stone grey #546278
  stoneHl:   [135, 150, 175, 255], // Sunlit stone face #8796af
  stoneBevel:[185, 200, 222, 255], // Glistening top bevel #b9c8de
  mossCrust: [46, 92, 58, 255],    // Moss tuft in mortar #2e5c3a
};

// 16x16 Staggered Edo Flagstones
// 0: mortar, 1: stoneDark, 2: stoneMid, 3: stoneHl, 4: stoneBevel, 5: mossCrust
const cobbleGrid = [
  // Row 0-3: Stone A (cols 0-6), Stone B (cols 8-14)
  [4, 4, 3, 3, 2, 2, 1,  0,  4, 4, 3, 3, 2, 2, 1,  0],
  [4, 3, 3, 2, 2, 2, 1,  0,  4, 3, 3, 2, 2, 2, 1,  0],
  [3, 2, 2, 2, 2, 1, 1,  5,  3, 2, 2, 2, 2, 1, 1,  0],
  [2, 1, 1, 1, 1, 1, 0,  0,  2, 1, 1, 1, 1, 1, 0,  0],
  // Grout row 4
  [0, 0, 0, 5, 0, 0, 0,  0,  0, 0, 0, 0, 5, 0, 0,  0],
  // Row 5-8: Staggered Stone C (cols 4-11), edge stones (cols 0-2 and 13-15)
  [2, 1, 0,  0,  4, 4, 4, 3, 3, 2, 2, 1,  0,  4, 4, 3],
  [2, 1, 0,  0,  4, 3, 3, 3, 2, 2, 2, 1,  0,  4, 3, 3],
  [1, 1, 0,  0,  3, 3, 2, 2, 2, 2, 1, 1,  0,  3, 2, 2],
  [1, 0, 0,  5,  2, 1, 1, 1, 1, 1, 1, 0,  0,  2, 1, 1],
  // Grout row 9
  [0, 0, 0,  0,  0, 0, 0, 0, 5, 0, 0, 0,  0,  0, 0, 0],
  // Row 10-14: Staggered Stone D (cols 1-7), Stone E (cols 9-15)
  [0,  4, 4, 3, 3, 2, 2, 1,  0,  4, 4, 3, 3, 2, 2, 1],
  [0,  4, 3, 3, 2, 2, 2, 1,  0,  4, 3, 3, 2, 2, 2, 1],
  [5,  3, 2, 2, 2, 2, 1, 1,  0,  3, 2, 2, 2, 2, 1, 1],
  [0,  2, 1, 1, 1, 1, 1, 0,  5,  2, 1, 1, 1, 1, 1, 0],
  // Grout row 14-15
  [0,  0, 0, 0, 5, 0, 0, 0,  0,  0, 0, 0, 0, 5, 0, 0],
  [0,  0, 0, 0, 0, 0, 0, 0,  0,  0, 0, 0, 0, 0, 0, 0],
];

const cobbleLookup = [
  CP.mortar, CP.stoneDark, CP.stoneMid, CP.stoneHl, CP.stoneBevel, CP.mossCrust
];

const cobblePNG = createPNG(TILE_PX, TILE_PX, (x, y) => {
  const gx = Math.floor(x / TEXEL_SIZE);
  const gy = Math.floor(y / TEXEL_SIZE);
  const val = cobbleGrid[gy][gx];
  return cobbleLookup[val];
});
fs.writeFileSync('public/map/pixel_cobble_tile.png', cobblePNG);
console.log('Saved authentic 16-bit public/map/pixel_cobble_tile.png (64x64, 4px texels)');

// =========================================================================
// 3. AUTHENTIC 16-BIT CHUNKY JRPG WATER TILE (64x64, 16x16 texels)
// Stepped wave crests and glistening water caustics (Chrono Trigger style)
// =========================================================================
const WP = {
  abyssBlue: [6, 28, 52, 255],     // Deepest river depth #061c34
  darkBlue:  [12, 54, 88, 255],    // Base river blue #0c3658
  midBlue:   [20, 115, 175, 255],  // River body blue #1473af
  lightBlue: [40, 160, 225, 255],  // Wave highlight #28a0e1
  shimmer:   [90, 210, 255, 255],  // Foam crest #5ad2ff
  sparkle:   [235, 248, 255, 255], // Sunlit sparkle #ebf8ff
};

// 16x16 Wave Matrix
// 0: abyssBlue, 1: darkBlue, 2: midBlue, 3: lightBlue, 4: shimmer, 5: sparkle
const waterGrid = [
  [1, 1, 2, 2, 3, 4, 5, 4, 3, 2, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 3, 4, 4, 4, 3, 2, 1, 1, 1, 1, 2, 2, 1],
  [2, 2, 3, 2, 2, 2, 2, 1, 1, 1, 2, 2, 3, 2, 2, 2],
  [2, 3, 2, 1, 1, 1, 1, 1, 2, 3, 4, 3, 2, 1, 1, 2],
  [1, 1, 1, 1, 2, 2, 2, 3, 4, 5, 4, 3, 2, 1, 1, 1],
  [1, 1, 2, 3, 4, 4, 4, 4, 3, 2, 2, 2, 1, 1, 2, 2],
  [2, 2, 4, 5, 4, 3, 2, 2, 1, 1, 1, 1, 2, 2, 3, 2],
  [2, 3, 3, 2, 2, 1, 1, 1, 1, 2, 2, 3, 4, 3, 2, 1],
  [1, 1, 1, 1, 1, 2, 2, 3, 4, 5, 4, 3, 2, 1, 1, 1],
  [1, 2, 2, 2, 3, 4, 4, 4, 3, 2, 2, 1, 1, 1, 2, 2],
  [2, 3, 4, 3, 2, 2, 1, 1, 1, 1, 2, 3, 4, 3, 2, 2],
  [3, 4, 5, 4, 2, 1, 1, 1, 2, 2, 3, 4, 5, 4, 2, 1],
  [2, 3, 4, 3, 2, 1, 2, 3, 4, 4, 3, 2, 3, 2, 1, 1],
  [1, 2, 2, 1, 1, 2, 4, 5, 4, 3, 2, 1, 1, 1, 2, 2],
  [1, 1, 1, 1, 2, 3, 4, 3, 2, 1, 1, 1, 1, 2, 3, 2],
  [1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 3, 4, 3, 1],
];

const waterLookup = [
  WP.abyssBlue, WP.darkBlue, WP.midBlue, WP.lightBlue, WP.shimmer, WP.sparkle
];

const waterPNG = createPNG(TILE_PX, TILE_PX, (x, y) => {
  const gx = Math.floor(x / TEXEL_SIZE);
  const gy = Math.floor(y / TEXEL_SIZE);
  const val = waterGrid[gy][gx];
  return waterLookup[val];
});
fs.writeFileSync('public/map/pixel_water_tile.png', waterPNG);
console.log('Saved authentic 16-bit public/map/pixel_water_tile.png (64x64, 4px texels)');

// =========================================================================
// 4. AUTHENTIC 16-BIT CHUNKY SUNKEN ABYSS CAVERN TILE (64x64, 16x16 texels)
// Bioluminescent cyan moss veins, dark submerged basalt rock, amethyst glints
// =========================================================================
const AP = {
  voidDark:   [8, 16, 26, 255],     // Deepest cavern void #08101a
  shadowFloor:[14, 28, 44, 255],    // Basalt floor shadow #0e1c2c
  midFloor:   [22, 46, 70, 255],    // Base submerged rock #162e46
  darkTeal:   [16, 68, 88, 255],    // Dark aquatic moss #104458
  cyanMoss:   [6, 182, 212, 255],   // Glowing bioluminescent cyan moss #06b6d4
  neonAqua:   [103, 232, 249, 255], // Bioluminescent crystal spore glint #67e8f9
  crystalPurp:[168, 85, 247, 255],  // Void amethyst crystal #a855f7
  crystalLight:[232, 121, 249, 255],// Amethyst glint #e879f9
};

// 16x16 Abyssal Matrix
// 0: voidDark, 1: shadowFloor, 2: midFloor, 3: darkTeal, 4: cyanMoss, 5: neonAqua, 6: crystalPurp, 7: crystalLight
const abyssGrid = [
  [2, 2, 3, 2, 2, 1, 2, 2, 2, 3, 4, 5, 2, 2, 2, 1],
  [2, 3, 4, 3, 2, 2, 2, 2, 3, 4, 4, 3, 2, 2, 2, 2],
  [1, 2, 3, 2, 1, 2, 3, 2, 2, 3, 2, 2, 1, 2, 3, 2],
  [2, 1, 1, 2, 2, 3, 4, 3, 2, 2, 2, 1, 2, 3, 4, 3],
  [2, 2, 2, 2, 2, 2, 3, 2, 2, 1, 2, 2, 2, 2, 3, 2],
  [3, 4, 3, 2, 1, 2, 2, 2, 3, 4, 3, 2, 1, 2, 2, 1],
  [4, 5, 4, 2, 2, 2, 6, 7, 4, 5, 4, 2, 2, 2, 2, 2],
  [3, 4, 3, 1, 2, 6, 6, 2, 3, 4, 3, 1, 2, 3, 2, 2],
  [2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 3, 4, 3, 2],
  [2, 2, 2, 3, 4, 3, 2, 1, 2, 2, 2, 2, 4, 5, 4, 2],
  [1, 2, 3, 4, 5, 4, 2, 2, 2, 3, 2, 1, 3, 4, 3, 1],
  [2, 2, 2, 3, 4, 3, 1, 2, 3, 4, 3, 2, 2, 2, 2, 2],
  [2, 3, 2, 2, 2, 1, 2, 2, 4, 5, 4, 2, 1, 2, 2, 2],
  [3, 4, 3, 2, 2, 2, 2, 1, 3, 4, 3, 2, 2, 6, 7, 2],
  [4, 5, 4, 2, 1, 2, 3, 2, 2, 2, 1, 2, 6, 6, 2, 1],
  [3, 4, 3, 1, 2, 3, 4, 3, 2, 2, 2, 2, 2, 1, 2, 2],
];

const abyssLookup = [
  AP.voidDark, AP.shadowFloor, AP.midFloor, AP.darkTeal,
  AP.cyanMoss, AP.neonAqua, AP.crystalPurp, AP.crystalLight
];

const abyssPNG = createPNG(TILE_PX, TILE_PX, (x, y) => {
  const gx = Math.floor(x / TEXEL_SIZE);
  const gy = Math.floor(y / TEXEL_SIZE);
  const val = abyssGrid[gy][gx];
  return abyssLookup[val];
});
fs.writeFileSync('public/map/pixel_abyss_tile.png', abyssPNG);
console.log('Saved authentic 16-bit public/map/pixel_abyss_tile.png (64x64, 4px texels)');

// =========================================================================
// 5. AUTHENTIC 16-BIT PIXEL ART RIVER STONE / SHORE ROCK (24x24 px, 6x6 texels)
// Replaces smooth SVG <circle> vector dots with authentic JRPG river rocks!
// =========================================================================
const RP = {
  transparent: [0, 0, 0, 0],
  outline:     [15, 23, 42, 255],    // Darkest stone outline #0f172a
  shadow:      [51, 65, 85, 255],    // Shadow stone face #334155
  mid:         [100, 116, 139, 255], // Mid stone slate #64748b
  highlight:   [148, 163, 184, 255], // Sunlit top highlight #94a3b8
  glint:       [226, 232, 240, 255], // Crisp edge glint #e2e8f0
  moss:        [34, 197, 94, 255],   // Green moss fleck #22c55e
};

const rockGrid = [
  [0, 1, 1, 1, 1, 0],
  [1, 5, 4, 4, 3, 1],
  [1, 4, 4, 3, 3, 1],
  [1, 4, 3, 2, 2, 1],
  [1, 3, 2, 2, 1, 1],
  [0, 1, 1, 1, 1, 0],
];

const rockLookup = [
  RP.transparent, RP.outline, RP.shadow, RP.mid, RP.highlight, RP.glint, RP.moss
];

const rockPNG = createPNG(24, 24, (x, y) => {
  const gx = Math.min(5, Math.floor(x / 4));
  const gy = Math.min(5, Math.floor(y / 4));
  const val = rockGrid[gy][gx];
  return rockLookup[val];
});
fs.writeFileSync('public/map/prop_river_rock.png', rockPNG);
console.log('Saved authentic 16-bit public/map/prop_river_rock.png (24x24, 4px texels)');
