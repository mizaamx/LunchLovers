import fs from 'fs';
import path from 'path';

const sysPath = 'C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\415783b6-32a4-4827-b686-ec4132aab258\\.system_generated';

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else {
        if (file.endsWith('.log') || file.endsWith('.json') || file.endsWith('.jsonl')) {
          console.log(`${fullPath} (${stat.size} bytes)`);
        }
      }
    }
  } catch (e) {
    console.error(`Error walking ${dir}:`, e.message);
  }
}

walkDir(sysPath);
