import fs from 'fs';
import zlib from 'zlib';

function readPNG(p) {
  const buf = fs.readFileSync(p);
  let pos = 8;
  let width, height, idatBuffers = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idatBuffers.push(data);
    }
    pos += 12 + len;
  }
  const inflated = zlib.inflateSync(Buffer.concat(idatBuffers));
  const rowSize = width * 4 + 1;
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const filter = inflated[y * rowSize];
    const rowOffset = y * rowSize + 1;
    for (let x = 0; x < width * 4; x++) {
      let val = inflated[rowOffset + x];
      const a = x >= 4 ? pixels[y * width * 4 + x - 4] : 0;
      const b = y > 0 ? pixels[(y - 1) * width * 4 + x] : 0;
      const c = (x >= 4 && y > 0) ? pixels[(y - 1) * width * 4 + x - 4] : 0;
      if (filter === 1) val = (val + a) & 0xff;
      else if (filter === 2) val = (val + b) & 0xff;
      else if (filter === 3) val = (val + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        val = (val + pr) & 0xff;
      }
      pixels[y * width * 4 + x] = val;
    }
  }
  return { width, height, pixels };
}

function writePNG(p, width, height, pixels) {
  const rowSize = width * 4 + 1;
  const uncompressed = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    uncompressed[y * rowSize] = 0;
    pixels.copy(uncompressed, y * rowSize + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(uncompressed);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    const crcVal = zlib.crc32(Buffer.concat([typeBuf, data]));
    crc.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }
  const out = Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
  fs.writeFileSync(p, out);
}

const p = 'C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/.user_uploaded/media_1795499173968_727f4de9.png';
const img = readPNG(p);

function crop(x0, y0, w, h, outPath) {
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = ((y0 + y) * img.width + (x0 + x)) * 4;
      const dstIdx = (y * w + x) * 4;
      buf[dstIdx] = img.pixels[srcIdx];
      buf[dstIdx+1] = img.pixels[srcIdx+1];
      buf[dstIdx+2] = img.pixels[srcIdx+2];
      buf[dstIdx+3] = img.pixels[srcIdx+3];
    }
  }
  writePNG(outPath, w, h, buf);
  console.log('Saved ' + outPath + ' (' + w + 'x' + h + ')');
}

// In PMD tilesets, grid lines are at intervals:
// Let's check row 1: y = 213..285 (height 72 = 3 * 24)
// Walls column: x = 89..161 (width 72 = 3 * 24)
// Water column: x = 611..683 (width 72 = 3 * 24)

// 1. Center seamless grass tile (24x24)
crop(89 + 24, 213 + 24, 24, 24, 'public/map/tileset_crops/pmd_grass_tile_24.png');

// 2. Full 3x3 grass block (72x72)
crop(89, 213, 72, 72, 'public/map/tileset_crops/pmd_grass_block_72.png');

// 3. Center seamless water tile (24x24)
crop(611 + 24, 213 + 24, 24, 24, 'public/map/tileset_crops/pmd_water_tile_24.png');

// 4. Full 3x3 water block (72x72)
crop(611, 213, 72, 72, 'public/map/tileset_crops/pmd_water_block_72.png');

// 5. Water from preview box (flowing wave pattern, 64x64)
crop(698, 62, 64, 64, 'public/map/tileset_crops/pmd_water_flowing_64.png');

// 6. Grass bank with reeds from preview box (64x40)
crop(698, 16, 64, 40, 'public/map/tileset_crops/pmd_grass_reeds_bank_64x40.png');

// 7. Pink lotus flower on lily pad (from Unused Ground, around x=470..518, y=240..270)
// Let's find exact coordinates of the lotus flower:
let lotusMinX = 999, lotusMaxX = 0, lotusMinY = 999, lotusMaxY = 0;
for (let y = 230; y < 290; y++) {
  for (let x = 460; x < 530; x++) {
    const idx = (y * img.width + x) * 4;
    const r = img.pixels[idx], g = img.pixels[idx+1], b = img.pixels[idx+2];
    // Pink petals: r > 180 && g < 100 && b > 80
    if (r > 180 && g < 100 && b > 80) {
      if (x < lotusMinX) lotusMinX = x;
      if (x > lotusMaxX) lotusMaxX = x;
      if (y < lotusMinY) lotusMinY = y;
      if (y > lotusMaxY) lotusMaxY = y;
    }
  }
}
console.log('Lotus flower bounds: x=' + lotusMinX + '..' + lotusMaxX + ', y=' + lotusMinY + '..' + lotusMaxY);
if (lotusMinX < 999) {
  crop(lotusMinX - 4, lotusMinY - 4, (lotusMaxX - lotusMinX + 9), (lotusMaxY - lotusMinY + 9), 'public/map/tileset_crops/pmd_lotus_flower.png');
}
