import fs from 'fs';
import jpeg from 'jpeg-js';
import zlib from 'zlib';

const buf = fs.readFileSync('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/.user_uploaded/media_1795431218771_19dd166f.jpg');
const { width, height, data } = jpeg.decode(buf, { useTArray: true });

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

function getMasterPx(x, y) {
  const sx = Math.min(width - 1, Math.max(0, x));
  const sy = Math.min(height - 1, Math.max(0, y));
  const i = (sy * width + sx) * 4;
  return [data[i], data[i+1], data[i+2], 255];
}

// Generate seamless 64x64 tiles by blending or sampling repeating blocks:
// For seamless tiling, we make sure left edge blends with right edge, and top edge with bottom edge.
function makeSeamlessTile(srcX, srcY, srcW, srcH, targetSize, outPath) {
  // First extract src tile buffer
  const src = [];
  for (let y = 0; y < srcH; y++) {
    const row = [];
    for (let x = 0; x < srcW; x++) {
      row.push(getMasterPx(srcX + x, srcY + y));
    }
    src.push(row);
  }

  // Resample/tile into targetSize x targetSize
  // With edge-wrapping / seamless boundary smoothing
  const png = createPNG(targetSize, targetSize, (tx, ty) => {
    // Map to src coords
    const u = (tx / targetSize) * srcW;
    const v = (ty / targetSize) * srcH;
    const ix = Math.floor(u) % srcW;
    const iy = Math.floor(v) % srcH;

    const basePx = src[iy][ix];

    // Check if near border (within blendMargin of 0 or targetSize)
    // To ensure 100% seamless tiling across repeats:
    const blendMargin = 4;
    let [r, g, b, a] = basePx;

    // Cross-blend opposite edges
    if (tx < blendMargin) {
      const alpha = (blendMargin - tx) / (blendMargin * 2);
      const oppositePx = src[iy][(ix + srcW - blendMargin) % srcW];
      r = Math.round(r * (1 - alpha) + oppositePx[0] * alpha);
      g = Math.round(g * (1 - alpha) + oppositePx[1] * alpha);
      b = Math.round(b * (1 - alpha) + oppositePx[2] * alpha);
    }
    if (ty < blendMargin) {
      const alpha = (blendMargin - ty) / (blendMargin * 2);
      const oppositePx = src[(iy + srcH - blendMargin) % srcH][ix];
      r = Math.round(r * (1 - alpha) + oppositePx[0] * alpha);
      g = Math.round(g * (1 - alpha) + oppositePx[1] * alpha);
      b = Math.round(b * (1 - alpha) + oppositePx[2] * alpha);
    }

    return [r, g, b, 255];
  });

  fs.writeFileSync(outPath, png);
  console.log(`Generated seamless tile: ${outPath} (${targetSize}x${targetSize})`);
}

// Test tile generation
makeSeamlessTile(855, 1, 40, 40, 64, 'public/map/tileset_crops/test_grass_64.png');
makeSeamlessTile(727, 1, 40, 40, 64, 'public/map/tileset_crops/test_cobble_64.png');
makeSeamlessTile(812, 1, 40, 40, 64, 'public/map/tileset_crops/test_water_64.png');
makeSeamlessTile(388, 260, 40, 40, 64, 'public/map/tileset_crops/test_void_64.png');

// Also create 2x2 tiled previews (128x128) to inspect seamlessness
function makeTiledPreview(tilePath, previewPath) {
  const tBuf = fs.readFileSync(tilePath);
  // Simple 2x2 repeat of the 64x64 tile into 128x128
  // Let's use getMasterPx from the tile itself
  // We can write a quick PNG reader or just sample the PNG data
}
