import fs from 'fs';
import path from 'path';

const userProfile = process.env.USERPROFILE || process.env.HOME || '';
const configPath = path.join(userProfile, '.config', 'configstore', 'firebase-tools.json');

if (fs.existsSync(configPath)) {
  const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log("Tokens structure:", JSON.stringify(data.tokens, null, 2));
} else {
  console.log("File does not exist.");
}
