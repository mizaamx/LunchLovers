import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist', 'assets');
const query = 'Error al sincronizar con';

fs.readdirSync(distDir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(distDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const index = content.indexOf(query);
    if (index !== -1) {
      console.log(`Found in: ${file} at position ${index}`);
      console.log('Surrounding code:');
      console.log(content.slice(Math.max(0, index - 200), Math.min(content.length, index + 300)));
    }
  }
});
