import { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import { Activity, Radio, AlertCircle } from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';

const Dashboard = () => {
    const { emergencies } = useEmergency();

    return (
        <div style={{ padding: '2rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="text-gradient">Organization Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <span className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 5px var(--danger)' }}></span>
                        {emergencies.filter(e => e.priority === 'Red').length} Critical
                    </span>
                    <span className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={16} /> Live Feed
                    </span>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', flex: 1, minHeight: 0 }}>
                {/* Left Panel: List */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Radio size={20} color="var(--primary)" /> Incoming Alerts
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {emergencies.map(em => (
                            <div key={em.id} style={{
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 'var(--radius-sm)',
                                borderLeft: `4px solid ${em.priority === 'Red' ? 'var(--danger)' : 'var(--warning)'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: '600' }}>{em.type}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{em.time}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: em.status === 'New' ? 'var(--primary)' : 'var(--success)' }}>{em.status}</span>
                                    <button style={{
                                        background: 'none',
                                        border: '1px solid var(--glass-border)',
                                        color: 'white',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}>Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Map */}
                <div style={{ height: '100%', minHeight: 0 }}>
                    <MapComponent emergencies={emergencies} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
