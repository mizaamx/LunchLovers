import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist', 'assets');
const filePath = path.join(distDir, 'index-BHOIwRhz.js');

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const query = 'WeeklyMenus';
  const index = content.indexOf(query);
  
  console.log('Surrounding code:');
  console.log(content.slice(Math.max(0, index - 200), Math.min(content.length, index + 300)));
} else {
  console.log("File not found");
}
