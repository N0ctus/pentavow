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

// Function to classify an 8x8 sub-block in a 24x24 legend cell
// returns: 1 if white, 0 if black, -1 if teal (transparent/empty)
function sampleBlock(startX, startY, blockX, blockY) {
  const cx = startX + blockX * 8 + 4;
  const cy = startY + blockY * 8 + 4;
  const [r, g, b] = getPixel(cx, cy);
  if (r === 0 && g === 128 && b === 128) return -1; // teal
  if (r > 150 && g > 150 && b > 150) return 1; // white
  if (r < 50 && g < 50 && b < 50) return 0; // black
  return 0;
}

const legendTiles = [];
for (let r = 0; r < 24; r++) {
  const yStart = 163 + r * 25;
  for (let sc = 0; sc < 3; sc++) {
    const xStart = 9 + sc * 25;
    const center = sampleBlock(xStart, yStart, 1, 1);
    if (center !== 1) continue; // Not a legend tile (e.g. empty teal cell)

    // Read 3x3 pattern:
    // NW, N, NE
    // W,  C, E
    // SW, S, SE
    const nw = sampleBlock(xStart, yStart, 0, 0);
    const n  = sampleBlock(xStart, yStart, 1, 0);
    const ne = sampleBlock(xStart, yStart, 2, 0);
    const w  = sampleBlock(xStart, yStart, 0, 1);
    const c  = 1;
    const e  = sampleBlock(xStart, yStart, 2, 1);
    const sw = sampleBlock(xStart, yStart, 0, 2);
    const s  = sampleBlock(xStart, yStart, 1, 2);
    const se = sampleBlock(xStart, yStart, 2, 2);

    legendTiles.push({
      row: r,
      subCol: sc,
      grid: [
        [nw, n, ne],
        [w,  c, e],
        [sw, s, se]
      ]
    });
  }
}

console.log(`Found ${legendTiles.length} legend tiles in Legend column!`);
legendTiles.forEach((lt, idx) => {
  const fmt = (v) => v === 1 ? 'W' : (v === 0 ? 'B' : '.');
  const rowStr = lt.grid.map(row => row.map(fmt).join('')).join('|');
  console.log(`Tile #${idx} (Row ${lt.row}, Col ${lt.subCol}): ${rowStr}`);
});
