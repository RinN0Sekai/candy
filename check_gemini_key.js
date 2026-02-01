import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(process.cwd(), '.env');
let API_KEY = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
    if (match) {
        API_KEY = match[1].trim();
    }
} catch (e) {
    console.error("Could not read .env file", e);
}

console.log(`Testing Gemini Key: ${API_KEY.substring(0, 10)}...`);

const genAI = new GoogleGenerativeAI(API_KEY);

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello?");
        const response = await result.response;
        console.log("✅ SUCCESS! Response:", response.text());
    } catch (error) {
        console.error("❌ FAILED:");
        console.error(error.message);
        if (error.message.includes("404")) {
            console.log("\n[Tip] 404 means 'Generative Language API' is NOT enabled on Google Cloud Project.");
        }
    }
}

run();
