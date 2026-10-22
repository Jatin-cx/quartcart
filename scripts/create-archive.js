const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const zipDest1 = path.join(root, 'public', 'QuickCart-Source-Code.zip');
const zipDest2 = 'C:\\Users\\Dell\\Downloads\\QuickCart-Source-Code.zip';

if (fs.existsSync(zipDest1)) fs.unlinkSync(zipDest1);
if (fs.existsSync(zipDest2)) fs.unlinkSync(zipDest2);

function walk(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.endsWith('.zip')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const allFiles = walk(root);
console.log('Total files to archive:', allFiles.length);

const tempFileList = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'quickcart_files.txt');
const relativeFiles = allFiles.map((f) => path.relative(root, f));
fs.writeFileSync(tempFileList, relativeFiles.join('\r\n'), 'utf8');

const psCmd = 'powershell.exe -NoProfile -Command "Get-Content \'' + tempFileList + '\' | Compress-Archive -DestinationPath \'' + zipDest1 + '\' -Force"';
console.log('Running archive compression...');
execSync(psCmd, { stdio: 'inherit', cwd: root });

fs.copyFileSync(zipDest1, zipDest2);
console.log('Successfully created QuickCart-Source-Code.zip at:', zipDest1);
console.log('Copied to:', zipDest2);
console.log('Zip file size:', fs.statSync(zipDest1).size, 'bytes');
