import fs from 'fs';
import readline from 'readline';

async function run() {
  const fileStream = fs.createReadStream('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.includes('media_1795441040637_acb53882')) {
      const obj = JSON.parse(line);
      console.log(`Step ${obj.step_index}: ${obj.type}`);
    }
  }
}
run();
