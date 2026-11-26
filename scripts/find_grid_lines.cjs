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

// Let's find horizontal lines across the left half (x = 20..700)
// Check which Y lines have continuous border pixels
console.log('--- Horizontal lines scan ---');
for (let y = 100; y < 760; y++) {
  let whiteCount = 0;
  let blackCount = 0;
  let tealCount = 0;
  for (let x = 10; x <= 750; x++) {
    const [r, g, b] = getPixel(x, y);
    if (r === 0 && g === 128 && b === 128) tealCount++;
    else if (r > 200 && g > 200 && b > 200) whiteCount++;
    else if (r < 30 && g < 30 && b < 30) blackCount++;
  }
  if (whiteCount > 300 || blackCount > 300) {
    console.log(`y=${y}: white=${whiteCount}, black=${blackCount}, teal=${tealCount}`);
  }
}

// Let's find vertical lines across the table (y = 200..300)
console.log('--- Vertical lines scan ---');
for (let x = 0; x < 760; x++) {
  let nonTeal = 0;
  for (let y = 200; y < 400; y++) {
    const [r, g, b] = getPixel(x, y);
    if (!(r === 0 && g === 128 && b === 128)) nonTeal++;
  }
  if (nonTeal === 200) {
    // Continuous line
    console.log(`x=${x} is continuous non-teal`);
  }
}
