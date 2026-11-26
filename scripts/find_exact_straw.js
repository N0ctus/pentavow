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

const target = readPNG('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/.user_uploaded/media_1795456953488_198ebd0b.png');

function findExact(path) {
  if (!fs.existsSync(path)) return;
  const img = readPNG(path);
  let bestScore = Infinity;
  let bestX = 0, bestY = 0;

  // Center pixel of target
  const tMidX = Math.floor(target.width / 2);
  const tMidY = Math.floor(target.height / 2);

  for (let y = 0; y < img.height - target.height; y += 2) {
    for (let x = 0; x < img.width - target.width; x += 2) {
      let diff = 0;
      // sample 10 points
      for (let sy = 10; sy < target.height; sy += 10) {
        for (let sx = 10; sx < target.width; sx += 10) {
          const tidx = (sy * target.width + sx) * 4;
          const iidx = ((y + sy) * img.width + (x + sx)) * 4;
          diff += Math.abs(target.pixels[tidx] - img.pixels[iidx]);
          diff += Math.abs(target.pixels[tidx+1] - img.pixels[iidx+1]);
          diff += Math.abs(target.pixels[tidx+2] - img.pixels[iidx+2]);
        }
      }
      if (diff < bestScore) {
        bestScore = diff;
        bestX = x;
        bestY = y;
      }
    }
  }
  console.log(`${path}: bestScore=${bestScore} at x=${bestX}, y=${bestY}`);
}

findExact('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/clean_terrain_verified.png');
findExact('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/browser_evidence/4ce08257-01d6-46c3-9082-ea258099554c/final_step_2148.png');
findExact('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/browser_evidence/4ce08257-01d6-46c3-9082-ea258099554c/final_step_2189.png');
