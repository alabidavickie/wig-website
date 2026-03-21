const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(dirPath);
  });
}

let modifiedFiles = 0;

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    let newContent = content
      .replace(/text-zinc-600/g, 'text-zinc-400')
      .replace(/text-zinc-500/g, 'text-zinc-400')
      .replace(/text-gray-600/g, 'text-gray-400')
      .replace(/text-gray-500/g, 'text-gray-400')
      .replace(/text-muted-foreground/g, 'text-zinc-400')
      .replace(/text-black\/50/g, 'text-white')
      .replace(/text-white\/30/g, 'text-zinc-400')
      .replace(/text-\[\#1A1A1D\]\/40/g, 'text-zinc-400')
      .replace(/text-\[\#1A1A1D\]\/50/g, 'text-zinc-400')
      .replace(/text-\[\#1A1A1D\]\/60/g, 'text-zinc-300')
      .replace(/text-zinc-400\/50/g, 'text-zinc-300');

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      modifiedFiles++;
    }
  }
});

console.log(`Successfully updated contrast classes in ${modifiedFiles} files.`);
