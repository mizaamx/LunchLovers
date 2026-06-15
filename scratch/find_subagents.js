import fs from 'fs';

const logPath = 'C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\415783b6-32a4-4827-b686-ec4132aab258\\.system_generated\\logs\\transcript.jsonl';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (line.includes('browser_subagent') || line.includes('subagentId')) {
      console.log(`Step ${obj.step_index}: type=${obj.type}`);
      if (obj.tool_calls) {
        console.log('Tool calls:', JSON.stringify(obj.tool_calls));
      }
    }
  } catch (e) {
    // Ignore invalid JSON
  }
}
