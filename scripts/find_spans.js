import fs from 'fs';
import jpeg from 'jpeg-js';

const jpgPath = 'C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/feudal_japan_pixel_sprites_1795422046562.jpg';
const buf = fs.readFileSync(jpgPath);
const decoded = jpeg.decode(buf, { useTArray: true });
const { width, height, data } = decoded;

function getPx(x, y) {
  const idx = (y * width + x) * 4;
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
}

console.log('Corner (0,0):', getPx(0, 0));
console.log('Corner (1375,0):', getPx(1375, 0));
console.log('Corner (0,767):', getPx(0, 767));

// Compute column activity (how many non-dark pixels in each column)
// Dark background is typically R, G, B < 45
const colActivity = new Array(width).fill(0);
for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    const [r, g, b] = getPx(x, y);
    if (r > 45 || g > 45 || b > 45) {
      colActivity[x]++;
    }
  }
}

// Find contiguous active spans
const spans = [];
let inSpan = false;
let start = 0;
for (let x = 0; x < width; x++) {
  if (colActivity[x] > 20) {
    if (!inSpan) {
      inSpan = true;
      start = x;
    }
  } else {
    if (inSpan) {
      inSpan = false;
      spans.push({ start, end: x - 1, width: x - start });
    }
  }
}
if (inSpan) spans.push({ start, end: width - 1, width: width - start });

console.log('Active horizontal column spans:', spans);
