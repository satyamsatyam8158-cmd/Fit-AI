import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function Report() {
    const [report, setReport] = useState(null);

    useEffect(() => {
        API.get('/progress/report').then(r => setReport(r.data)).catch(() => { });
    }, []);

    if (!report) return <div className="loading-center"><div className="spinner" /></div>;

    const gradeColor = { A: '#10b981', B: '#06b6d4', C: '#f59e0b', D: '#f43f5e' };
    const arrow = (v) => v > 0 ? '↑' : v < 0 ? '↓' : '—';
    const color = (v) => v > 0 ? '#f43f5e' : v < 0 ? '#10b981' : '#64748b';

    return (
        <>
            <div className="page-header">
                <h1>📋 Monthly Fitness Report</h1>
                <p>{report.period} · {report.totalWeeksLogged} total weeks logged</p>
            </div>

            {/* Grade + Progress */}
            <div className="glass-card" style={{ textAlign: 'center', marginBottom: 24, padding: 32 }}>
                <div style={{ fontSize: '4rem', fontWeight: 800, color: gradeColor[report.grade] || '#64748b' }}>
                    {report.grade}
                </div>
                <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Overall Grade
                </div>
                {report.goalProgress !== null && (
                    <div style={{ marginTop: 16 }}>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, height: 20, overflow: 'hidden', maxWidth: 400, margin: '0 auto' }}>
                            <div style={{
                                width: `${report.goalProgress}%`, height: '100%',
                                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-violet))',
                                borderRadius: 10, transition: 'width 0.5s',
                            }} />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 6 }}>
                            Goal Progress: {report.goalProgress}%
                        </div>
                    </div>
                )}
            </div>

            {/* Key Metrics */}
            <div className="stats-grid">
                <div className="stat-card stat-cyan">
                    <div className="stat-label">Weight Change</div>
                    <div className="stat-value" style={{ color: color(report.totalWeightChange) }}>
                        {report.totalWeightChange !== null ? `${report.totalWeightChange > 0 ? '+' : ''}${report.totalWeightChange}` : '—'}
                        <span style={{ fontSize: '1rem' }}> kg</span>
                    </div>
                    <div className="stat-sub">total change</div>
                </div>
                <div className="stat-card stat-violet">
                    <div className="stat-label">Monthly Change</div>
                    <div className="stat-value" style={{ color: color(report.monthlyWeightChange) }}>
                        {report.monthlyWeightChange !== null ? `${report.monthlyWeightChange > 0 ? '+' : ''}${report.monthlyWeightChange}` : '—'}
                        <span style={{ fontSize: '1rem' }}> kg</span>
                    </div>
                    <div className="stat-sub">last 4 weeks</div>
                </div>
                <div className="stat-card stat-emerald">
                    <div className="stat-label">Habit Score</div>
                    <div className="stat-value">{report.habitScoreAvg}%</div>
                    <div className="stat-sub">average</div>
                </div>
                <div className="stat-card stat-amber">
                    <div className="stat-label">Weeks Logged</div>
                    <div className="stat-value">{report.totalWeeksLogged}</div>
                    <div className="stat-sub">total entries</div>
                </div>
            </div>

            {/* Adherence Breakdown */}
            <div className="glass-card" style={{ marginTop: 24 }}>
                <div className="section-title"><span className="dot" style={{ background: 'var(--accent-violet)' }} /> Adherence Breakdown</div>
                <div className="grid-2">
                    <div style={{ textAlign: 'center', padding: 16 }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: report.avgWorkoutAdherence >= 70 ? '#10b981' : report.avgWorkoutAdherence >= 40 ? '#f59e0b' : '#f43f5e' }}>
                            {report.avgWorkoutAdherence}%
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Workout Adherence</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 16 }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: report.avgDietAdherence >= 70 ? '#10b981' : report.avgDietAdherence >= 40 ? '#f59e0b' : '#f43f5e' }}>
                            {report.avgDietAdherence}%
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Diet Adherence</div>
                    </div>
                </div>
            </div>

            {/* Measurement Changes */}
            {report.measurementChange && (
                <div className="glass-card" style={{ marginTop: 24 }}>
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-emerald)' }} /> Measurement Changes</div>
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                        {[['Waist', 'waist'], ['Chest', 'chest'], ['Hips', 'hips'], ['Arms', 'arms'], ['Thighs', 'thighs']].map(([label, key]) => {
                            const v = report.measurementChange[key];
                            return (
                                <div key={key} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: color(v) }}>
                                        {arrow(v)} {v > 0 ? '+' : ''}{v} cm
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Weight Summary */}
            <div className="glass-card" style={{ marginTop: 24 }}>
                <div className="section-title"><span className="dot" /> Weight Summary</div>
                <div className="grid-2">
                    <div style={{ padding: 8 }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Starting Weight:</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, marginLeft: 8 }}>{report.weightStart ?? '—'} kg</span>
                    </div>
                    <div style={{ padding: 8 }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Current Weight:</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, marginLeft: 8 }}>{report.weightCurrent ?? '—'} kg</span>
                    </div>
                </div>
            </div>
        </>
    );
}
