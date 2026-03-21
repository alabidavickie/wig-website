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
    let newContent = content;

    // Fix explicit page wrappers that incorrectly force white backgrounds
    newContent = newContent.replace(/bg-white text-\[\#1A1A1D\]/g, 'bg-background text-white');
    newContent = newContent.replace(/text-\[\#1A1A1D\] bg-background/g, 'text-white bg-background');
    newContent = newContent.replace(/bg-background min-h-screen font-sans text-\[\#1A1A1D\]/g, 'bg-background min-h-screen font-sans text-white');
    newContent = newContent.replace(/bg-white hover:bg-zinc-200 text-black/g, 'bg-white hover:bg-zinc-200 text-black'); // leaving light ghost buttons alone
    
    // Smart replace className instances of text-[#1A1A1D]
    // We only replace if the className DOES NOT contain bg-white, bg-[#FAF9F6] or bg-[#D5A754]
    newContent = newContent.replace(/className=(['"]|`)(.*?)(['"]|`)/g, (match, p1, classString, p3) => {
      // If the element has a light background, keep the black text for contrast
      if (classString.includes('bg-white') || classString.includes('bg-[#D5A754]') || classString.includes('bg-[#FAF9F6]')) {
        return match;
      }
      
      // Otherwise, swap dark text for white text on the dark theme
      let updatedString = classString
        .replace(/text-\[\#1A1A1D\]/g, 'text-white')
        .replace(/border-\[\#1A1A1D\]/g, 'border-white/20')
        .replace(/text-black/g, 'text-white') // specific fix for ghost components mapped incorrectly
        .replace(/hover:text-black/g, 'hover:text-white')
        .replace(/border-black/g, 'border-white')
        .replace(/hover:border-black/g, 'hover:border-white');
        
      return `className=${p1}${updatedString}${p3}`;
    });

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      modifiedFiles++;
    }
  }
});

console.log(`Successfully fixed black text visibility in ${modifiedFiles} files.`);
