import fs from 'fs';
import path from 'path';

const messagesDir = 'C:\\Users\\misss\\.gemini\\antigravity-ide\\brain\\415783b6-32a4-4827-b686-ec4132aab258\\.system_generated\\messages';

if (fs.existsSync(messagesDir)) {
  const files = fs.readdirSync(messagesDir);
  console.log(`Found ${files.length} message files.`);
  
  const fileStats = files.map(file => {
    const filePath = path.join(messagesDir, file);
    return {
      name: file,
      time: fs.statSync(filePath).mtimeMs,
      content: fs.readFileSync(filePath, 'utf8')
    };
  });
  
  fileStats.sort((a, b) => b.time - a.time);
  
  fileStats.slice(0, 10).forEach((item, index) => {
    console.log(`\n--- Message ${index + 1}: ${item.name} (${new Date(item.time).toISOString()}) ---`);
    if (item.content.includes('console') || item.content.includes('error') || item.content.includes('logs')) {
      console.log(item.content.slice(0, 2000));
    } else {
      console.log("No console/error logs found in this message metadata. Snippet:");
      console.log(item.content.slice(0, 300));
    }
  });
} else {
  console.log("Messages directory not found at " + messagesDir);
}
