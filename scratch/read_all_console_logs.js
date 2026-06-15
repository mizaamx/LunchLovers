import fs from 'fs';

const logPath = 'C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\415783b6-32a4-4827-b686-ec4132aab258\\.system_generated\\logs\\transcript.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

console.log('Extracting console captures from transcript...');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    // We look for steps inside the subagent run. The type is BROWSER_SUBAGENT or similar.
    // If the line contains console logs, let's print them.
    if (line.includes('capture_browser_console_logs') && line.includes('output') && !line.includes('write_to_file')) {
      console.log(`\n========================================`);
      console.log(`Step index: ${obj.step_index}`);
      
      // Let's search for the console logs list in the JSON string
      const match = line.match(/"output":\s*"([\s\S]*?)"/);
      if (match) {
        try {
          const clean = JSON.parse('"' + match[1] + '"');
          console.log(clean.substring(0, 2000));
        } catch (e) {
          console.log(match[1].substring(0, 1000));
        }
      } else {
        console.log(line.substring(0, 1000));
      }
    }
  } catch (e) {
    // Ignore
  }
}
