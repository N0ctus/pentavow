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

const p = 'C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/.user_uploaded/media_1795499173968_727f4de9.png';
const img = readPNG(p);

// Sample across row y = 250 (first row of tiles)
console.log('Sampling row y = 250 across width:');
for (let x = 0; x < img.width; x += 16) {
  const idx = (250 * img.width + x) * 4;
  const r = img.pixels[idx], g = img.pixels[idx+1], b = img.pixels[idx+2];
  let type = 'other';
  if (r === 0 && g === 128 && b === 128) type = 'grid-teal';
  else if (r > 200 && g < 50 && b > 200) type = 'magenta-mask';
  else if (b > r + 30 && b > g) type = 'blue-water';
  else if (g > r && g > b) type = 'green-grass';
  else if (r < 40 && g < 40 && b < 40) type = 'black';
  else if (r > 200 && g > 200 && b > 200) type = 'white';
  console.log(`x=${String(x).padStart(3, '0')}: [${r}, ${g}, ${b}] -> ${type}`);
}
