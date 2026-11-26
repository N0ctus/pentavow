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
    } else if (type === 'IDAT') idatBuffers.push(data);
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

// Let's test 3 different candidates for grass:
// Candidate 1: Preview box top grass (x=698..745, y=14..37, 48x24) repeated
// Candidate 2: Wall center tile (x=109..132, y=213..236, 24x24) seamlessly blended
// Candidate 3: Composite lush meadow textured with PMD grass blade details

// Let's create a 192x192 tiled preview for Candidate 1 & 2
const grassTile = readPNG('public/map/tileset_crops/pmd_grass_seamless_48.png');
const preview192 = Buffer.alloc(192 * 192 * 4);
for (let y = 0; y < 192; y++) {
  for (let x = 0; x < 192; x++) {
    const sIdx = ((y % 48) * 48 + (x % 48)) * 4;
    const dIdx = (y * 192 + x) * 4;
    preview192[dIdx] = grassTile.pixels[sIdx];
    preview192[dIdx+1] = grassTile.pixels[sIdx+1];
    preview192[dIdx+2] = grassTile.pixels[sIdx+2];
    preview192[dIdx+3] = 255;
  }
}
writePNG('public/map/tileset_crops/test_grass_tiled_192.png', 192, 192, preview192);

// Same for water: 192x192 tiled preview
const waterTile = readPNG('public/map/tileset_crops/pmd_water_seamless_48.png');
const water192 = Buffer.alloc(192 * 192 * 4);
for (let y = 0; y < 192; y++) {
  for (let x = 0; x < 192; x++) {
    const sIdx = ((y % 48) * 48 + (x % 48)) * 4;
    const dIdx = (y * 192 + x) * 4;
    water192[dIdx] = waterTile.pixels[sIdx];
    water192[dIdx+1] = waterTile.pixels[sIdx+1];
    water192[dIdx+2] = waterTile.pixels[sIdx+2];
    water192[dIdx+3] = 255;
  }
}
writePNG('public/map/tileset_crops/test_water_tiled_192.png', 192, 192, water192);
console.log('Saved 192x192 tiled test previews!');
