import fs from 'fs';
import zlib from 'zlib';

function readPNG(path) {
  const buf = fs.readFileSync(path);
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

  // Unfilter (assuming sub/none/up/average/paeth - let's handle simple reconstruction)
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

const { width, height, pixels } = readPNG('public/map/prop_torii.png');
console.log('Torii image size:', width, 'x', height);

const midY = Math.floor(height * 0.7);
const leftPosts = [], rightPosts = [];
for (let x = 0; x < width; x++) {
  const a = pixels[(midY * width + x) * 4 + 3];
  if (a > 50) {
    if (x < width / 2) leftPosts.push(x);
    else rightPosts.push(x);
  }
}

console.log('Left post X range:', leftPosts[0], 'to', leftPosts[leftPosts.length-1]);
console.log('Right post X range:', rightPosts[0], 'to', rightPosts[rightPosts.length-1]);
console.log('Post inner opening width:', rightPosts[0] - leftPosts[leftPosts.length-1], 'px (out of total', width, 'px)');
console.log('Opening ratio:', (rightPosts[0] - leftPosts[leftPosts.length-1]) / width);
