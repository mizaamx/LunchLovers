import fs from 'fs';

const logPath = 'C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\415783b6-32a4-4827-b686-ec4132aab258\\.system_generated\\logs\\transcript.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');

// Find all occurrences of Console logs capture in the text
const regex = /Console logs capture[\s\S]*?output":\s*"([\s\S]*?)"/g;
let match;
let count = 0;

console.log('Searching for Console logs capture outputs in transcript...');
while ((match = regex.exec(fileContent)) !== null) {
  count++;
  console.log(`\n--- MATCH ${count} ---`);
  // Unescape the string content
  const rawContent = match[1];
  try {
    const clean = JSON.parse('"' + rawContent + '"');
    console.log(clean);
  } catch (e) {
    console.log(rawContent.substring(0, 1000));
  }
}
