import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist', 'assets');
const filePath = path.join(distDir, 'index-B8SQVUP-.js');

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const query = 'Error al sincronizar con';
  const index = content.indexOf(query);
  
  // Let's find the start of the function by searching backwards for 'MealSelectionProvider' or 'function'
  // Or just print out a wide window.
  console.log(content.slice(Math.max(0, index - 5000), Math.min(content.length, index + 1500)));
} else {
  console.log("File not found");
}
