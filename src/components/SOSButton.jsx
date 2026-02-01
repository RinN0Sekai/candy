import { AlertTriangle } from 'lucide-react';

const SOSButton = ({ onActivate }) => {
    return (
        <button
            onClick={onActivate}
            className="sos-btn"
            style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--danger)',
                border: '4px solid rgba(255,255,255,0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 100,
                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            <AlertTriangle size={32} fill="white" stroke="var(--danger)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', marginTop: '2px' }}>SOS</span>
        </button>
    );
};

export default SOSButton;
