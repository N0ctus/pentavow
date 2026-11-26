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

// Check Group 8 (x=608..683) and Group 9 (x=683..758)
console.log('Group 8 sample row 0 tile:');
let hasMagentaG8 = false, hasTealG8 = false;
for (let y = 163; y <= 186; y++) {
  for (let x = 609; x <= 632; x++) {
    const [r, g, b] = getPixel(x, y);
    if (r === 255 && g === 0 && b === 255) hasMagentaG8 = true;
    if (r === 0 && g === 128 && b === 128) hasTealG8 = true;
  }
}
console.log('Group 8 has magenta:', hasMagentaG8, 'has teal:', hasTealG8);

console.log('Group 9 sample row 0 tile:');
let hasMagentaG9 = false, hasTealG9 = false;
for (let y = 163; y <= 186; y++) {
  for (let x = 684; x <= 707; x++) {
    const [r, g, b] = getPixel(x, y);
    if (r === 255 && g === 0 && b === 255) hasMagentaG9 = true;
    if (r === 0 && g === 128 && b === 128) hasTealG9 = true;
  }
}
console.log('Group 9 has magenta:', hasMagentaG9, 'has teal:', hasTealG9);

// Check palette tables on the right (x > 760)
console.log('Right side features (x > 760):');
for (let y = 100; y < 700; y += 20) {
  let colorsInRow = new Set();
  for (let x = 770; x < img.width; x += 5) {
    const [r, g, b] = getPixel(x, y);
    if (!(r === 0 && g === 128 && b === 128)) {
      colorsInRow.add(`${r},${g},${b}`);
    }
  }
  if (colorsInRow.size > 2) {
    console.log(`y=${y}: ${colorsInRow.size} distinct colors`);
  }
}
