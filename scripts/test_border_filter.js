import fs from 'fs';
import omggif from 'omggif';

const buf = fs.readFileSync('C:/Users/Noctus/Downloads/rMMKwa.gif');
const reader = new omggif.GifReader(buf);
const canvas = Buffer.alloc(reader.width * reader.height * 4);
reader.decodeAndBlitFrameRGBA(0, canvas);

// Check if any pixels in y: 80 to 105 match the banner border
let borderCount = 0;
for (let y = 80; y < 105; y++) {
  for (let x = 10; x < 155; x++) {
    const idx = (y * reader.width + x) * 4;
    const r = canvas[idx], g = canvas[idx+1], b = canvas[idx+2];
    if (r > 160 && g > 130 && b < 130) {
      borderCount++;
    }
  }
}
console.log('Border pixels in y:80-105 for Arcane:', borderCount);
