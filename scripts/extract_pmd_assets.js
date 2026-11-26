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
  console.log(`Cropped ${outPath} (${w}x${h}) from (${x0}, ${y0})`);
}

// 1. Check the Water column
// Let's inspect where the Water column starts and ends:
// x is around 616..688, y is around 210..760
// In PMD, each chunk is 3x3 tiles, each tile is 24x24 px (total 72x72 px).
// Let's test cropping a 72x72 water block:
crop(616, 212, 72, 72, 'public/map/tileset_crops/test_pmd_water_1.png');

// 2. Crop preview box water
crop(686, 74, 72, 72, 'public/map/tileset_crops/test_pmd_water_preview.png');

// 3. Crop grass from Walls (72x72)
crop(92, 212, 72, 72, 'public/map/tileset_crops/test_pmd_grass_1.png');

// 4. Crop preview box grass
crop(686, 16, 72, 54, 'public/map/tileset_crops/test_pmd_grass_preview.png');

// 5. Crop lotus from Unused Ground (around x=480, y=240)
crop(470, 235, 48, 48, 'public/map/tileset_crops/test_pmd_lotus.png');
