const fs = require('fs');
const path = require('path');

// 1. Add cache-busting query string (?v=3) to CSS & JS references in HTML files
for (const f of fs.readdirSync('public')) {
  if (f.endsWith('.html')) {
    const p = path.join('public', f);
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/\/css\/style\.css(\?v=\d+)?/g, '/css/style.css?v=3');
    c = c.replace(/\/js\/([a-zA-Z0-9-]+)\.js(\?v=\d+)?/g, '/js/$1.js?v=3');
    fs.writeFileSync(p, c, 'utf8');
  }
}

// 2. Audit all files for zero emojis and zero em-dashes
function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      if (item !== 'node_modules' && item !== '.git') {
        files = files.concat(walk(full));
      }
    } else {
      files.push(full);
    }
  }
  return files;
}

const files = walk('public');
let errorCount = 0;

for (const file of files) {
  if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('\u2014')) {
      console.error('Found em-dash in:', file);
      errorCount++;
    }
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(content)) {
      console.error('Found emoji in:', file);
      errorCount++;
    }
  }
}

if (errorCount === 0) {
  console.log('AUDIT PASSED: Cache-busted (?v=3), zero emojis, and zero em-dashes across all public files.');
} else {
  console.error('AUDIT FAILED with ' + errorCount + ' issues.');
  process.exit(1);
}
