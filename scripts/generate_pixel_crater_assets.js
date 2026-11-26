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

if (!fs.existsSync('public/map')) {
  fs.mkdirSync('public/map', { recursive: true });
}

const TEXEL = 4; // 4x4 raw pixels per retro texel

// =========================================================================
// 1. AUTHENTIC 16-BIT CHUNKY PIXEL VOID CRATER TILE (64x64, 16x16 texels)
// Deep cosmic obsidian floor, glowing violet ley-line energy cracks,
// amethyst crystal veins & starlight sparks
// =========================================================================
const VP = {
  abyssVoid:   [9, 3, 20, 255],      // Deepest void black #090314
  darkObsidian:[24, 8, 48, 255],     // Dark obsidian rock #180830
  midStone:    [46, 16, 85, 255],     // Fractured crater basalt #2e1055
  glowRune:    [98, 25, 165, 255],    // Ley-line violet vein #6219a5
  brightViolet:[168, 85, 247, 255],  // Glowing astral violet #a855f7
  neonFuchsia: [217, 70, 239, 255],  // High-energy ley crack #d946ef
  starlight:   [245, 208, 254, 255], // Starlight rune glint #f5d0fe
  pureWhite:   [255, 255, 255, 255], // Pure energy spark
};

// 16x16 Handcrafted Void Crater Matrix
// 0: abyssVoid, 1: darkObsidian, 2: midStone, 3: glowRune, 4: brightViolet, 5: neonFuchsia, 6: starlight, 7: pureWhite
const voidGrid = [
  // 0-3: Staggered obsidian slabs with glowing ley-line cracks
  [2, 2, 1, 0, 1, 2, 2, 3, 4, 5, 4, 3, 2, 1, 1, 2],
  [2, 3, 2, 1, 1, 2, 3, 4, 6, 7, 6, 4, 2, 2, 2, 2],
  [1, 2, 3, 2, 1, 2, 4, 5, 4, 3, 3, 2, 1, 2, 3, 2],
  [0, 1, 2, 1, 1, 3, 4, 3, 2, 1, 2, 1, 1, 2, 4, 3],
  // 4-7: Obsidian floor with branch energy vein
  [1, 1, 2, 2, 3, 4, 3, 2, 1, 1, 2, 2, 2, 2, 3, 2],
  [2, 2, 3, 4, 5, 4, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1],
  [2, 3, 4, 6, 5, 3, 2, 1, 1, 2, 3, 4, 5, 4, 2, 2],
  [3, 4, 5, 4, 3, 2, 1, 2, 2, 3, 4, 6, 7, 5, 3, 2],
  // 8-11: Deep void crevice and crystal rune node
  [4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 5, 6, 4, 2, 1],
  [3, 4, 3, 2, 1, 2, 3, 4, 6, 7, 6, 4, 3, 2, 1, 0],
  [2, 3, 2, 1, 1, 2, 4, 5, 4, 6, 5, 3, 2, 1, 1, 1],
  [2, 2, 1, 0, 1, 3, 4, 3, 2, 3, 4, 2, 1, 2, 2, 2],
  // 12-15: Intersecting cracks wrapping seamlessly
  [1, 1, 2, 1, 2, 4, 5, 4, 3, 2, 3, 2, 1, 2, 3, 2],
  [2, 2, 3, 2, 3, 5, 6, 5, 4, 3, 2, 2, 2, 3, 4, 3],
  [2, 3, 4, 3, 4, 6, 7, 6, 5, 4, 3, 2, 2, 4, 5, 4],
  [2, 2, 3, 4, 5, 4, 5, 4, 3, 2, 2, 1, 2, 3, 4, 3],
];

const voidLookup = [
  VP.abyssVoid, VP.darkObsidian, VP.midStone, VP.glowRune,
  VP.brightViolet, VP.neonFuchsia, VP.starlight, VP.pureWhite
];

const voidPNG = createPNG(64, 64, (x, y) => {
  const gx = Math.floor(x / TEXEL);
  const gy = Math.floor(y / TEXEL);
  const val = voidGrid[gy][gx];
  return voidLookup[val];
});
fs.writeFileSync('public/map/pixel_void_tile.png', voidPNG);
console.log('Saved 16-bit public/map/pixel_void_tile.png (64x64, 4px texels)');

// =========================================================================
// 2. AUTHENTIC 16-BIT PIXEL ART MAGIC RITUAL CIRCLE (256x256 px, 64x64 texels)
// Stepped concentric pixel rings, 8 cardinal rune nodes, ancient JRPG glyphs,
// and a nested 8-pointed star / octagram. Zero vector anti-aliasing!
// =========================================================================
const MC = {
  transparent: [0, 0, 0, 0],
  darkViolet:  [76, 29, 149, 230],   // Deep outer seal #4c1d95
  midViolet:   [139, 92, 246, 255],  // Base rune line #8b5cf6
  brightViolet:[192, 132, 252, 255], // Sunlit energy line #c084fc
  cyanRune:    [34, 211, 238, 255],  // Astral cyan glyph #22d3ee
  brightCyan:  [165, 243, 252, 255], // Rune node core #a5f3fc
  fuchsiaStar: [232, 121, 249, 255], // Star point highlight #e879f9
  starlightWhite:[255, 255, 255, 255],// Glint peak
};

const circleTexW = 64;
const circleTexH = 64;
const circlePNG = createPNG(256, 256, (x, y) => {
  const tx = Math.floor(x / 4) - 32 + 0.5;
  const ty = Math.floor(y / 4) - 32 + 0.5;
  const r = Math.hypot(tx, ty);
  const angle = Math.atan2(ty, tx); // -PI to PI

  // Ring 1: Outer Stepped Ring (r ≈ 29 to 30.5)
  if (r >= 29.2 && r <= 30.8) {
    // 8 Cardinal Nodes at 45 deg intervals
    const modAngle = Math.abs(Math.sin(angle * 4));
    if (modAngle < 0.12) return MC.starlightWhite;
    return MC.brightViolet;
  }
  if (r >= 28.2 && r < 29.2) {
    return MC.darkViolet;
  }

  // Ring 2: Intermediate Runic Band (r ≈ 23 to 24.5)
  if (r >= 23.2 && r <= 24.5) {
    return MC.midViolet;
  }

  // Ancient Runic Glyphs in the band (r between 25 and 28)
  if (r >= 25.5 && r <= 27.5) {
    // Staccato rune tick marks every 15 degrees
    const runeSector = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 24);
    const inSector = ((angle + Math.PI) / (Math.PI * 2)) * 24 - runeSector;
    if (inSector > 0.25 && inSector < 0.75) {
      if ((runeSector % 3 === 0 && Math.abs(r - 26.5) < 0.6) ||
          (runeSector % 3 === 1 && (Math.abs(tx) % 2 === 0 || Math.abs(ty) % 2 === 0)) ||
          (runeSector % 3 === 2 && Math.abs(r - 26.5) < 0.8)) {
        return MC.cyanRune;
      }
    }
  }

  // Inner Nested 8-Pointed Star (Octagram) between r = 6 and r = 23
  // Diamond 1 (Square aligned): |tx| + |ty| ≈ 19
  const d1 = Math.abs(tx) + Math.abs(ty);
  if (d1 >= 18.2 && d1 <= 19.8 && r <= 23.5) {
    return MC.fuchsiaStar;
  }
  // Diamond 2 (Rotated Square): box bounds
  const rotX = tx * 0.7071 - ty * 0.7071;
  const rotY = tx * 0.7071 + ty * 0.7071;
  const d2 = Math.abs(rotX) + Math.abs(rotY);
  if (d2 >= 18.2 && d2 <= 19.8 && r <= 23.5) {
    return MC.cyanRune;
  }

  // Ring 3: Inner Core Ring (r ≈ 13 to 14.5)
  if (r >= 13.5 && r <= 14.8) {
    return MC.brightViolet;
  }
  if (r >= 12.5 && r < 13.5) {
    return MC.darkViolet;
  }

  // 4 Cardinal Star Points (Cross: tx ≈ 0 or ty ≈ 0)
  if (r >= 14.8 && r <= 23.0) {
    if (Math.abs(tx) <= 0.6 || Math.abs(ty) <= 0.6) {
      return MC.brightCyan;
    }
    // Diagonal rays
    if (Math.abs(Math.abs(tx) - Math.abs(ty)) <= 0.6) {
      return MC.brightViolet;
    }
  }

  // 8 Cardinal Rune Nodes on Outer Ring (r ≈ 30)
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const nx = Math.cos(a) * 30;
    const ny = Math.sin(a) * 30;
    const dNode = Math.hypot(tx - nx, ty - ny);
    if (dNode <= 1.8) {
      if (dNode <= 0.8) return MC.starlightWhite;
      return MC.brightCyan;
    }
  }

  return MC.transparent;
});
fs.writeFileSync('public/map/prop_void_magic_circle.png', circlePNG);
console.log('Saved 16-bit public/map/prop_void_magic_circle.png (256x256, 4px texels)');

// =========================================================================
// 3. AUTHENTIC 16-BIT PIXEL ART VOID SINGULARITY CORE (80x80 px, 20x20 texels)
// Concentric stepped pixel energy orbs with dark void pupil & fuchsia/cyan corona
// =========================================================================
const corePNG = createPNG(80, 80, (x, y) => {
  const tx = Math.floor(x / 4) - 10 + 0.5;
  const ty = Math.floor(y / 4) - 10 + 0.5;
  const r = Math.hypot(tx, ty);

  if (r > 9.6) return [0, 0, 0, 0];
  if (r >= 8.2) return [168, 85, 247, 180]; // Outer fuchsia aura
  if (r >= 6.8) return [217, 70, 239, 230]; // Neon corona
  if (r >= 5.2) return [103, 232, 249, 255]; // Cyan starlight ring
  if (r >= 3.6) return [245, 208, 254, 255]; // Glistening white-pink
  if (r >= 2.0) return [255, 255, 255, 255]; // Pure core highlight
  // Inner event horizon (Void pupil)
  return [10, 2, 25, 255]; // Deep cosmic black
});
fs.writeFileSync('public/map/prop_void_core.png', corePNG);
console.log('Saved 16-bit public/map/prop_void_core.png (80x80, 4px texels)');

// =========================================================================
// 4. AUTHENTIC 16-BIT PIXEL ART FLOATING VOID CRYSTALS (32x48 px, 8x12 texels)
// Faceted amethyst/cyan crystal shards with bold pixel bevels & highlights
// =========================================================================
const CP = {
  trans:     [0, 0, 0, 0],
  outline:   [24, 8, 48, 255],     // Deep shadow edge #180830
  shadow:    [88, 28, 135, 255],   // Dark amethyst facet #581c87
  body:      [147, 51, 234, 255],  // Base crystal violet #9333ea
  hlViolet:  [192, 132, 252, 255], // Lit crystal facet #c084fc
  cyanGlint: [103, 232, 249, 255], // Starlight cyan edge #67e8f9
  specular:  [255, 255, 255, 255], // Crisp white sparkle
};

// 8x12 Crystal Grid
// 0: trans, 1: outline, 2: shadow, 3: body, 4: hlViolet, 5: cyanGlint, 6: specular
const crystalGrid = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 5, 4, 1, 0, 0],
  [0, 1, 5, 6, 4, 3, 1, 0],
  [0, 1, 5, 4, 4, 3, 1, 0],
  [1, 5, 6, 4, 3, 2, 2, 1],
  [1, 5, 4, 4, 3, 2, 2, 1],
  [1, 4, 4, 3, 3, 2, 1, 1],
  [1, 4, 3, 3, 2, 2, 1, 0],
  [0, 1, 4, 3, 2, 1, 0, 0],
  [0, 1, 3, 2, 2, 1, 0, 0],
  [0, 0, 1, 2, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0],
];

const crystalLookup = [
  CP.trans, CP.outline, CP.shadow, CP.body, CP.hlViolet, CP.cyanGlint, CP.specular
];

const crystalPNG = createPNG(32, 48, (x, y) => {
  const gx = Math.min(7, Math.floor(x / 4));
  const gy = Math.min(11, Math.floor(y / 4));
  const val = crystalGrid[gy][gx];
  return crystalLookup[val];
});
fs.writeFileSync('public/map/prop_void_crystal.png', crystalPNG);
console.log('Saved 16-bit public/map/prop_void_crystal.png (32x48, 4px texels)');

// =========================================================================
// 5. AUTHENTIC 16-BIT CRATER RIM BOULDER (32x32 px, 8x8 texels)
// Chunky fractured rim boulder lining the perimeter of the crater
// =========================================================================
const BP = {
  trans:    [0, 0, 0, 0],
  outline:  [15, 6, 30, 255],     // Dark rim silhouette #0f061e
  shadow:   [45, 20, 75, 255],    // Shadow stone basalt #2d144b
  midStone: [80, 40, 120, 255],   // Base crater basalt #502878
  hlStone:  [130, 80, 180, 255],  // Violet lit crest #8250b4
  glint:    [210, 150, 255, 255], // Starlight rim glint #d296ff
};

const boulderGrid = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 4, 4, 3, 3, 1, 0],
  [1, 4, 5, 4, 3, 2, 2, 1],
  [1, 4, 4, 3, 3, 2, 1, 1],
  [1, 3, 3, 3, 2, 2, 2, 1],
  [1, 3, 2, 2, 2, 1, 1, 1],
  [0, 1, 2, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0],
];

const boulderLookup = [
  BP.trans, BP.outline, BP.shadow, BP.midStone, BP.hlStone, BP.glint
];

const boulderPNG = createPNG(32, 32, (x, y) => {
  const gx = Math.min(7, Math.floor(x / 4));
  const gy = Math.min(7, Math.floor(y / 4));
  const val = boulderGrid[gy][gx];
  return boulderLookup[val];
});
fs.writeFileSync('public/map/prop_crater_boulder.png', boulderPNG);
console.log('Saved 16-bit public/map/prop_crater_boulder.png (32x32, 4px texels)');
