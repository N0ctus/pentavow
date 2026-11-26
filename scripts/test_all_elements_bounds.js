import fs from 'fs';
import omggif from 'omggif';

const buf = fs.readFileSync('C:/Users/Noctus/Downloads/rMMKwa.gif');
const reader = new omggif.GifReader(buf);

const canvas = Buffer.alloc(reader.width * reader.height * 4);
const frames = [];

for (let i = 0; i <= 26; i++) {
  const info = reader.frameInfo(i);
  let backup = null;
  if (info.disposal === 3) backup = Buffer.from(canvas);
  reader.decodeAndBlitFrameRGBA(i, canvas);
  frames.push(Buffer.from(canvas));
  if (info.disposal === 2) {
    for (let y = info.y; y < info.y + info.height; y++) {
      for (let x = info.x; x < info.x + info.width; x++) {
        const idx = (y * reader.width + x) * 4;
        canvas[idx] = 0; canvas[idx+1] = 0; canvas[idx+2] = 0; canvas[idx+3] = 0;
      }
    }
  } else if (info.disposal === 3 && backup) {
    backup.copy(canvas);
  }
}

const elements = [
  { name: 'arcane', centerX: 82 },
  { name: 'fire', centerX: 216 },
  { name: 'frost', centerX: 350 },
  { name: 'toxic', centerX: 484 },
  { name: 'holy', centerX: 618 },
  { name: 'blood', centerX: 752 },
  { name: 'necrotic', centerX: 886 },
];

for (const el of elements) {
  let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
  for (let f = 0; f <= 25; f++) {
    const frame = frames[f];
    for (let y = 118; y <= 255; y++) {
      for (let x = el.centerX - 72; x <= el.centerX + 72; x++) {
        if (x < 0 || x >= reader.width) continue;
        const idx = (y * reader.width + x) * 4;
        const r = frame[idx], g = frame[idx+1], b = frame[idx+2];
        const dist = Math.abs(r - 62) + Math.abs(g - 48) + Math.abs(b - 108);
        if (dist > 35) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }
  console.log(`${el.name.padEnd(9)}: x=[${minX}, ${maxX}] w=${maxX - minX + 1}, y=[${minY}, ${maxY}] h=${maxY - minY + 1}`);
}
