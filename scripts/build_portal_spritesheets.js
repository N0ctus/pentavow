import fs from 'fs';
import omggif from 'omggif';
import zlib from 'zlib';

function savePNG(width, height, getPixel, outPath) {
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      raw[pxOffset] = r; raw[pxOffset+1] = g; raw[pxOffset+2] = b; raw[pxOffset+3] = a;
    }
  }
  const deflated = zlib.deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : (c >>> 1);
    crcTable[n] = c >>> 0;
  }
  function makeChunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const chunkData = Buffer.concat([typeBuf, data]);
    let crc = 0xffffffff;
    for (let i = 0; i < chunkData.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ chunkData[i]) & 0xff];
    crc = (crc ^ 0xffffffff) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([signature, makeChunk('IHDR', ihdr), makeChunk('IDAT', deflated), makeChunk('IEND', Buffer.alloc(0))]);
  fs.writeFileSync(outPath, png);
}

const buf = fs.readFileSync('C:/Users/Noctus/Downloads/rMMKwa.gif');
const reader = new omggif.GifReader(buf);

const numFrames = 26;
const canvas = Buffer.alloc(reader.width * reader.height * 4);
const frames = [];

for (let i = 0; i < numFrames; i++) {
  const info = reader.frameInfo(i);
  let backup = null;
  if (info.disposal === 3) backup = Buffer.from(canvas);
  reader.decodeAndBlitFrameRGBA(i, canvas);
  frames.push(Buffer.from(canvas));

  if (info.disposal === 2) {
    for (let y = info.y; y < info.y + info.height; y++) {
      for (let x = info.x; x < info.x + info.width; x++) {
        const idx = (y * reader.width + x) * 4;
        canvas[idx] = 0; canvas[idx+1] = 0; canvas[idx+2] = 0; canvas[idx+3] = 0;
      }
    }
  } else if (info.disposal === 3 && backup) {
    backup.copy(canvas);
  }
}

// Exactly frameW = 146, frameH = 140, cropY = 117
const frameW = 146;
const frameH = 140;
const cropY = 117;

function getCleanPixel(frame, srcX, srcY) {
  if (srcX < 0 || srcX >= reader.width || srcY < 0 || srcY >= reader.height) return [0, 0, 0, 0];
  const idx = (srcY * reader.width + srcX) * 4;
  const r = frame[idx];
  const g = frame[idx+1];
  const b = frame[idx+2];

  // Dist from purple background #3e306c (62, 48, 108)
  const dist = Math.abs(r - 62) + Math.abs(g - 48) + Math.abs(b - 108);
  if (dist < 26) {
    return [0, 0, 0, 0];
  }
  let a = 255;
  if (dist < 44) {
    a = Math.round(((dist - 26) / 18) * 255);
  }
  return [r, g, b, a];
}

const elements = [
  { name: 'arcane', centerX: 82 },
  { name: 'fire', centerX: 216 },
  { name: 'frost', centerX: 350 },
  { name: 'toxic', centerX: 484 },
  { name: 'holy', centerX: 618 },
  { name: 'blood', centerX: 752 },
  { name: 'necrotic', centerX: 886 },
];

for (const el of elements) {
  const startX = el.centerX - Math.floor(frameW / 2);
  const sheetW = frameW * numFrames;
  const sheetH = frameH;

  const publicPath = `public/portals/portal_cycle_${el.name}.png`;
  const distPath = `dist/portals/portal_cycle_${el.name}.png`;

  savePNG(sheetW, sheetH, (x, y) => {
    const f = Math.floor(x / frameW);
    const fx = x % frameW;
    const srcX = startX + fx;
    const srcY = cropY + y;
    return getCleanPixel(frames[f], srcX, srcY);
  }, publicPath);

  fs.copyFileSync(publicPath, distPath);
  console.log(`Saved ${publicPath} and ${distPath} (${sheetW}x${sheetH})`);
}
