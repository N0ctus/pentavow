import fs from 'fs';
import zlib from 'zlib';
import jpeg from 'jpeg-js';

const buf = fs.readFileSync('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/feudal_japan_pixel_sprites_1795422046562.jpg');
const decoded = jpeg.decode(buf, { useTArray: true });
const { width, height, data } = decoded;

function getPx(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return [0, 0, 0, 0];
  const idx = (y * width + x) * 4;
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
}

// Minimal PNG writer
function writePNG(outPath, w, h, getPixelRGBA) {
  const bytesPerPixel = 4;
  const rowSize = w * bytesPerPixel + 1;
  const rawData = Buffer.alloc(rowSize * h);

  for (let y = 0; y < h; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y);
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

  const finalBuf = Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ]);

  fs.writeFileSync(outPath, finalBuf);
  console.log(`Saved: ${outPath} (${w}x${h})`);
}

function extractBox(name, x1, y1, x2, y2, bgThreshold = 44) {
  const cropW = x2 - x1 + 1;
  const cropH = y2 - y1 + 1;

  writePNG(`public/map/${name}.png`, cropW, cropH, (lx, ly) => {
    const gx = x1 + lx;
    const gy = y1 + ly;
    const [r, g, b] = getPx(gx, gy);

    // Dark charcoal background check
    // Background is near-neutral dark gray: R, G, B all < bgThreshold and close to each other
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const diff = maxVal - minVal;

    // Check if background pixel
    if (maxVal < bgThreshold && diff < 12) {
      return [0, 0, 0, 0];
    }

    // Edge softening / anti-aliasing
    if (maxVal < bgThreshold + 10 && diff < 14) {
      const alpha = Math.floor(((maxVal - bgThreshold) / 10) * 255);
      return [r, g, b, Math.max(0, Math.min(255, alpha))];
    }

    return [r, g, b, 255];
  });
}

// Extract 3 assets
extractBox('tree_sakura', 98, 12, 676, 750, 44);
extractBox('tree_pine', 780, 22, 1256, 395, 44);
extractBox('prop_torii', 835, 435, 1150, 725, 44);
