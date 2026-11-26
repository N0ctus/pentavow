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

// Find vertical separator lines in the header (y = 148)
const headerSeparators = [];
for (let x = 8; x <= 758; x++) {
  const [r, g, b] = getPixel(x, 148);
  if (r > 200 && g > 200 && b > 200) {
    // Check if it's a vertical white line in header
    let isLine = true;
    for (let y = 147; y <= 158; y++) {
      const [pr, pg, pb] = getPixel(x, y);
      if (pr < 180) { isLine = false; break; }
    }
    if (isLine) headerSeparators.push(x);
  }
}
console.log('Header vertical separators (white lines):', headerSeparators);

// Also check all 30 sub-columns (each 25px wide)
const colStarts = [];
for (let i = 0; i < 30; i++) {
  colStarts.push(8 + i * 25);
}
console.log('Tile sub-column borders (x):', colStarts);

// Let's print which sub-columns correspond to which header group!
let sepIdx = 0;
for (let i = 0; i < 30; i++) {
  const xLeft = 8 + i * 25;
  const xRight = 8 + (i + 1) * 25;
  console.log(`Sub-column ${i}: [${xLeft + 1} .. ${xRight - 1}]`);
}
