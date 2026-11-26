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
// Center column x = 96
let crossbarBottom = 0;
for (let y = 0; y < height; y++) {
  const a = pixels[(y * width + 96) * 4 + 3];
  if (a > 50) {
    crossbarBottom = y;
  } else if (crossbarBottom > 0) {
    // found the gap below crossbar!
    console.log('Crossbar bottom at y =', crossbarBottom);
    break;
  }
}

// Find ground / bottom of posts
let postBottom = 0;
for (let y = height - 1; y >= 0; y--) {
  const a = pixels[(y * width + 48) * 4 + 3];
  if (a > 50) {
    postBottom = y;
    console.log('Post bottom at y =', postBottom);
    break;
  }
}

console.log('Opening vertical span: y =', crossbarBottom, 'to', postBottom, 'height =', postBottom - crossbarBottom);
