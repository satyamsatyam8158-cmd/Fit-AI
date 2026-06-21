import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [habit, setHabit] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [overload, setOverload] = useState(null);
    const [adjustment, setAdjustment] = useState(null);
    const [energy, setEnergy] = useState(null);
    const [todayWorkout, setTodayWorkout] = useState(null);
    const [report, setReport] = useState(null);

    useEffect(() => {
        API.get('/profile').then(r => setProfile(r.data)).catch(() => { });
        API.get('/progress/habit').then(r => setHabit(r.data)).catch(() => { });
        API.get('/progress/forecast').then(r => setForecast(r.data)).catch(() => { });
        API.get('/workout/overload').then(r => setOverload(r.data)).catch(() => { });
        API.get('/progress/adjustment').then(r => setAdjustment(r.data)).catch(() => { });
        API.get('/progress/energy-adjustment').then(r => setEnergy(r.data)).catch(() => { });
        API.get('/progress/report').then(r => setReport(r.data)).catch(() => { });
        // Get today's workout
        API.get('/workout/current').then(r => {
            if (r.data?.days) {
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const today = days[new Date().getDay()];
                const dayPlan = r.data.days.find(d => d.day === today);
                setTodayWorkout(dayPlan);
            }
        }).catch(() => { });
    }, []);

    if (!profile) return <div className="loading-center"><div className="spinner" /></div>;

    const goalLabel = {
        lose_weight: 'Lose Weight', build_muscle: 'Build Muscle',
        body_recomposition: 'Body Recomposition',
        maintain: 'Maintain', improve_endurance: 'Endurance',
    };

    const severityColor = { high: 'var(--accent-rose)', moderate: 'var(--accent-amber)' };

    return (
        <>
            <div className="page-header">
                <h1>Welcome back, {profile.name || 'Athlete'} 👋</h1>
                <p>Your unified fitness command center</p>
            </div>

            {/* ── Row 1: Core Stats ── */}
            <div className="stats-grid">
                <div className="stat-card stat-cyan">
                    <div className="stat-label">Current Weight</div>
                    <div className="stat-value">{profile.weightKg || '—'} <span style={{ fontSize: '1rem' }}>kg</span></div>
                    <div className="stat-sub">Target: {profile.targetWeightKg || '—'} kg</div>
                </div>
                <div className="stat-card stat-violet">
                    <div className="stat-label">Active Goal</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem' }}>{goalLabel[profile.goal] || '—'}</div>
                    <div className="stat-sub">Level: {profile.experience || '—'}</div>
                </div>
                <div className="stat-card stat-emerald">
                    <div className="stat-label">Habit Score</div>
                    <div className="stat-value">{habit?.currentScore ?? '—'}</div>
                    <div className="stat-sub">Streak: {habit?.streak ?? 0} weeks</div>
                </div>
                <div className="stat-card stat-amber">
                    <div className="stat-label">Goal Forecast</div>
                    <div className="stat-value" style={{ fontSize: '1.2rem' }}>
                        {forecast?.weeksRemaining ? `${forecast.weeksRemaining}w` : '—'}
                    </div>
                    <div className="stat-sub">{forecast?.estimatedDate || 'Not enough data'}</div>
                </div>
            </div>

            {/* ── Row 2: Adherence + Energy + Grade ── */}
            <div className="stats-grid" style={{ marginTop: 16 }}>
                <div className="stat-card stat-cyan">
                    <div className="stat-label">Workout Adherence</div>
                    <div className="stat-value">{report?.avgWorkoutAdherence ?? '—'}%</div>
                    <div className="stat-sub">recent average</div>
                </div>
                <div className="stat-card stat-violet">
                    <div className="stat-label">Diet Adherence</div>
                    <div className="stat-value">{report?.avgDietAdherence ?? '—'}%</div>
                    <div className="stat-sub">recent average</div>
                </div>
                <div className="stat-card stat-emerald">
                    <div className="stat-label">Energy Status</div>
                    <div className="stat-value" style={{ fontSize: '1.2rem' }}>
                        {energy?.avgFatigue ? (energy.avgFatigue <= 4 ? '⚡ Good' : energy.avgFatigue <= 7 ? '😐 OK' : '😓 Low') : '—'}
                    </div>
                    <div className="stat-sub">{energy?.avgSleep ? `${energy.avgSleep}h sleep avg` : 'No data'}</div>
                </div>
                <div className="stat-card stat-amber">
                    <div className="stat-label">Overall Grade</div>
                    <div className="stat-value" style={{ fontSize: '2rem', color: report?.grade === 'A' ? '#10b981' : report?.grade === 'B' ? '#06b6d4' : report?.grade === 'C' ? '#f59e0b' : '#f43f5e' }}>
                        {report?.grade || '—'}
                    </div>
                    <div className="stat-sub">Goal: {report?.goalProgress ?? '—'}% complete</div>
                </div>
            </div>

            {/* ── Today's Workout ── */}
            <div className="glass-card" style={{ marginTop: 24 }}>
                <div className="section-title"><span className="dot" style={{ background: 'var(--accent-violet)' }} /> Today's Workout</div>
                {todayWorkout ? (
                    todayWorkout.exercises.length > 0 ? (
                        <div>
                            <span className="badge" style={{ marginBottom: 12, display: 'inline-block' }}>{todayWorkout.focus}</span>
                            <div className="exercise-list">
                                {todayWorkout.exercises.map((ex, i) => (
                                    <div className="exercise-item" key={i}>
                                        <span className="exercise-name">{ex.name}</span>
                                        <span className="exercise-detail">{ex.sets} × {ex.reps}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>🧘 Rest day — take it easy!</p>
                    )
                ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No workout plan yet. Generate one from the Workout page.</p>
                )}
            </div>

            {/* ── Smart Adjustment Suggestions (#16) ── */}
            {adjustment && adjustment.adjustments?.length > 0 && (
                <div className="glass-card" style={{ marginTop: 24 }}>
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-rose)' }} /> Smart Adjustments</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>{adjustment.summary}</p>
                    {adjustment.adjustments.map((adj, i) => (
                        <div key={i} style={{
                            padding: '12px 16px', marginBottom: 8,
                            borderLeft: `3px solid ${severityColor[adj.severity] || 'var(--accent-cyan)'}`,
                            background: 'rgba(255,255,255,0.02)', borderRadius: 8,
                        }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                {adj.icon} {adj.title}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {adj.message}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── AI Coaching Suggestion ── */}
            {overload && (
                <div className="glass-card" style={{ marginTop: 24 }}>
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-cyan)' }} /> AI Coaching Suggestion</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        {overload.message || 'Keep logging progress to get personalized coaching!'}
                    </p>
                </div>
            )}

            {/* ── Goal Forecast with Confidence Band ── */}
            {forecast && (
                <div className="glass-card" style={{ marginTop: 24 }}>
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-amber)' }} /> Goal Timeline</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        {forecast.message}
                    </p>
                    {forecast.estimatedDate && (
                        <p style={{ color: 'var(--accent-amber)', fontWeight: 600, marginTop: 8 }}>
                            📅 Estimated completion: {forecast.estimatedDate}
                        </p>
                    )}
                    {forecast.confidenceBand && (
                        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--accent-emerald)' }}>
                                🟢 Best case: {forecast.confidenceBand.optimistic.date} ({forecast.confidenceBand.optimistic.weeks}w)
                            </span>
                            <span style={{ color: 'var(--accent-rose)' }}>
                                🔴 Worst case: {forecast.confidenceBand.pessimistic.date} ({forecast.confidenceBand.pessimistic.weeks}w)
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* ── Adjustment Summary ── */}
            {adjustment && !adjustment.adjustments?.length && (
                <div className="glass-card" style={{ marginTop: 24 }}>
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-emerald)' }} /> Plan Status</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{adjustment.summary}</p>
                </div>
            )}

            <div className="glass-card" style={{ marginTop: 24, padding: '16px 20px', borderLeft: '3px solid var(--accent-amber)', opacity: 0.85 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                    ⚠️ <strong style={{ color: 'var(--accent-amber)' }}>Medical Disclaimer:</strong> FitAI provides fitness guidance for informational purposes only. Always consult a qualified healthcare professional before starting any exercise or nutrition program. Individual results may vary.
                </p>
            </div>
        </>
    );
}
