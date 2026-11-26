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

// Bounding box of Arcane (col 0): search in x: 0 to 160, y: 50 to 225
let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
for (let f = 0; f <= 25; f++) {
  const frame = frames[f];
  for (let y = 60; y < 225; y++) {
    for (let x = 10; x < 155; x++) {
      const idx = (y * reader.width + x) * 4;
      const r = frame[idx], g = frame[idx+1], b = frame[idx+2];
      const dist = Math.abs(r - 62) + Math.abs(g - 48) + Math.abs(b - 108);
      // skip Arcane label at bottom if any
      if (y > 218 && r > 150 && g > 150) continue;
      // skip top header border at y < 75
      if (y < 75 && (r > 150 || g > 150)) continue;

      if (dist > 35) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
}

console.log('Tight bounds for Arcane arrival portal:');
console.log(`x: ${minX} to ${maxX} (width: ${maxX - minX + 1})`);
console.log(`y: ${minY} to ${maxY} (height: ${maxY - minY + 1})`);
console.log(`Center: x = ${(minX + maxX)/2}, y = ${(minY + maxY)/2}`);
