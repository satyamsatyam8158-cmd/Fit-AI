import { useEffect, useState, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import API from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Progress() {
    const [logs, setLogs] = useState([]);
    const [form, setForm] = useState({ weekNumber: '', weightKg: '', workoutAdherence: '', dietAdherence: '', notes: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchLogs = () => {
        API.get('/progress/history')
            .then(r => setLogs(r.data))
            .catch(() => { });
    };
    useEffect(() => { fetchLogs(); }, []);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post('/progress/log', {
                weekNumber: Number(form.weekNumber),
                weightKg: Number(form.weightKg),
                workoutAdherence: Number(form.workoutAdherence),
                dietAdherence: Number(form.dietAdherence),
                notes: form.notes,
            });
            setForm({ weekNumber: '', weightKg: '', workoutAdherence: '', dietAdherence: '', notes: '' });
            fetchLogs();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error');
        } finally {
            setSubmitting(false);
        }
    };

    const chartData = {
        labels: logs.map(l => `Wk ${l.weekNumber}`),
        datasets: [
            {
                label: 'Weight (kg)',
                data: logs.map(l => l.weightKg),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6,182,212,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#06b6d4',
            },
        ],
    };

    const adherenceData = {
        labels: logs.map(l => `Wk ${l.weekNumber}`),
        datasets: [
            {
                label: 'Workout %',
                data: logs.map(l => l.workoutAdherence),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139,92,246,0.1)',
                fill: true, tension: 0.4,
            },
            {
                label: 'Diet %',
                data: logs.map(l => l.dietAdherence),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.1)',
                fill: true, tension: 0.4,
            },
        ],
    };

    const chartOpts = {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
            x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        },
    };

    return (
        <>
            <div className="page-header">
                <h1>📈 Progress Tracking</h1>
                <p>Log your weekly progress and track trends over time</p>
            </div>

            {/* Log Form */}
            <div className="glass-card" style={{ marginBottom: 24 }}>
                <div className="section-title"><span className="dot" /> Log Progress</div>
                <form onSubmit={submit}>
                    <div className="grid-3" style={{ gap: 16 }}>
                        <div className="form-group">
                            <label>Week #</label>
                            <input className="form-input" type="number" placeholder="1"
                                value={form.weekNumber} onChange={e => set('weekNumber', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Weight (kg)</label>
                            <input className="form-input" type="number" step="0.1" placeholder="74.5"
                                value={form.weightKg} onChange={e => set('weightKg', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Workout Adherence</label>
                            <select className="form-input"
                                value={form.workoutAdherence} onChange={e => set('workoutAdherence', e.target.value)} required>
                                <option value="">Select</option>
                                <option value="100">✅ Completed (100%)</option>
                                <option value="80">👍 Mostly Done (80%)</option>
                                <option value="50">⚡ Partial (50%)</option>
                                <option value="25">😕 Minimal (25%)</option>
                                <option value="0">❌ Skipped (0%)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Diet Adherence</label>
                            <select className="form-input"
                                value={form.dietAdherence} onChange={e => set('dietAdherence', e.target.value)} required>
                                <option value="">Select</option>
                                <option value="100">✅ On Plan (100%)</option>
                                <option value="80">👍 Mostly On Plan (80%)</option>
                                <option value="50">⚡ Some Deviations (50%)</option>
                                <option value="25">😕 Mostly Off Plan (25%)</option>
                                <option value="0">❌ Off Plan (0%)</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Notes (optional)</label>
                            <input className="form-input" placeholder="How's the week going?"
                                value={form.notes} onChange={e => set('notes', e.target.value)} />
                        </div>
                    </div>
                    <button className="btn btn-primary" disabled={submitting} style={{ marginTop: 8 }}>
                        {submitting ? 'Saving…' : 'Log Progress'}
                    </button>
                </form>
            </div>

            {/* Charts */}
            {logs.length > 0 && (
                <div className="grid-2">
                    <div className="glass-card">
                        <div className="section-title"><span className="dot" /> Weight Trend</div>
                        <Line data={chartData} options={chartOpts} />
                    </div>
                    <div className="glass-card">
                        <div className="section-title"><span className="dot" style={{ background: 'var(--accent-violet)' }} /> Adherence</div>
                        <Line data={adherenceData} options={chartOpts} />
                    </div>
                </div>
            )}
        </>
    );
}
