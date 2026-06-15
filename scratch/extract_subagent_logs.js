import fs from 'fs';

const logPath = 'C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\415783b6-32a4-4827-b686-ec4132aab258\\.system_generated\\logs\\transcript.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 868) {
      const content = obj.content;
      
      // Find occurrences of capture_browser_console_logs in content
      let index = 0;
      while ((index = content.indexOf('capture_browser_console_logs', index)) !== -1) {
        console.log(`\n========================================`);
        console.log(`FOUND capture_browser_console_logs at index ${index}:`);
        console.log(content.substring(index, index + 2000));
        index += 28; // Advance past this keyword
      }
    }
  } catch (e) {
    // Ignore invalid JSON lines
  }
}
