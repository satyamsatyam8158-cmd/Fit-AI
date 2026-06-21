import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function WorkoutPlan() {
    const [plan, setPlan] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [energyAlert, setEnergyAlert] = useState(null);

    useEffect(() => {
        API.get('/workout/current').then(r => setPlan(r.data)).catch(() => { });
        API.get('/progress/energy-adjustment').then(r => {
            if (r.data.adjustment !== 'none') setEnergyAlert(r.data);
        }).catch(() => { });
    }, []);

    const generate = async () => {
        setGenerating(true);
        try {
            const { data } = await API.post('/workout/generate');
            setPlan(data);
        } catch (err) {
            alert(err.response?.data?.msg || 'Error');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1>🏋️ Workout Plan</h1>
                    <p>Your personalized 7-day training program</p>
                </div>
                <button className="btn btn-primary" onClick={generate} disabled={generating}>
                    {generating ? 'Generating…' : plan ? '↻ Regenerate' : '+ Generate Plan'}
                </button>
            </div>

            {energyAlert && (
                <div className="glass-card" style={{
                    marginBottom: 20, padding: '16px 20px',
                    borderLeft: `3px solid ${energyAlert.adjustment === 'recovery' ? 'var(--accent-rose)' : 'var(--accent-amber)'}`,
                }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                        {energyAlert.message}
                    </p>
                </div>
            )}

            {!plan ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 60 }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                        No workout plan yet. Generate one based on your profile!
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={generate} disabled={generating}>
                        Generate My Plan
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                    {plan.days.map((day, i) => (
                        <div className="day-card" key={i}>
                            <div className="day-card-header">
                                <h3>{day.day}</h3>
                                <span className="badge">{day.focus}</span>
                            </div>
                            {day.exercises.length > 0 ? (
                                <div className="exercise-list">
                                    {day.exercises.map((ex, j) => (
                                        <div className="exercise-item" key={j}>
                                            <span className="exercise-name">{ex.name}</span>
                                            <span className="exercise-detail">
                                                {ex.sets} × {ex.reps} &nbsp;|&nbsp; Rest {ex.restSec}s
                                            </span>
                                            {ex.notes && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: 4, fontStyle: 'italic' }}>
                                                    💡 {ex.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rest-day">🧘 Rest & Recovery — Take it easy today</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="glass-card" style={{ marginTop: 24, padding: '16px 20px', borderLeft: '3px solid var(--accent-amber)', opacity: 0.85 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                    ⚠️ <strong style={{ color: 'var(--accent-amber)' }}>Medical Disclaimer:</strong> This workout plan is generated for informational purposes only and is not a substitute for professional medical advice. Consult a qualified healthcare provider or certified fitness professional before starting any new exercise program, especially if you have pre-existing health conditions or injuries.
                </p>
            </div>
        </>
    );
}
