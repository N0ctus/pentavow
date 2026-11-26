import fs from 'fs';
import zlib from 'zlib';

function createPNG(w, h, getPixel) {
  const bytesPerPixel = 4;
  const rowSize = w * bytesPerPixel + 1;
  const rawData = Buffer.alloc(rowSize * h);

  for (let y = 0; y < h; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < w; x++) {
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
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
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

// 32x56 Pixel Art Japanese Stone Lantern (Ishidoro)
const w = 32;
const h = 56;
const cx = 16;

// Palette
const P = {
  trans: [0, 0, 0, 0],
  darkGrout: [30, 41, 59, 255],     // #1e293b
  darkStone: [51, 65, 85, 255],     // #334155
  midStone: [71, 85, 105, 255],     // #475569
  lightStone: [100, 116, 139, 255], // #64748b
  stoneHl: [148, 163, 184, 255],    // #94a3b8
  mossGreen: [45, 106, 79, 255],    // #2d6a4f
  mossHl: [82, 183, 136, 255],      // #52b788
  amberGlow: [245, 158, 11, 255],   // #f59e0b
  brightFire: [254, 240, 138, 255], // #fef08a
  woodLattice: [69, 26, 3, 255]     // #451a03
};

const lanternPNG = createPNG(w, h, (x, y) => {
  const dx = Math.abs(x - cx);

  // 1. TOP FINIAL / JEWEL (Hoju: y: 2 to 7)
  if (y >= 2 && y <= 4) {
    if (dx <= 2) return (x < cx) ? P.stoneHl : P.midStone;
    if (dx === 3) return P.darkGrout;
  }
  if (y >= 5 && y <= 6) {
    if (dx <= 3) return (x < cx) ? P.lightStone : P.darkStone;
    if (dx === 4) return P.darkGrout;
  }
  if (y === 7) {
    if (dx <= 4) return P.darkStone;
  }

  // 2. PAGODA ROOF (Kasa: y: 8 to 18)
  if (y >= 8 && y <= 18) {
    const roofProgress = (y - 8) / 10; // 0 to 1
    const halfWidth = Math.round(5 + roofProgress * 9); // flaring out from 5 to 14
    if (dx === halfWidth) return P.darkGrout;
    if (dx < halfWidth) {
      // Moss on roof
      if (y >= 10 && y <= 13 && x % 4 === 1) return P.mossGreen;
      if (y >= 11 && y <= 12 && x % 4 === 2) return P.mossHl;
      // Shading
      if (x < cx - 3) return P.stoneHl;
      if (x < cx) return P.lightStone;
      if (x > cx + 4) return P.darkStone;
      return P.midStone;
    }
    // Upturned roof corners on y=18
    if (y === 17 && (dx === halfWidth + 1)) return P.stoneHl;
  }

  // Roof under-rim shadow
  if (y === 19 && dx <= 11) {
    return P.darkGrout;
  }

  // 3. FIRE CHAMBER (Hibukuro: y: 20 to 32)
  if (y >= 20 && y <= 32) {
    // Outer wooden frame posts at dx: 6 and 7
    if (dx >= 7 && dx <= 8) return P.woodLattice;
    if (dx === 6) return P.darkGrout;
    // Top and bottom crossbars
    if (y === 20 || y === 32) {
      if (dx <= 7) return P.woodLattice;
    }
    // Window opening with paper & flame (dx <= 5)
    if (dx <= 5) {
      // Vertical lattice bar in center
      if (dx === 0) return P.woodLattice;
      // Flame glowing core in center
      if (y >= 24 && y <= 28 && dx <= 2) {
        if (dx === 1 && (y === 25 || y === 26)) return P.brightFire;
        return P.amberGlow;
      }
      // Amber ambient paper
      return (y % 2 === 0) ? [217, 119, 6, 230] : [245, 158, 11, 240];
    }
  }

  // 4. PLATFORM BENEATH CHAMBER (Chudai: y: 33 to 38)
  if (y >= 33 && y <= 38) {
    const platHalfW = y <= 35 ? 9 : 8;
    if (dx === platHalfW) return P.darkGrout;
    if (dx < platHalfW) {
      if (x < cx - 2) return P.lightStone;
      if (x > cx + 2) return P.darkStone;
      return P.midStone;
    }
  }

  // 5. STONE COLUMN SHAFT (Sao: y: 39 to 47)
  if (y >= 39 && y <= 47) {
    if (dx === 5) return P.darkGrout;
    if (dx < 5) {
      // Moss spot
      if (y >= 43 && y <= 45 && dx === 2) return P.mossGreen;
      if (x < cx - 1) return P.lightStone;
      if (x > cx + 1) return P.darkStone;
      return P.midStone;
    }
  }

  // 6. TIERED BASE PEDESTAL (Kiso: y: 48 to 54)
  if (y >= 48 && y <= 50) {
    if (dx === 8) return P.darkGrout;
    if (dx < 8) return (x < cx) ? P.midStone : P.darkStone;
  }
  if (y >= 51 && y <= 54) {
    if (dx === 11) return P.darkGrout;
    if (dx < 11) {
      if (y >= 52 && (x % 3 === 0)) return P.mossGreen;
      return (x < cx) ? P.lightStone : P.darkStone;
    }
  }

  // Ground shadow underneath lantern
  if (y === 55 && dx <= 12) {
    return [2, 6, 23, 110]; // Soft dark shadow
  }

  return P.trans;
});

fs.writeFileSync('public/map/prop_lantern.png', lanternPNG);
console.log('Created public/map/prop_lantern.png (32x56)');
