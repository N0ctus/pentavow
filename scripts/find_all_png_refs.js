import fs from 'fs';

const pngRefs = new Set();
function searchPngs(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = `${dir}/${f}`;
    if (fs.statSync(p).isDirectory()) {
      searchPngs(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.css')) {
      const txt = fs.readFileSync(p, 'utf-8');
      const matches = txt.match(/['"`][^'"`]+\.png['"`]/g);
      if (matches) {
        for (const m of matches) {
          pngRefs.add(m);
        }
      }
    }
  }
}
searchPngs('src');
console.log('Unique PNG references in src:');
[...pngRefs].sort().forEach(r => console.log(r));
