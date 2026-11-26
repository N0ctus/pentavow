const fs = require('fs');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function encodePng(width, height, rgbaBuffer) {
  const stride = width * 4;
  const filtered = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    filtered[y * (stride + 1)] = 0; // Filter 0: None
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
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function decodePng(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8;
  let width = 0, height = 0;
  const idatChunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idatChunks.push(buf.subarray(pos + 8, pos + 8 + len));
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const rawData = Buffer.alloc(width * height * 4);
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  let srcPos = 0;
  let prevRow = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = decompressed[srcPos++];
    const row = Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const byte = decompressed[srcPos++];
      let a = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
      let b = prevRow[x];
      let c = x >= bytesPerPixel ? prevRow[x - bytesPerPixel] : 0;
      let val = 0;
      if (filter === 0) val = byte;
      else if (filter === 1) val = (byte + a) & 0xff;
      else if (filter === 2) val = (byte + b) & 0xff;
      else if (filter === 3) val = (byte + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        let p = a + b - c;
        let pa = Math.abs(p - a);
        let pb = Math.abs(p - b);
        let pc = Math.abs(p - c);
        let pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        val = (byte + pr) & 0xff;
      }
      row[x] = val;
    }
    row.copy(rawData, y * stride);
    prevRow = row;
  }
  return { width, height, data: rawData };
}

// ==========================================
// 1. EXTRACT 100% SEAMLESS CAUSTIC WATER TILE
// ==========================================
console.log('Processing Water Tile...');
const waterSrc = decodePng('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/.user_uploaded/media_1795435716941_995be427.png');
const waterTile = Buffer.alloc(60 * 60 * 4);
for (let y = 0; y < 60; y++) {
  for (let x = 0; x < 60; x++) {
    const srcIdx = ((y + 5) * waterSrc.width + (x + 1)) * 4;
    const dstIdx = (y * 60 + x) * 4;
    waterTile[dstIdx] = waterSrc.data[srcIdx];
    waterTile[dstIdx + 1] = waterSrc.data[srcIdx + 1];
    waterTile[dstIdx + 2] = waterSrc.data[srcIdx + 2];
    waterTile[dstIdx + 3] = 255;
  }
}
fs.writeFileSync('public/map/pixel_water_tile.png', encodePng(60, 60, waterTile));
console.log('Saved public/map/pixel_water_tile.png (60x60 seamless)');

// ==========================================
// 2. EXTRACT AUTHENTIC LOTUS TILES & PROPS
// ==========================================
console.log('Processing Lotus Props...');
const lotusSrc = decodePng('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/.user_uploaded/media_1795435804008_3ca2b6d4.png');

// Key out grey background #e0e0e0 (rgb: 224, 224, 224)
const lotusKeyed = Buffer.alloc(lotusSrc.width * lotusSrc.height * 4);
for (let y = 0; y < lotusSrc.height; y++) {
  for (let x = 0; x < lotusSrc.width; x++) {
    const idx = (y * lotusSrc.width + x) * 4;
    if (x >= 337) {
      // Crop out right artifact border
      lotusKeyed[idx + 3] = 0;
      continue;
    }
    const r = lotusSrc.data[idx];
    const g = lotusSrc.data[idx + 1];
    const b = lotusSrc.data[idx + 2];
    
    // Background check: grey has r ~ g ~ b ~ 224
    const diffR = Math.abs(r - 224);
    const diffG = Math.abs(g - 224);
    const diffB = Math.abs(b - 224);
    const maxDiff = Math.max(diffR, diffG, diffB);
    
    if (maxDiff <= 18) {
      lotusKeyed[idx + 3] = 0; // Transparent
    } else {
      lotusKeyed[idx] = r;
      lotusKeyed[idx + 1] = g;
      lotusKeyed[idx + 2] = b;
      lotusKeyed[idx + 3] = 255;
    }
  }
}

// Function to crop a rectangular subregion tightly to non-zero alpha
function cropSubregion(srcData, srcWidth, srcHeight, rx, ry, rw, rh) {
  let minX = rw, maxX = 0, minY = rh, maxY = 0;
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      const idx = ((ry + y) * srcWidth + (rx + x)) * 4;
      if (srcData[idx + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (minX > maxX || minY > maxY) return null;
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const cropBuf = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const sIdx = ((ry + minY + y) * srcWidth + (rx + minX + x)) * 4;
      const dIdx = (y * cw + x) * 4;
      cropBuf[dIdx] = srcData[sIdx];
      cropBuf[dIdx + 1] = srcData[sIdx + 1];
      cropBuf[dIdx + 2] = srcData[sIdx + 2];
      cropBuf[dIdx + 3] = srcData[sIdx + 3];
    }
  }
  return { width: cw, height: ch, data: cropBuf };
}

// Cluster 1 (Top cluster: lily pads + 2 pink flowers with ripples)
const cluster1 = cropSubregion(lotusKeyed, lotusSrc.width, lotusSrc.height, 0, 0, 336, 175);
if (cluster1) {
  fs.writeFileSync('public/map/prop_lotus_cluster_1.png', encodePng(cluster1.width, cluster1.height, cluster1.data));
  console.log('Saved public/map/prop_lotus_cluster_1.png (' + cluster1.width + 'x' + cluster1.height + ')');
}

// Cluster 2 (Bottom cluster: dense lily pads + 5 pink flowers with ripples)
const cluster2 = cropSubregion(lotusKeyed, lotusSrc.width, lotusSrc.height, 0, 205, 336, 327);
if (cluster2) {
  fs.writeFileSync('public/map/prop_lotus_cluster_2.png', encodePng(cluster2.width, cluster2.height, cluster2.data));
  console.log('Saved public/map/prop_lotus_cluster_2.png (' + cluster2.width + 'x' + cluster2.height + ')');
}

// Single blooming pink lotus flower with water ripples
const singleFlower = cropSubregion(lotusKeyed, lotusSrc.width, lotusSrc.height, 90, 205, 100, 85);
if (singleFlower) {
  fs.writeFileSync('public/map/prop_lotus_flower.png', encodePng(singleFlower.width, singleFlower.height, singleFlower.data));
  console.log('Saved public/map/prop_lotus_flower.png (' + singleFlower.width + 'x' + singleFlower.height + ')');
}

// Single lily pad with water ripples
const singlePad = cropSubregion(lotusKeyed, lotusSrc.width, lotusSrc.height, 0, 40, 95, 75);
if (singlePad) {
  fs.writeFileSync('public/map/prop_lotus_pad.png', encodePng(singlePad.width, singlePad.height, singlePad.data));
  console.log('Saved public/map/prop_lotus_pad.png (' + singlePad.width + 'x' + singlePad.height + ')');
}

// ==========================================
// 3. SEAMLESS LAVA TILE FOR VOLCANO REALM
// ==========================================
console.log('Processing Lava Tile...');
const rawLava = decodePng('public/map/pixel_lava_tile_raw.png');
const LAVA_SIZE = 48;
const seamlessLava = Buffer.alloc(LAVA_SIZE * LAVA_SIZE * 4);

// Make 48x48 seamless via dual cosine cross-fade
for (let y = 0; y < LAVA_SIZE; y++) {
  const ty = (1 - Math.cos((y / (LAVA_SIZE - 1)) * Math.PI)) / 2; // 0 at top, 1 at bottom
  const sy1 = y;
  const sy2 = (y + Math.floor(LAVA_SIZE / 2)) % LAVA_SIZE;
  
  for (let x = 0; x < LAVA_SIZE; x++) {
    const tx = (1 - Math.cos((x / (LAVA_SIZE - 1)) * Math.PI)) / 2; // 0 at left, 1 at right
    const sx1 = x;
    const sx2 = (x + Math.floor(LAVA_SIZE / 2)) % LAVA_SIZE;
    
    // Sample 4 quadrants
    const idx11 = (sy1 * LAVA_SIZE + sx1) * 4;
    const idx12 = (sy1 * LAVA_SIZE + sx2) * 4;
    const idx21 = (sy2 * LAVA_SIZE + sx1) * 4;
    const idx22 = (sy2 * LAVA_SIZE + sx2) * 4;
    
    const dIdx = (y * LAVA_SIZE + x) * 4;
    for (let c = 0; c < 3; c++) {
      const top = (1 - tx) * rawLava.data[idx11 + c] + tx * rawLava.data[idx12 + c];
      const bot = (1 - tx) * rawLava.data[idx21 + c] + tx * rawLava.data[idx22 + c];
      seamlessLava[dIdx + c] = Math.round((1 - ty) * top + ty * bot);
    }
    seamlessLava[dIdx + 3] = 255;
  }
}
fs.writeFileSync('public/map/pixel_lava_tile.png', encodePng(LAVA_SIZE, LAVA_SIZE, seamlessLava));
console.log('Saved public/map/pixel_lava_tile.png (48x48 seamless)');

console.log('ALL MAP ASSETS GENERATED SUCCESSFULLY!');
