import { useEffect, useState } from 'react';
import API from '../api/axios';

const phaseColors = {
    Foundation: 'var(--accent-cyan)',
    Building: 'var(--accent-violet)',
    Intensification: 'var(--accent-amber)',
    Peak: 'var(--accent-rose)',
};

export default function Roadmap() {
    const [data, setData] = useState(null);

    useEffect(() => {
        API.get('/progress/roadmap').then(r => setData(r.data)).catch(() => { });
    }, []);

    if (!data) return <div className="loading-center"><div className="spinner" /></div>;

    return (
        <>
            <div className="page-header">
                <h1>🗺️ Multi-Week Roadmap</h1>
                <p>Your 8-week progression plan preview</p>
            </div>

            {/* Summary */}
            <div className="stats-grid">
                <div className="stat-card stat-cyan">
                    <div className="stat-label">Start Weight</div>
                    <div className="stat-value">{data.startWeight} <span style={{ fontSize: '1rem' }}>kg</span></div>
                </div>
                <div className="stat-card stat-violet">
                    <div className="stat-label">Projected End</div>
                    <div className="stat-value">{data.projectedEndWeight} <span style={{ fontSize: '1rem' }}>kg</span></div>
                </div>
                <div className="stat-card stat-emerald">
                    <div className="stat-label">Weekly Rate</div>
                    <div className="stat-value">{data.weeklyRate > 0 ? '+' : ''}{data.weeklyRate} <span style={{ fontSize: '1rem' }}>kg/w</span></div>
                </div>
                <div className="stat-card stat-amber">
                    <div className="stat-label">Duration</div>
                    <div className="stat-value">{data.totalWeeks} <span style={{ fontSize: '1rem' }}>weeks</span></div>
                </div>
            </div>

            {/* Timeline */}
            <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
                {data.roadmap.map((week) => (
                    <div key={week.week} className="glass-card" style={{
                        borderLeft: `4px solid ${phaseColors[week.phase] || 'var(--accent-cyan)'}`,
                        padding: '16px 20px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginRight: 12 }}>
                                    Week {week.week}
                                </span>
                                <span className="badge" style={{ background: phaseColors[week.phase], color: '#0b1120' }}>
                                    {week.phase}
                                </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {week.projectedWeight} kg · {week.intensityPct}% intensity
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem' }}>
                            <div>
                                <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>🍽️ Diet: </span>
                                <span style={{ color: 'var(--text-secondary)' }}>{week.dietNote}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--accent-violet)', fontWeight: 600 }}>🏋️ Workout: </span>
                                <span style={{ color: 'var(--text-secondary)' }}>{week.workoutNote}</span>
                            </div>
                        </div>

                        {week.milestone && (
                            <div style={{
                                marginTop: 8, padding: '6px 12px', borderRadius: 6,
                                background: 'rgba(6,182,212,0.1)', fontSize: '0.85rem',
                                color: 'var(--accent-cyan)', fontWeight: 600,
                            }}>
                                {week.milestone}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}
