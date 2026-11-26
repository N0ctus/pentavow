const fs = require('fs');
const zlib = require('zlib');

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

const img = readPNG('Tiles/Game Boy Advance - Pokemon Mystery Dungeon_ Red Rescue Team - Dungeon Tiles - Buried Relic B21F - B50F.png');

function getPixel(x, y) {
  if (x < 0 || x >= img.width || y < 0 || y >= img.height) return [0,0,0,0];
  const idx = (y * img.width + x) * 4;
  return [img.pixels[idx], img.pixels[idx+1], img.pixels[idx+2], img.pixels[idx+3]];
}

// In Group 8 (Water, sc=24..26) and Group 9 (Water Sparkle, sc=27..29):
// Check what colors are in tile #0 (row 0, sc 24 and 27) and tile #4 (row 1, sc 25 and 28)
console.log('--- Group 8 Tile #4 (row 1, col 1: interior water) ---');
const colorsG8_T4 = new Set();
for (let y = 163 + 25; y < 163 + 49; y++) {
  for (let x = 9 + 25 * 25; x < 9 + 25 * 25 + 24; x++) {
    const [r, g, b] = getPixel(x, y);
    colorsG8_T4.add(`${r},${g},${b}`);
  }
}
console.log('G8 T4 colors:', Array.from(colorsG8_T4));

console.log('--- Group 8 Tile #0 (row 0, col 0: top-left corner water) ---');
const colorsG8_T0 = new Set();
for (let y = 163; y < 163 + 24; y++) {
  for (let x = 9 + 24 * 25; x < 9 + 24 * 25 + 24; x++) {
    const [r, g, b] = getPixel(x, y);
    colorsG8_T0.add(`${r},${g},${b}`);
  }
}
console.log('G8 T0 colors:', Array.from(colorsG8_T0));

console.log('--- Group 9 Tile #0 (row 0, col 0: top-left corner sparkle) ---');
const colorsG9_T0 = new Set();
for (let y = 163; y < 163 + 24; y++) {
  for (let x = 9 + 27 * 25; x < 9 + 27 * 25 + 24; x++) {
    const [r, g, b] = getPixel(x, y);
    colorsG9_T0.add(`${r},${g},${b}`);
  }
}
console.log('G9 T0 colors:', Array.from(colorsG9_T0));
