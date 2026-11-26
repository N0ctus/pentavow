import fs from 'fs';

const code = fs.readFileSync('src/components/map/OverworldMap.tsx', 'utf-8');
const lines = code.split('\n');

console.log('Searching for river / waterway / lake in OverworldMap...');
lines.forEach((l, i) => {
  if (l.match(/(waterway|river|lake|pond|shoreline|riverbank|basin)/i)) {
    console.log(`L${i + 1}: ${l.trim()}`);
  }
});
