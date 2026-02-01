import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Handling __dirname in ESM
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
    console.error("No API Key found in .env file.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    console.log("Checking available models for provided key...");

    // List of models to test compatibility
    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    let successCount = 0;

    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // Try a minimal generation to valid access
            await model.generateContent("Hi");
            console.log(`✅ SUCCESS: ${modelName} is available.`);
            successCount++;
        } catch (e) {
            let msg = e.message.split('[')[0];
            if (e.message.includes('404')) msg = '404 Not Found (Region/Access)';
            console.log(`❌ FAILED: ${modelName} - ${msg}`);
        }
    }

    if (successCount === 0) {
        console.log("\n⚠️  No models worked. The API Key might be invalid, or the project lacks 'Geneative Language API' permission.");
    } else {
        console.log("\n🎉 At least one model is working!");
    }
}

listModels();
