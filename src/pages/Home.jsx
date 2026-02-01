import { useState, useEffect, useRef } from 'react';
import VoiceVisualizer from '../components/VoiceVisualizer';
import SOSButton from '../components/SOSButton';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useTextToSpeech from '../hooks/useTextToSpeech';
import useChatHistory from '../hooks/useChatHistory';
import { analyzeEmergency } from '../services/aiService';
import { useEmergency } from '../context/EmergencyContext';
import { getNearbyVets } from '../services/vetService';
import { Trash2 } from 'lucide-react';

const Home = () => {
    const { isListening, transcript, startListening, stopListening, error } = useSpeechRecognition();
    const { speak, cancel, isSpeaking } = useTextToSpeech();
    const { messages, addMessage, clearHistory } = useChatHistory();
    const { addEmergency } = useEmergency();
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-Process when listening stops (e.g. silence)
    useEffect(() => {
        if (!isListening && transcript) {
            processEmergency(transcript);
        }
    }, [isListening]);

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            // Stop speaking if interrupted
            if (isSpeaking) {
                cancel();
            }
            startListening();
        }
    };

    const processEmergency = async (text) => {
        if (!text) return;

        // Add User Message
        addMessage(text, 'user');

        try {
            const result = await analyzeEmergency(text);

            const aiText = result.advice;

            // Add AI Message
            addMessage(aiText, 'ai');

            // Speak the advice
            speak(aiText, result.detectedLanguage);

            // AUTO-SUGGEST VETS (If Priority is High)
            if (result.priority === 'Red' || result.priority === 'Yellow') {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const vets = getNearbyVets(pos.coords.latitude, pos.coords.longitude);

                    // Format Vets as a special message or UI element
                    const vetListMsg = "📍 I found these vets nearby:\n" +
                        vets.map(v => `• ${v.name} (${v.dist}) - ${v.status}`).join("\n");

                    addMessage(vetListMsg, 'ai');

                    // Also report to dashboard
                    addEmergency({
                        id: Date.now(),
                        type: result.type,
                        priority: result.priority,
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        status: 'Active',
                        time: new Date().toLocaleTimeString()
                    });
                }, null, { enableHighAccuracy: true });
            }

        } catch (err) {
            console.error(err);
            addMessage("I'm having trouble connecting, but I am alerting nearby help.", 'ai');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            maxWidth: '100vw',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg-dark)',
            color: 'white'
        }}>
            {/* Header / Chat Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                paddingBottom: '240px', // Space for bottom controls
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        marginTop: '20vh',
                        opacity: 0.6
                    }}>
                        <h1>Hi, I'm Candy.</h1>
                        <p>Tell me what is wrong with your animal.</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        padding: '1rem',
                        borderRadius: '1.5rem',
                        borderBottomRightRadius: msg.sender === 'user' ? '4px' : '1.5rem',
                        borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '1.5rem',
                        background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white', // Ensure text is visible
                        backdropFilter: 'blur(10px)',
                        fontSize: '1.1rem',
                        lineHeight: '1.5'
                    }}>
                        <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                    </div>
                ))}

                {/* Live Transcript Preview */}
                {isListening && transcript && (
                    <div style={{
                        alignSelf: 'flex-end',
                        maxWidth: '80%',
                        padding: '1rem',
                        borderRadius: '1rem',
                        border: '1px dashed rgba(255,255,255,0.3)',
                        color: 'rgba(255,255,255,0.7)'
                    }}>
                        {transcript}...
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Clear History Button (Top Right) */}
            {messages.length > 0 && (
                <button
                    onClick={clearHistory}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'rgba(0,0,0,0.3)',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                    title="Clear History"
                >
                    <Trash2 size={20} />
                </button>
            )}

            {/* Bottom Controls */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                background: 'linear-gradient(to top, var(--bg-dark) 20%, transparent)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                zIndex: 20
            }}>
                {/* Status Text */}
                <p style={{
                    minHeight: '1.5rem',
                    color: isListening ? 'var(--highlight)' : 'rgba(255,255,255,0.5)',
                    fontWeight: '500'
                }}>
                    {isListening ? "Listening..." : (isSpeaking ? "Speaking..." : "Tap to Speak")}
                </p>

                {/* Visualizer / Button */}
                <VoiceVisualizer
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    onClick={toggleListening}
                />

                {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p>}

                {/* SOS Button remains accessible */}
                <div style={{ position: 'absolute', bottom: '2rem', right: '2rem' }}>
                    <SOSButton />
                </div>

                {/* Dashboard Link */}
                <div style={{ position: 'absolute', bottom: '2rem', left: '2rem' }}>
                    <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>
                        Dashboard &rarr;
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Home;
