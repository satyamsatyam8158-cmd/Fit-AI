import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function HabitScore() {
    const [habit, setHabit] = useState(null);
    const [energyLogs, setEnergyLogs] = useState([]);
    const [form, setForm] = useState({ fatigueLevel: 5, sleepHours: '', stressLevel: 5, notes: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        API.get('/progress/habit').then(r => setHabit(r.data)).catch(() => { });
        API.get('/progress/energy').then(r => setEnergyLogs(r.data)).catch(() => { });
    }, []);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submitEnergy = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post('/progress/energy', {
                fatigueLevel: Number(form.fatigueLevel),
                sleepHours: Number(form.sleepHours),
                stressLevel: Number(form.stressLevel),
                notes: form.notes,
            });
            setForm({ fatigueLevel: 5, sleepHours: '', stressLevel: 5, notes: '' });
            API.get('/progress/energy').then(r => setEnergyLogs(r.data));
        } catch (err) {
            alert('Error');
        } finally {
            setSubmitting(false);
        }
    };

    const scoreColor = (s) => s >= 80 ? 'var(--accent-emerald)' : s >= 60 ? 'var(--accent-amber)' : 'var(--accent-rose)';
    const trendIcon = { improving: '📈', declining: '📉', stable: '➡️', none: '—' };

    return (
        <>
            <div className="page-header">
                <h1>🔥 Habit Score & Energy</h1>
                <p>Track your consistency and daily energy levels</p>
            </div>

            {/* Habit Score Overview */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-label">Habit Score</div>
                    <div className="stat-value" style={{ color: habit ? scoreColor(habit.currentScore) : 'var(--text-muted)' }}>
                        {habit?.currentScore ?? '—'}
                    </div>
                    <div className="stat-sub">out of 100</div>
                </div>
                <div className="stat-card stat-amber">
                    <div className="stat-label">Current Streak</div>
                    <div className="stat-value">{habit?.streak ?? 0}</div>
                    <div className="stat-sub">weeks</div>
                </div>
                <div className="stat-card stat-violet">
                    <div className="stat-label">Trend</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem' }}>
                        {trendIcon[habit?.trend] || '—'} {habit?.trend || 'none'}
                    </div>
                </div>
                <div className="stat-card stat-cyan">
                    <div className="stat-label">Monthly Average</div>
                    <div className="stat-value" style={{ color: habit?.monthlyAvg ? scoreColor(habit.monthlyAvg) : 'var(--text-muted)' }}>
                        {habit?.monthlyAvg ?? '—'}
                    </div>
                    <div className="stat-sub">last 4 weeks</div>
                </div>
            </div>

            {habit?.alert && <div className="alert alert-warning" style={{ marginBottom: 24 }}>{habit.alert}</div>}

            <div className="grid-2">
                {/* Energy Check-in */}
                <div className="glass-card">
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-amber)' }} /> Energy Check-In</div>
                    <form onSubmit={submitEnergy}>
                        <div className="form-group">
                            <label>How are you feeling?</label>
                            <select className="form-input"
                                value={form.fatigueLevel} onChange={e => set('fatigueLevel', e.target.value)}>
                                <option value="2">⚡ Energized</option>
                                <option value="4">😊 Normal</option>
                                <option value="5">🙂 Slightly Tired</option>
                                <option value="7">😓 Fatigued</option>
                                <option value="9">😵 Very Tired</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Sleep Hours</label>
                            <input className="form-input" type="number" step="0.5" placeholder="7.5"
                                value={form.sleepHours} onChange={e => set('sleepHours', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Stress Level (1–10): {form.stressLevel}</label>
                            <input type="range" min="1" max="10" value={form.stressLevel}
                                onChange={e => set('stressLevel', e.target.value)}
                                style={{ width: '100%', accentColor: 'var(--accent-violet)' }} />
                        </div>
                        <div className="form-group">
                            <label>Notes</label>
                            <input className="form-input" placeholder="How do you feel today?"
                                value={form.notes} onChange={e => set('notes', e.target.value)} />
                        </div>
                        <button className="btn btn-primary btn-block" disabled={submitting}>
                            {submitting ? 'Saving…' : 'Log Energy'}
                        </button>
                    </form>
                </div>

                {/* Recent Energy Logs */}
                <div className="glass-card">
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-emerald)' }} /> Recent Energy Logs</div>
                    {energyLogs.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No energy logs yet. Start checking in daily!</p>
                    ) : (
                        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                            {energyLogs.slice(0, 10).map((log, i) => (
                                <div key={i} style={{
                                    padding: '12px 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    fontSize: '0.9rem',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span>
                                            Fatigue: <strong>{log.fatigueLevel}/10</strong> &nbsp;|&nbsp;
                                            Sleep: <strong>{log.sleepHours}h</strong> &nbsp;|&nbsp;
                                            Stress: <strong>{log.stressLevel}/10</strong>
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {log.notes && <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{log.notes}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
