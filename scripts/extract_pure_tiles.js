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

function cropTile(x0, y0, w, h, outPath) {
  const png = createPNG(w, h, (x, y) => {
    const sx = Math.min(width - 1, Math.max(0, x0 + x));
    const sy = Math.min(height - 1, Math.max(0, y0 + y));
    const i = (sy * width + sx) * 4;
    return [data[i], data[i+1], data[i+2], 255];
  });
  fs.writeFileSync(outPath, png);
  console.log(`Extracted: ${outPath} (${w}x${h})`);
}

// 1. Pure Water Tile (Center of water pool in quad_top_left)
// Water pool is around x: 236 to 280, y: 156 to 188
cropTile(244, 158, 32, 32, 'public/map/tileset_crops/pure_water_1.png');
cropTile(352, 158, 32, 32, 'public/map/tileset_crops/pure_water_2.png');
// Water canal in row 0
cropTile(16, 100, 32, 32, 'public/map/tileset_crops/pure_water_canal.png');

// 2. Pure Grass Tile
// Top-right column 4: x: 854 to 896, y: 0 to 48 (sub-tiles at x: 855..875, y: 1..21 and 876..895, y: 1..21)
cropTile(855, 1, 20, 20, 'public/map/tileset_crops/grass_subtile_1.png');
cropTile(876, 1, 20, 20, 'public/map/tileset_crops/grass_subtile_2.png');
cropTile(855, 23, 20, 20, 'public/map/tileset_crops/grass_subtile_3.png');
cropTile(876, 23, 20, 20, 'public/map/tileset_crops/grass_subtile_4.png');
cropTile(855, 1, 40, 42, 'public/map/tileset_crops/grass_full_block.png');

// 3. Pure Cobblestone Tile
// Top-right column 1: x: 726 to 768, y: 0 to 48
cropTile(727, 1, 20, 20, 'public/map/tileset_crops/cobble_subtile_1.png');
cropTile(748, 1, 20, 20, 'public/map/tileset_crops/cobble_subtile_2.png');
cropTile(727, 1, 40, 42, 'public/map/tileset_crops/cobble_full_block.png');
// Cobblestone row 1 col 4 (rounded river cobbles)
cropTile(855, 82, 40, 40, 'public/map/tileset_crops/cobble_rounded.png');

// 4. Pure Void / Abyss / Dark Cavern Tile
// Look at the purple void portal in quad_top_right: x: 638 to 680, y: 278 to 320
cropTile(640, 280, 40, 40, 'public/map/tileset_crops/pure_void_portal.png');
// Cavern abyss pit black center: x: 520, y: 88
cropTile(520, 88, 36, 36, 'public/map/tileset_crops/pure_abyss_pit.png');
// Purple abyss tile in row 3 col 6 of quad_top_left: x: 384, y: 256
cropTile(388, 260, 40, 40, 'public/map/tileset_crops/pure_abyss_runic.png');
