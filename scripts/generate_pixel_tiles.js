import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, getPixel) {
  // getPixel(x, y) returns [r, g, b, a]
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel + 1; // +1 for filter byte (0 = None)
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

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // Helper to make chunk
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    
    // Compute CRC32
    const chunkData = Buffer.concat([typeBuf, data]);
    let crc = 0xffffffff;
    for (let i = 0; i < chunkData.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ chunkData[i]) & 0xff];
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Precompute CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c >>> 0;
  }

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Ensure public/map directory
if (!fs.existsSync('public/map')) {
  fs.mkdirSync('public/map', { recursive: true });
}

// 1. SEAMLESS 16-BIT RETRO JRPG PIXEL GRASS TILE (32x32)
// Palette inspired by Chrono Trigger & Secret of Mana
const grassPalette = [
  [21, 54, 27, 255],   // 0: Deep Shadow Green #15361b
  [25, 66, 32, 255],   // 1: Base Forest Green #194220
  [34, 88, 43, 255],   // 2: Lush Mid Green   #22582b
  [45, 115, 56, 255],  // 3: Highlight Grass  #2d7338
  [65, 148, 77, 255],  // 4: Sunlit Tip       #41944d
  [15, 38, 20, 255],   // 5: Dirt / Dark Moss #0f2614
];

// Seeded pseudorandom
function pseudo(x, y, seed = 1337) {
  let h = (x * 374761393 + y * 668265263 + seed) ^ 0x5bf03635;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const grassPNG = createPNG(32, 32, (x, y) => {
  // Base dither
  const noise = pseudo(x, y, 42);
  let colorIdx = 1; // Base green
  if (noise < 0.22) colorIdx = 0;
  else if (noise < 0.65) colorIdx = 1;
  else if (noise < 0.88) colorIdx = 2;
  else colorIdx = 3;

  // Occasional scattered grass blade tufts (2-3 pixel vertical highlights)
  const isBladeBase = (x % 8 === 2 && y % 7 === 3) || (x % 9 === 6 && y % 8 === 1);
  if (isBladeBase) {
    colorIdx = 4;
  }
  const isBladeShadow = (x % 8 === 2 && y % 7 === 4) || (x % 9 === 6 && y % 8 === 2);
  if (isBladeShadow) {
    colorIdx = 0;
  }

  // Tiny clover / flower petal speck
  if ((x === 7 && y === 12) || (x === 23 && y === 25)) {
    return [244, 114, 182, 255]; // Soft pink sakura petal
  }
  if ((x === 8 && y === 12) || (x === 24 && y === 25)) {
    return [251, 207, 232, 255]; // Petal highlight
  }

  return grassPalette[colorIdx];
});

fs.writeFileSync('public/map/pixel_grass_tile.png', grassPNG);
console.log('Created public/map/pixel_grass_tile.png (32x32)');

// 2. SEAMLESS 16-BIT RETRO JRPG COBBLESTONE TILE (32x32)
// Palette: Weathered Edo Stone
const cobblePalette = [
  [30, 41, 59, 255],   // Grout / Deep Crevice #1e293b
  [51, 65, 85, 255],   // Dark Stone Body     #334155
  [71, 85, 105, 255],  // Mid Stone Tone      #475569
  [100, 116, 139, 255],// Stone Top Highlight #64748b
  [148, 163, 184, 255],// Bevel Edge Glint   #94a3b8
  [40, 70, 50, 255],   // Moss in crevice     #284632
];

// Defined stone layout within 32x32 wrapping grid
const stones = [
  { cx: 8, cy: 8, rx: 6, ry: 5 },
  { cx: 24, cy: 7, rx: 6, ry: 5 },
  { cx: 16, cy: 19, rx: 7, ry: 5 },
  { cx: 0, cy: 26, rx: 5, ry: 4 },
  { cx: 32, cy: 26, rx: 5, ry: 4 },
  { cx: 28, cy: 27, rx: 5, ry: 4 }
];

const cobblePNG = createPNG(32, 32, (x, y) => {
  // Find closest stone
  let insideStone = false;
  let distToEdge = 999;
  let stoneCenter = null;

  for (const s of stones) {
    // Check wrapped coordinates
    for (const ox of [-32, 0, 32]) {
      for (const oy of [-32, 0, 32]) {
        const scx = s.cx + ox;
        const scy = s.cy + oy;
        const dx = (x - scx) / s.rx;
        const dy = (y - scy) / s.ry;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= 1.0) {
          insideStone = true;
          const edgeDist = 1.0 - d;
          if (edgeDist < distToEdge) {
            distToEdge = edgeDist;
            stoneCenter = { x: scx, y: scy };
          }
        }
      }
    }
  }

  if (!insideStone) {
    // Grout crevice: subtle moss accent
    const mossNoise = pseudo(x, y, 77);
    return mossNoise < 0.25 ? cobblePalette[5] : cobblePalette[0];
  }

  // Inside stone: 3D beveled pixel shading
  const relY = y - stoneCenter.y;
  const relX = x - stoneCenter.x;
  
  // Top-left highlight, bottom-right shadow
  if (relY <= -2 && relX <= 1) {
    return cobblePalette[4]; // Sunlit bevel glint
  } else if (relY < 0) {
    return cobblePalette[3]; // Highlight
  } else if (relY > 2 || distToEdge < 0.15) {
    return cobblePalette[1]; // Bottom shadow
  } else {
    return cobblePalette[2]; // Mid stone
  }
});

fs.writeFileSync('public/map/pixel_cobble_tile.png', cobblePNG);
console.log('Created public/map/pixel_cobble_tile.png (32x32)');
