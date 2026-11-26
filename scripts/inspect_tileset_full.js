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

function cropToPNG(x0, y0, cropW, cropH, outPath) {
  const pngBuf = createPNG(cropW, cropH, (x, y) => {
    const sx = Math.min(width - 1, Math.max(0, x0 + x));
    const sy = Math.min(height - 1, Math.max(0, y0 + y));
    const idx = (sy * width + sx) * 4;
    return [data[idx], data[idx + 1], data[idx + 2], 255];
  });
  fs.writeFileSync(outPath, pngBuf);
  console.log(`Saved ${outPath} (${cropW}x${cropH})`);
}

// Ensure output directory
fs.mkdirSync('public/map/tileset_crops', { recursive: true });

// Crop 4 quadrants to inspect them clearly
cropToPNG(0, 64, 512, 256, 'public/map/tileset_crops/quad_top_left.png');
cropToPNG(512, 0, 512, 320, 'public/map/tileset_crops/quad_top_right.png');
cropToPNG(0, 320, 512, 342, 'public/map/tileset_crops/quad_bottom_left.png');
cropToPNG(512, 320, 512, 342, 'public/map/tileset_crops/quad_bottom_right.png');
