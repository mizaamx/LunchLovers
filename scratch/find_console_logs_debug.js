import fs from 'fs';

const logPath = 'C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\415783b6-32a4-4827-b686-ec4132aab258\\.system_generated\\logs\\transcript.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('capture_browser_console_logs') && lines[i].includes('Status:')) {
    console.log(`Line ${i}:`);
    console.log(lines[i].substring(0, 1000));
  }
}
