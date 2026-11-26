import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, getPixel) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
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

// 16-BIT SEAMLESS POND WATER TILE (32x32)
// Palette: JRPG Crystal Blue Lake
const waterPal = {
  deep: [8, 47, 73, 255],     // #082f49 Deep abyss
  body: [3, 105, 161, 255],   // #0369a1 Lake body
  light: [2, 132, 199, 255],  // #0284c7 Mid water
  ripple: [56, 189, 248, 255],// #38bdf8 Shimmer ripple
  glint: [186, 230, 253, 255] // #bae6fd Sunlight glint
};

const waterPNG = createPNG(32, 32, (x, y) => {
  // Gentle horizontal caustic ripple lines wrapping at 32
  // Line 1: y around 6-7
  const r1 = Math.sin((x / 32) * Math.PI * 2) * 2;
  const r2 = Math.sin((x / 16) * Math.PI * 2) * 1.5;
  const isRipple1 = Math.abs((y - 7) - r1) < 0.9;
  const isGlint1 = isRipple1 && (x >= 12 && x <= 16);

  // Line 2: y around 20-21
  const r3 = Math.cos((x / 32) * Math.PI * 2) * 2;
  const isRipple2 = Math.abs((y - 22) - r3) < 0.9;
  const isGlint2 = isRipple2 && (x >= 24 && x <= 28);

  if (isGlint1 || isGlint2) return waterPal.glint;
  if (isRipple1 || isRipple2) return waterPal.ripple;

  // Secondary soft wave band
  if (Math.abs((y - 14) - r2) < 1.2) return waterPal.light;

  // Deep subtle gradient
  if (y % 4 === 0) return waterPal.deep;

  return waterPal.body;
});

fs.writeFileSync('public/map/pixel_water_tile.png', waterPNG);
console.log('Created public/map/pixel_water_tile.png (32x32)');

// 16-BIT LOTUS LILYPAD & BLOSSOM SPRITE (48x48)
const lotusPNG = createPNG(48, 48, (x, y) => {
  const cx = 24;
  const cy = 24;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Lily Pad: radius 18, with a V-notch on the right (angle around 0 rad)
  if (dist <= 18) {
    const angle = Math.atan2(dy, dx); // -pi to pi
    // Notch cut: angle between -0.3 and 0.3
    if (dist > 3 && angle > -0.28 && angle < 0.28) {
      return [0, 0, 0, 0]; // Notch gap
    }

    // Outer rim highlight
    if (dist >= 16.5) {
      return [74, 222, 128, 255]; // #4ade80 bright lime rim
    }
    // Veins / radial lines
    const isVein = (Math.abs(dx) <= 1 && dy < 0) || (Math.abs(dy) <= 1 && dx < 0) || (Math.abs(dx + dy) <= 1);
    if (isVein && dist > 5) {
      return [34, 197, 94, 255]; // #22c55e vein
    }
    // Main leaf body
    if (dist < 8) return [21, 128, 61, 255]; // #15803d
    return [22, 163, 74, 255]; // #16a34a
  }

  // Soft water contact shadow
  if (dist <= 20) {
    return [8, 47, 73, 120];
  }

  return [0, 0, 0, 0];
});

fs.writeFileSync('public/map/prop_lotus_pad.png', lotusPNG);
console.log('Created public/map/prop_lotus_pad.png (48x48)');

// 16-BIT BLOOMING PINK LOTUS FLOWER (32x32)
const flowerPNG = createPNG(32, 32, (x, y) => {
  const cx = 16;
  const cy = 16;
  const dx = Math.abs(x - cx);
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Golden Center Pistil / Stamen (dist <= 3)
  if (dist <= 3) {
    if (dist <= 1.5) return [254, 240, 138, 255]; // #fef08a bright gold
    return [245, 158, 11, 255]; // #f59e0b
  }

  // Inner Petals (dist <= 7)
  if (dist <= 7) {
    if (y < cy) return [255, 255, 255, 255]; // Pure white petal tip
    return [244, 114, 182, 255]; // #f472b6
  }

  // Outer Flared Petals (dist <= 12)
  if (dist <= 12) {
    // 6 distinct petal lobes
    const angle = Math.atan2(dy, (x - cx));
    const petalFactor = Math.sin(angle * 6);
    if (dist <= 9 + petalFactor * 2.8) {
      if (dist >= 8.5 + petalFactor * 2.8) {
        return [236, 72, 153, 255]; // #ec4899 magenta outline
      }
      if (y < cy - 2) return [251, 207, 232, 255]; // #fbcfe8 soft pink
      return [244, 114, 182, 255];
    }
  }

  return [0, 0, 0, 0];
});

fs.writeFileSync('public/map/prop_lotus_flower.png', flowerPNG);
console.log('Created public/map/prop_lotus_flower.png (32x32)');

// 16-BIT NISHIKIGOI (KOI FISH) SILHOUETTE (24x24)
const koiPNG = createPNG(24, 24, (x, y) => {
  // S-curved swimming koi fish facing northeast
  const cx = 12;
  const cy = 12;
  // Body line: y = -x + 24
  const dDiag = Math.abs((x + y) - 24);
  const len = Math.sqrt((x - 4) * (x - 4) + (y - 20) * (y - 20));

  if (dDiag <= 3.2 && len <= 18) {
    // Head at top-right (x: 18, y: 6)
    if (x >= 16 && y <= 8) {
      return [255, 255, 255, 230]; // White snout
    }
    // Red / Kohaku orange markings
    if ((x >= 10 && x <= 14) || (x >= 6 && x <= 8)) {
      return [239, 68, 68, 240]; // #ef4444 vibrant koi red
    }
    // Black Sumi spot
    if (x === 11 && y === 13) {
      return [15, 23, 42, 240]; // #0f172a
    }
    return [248, 250, 252, 230]; // Pearl white body
  }

  // Fins / Tail fan
  if (x <= 6 && y >= 17 && dDiag <= 5) {
    return [254, 205, 211, 160]; // Translucent pink fin
  }

  return [0, 0, 0, 0];
});

fs.writeFileSync('public/map/prop_koi_fish.png', koiPNG);
console.log('Created public/map/prop_koi_fish.png (24x24)');
