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

function sampleBlock(startX, startY, blockX, blockY) {
  const cx = startX + blockX * 8 + 4;
  const cy = startY + blockY * 8 + 4;
  const [r, g, b] = getPixel(cx, cy);
  if (r === 0 && g === 128 && b === 128) return 0; // teal
  if (r > 150 && g > 150 && b > 150) return 0; // white (not a neighbor, center is white)
  if (r < 50 && g < 50 && b < 50) return 1; // black = neighbor is same type!
  return 0;
}

// In the legend:
// Black block = neighbor of SAME type (connected)
// Teal block = different type / open
// White center = current tile

// Standard bitmask definition:
// NW: 1, N: 2, NE: 4, W: 8, E: 16, SW: 32, S: 64, SE: 128
const legendMap = [];
const bitmaskSet = new Set();

for (let r = 0; r < 24; r++) {
  const yStart = 163 + r * 25;
  for (let sc = 0; sc < 3; sc++) {
    const xStart = 9 + sc * 25;
    // Check center
    const cx = xStart + 12;
    const cy = yStart + 12;
    const [cr, cg, cb] = getPixel(cx, cy);
    if (!(cr > 150 && cg > 150 && cb > 150)) continue; // not a legend tile

    const nw = sampleBlock(xStart, yStart, 0, 0);
    const n  = sampleBlock(xStart, yStart, 1, 0);
    const ne = sampleBlock(xStart, yStart, 2, 0);
    const w  = sampleBlock(xStart, yStart, 0, 1);
    const e  = sampleBlock(xStart, yStart, 2, 1);
    const sw = sampleBlock(xStart, yStart, 0, 2);
    const s  = sampleBlock(xStart, yStart, 1, 2);
    const se = sampleBlock(xStart, yStart, 2, 2);

    const mask = (nw << 0) | (n << 1) | (ne << 2) | (w << 3) | (e << 4) | (sw << 5) | (s << 6) | (se << 7);
    legendMap.push({
      index: legendMap.length,
      row: r,
      col: sc,
      nw, n, ne, w, e, sw, s, se,
      mask
    });
    bitmaskSet.add(mask);
  }
}

console.log(`Total legend tiles: ${legendMap.length}`);
console.log(`Unique bitmasks: ${bitmaskSet.size}`);

// Verify canonical collapse of all 256 combinations:
// Rule: corner bits are only valid if adjacent cardinals are 1
function canonicalize(mask) {
  let nw = (mask >> 0) & 1;
  let n  = (mask >> 1) & 1;
  let ne = (mask >> 2) & 1;
  let w  = (mask >> 3) & 1;
  let e  = (mask >> 4) & 1;
  let sw = (mask >> 5) & 1;
  let s  = (mask >> 6) & 1;
  let se = (mask >> 7) & 1;

  if (!n || !w) nw = 0;
  if (!n || !e) ne = 0;
  if (!s || !w) sw = 0;
  if (!s || !e) se = 0;

  return (nw << 0) | (n << 1) | (ne << 2) | (w << 3) | (e << 4) | (sw << 5) | (s << 6) | (se << 7);
}

const canonicalSet = new Set();
for (let m = 0; m < 256; m++) {
  canonicalSet.add(canonicalize(m));
}
console.log(`Canonical 256 collapsed set size: ${canonicalSet.size}`);

// Check if all bitmaskSet elements are in canonicalSet
let allMatch = true;
for (const m of bitmaskSet) {
  if (!canonicalSet.has(m)) {
    console.log(`Mask ${m} not in canonical set!`);
    allMatch = false;
  }
}
console.log(`All legend masks match canonical 47-blob? ${allMatch}`);
