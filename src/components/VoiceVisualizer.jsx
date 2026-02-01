import { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';

const VoiceVisualizer = ({ isListening, isSpeaking, onClick }) => {
    const [waves, setWaves] = useState([1, 1, 1]);

    useEffect(() => {
        if (isListening || isSpeaking) {
            const interval = setInterval(() => {
                setWaves(prev => prev.map(() => Math.random() * 0.5 + 0.5));
            }, 200);
            return () => clearInterval(interval);
        } else {
            setWaves([1, 1, 1]);
        }
    }, [isListening, isSpeaking]);

    const isActive = isListening || isSpeaking;

    return (
        <div className="voice-visualizer" style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '2rem',
            cursor: 'pointer'
        }} onClick={onClick}>

            {/* Ripple Effects */}
            {isActive && (
                <div className="ripple-container" style={{ position: 'absolute' }}>
                    <div className="ripple" style={{ animationDelay: '0s', borderColor: isSpeaking ? 'var(--secondary)' : 'var(--primary-glow)' }}></div>
                    <div className="ripple" style={{ animationDelay: '1s', borderColor: isSpeaking ? 'var(--secondary)' : 'var(--primary-glow)' }}></div>
                </div>
            )}

            {/* Main Orb */}
            <div className="orb" style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: isSpeaking
                    ? 'linear-gradient(135deg, var(--secondary), var(--success))'
                    : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                boxShadow: `0 0 ${isActive ? '50px' : '20px'} ${isSpeaking ? 'var(--secondary)' : 'var(--primary-glow)'}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.4s ease',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                zIndex: 10
            }}>
                {/* Inner Waveform Simulation */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '40px' }}>
                    {isActive ? (
                        // Simple bars that scale
                        [0, 1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                                width: '4px',
                                height: '20px',
                                background: 'white',
                                borderRadius: '2px',
                                animation: 'wave 0.5s infinite ease-in-out',
                                animationDelay: `${i * 0.1}s`
                            }} />
                        ))
                    ) : (
                        <Mic size={48} color="white" />
                    )}
                </div>
            </div>

            <style>{`
        @keyframes wave {
          0%, 100% { height: 10px; opacity: 0.5; }
          50% { height: 30px; opacity: 1; }
        }
        .ripple {
          position: absolute;
          border: 2px solid var(--primary-glow);
          border-radius: 50%;
          width: 120px;
          height: 120px;
          animation: ripple-growth 2s infinite linear;
          opacity: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        @keyframes ripple-growth {
          0% { width: 120px; height: 120px; opacity: 0.8; }
          100% { width: 300px; height: 300px; opacity: 0; }
        }
      `}</style>
        </div>
    );
};

export default VoiceVisualizer;
