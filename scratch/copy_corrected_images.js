import fs from 'fs';
import path from 'path';

const artifactDir = 'C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\18684b10-c986-4812-8ef8-203ffc5c17d2';
const destDir = 'c:\\Users\\misss\\OneDrive\\Escritorio\\LOL\\public\\dishes';

const files = fs.readdirSync(artifactDir);

const mappings = {
  sope_nopal: 'sope_nopal.png',
  milanesa_cerdo_arroz: 'milanesa_cerdo_arroz.png'
};

for (const [prefix, destName] of Object.entries(mappings)) {
  const match = files.find(f => f.startsWith(prefix) && f.endsWith('.png'));
  if (match) {
    const srcPath = path.join(artifactDir, match);
    const destPath = path.join(destDir, destName);
    // Overwrite if exists
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied corrected image: ${match} -> ${destName}`);
  } else {
    console.warn(`WARNING: Could not find generated image for ${prefix}`);
  }
}

console.log("Corrected images copy complete.");
