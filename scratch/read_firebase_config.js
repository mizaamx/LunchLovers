import fs from 'fs';
import path from 'path';

const userProfile = process.env.USERPROFILE || process.env.HOME || '';
const configPath = path.join(userProfile, '.config', 'configstore', 'firebase-tools.json');

console.log("Checking path:", configPath);
if (fs.existsSync(configPath)) {
  console.log("File exists!");
  try {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log("Keys available:", Object.keys(data));
    if (data.tokens) {
      console.log("Tokens present!");
      // Print first 5 chars of token to confirm
      if (data.tokens.active || data.tokens.refresh) {
        console.log("Active token present!");
      }
    }
  } catch (error) {
    console.error("Error reading config:", error);
  }
} else {
  console.log("File does not exist.");
}
