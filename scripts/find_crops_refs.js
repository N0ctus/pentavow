import fs from 'fs';

function searchInSrc(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = `${dir}/${f}`;
    if (fs.statSync(p).isDirectory()) {
      searchInSrc(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      const txt = fs.readFileSync(p, 'utf-8');
      if (txt.includes('tileset_crops') || txt.includes('quad_')) {
        console.log(`Found reference in: ${p}`);
      }
    }
  }
}
searchInSrc('src');
