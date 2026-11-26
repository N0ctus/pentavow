import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function readPNG(p) {
  try {
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
  } catch (e) {
    return null;
  }
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name !== 'node_modules' && ent.name !== '.git') scanDir(full);
    } else if (ent.name.endsWith('.png')) {
      const img = readPNG(full);
      if (!img) continue;
      
      let redCount = 0;
      let whiteCount = 0;
      for (let i = 0; i < img.pixels.length; i += 4) {
        const r = img.pixels[i], g = img.pixels[i+1], b = img.pixels[i+2], a = img.pixels[i+3];
        if (a > 100) {
          if (r >= 170 && r <= 210 && g >= 45 && g <= 75 && b >= 45 && b <= 75) redCount++;
          if (r >= 190 && r <= 210 && g >= 190 && g <= 210 && b >= 195 && b <= 215) whiteCount++;
        }
      }
      if (redCount > 5 && whiteCount > 5) {
        console.log(`MATCH in ${full}: red=${redCount}, white=${whiteCount}`);
      }
    }
  }
}

console.log('Scanning public/ ...');
scanDir('public');
console.log('Scanning src/ ...');
scanDir('src');
