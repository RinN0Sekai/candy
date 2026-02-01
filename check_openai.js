import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Handling __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(process.cwd(), '.env');
let API_KEY = '';

try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/VITE_OPENAI_API_KEY=(.*)/);
        if (match) {
            API_KEY = match[1].trim();
        }
    }
} catch (e) {
    console.error("Could not read .env file", e);
}

if (!API_KEY) {
    console.error("No API Key found in .env");
    process.exit(1);
}

console.log(`Testing OpenAI Key: ${API_KEY.substring(0, 10)}...`);

const openai = new OpenAI({ apiKey: API_KEY });

async function test() {
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Say 'Hello from OpenAI!'" }],
            model: "gpt-3.5-turbo",
        });

        console.log("\n✅ SUCCESS! Response:");
        console.log(completion.choices[0].message.content);
    } catch (e) {
        console.error("\n❌ FAILED:");
        console.error(e.message);
    }
}

test();
