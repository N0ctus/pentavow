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

// 16-BIT RED ARCHED JAPANESE TAIKO-BASHI BRIDGE (128 x 68)
const w = 128;
const h = 68;
const cx = 64;

// Colors
const P = {
  trans: [0, 0, 0, 0],
  redOutline: [127, 29, 29, 255],   // #7f1d1d Deep lacquer crimson
  redBase: [220, 38, 38, 255],      // #dc2626 Vermilion red
  redLight: [248, 113, 113, 255],   // #f87171 Sunlit rail highlight
  woodDark: [69, 26, 3, 255],       // #451a03 Dark timber under arch
  woodPlank: [120, 53, 15, 255],    // #78350f Timber plank
  woodHl: [180, 83, 9, 255],        // #b45309 Plank highlight
  goldDark: [180, 83, 9, 255],      // #b45309 Bronze gold
  goldBase: [245, 158, 11, 255],    // #f59e0b Warm gold finial
  goldLight: [254, 240, 138, 255],  // #fef08a Gold reflection
  shadow: [8, 47, 73, 140],         // Water contact shadow
};

// Parabolic arch function: y = y_apex + a * (x - cx)^2
// Apex of deck top: y = 24. Ends at x = 12, 116 -> y = 48.
// 48 = 24 + a * (52)^2 => a = 24 / 2704 ≈ 0.00887
function deckY(x) {
  const dx = x - cx;
  return 24 + 0.00887 * dx * dx;
}

const bridgePNG = createPNG(w, h, (x, y) => {
  // Only within span x: 8 to 120
  if (x < 8 || x > 120) return P.trans;

  const dy = deckY(x); // Top of deck walking surface

  // 1. UNDER-ARCH SHADOW & WOODEN PIERS (y > dy + 8)
  if (y > dy + 8 && y < 62) {
    // Arch underside curve: apex at y = 30
    const underArchY = 32 + 0.0095 * (x - cx) * (x - cx);
    if (y < underArchY) {
      // Dark underside of wooden arch
      return P.woodDark;
    }

    // Wooden Pylons / Pilings at x = 40, x = 64, x = 88 extending into water
    const isPylon = (Math.abs(x - 40) <= 2) || (Math.abs(x - 64) <= 2) || (Math.abs(x - 88) <= 2);
    if (isPylon) {
      if (y >= underArchY) {
        if (Math.abs(x - 40) === 2 || Math.abs(x - 64) === 2 || Math.abs(x - 88) === 2) return P.redOutline;
        return (x % 2 === 0) ? P.woodPlank : P.woodHl;
      }
    }

    // Water shadow directly below bridge
    if (y >= 52 && y <= 60 && Math.abs(x - cx) <= 46) {
      return P.shadow;
    }
  }

  // 2. WOODEN DECK (Thickness: 8 pixels, from dy to dy + 8)
  if (y >= dy && y <= dy + 8) {
    // Bottom edge trim
    if (y >= dy + 7) return P.redOutline;
    // Top walking surface highlight
    if (y <= dy + 1) return P.woodHl;
    // Transverse plank lines (every 4 pixels in x)
    if (x % 4 === 0) return P.woodDark;
    return P.woodPlank;
  }

  // 3. VERMILION LACQUER RAILINGS & BALUSTERS (y from dy - 16 to dy)
  const railTopY = dy - 16;
  const railMidY = dy - 8;

  // Posts / Balusters (at x = 12, 32, 52, 64, 76, 96, 116)
  const postXList = [12, 32, 52, 64, 76, 96, 116];
  let nearPost = false;
  let isPostCenter = false;
  for (const px of postXList) {
    if (Math.abs(x - px) <= 1) nearPost = true;
    if (x === px) isPostCenter = true;
  }

  // A. GIBOSHI (Gold Onion-head Finials on posts top: y from railTopY - 5 to railTopY)
  if (nearPost && y >= railTopY - 5 && y <= railTopY) {
    const postApexY = railTopY - 4;
    if (y === railTopY - 5 && isPostCenter) return P.goldLight;
    if (y >= railTopY - 4 && y <= railTopY - 2) {
      return isPostCenter ? P.goldLight : P.goldBase;
    }
    if (y >= railTopY - 1) return P.goldDark;
  }

  // B. TOP RAIL (Lacquered curved handrail: 3px thickness)
  if (y >= railTopY && y <= railTopY + 2) {
    if (y === railTopY) return P.redLight;
    if (y === railTopY + 2) return P.redOutline;
    return P.redBase;
  }

  // C. MID RAIL (Horizontal crossbar: 2px thickness)
  if (y >= railMidY && y <= railMidY + 1) {
    return (y === railMidY) ? P.redLight : P.redOutline;
  }

  // D. VERTICAL POST SHAFT (Connecting rail to deck)
  if (nearPost && y > railTopY && y < dy) {
    return isPostCenter ? P.redLight : P.redOutline;
  }

  return P.trans;
});

fs.writeFileSync('public/map/prop_taiko_bridge.png', bridgePNG);
console.log('Created public/map/prop_taiko_bridge.png (128x68)');
