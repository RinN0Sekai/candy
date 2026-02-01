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
        const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
        if (match) {
            API_KEY = match[1].trim();
        }
    }
} catch (e) {
    console.error("Could not read .env file", e);
}

if (!API_KEY) {
    console.error("No API Key found.");
    process.exit(1);
}

console.log(`Testing Key: ${API_KEY.substring(0, 10)}...`);

async function testRaw() {
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    const payload = {
        contents: [{
            parts: [{ text: "Hello" }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const status = response.status;
        const data = await response.json();

        console.log(`\nHTTP Status: ${status}`);

        if (status === 200) {
            console.log("✅ SUCCESS! API is working.");
        } else {
            console.log("❌ ERROR DETAILS:");
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error("Network Error:", e);
    }
}

testRaw();
