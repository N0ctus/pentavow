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

// 1. Water analysis:
// Candidate A: 24x24 at x=713, y=97 (preview flowing wave)
// Candidate B: 48x48 constructed from 24x24
// Let's create seamless 24x24 and 48x48
function makeSeamless(srcX, srcY, size) {
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sIdx = ((srcY + y) * img.width + (srcX + x)) * 4;
      const dIdx = (y * size + x) * 4;
      buf[dIdx] = img.pixels[sIdx];
      buf[dIdx+1] = img.pixels[sIdx+1];
      buf[dIdx+2] = img.pixels[sIdx+2];
      buf[dIdx+3] = 255;
    }
  }
  // Soft edge blending over 2 boundary pixels
  for (let y = 0; y < size; y++) {
    const leftIdx = (y * size) * 4;
    const rightIdx = (y * size + size - 1) * 4;
    for (let c = 0; c < 3; c++) {
      const avg = Math.round((buf[leftIdx + c] + buf[rightIdx + c]) / 2);
      buf[leftIdx + c] = avg;
      buf[rightIdx + c] = avg;
    }
  }
  for (let x = 0; x < size; x++) {
    const topIdx = x * 4;
    const btmIdx = ((size - 1) * size + x) * 4;
    for (let c = 0; c < 3; c++) {
      const avg = Math.round((buf[topIdx + c] + buf[btmIdx + c]) / 2);
      buf[topIdx + c] = avg;
      buf[btmIdx + c] = avg;
    }
  }
  return buf;
}

// 2. Tile seamless 24x24 into 48x48 for optimal rendering
const water24 = makeSeamless(713, 97, 24);
const water48 = Buffer.alloc(48 * 48 * 4);
for (let y = 0; y < 48; y++) {
  for (let x = 0; x < 48; x++) {
    const sIdx = ((y % 24) * 24 + (x % 24)) * 4;
    const dIdx = (y * 48 + x) * 4;
    water48[dIdx] = water24[sIdx];
    water48[dIdx+1] = water24[sIdx+1];
    water48[dIdx+2] = water24[sIdx+2];
    water48[dIdx+3] = 255;
  }
}
writePNG('public/map/tileset_crops/pmd_water_seamless_24.png', 24, 24, water24);
writePNG('public/map/tileset_crops/pmd_water_seamless_48.png', 48, 48, water48);
console.log('Saved seamless water tiles!');

// 3. Grass analysis:
// Let's test the preview box grass at x=710, y=18 (24x24) and x=698..746, y=14..38
const grass24 = makeSeamless(715, 20, 24);
const grass48 = Buffer.alloc(48 * 48 * 4);
for (let y = 0; y < 48; y++) {
  for (let x = 0; x < 48; x++) {
    const sIdx = ((y % 24) * 24 + (x % 24)) * 4;
    const dIdx = (y * 48 + x) * 4;
    grass48[dIdx] = grass24[sIdx];
    grass48[dIdx+1] = grass24[sIdx+1];
    grass48[dIdx+2] = grass24[sIdx+2];
    grass48[dIdx+3] = 255;
  }
}
writePNG('public/map/tileset_crops/pmd_grass_seamless_24.png', 24, 24, grass24);
writePNG('public/map/tileset_crops/pmd_grass_seamless_48.png', 48, 48, grass48);
console.log('Saved seamless grass tiles!');

// 4. Pink Lotus Flower (24x24 at x=484, y=188)
// Let's make transparent background: the background is shallow blue water [57, 156, 247], [66, 148, 247], [49, 165, 247]
const lotusBuf = Buffer.alloc(24 * 24 * 4);
for (let y = 0; y < 24; y++) {
  for (let x = 0; x < 24; x++) {
    const sIdx = ((188 + y) * img.width + (484 + x)) * 4;
    const dIdx = (y * 24 + x) * 4;
    const r = img.pixels[sIdx], g = img.pixels[sIdx+1], b = img.pixels[sIdx+2];
    lotusBuf[dIdx] = r;
    lotusBuf[dIdx+1] = g;
    lotusBuf[dIdx+2] = b;
    // Transparent if it's the blue background water
    // Water in this cell has b > 220 && g in 130..180 && r in 40..70
    if (b > 220 && g > 130 && r < 80) {
      lotusBuf[dIdx+3] = 0; // transparent
    } else {
      lotusBuf[dIdx+3] = 255; // opaque petal / leaf / pad
    }
  }
}
writePNG('public/map/tileset_crops/pmd_lotus_flower_24.png', 24, 24, lotusBuf);
console.log('Saved transparent PMD lotus flower!');
