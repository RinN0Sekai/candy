// Candy's Brain 6.0 - Universal (OpenAI + Gemini + Rule-Based)
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// --- EXPERT RULE-BASED SYSTEM (Robust Fallback) ---
const KNOWLEDGE_BASE = {
    bleeding: {
        priority: 'Red',
        en: "Apply direct pressure to the wound with a clean cloth. Do not remove the cloth if it soaks through, just add more on top. Keep the animal calm.",
        es: "Aplique presión directa sobre la herida con un paño limpio. No quite el paño si se empapa, añada más encima.",
        hi: "Ghav par saaf kapde se dabav dalein. Agar khoon na ruke toh kapda na hatayein, uske upar aur kapda rakhein."
    },
    choking: {
        priority: 'Red',
        en: "Check if you can see the object. If visible, try to gently remove it with pliers or tweezers. Be careful not to push it further.",
        es: "Verifique si puede ver el objeto. Si es visible, intente retirarlo suavemente.",
        hi: "Dekhein agar aapko atki hui cheez dikh rahi hai. Agar dikhe toh chimti se nikalne ki koshish karein."
    },
    vomit: {
        priority: 'Yellow',
        en: "Remove food and water for 2 hours. If vomiting stops, offer small amounts of water. If it continues or there is blood, go to a vet.",
        es: "Retire la comida y el agua por 2 horas. Si el vómito para, ofrezca poca agua.",
        hi: "2 ghante ke liye khana paani hata dein. Agar ulti ruk jaye toh thoda paani dein."
    },
    heatstroke: {
        priority: 'Red',
        en: "Move to a cool area immediately. Apply cool (not ice) water to their paws and ears. Offer small sips of water.",
        es: "Mueva al animal a un área fresca inmediatamente. Aplique agua fresca en sus patas.",
        hi: "Janwar ko turant thandi jagah le jayein. Pairo par thanda paani lagayein."
    },
    poison: {
        priority: 'Red',
        en: "If you know what they ate, take a photo. Do not induce vomiting unless told by a vet. Go to emergency immediately.",
        es: "Si sabe qué comió, tome una foto. No induzca el vómito.",
        hi: "Agar pata hai kya khaya hai, toh photo lein. Ulti na karwayein. Turant hospital jayein."
    },
    greeting: {
        priority: 'Green',
        en: "Hi there! I am Candy. Tell me if your animal is hurt (e.g., 'Bleeding', 'Choking') and I will help.",
        es: "¡Hola! Soy Candy. Dime si tu animal está herido.",
        hi: "Namaste! Main Candy hoon. Batayein kya hua (jaise 'khoon' ya 'saans')."
    },
    default: {
        priority: 'Green',
        en: "I didn't catch a specific medical emergency. Could you say it again? (Try 'Bleeding' or 'Choking').",
        es: "No entendí la emergencia. ¿Puede repetirlo?",
        hi: "Main samajh nahi payi. Kripya phir se bolein (jaise 'Khoon' ya 'Saans')."
    }
};

const detectLanguage = (text) => {
    const lower = text.toLowerCase();
    if (lower.match(/(hola|ayuda|perro|gato|sangre|dolor|socorro|herido|enfermo|calma|gracias)/)) return 'es';
    if (lower.match(/(namaste|madad|kutta|billi|dard|lag|khoon|chot|bimar|kya|hua|hai|kaise|bhai|theek|pani|khana|haan|mil|gaya|kar|raha|hoon)/)) return 'hi';
    return 'en';
};

const detectIntent = (text) => {
    const lower = text.toLowerCase();
    console.log("Analyzing Fallback Intent for:", lower);

    if (lower.match(/(hello|hi|hey|greetings|candy|help|hola|namaste)/)) return 'greeting';
    if (lower.match(/(bleed|blood|cut|wound|hemorrhage|khoon|sangre|herida)/)) return 'bleeding';
    if (lower.match(/(choke|choking|stuck|breath|gag|cough|atak|saans|ahogo)/)) return 'choking';
    if (lower.match(/(vomit|puke|throw|sick|stomach|ulti|vomito)/)) return 'vomit';
    if (lower.match(/(hot|heat|sun|stroke|pant|garmi|calor|jadeo)/)) return 'heatstroke';
    if (lower.match(/(poison|ate|eat|swallow|toxic|chemical|zahar|veneno|comio)/)) return 'poison';

    return null;
};

// --- REAL AI CLIENTS ---
const geminiClient = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const openaiClient = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY, dangerouslyAllowBrowser: true }) : null;

export const analyzeEmergency = async (text) => {
    const lang = detectLanguage(text);

    const systemPrompt = `
    You are Candy, a gentle, empathetic, and intelligent AI First-Aid Guardian for animals. 
    User Input: "${text}"
    Detected Language: "${lang}" (Reply in this language).
    
    Task:
    1. Analyze urgency (Red/Yellow/Green).
    2. Provide immediate, step-by-step first aid advice.
    3. Be comforting.
    4. Concise response (2 sentences).
    
    Output JSON ONLY: { "type": "", "priority": "", "advice": "" }
    `;

    // 1. Try Gemini (Prioritized since OpenAI is Quota Limited)
    if (geminiClient) {
        console.log("Attempting Gemini...");
        try {
            const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            const textResponse = response.text();

            // Clean markdown if present
            const jsonStr = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(jsonStr);

            console.log("Gemini Success:", data);
            return {
                type: data.type,
                priority: data.priority,
                advice: data.advice + " (Gemini Live)",
                action: 'AI Guidance (Gemini)',
                detectedLanguage: lang
            };

        } catch (error) {
            console.error("Gemini Failed:", error);
            // Continue to OpenAI...
        }
    }

    // 2. Try OpenAI (Secondary)
    if (openaiClient) {
        console.log("Attempting OpenAI...");
        try {
            const completion = await openaiClient.chat.completions.create({
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: text }],
                model: "gpt-3.5-turbo",
                response_format: { type: "json_object" }
            });

            const data = JSON.parse(completion.choices[0].message.content);
            console.log("OpenAI Success:", data);
            return {
                type: data.type,
                priority: data.priority,
                advice: data.advice + " (GPT Live)",
                action: 'AI Guidance (GPT)',
                detectedLanguage: lang
            };
        } catch (e) {
            console.error("OpenAI Failed:", e);
        }
    }

    // 3. Expert Fallback
    await new Promise(r => setTimeout(r, 600));

    const intent = detectIntent(text);
    console.log("Detected Intent:", intent);

    const data = KNOWLEDGE_BASE[intent] || KNOWLEDGE_BASE['default'];

    return {
        type: intent ? `Medical: ${intent}` : 'General Alert',
        priority: data.priority,
        advice: data[lang],
        action: 'Expert Protocol',
        detectedLanguage: lang
    };
};

export const resetSession = () => { };
