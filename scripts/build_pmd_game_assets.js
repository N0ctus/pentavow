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

const pmdPath = 'C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/.user_uploaded/media_1795499173968_727f4de9.png';
const img = readPNG(pmdPath);

// ==========================================
// 1. SEAMLESS PMD WATER TILE (48x48)
// ==========================================
// Preview box flowing wave: x=713, y=97 (size 24x24)
// Perfectly blended seams so tiling diff is exactly 0
const water24 = Buffer.alloc(24 * 24 * 4);
for (let y = 0; y < 24; y++) {
  for (let x = 0; x < 24; x++) {
    const sIdx = ((97 + y) * img.width + (713 + x)) * 4;
    const dIdx = (y * 24 + x) * 4;
    water24[dIdx] = img.pixels[sIdx];
    water24[dIdx+1] = img.pixels[sIdx+1];
    water24[dIdx+2] = img.pixels[sIdx+2];
    water24[dIdx+3] = 255;
  }
}
// Soft 1px edge match for mathematical seamlessness
for (let y = 0; y < 24; y++) {
  const l = (y * 24) * 4;
  const r = (y * 24 + 23) * 4;
  for (let c = 0; c < 3; c++) {
    const avg = Math.round((water24[l+c] + water24[r+c]) / 2);
    water24[l+c] = avg;
    water24[r+c] = avg;
  }
}
for (let x = 0; x < 24; x++) {
  const t = x * 4;
  const b = (23 * 24 + x) * 4;
  for (let c = 0; c < 3; c++) {
    const avg = Math.round((water24[t+c] + water24[b+c]) / 2);
    water24[t+c] = avg;
    water24[b+c] = avg;
  }
}

// Tile 24x24 into 48x48
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
writePNG('public/map/pixel_water_tile.png', 48, 48, water48);
console.log('Saved public/map/pixel_water_tile.png (48x48 seamless PMD water)');

// ==========================================
// 2. SEAMLESS PMD LUSH GRASS TILE (48x48)
// ==========================================
// Authentic PMD grass blade texture from Walls interior (x=109..132, y=513..536)
// Composed seamlessly across 48x48
const grass24 = Buffer.alloc(24 * 24 * 4);
for (let y = 0; y < 24; y++) {
  for (let x = 0; x < 24; x++) {
    const sIdx = ((513 + y) * img.width + (109 + x)) * 4;
    const dIdx = (y * 24 + x) * 4;
    grass24[dIdx] = img.pixels[sIdx];
    grass24[dIdx+1] = img.pixels[sIdx+1];
    grass24[dIdx+2] = img.pixels[sIdx+2];
    grass24[dIdx+3] = 255;
  }
}
// Soft 1px edge match for mathematical seamlessness
for (let y = 0; y < 24; y++) {
  const l = (y * 24) * 4;
  const r = (y * 24 + 23) * 4;
  for (let c = 0; c < 3; c++) {
    const avg = Math.round((grass24[l+c] + grass24[r+c]) / 2);
    grass24[l+c] = avg;
    grass24[r+c] = avg;
  }
}
for (let x = 0; x < 24; x++) {
  const t = x * 4;
  const b = (23 * 24 + x) * 4;
  for (let c = 0; c < 3; c++) {
    const avg = Math.round((grass24[t+c] + grass24[b+c]) / 2);
    grass24[t+c] = avg;
    grass24[b+c] = avg;
  }
}

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
writePNG('public/map/pixel_grass_tile.png', 48, 48, grass48);
console.log('Saved public/map/pixel_grass_tile.png (48x48 seamless PMD grass)');

// ==========================================
// 3. PMD PINK LOTUS BLOSSOM (24x24)
// ==========================================
const lotusBuf = Buffer.alloc(24 * 24 * 4);
for (let y = 0; y < 24; y++) {
  for (let x = 0; x < 24; x++) {
    const sIdx = ((188 + y) * img.width + (484 + x)) * 4;
    const dIdx = (y * 24 + x) * 4;
    const r = img.pixels[sIdx], g = img.pixels[sIdx+1], b = img.pixels[sIdx+2];
    lotusBuf[dIdx] = r;
    lotusBuf[dIdx+1] = g;
    lotusBuf[dIdx+2] = b;
    // Blue water background in this cell: b > 220 && g > 130 && r < 80
    if (b > 220 && g > 130 && r < 80) {
      lotusBuf[dIdx+3] = 0;
    } else {
      lotusBuf[dIdx+3] = 255;
    }
  }
}
writePNG('public/map/prop_lotus_flower.png', 24, 24, lotusBuf);
console.log('Saved public/map/prop_lotus_flower.png (PMD pink lotus blossom)');

// ==========================================
// 4. PMD LILY PADS (24x24) from Ground Alt. 1
// ==========================================
// Column 13, row 0: x=334..357, y=188..211
const lilyBuf = Buffer.alloc(24 * 24 * 4);
for (let y = 0; y < 24; y++) {
  for (let x = 0; x < 24; x++) {
    const sIdx = ((188 + y) * img.width + (334 + x)) * 4;
    const dIdx = (y * 24 + x) * 4;
    const r = img.pixels[sIdx], g = img.pixels[sIdx+1], b = img.pixels[sIdx+2];
    lilyBuf[dIdx] = r;
    lilyBuf[dIdx+1] = g;
    lilyBuf[dIdx+2] = b;
    // Blue water background: b > 200 && g > 120 && r < 80
    if (b > 200 && g > 120 && r < 80) {
      lilyBuf[dIdx+3] = 0;
    } else {
      lilyBuf[dIdx+3] = 255;
    }
  }
}
writePNG('public/map/prop_lilypad_cluster.png', 24, 24, lilyBuf);
console.log('Saved public/map/prop_lilypad_cluster.png (PMD lily pads)');

// ==========================================
// 5. PMD REED TUFTS (24x24) from Wall Alt.
// ==========================================
// Column 7, row 0: x=184..207, y=188..211
const reedBuf = Buffer.alloc(24 * 24 * 4);
for (let y = 0; y < 24; y++) {
  for (let x = 0; x < 24; x++) {
    const sIdx = ((188 + y) * img.width + (184 + x)) * 4;
    const dIdx = (y * 24 + x) * 4;
    const r = img.pixels[sIdx], g = img.pixels[sIdx+1], b = img.pixels[sIdx+2];
    reedBuf[dIdx] = r;
    reedBuf[dIdx+1] = g;
    reedBuf[dIdx+2] = b;
    reedBuf[dIdx+3] = 255;
  }
}
writePNG('public/map/prop_reed_tuft.png', 24, 24, reedBuf);
console.log('Saved public/map/prop_reed_tuft.png (PMD reed tufts)');
