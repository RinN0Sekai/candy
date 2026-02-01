import { useState, useEffect, useRef } from 'react';

const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError('Browser does not support Speech Recognition.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false; // Stop after one sentence for now, or true for continuous
        recognition.interimResults = true;
        // recognition.lang = 'en-US'; // Removed to allow browser default / user preference

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event) => {
            let currentTrans = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                currentTrans += event.results[i][0].transcript;
            }
            setTranscript(currentTrans);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setError(event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setError(null);
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    return { isListening, transcript, startListening, stopListening, error };
};

export default useSpeechRecognition;
