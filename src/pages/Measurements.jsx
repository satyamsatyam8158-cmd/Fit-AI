import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import API from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Measurements() {
    const [entries, setEntries] = useState([]);
    const [form, setForm] = useState({ waistCm: '', chestCm: '', hipsCm: '', armsCm: '', thighsCm: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchData = () => {
        API.get('/measurements/history')
            .then(r => setEntries(r.data))
            .catch(() => { });
    };

    useEffect(() => { fetchData(); }, []);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await API.post('/measurements/log', {
                waistCm: Number(form.waistCm),
                chestCm: Number(form.chestCm),
                hipsCm: Number(form.hipsCm),
                armsCm: Number(form.armsCm),
                thighsCm: Number(form.thighsCm),
            });
            setForm({ waistCm: '', chestCm: '', hipsCm: '', armsCm: '', thighsCm: '' });
            fetchData();
        } catch (err) {
            setError('Error logging measurement');
        } finally {
            setSubmitting(false);
        }
    };

    const labels = entries.map((_, i) => `Entry ${i + 1}`);
    const makeDS = (label, key, color) => ({
        label, data: entries.map(e => e[key]), borderColor: color,
        tension: 0.4, pointRadius: 4, pointBackgroundColor: color,
    });

    const chartData = {
        labels,
        datasets: [
            makeDS('Waist', 'waistCm', '#06b6d4'),
            makeDS('Chest', 'chestCm', '#8b5cf6'),
            makeDS('Hips', 'hipsCm', '#10b981'),
            makeDS('Arms', 'armsCm', '#f59e0b'),
            makeDS('Thighs', 'thighsCm', '#f43f5e'),
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
                <h1>📏 Body Measurements</h1>
                <p>Track how your body composition changes over time</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="glass-card" style={{ marginBottom: 24 }}>
                <div className="section-title"><span className="dot" /> Log Measurements (cm)</div>
                <form onSubmit={submit}>
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                        {[['Waist', 'waistCm'], ['Chest', 'chestCm'], ['Hips', 'hipsCm'], ['Arms', 'armsCm'], ['Thighs', 'thighsCm']].map(([label, key]) => (
                            <div className="form-group" key={key}>
                                <label>{label}</label>
                                <input className="form-input" type="number" step="0.1" placeholder="cm"
                                    value={form[key]} onChange={e => set(key, e.target.value)} required />
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Saving…' : 'Log Measurements'}
                    </button>
                </form>
            </div>

            {entries.length >= 2 && (() => {
                const first = entries[0];
                const latest = entries[entries.length - 1];
                const diff = (key) => (latest[key] - first[key]).toFixed(1);
                const arrow = (val) => val > 0 ? '↑' : val < 0 ? '↓' : '—';
                const color = (val) => val > 0 ? '#f43f5e' : val < 0 ? '#10b981' : '#64748b';
                const parts = [
                    ['Waist', 'waistCm'], ['Chest', 'chestCm'], ['Hips', 'hipsCm'],
                    ['Arms', 'armsCm'], ['Thighs', 'thighsCm'],
                ];

                // Monthly comparison: find entry closest to 30 days ago
                const now = new Date(latest.createdAt || Date.now());
                const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
                const monthEntry = entries.reduce((best, e) => {
                    const d = Math.abs(new Date(e.createdAt) - thirtyDaysAgo);
                    return !best || d < Math.abs(new Date(best.createdAt) - thirtyDaysAgo) ? e : best;
                }, null);
                const hasMonthly = monthEntry && monthEntry !== latest && entries.indexOf(monthEntry) !== entries.length - 1;

                return (
                    <>
                        <div className="glass-card" style={{ marginBottom: 24 }}>
                            <div className="section-title"><span className="dot" style={{ background: 'var(--accent-emerald)' }} /> Change Since Start</div>
                            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                                {parts.map(([label, key]) => {
                                    const d = diff(key);
                                    return (
                                        <div key={key} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: color(d) }}>
                                                {arrow(d)} {d > 0 ? '+' : ''}{d} cm
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {hasMonthly && (
                            <div className="glass-card" style={{ marginBottom: 24 }}>
                                <div className="section-title"><span className="dot" style={{ background: 'var(--accent-violet)' }} /> Last 30 Days</div>
                                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                                    {parts.map(([label, key]) => {
                                        const d = (latest[key] - monthEntry[key]).toFixed(1);
                                        return (
                                            <div key={key} style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                                                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: color(d) }}>
                                                    {arrow(d)} {d > 0 ? '+' : ''}{d} cm
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                );
            })()}

            {entries.length > 0 && (
                <div className="glass-card">
                    <div className="section-title"><span className="dot" /> Measurement Trends</div>
                    <Line data={chartData} options={chartOpts} />
                </div>
            )}
        </>
    );
}
