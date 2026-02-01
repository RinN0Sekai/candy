import { useState, useEffect, useRef } from 'react';

const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synth = useRef(window.speechSynthesis);
    const [voices, setVoices] = useState([]);

    useEffect(() => {
        const loadVoices = () => {
            const vs = window.speechSynthesis.getVoices();
            console.log(`Loaded ${vs.length} voices.`);
            setVoices(vs);
        };

        loadVoices();

        // Chrome loads voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const speak = (text, languageCode = 'en') => {
        if (!synth.current) return;

        console.log(`TTS Request: "${text}" (${languageCode})`);

        // Cancel strictly before creating new utterance
        synth.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        const langMap = {
            'en': 'en-US',
            'es': 'es-ES',
            'hi': 'hi-IN'
        };
        const targetLang = langMap[languageCode] || 'en-US';
        utterance.lang = targetLang;

        // Select Voice - now using the state-loaded voices
        // Prioritize: specific lang -> generic lang -> defaults
        let bestVoice = voices.find(v => v.lang === targetLang); // Exact match

        if (!bestVoice) {
            // Prefix match (e.g. en-GB for en-US req if US missing)
            bestVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
        }

        if (!bestVoice) {
            // Fallback default
            bestVoice = voices.find(v => v.default) || voices[0];
        }

        if (bestVoice) {
            utterance.voice = bestVoice;
            console.log("Using Voice:", bestVoice.name);
        } else {
            console.warn("No specific voice found, using system default.");
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            setIsSpeaking(false);
        };

        synth.current.speak(utterance);
    };

    const cancel = () => {
        if (synth.current) {
            synth.current.cancel();
            setIsSpeaking(false);
        }
    };

    return { speak, cancel, isSpeaking };
};

export default useTextToSpeech;
