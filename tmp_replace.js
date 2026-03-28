const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // Backgrounds:
  { from: /bg-\[#0A0A0A\]/g, to: 'bg-background' },
  { from: /bg-\[#141414\]/g, to: 'bg-card' },
  { from: /bg-\[#1A1A1D\]/g, to: 'bg-secondary' },
  // Borders:
  { from: /border-\[#2A2A2D\]/g, to: 'border-border' },
  { from: /border-\[#3F3F46\]/g, to: 'border-border' },
  // Text:
  { from: /text-white/g, to: 'text-foreground' },
  { from: /text-zinc-400/g, to: 'text-muted-foreground' },
  { from: /text-zinc-500/g, to: 'text-muted-foreground' },
  { from: /text-zinc-700/g, to: 'text-muted-foreground/50' },
  // Rare hover states or text fills:
  { from: /text-\[#0A0A0A\]/g, to: 'text-background' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { from, to } of replacements) {
        if (from.test(content)) {
          content = content.replace(from, to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

try {
  processDir(srcDir);
  console.log("Replacements complete.");
} catch (error) {
  console.error(error);
}
