const fs = require('fs');
const zlib = require('zlib');
const jpeg = require('jpeg-js');

const buf = fs.readFileSync('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/.user_uploaded/media_1795431218771_19dd166f.jpg');
const sheet = jpeg.decode(buf, { useTArray: true });

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}
function crc32(b) {
  let c = -1;
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function encodePng(width, height, rgbaBuffer) {
  const stride = width * 4;
  const filtered = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    filtered[y * (stride + 1)] = 0;
    rgbaBuffer.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const deflated = zlib.deflateSync(filtered, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const c = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(c, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([sig, makeChunk('IHDR', ihdr), makeChunk('IDAT', deflated), makeChunk('IEND', Buffer.alloc(0))]);
}

function crop(x0, y0, w, h, outPath) {
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.max(0, Math.min(sheet.width - 1, x0 + x));
      const sy = Math.max(0, Math.min(sheet.height - 1, y0 + y));
      const srcIdx = (sy * sheet.width + sx) * 4;
      const dstIdx = (y * w + x) * 4;
      out[dstIdx] = sheet.data[srcIdx];
      out[dstIdx + 1] = sheet.data[srcIdx + 1];
      out[dstIdx + 2] = sheet.data[srcIdx + 2];
      out[dstIdx + 3] = 255;
    }
  }
  fs.writeFileSync(outPath, encodePng(w, h, out));
  console.log(`Saved: ${outPath} (${w}x${h})`);
}

// 1. The exact pool from the user's attachment (sand/pebble water pool)
// Matched at x=38, y=176 with size 138x106
crop(38, 176, 138, 106, 'public/map/tileset_crops/user_reference_pool.png');

// 2. Full 3x3 autotile block for the sand/pebble water pool (x: 32..176, y: 160..256)
crop(32, 160, 144, 96, 'public/map/tileset_crops/sand_pool_full.png');

// 3. Grass water pool (x: 32..176, y: 64..160)
crop(32, 64, 144, 96, 'public/map/tileset_crops/grass_pool_full.png');

// 4. Molten lava pool (x: 176..320, y: 0..96)
crop(176, 0, 144, 96, 'public/map/tileset_crops/lava_pool_full.png');

// 5. Cavern abyss chasm pool (x: 480..624, y: 0..96)
crop(480, 0, 144, 96, 'public/map/tileset_crops/abyss_pool_full.png');

// 6. Stone embankment canal (x: 0..128, y: 0..96)
crop(0, 0, 128, 96, 'public/map/tileset_crops/stone_canal_full.png');

console.log('All shoreline autotile blocks extracted successfully!');
