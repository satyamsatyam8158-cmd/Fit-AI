import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import API from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function Analytics() {
    const [data, setData] = useState(null);

    useEffect(() => {
        API.get('/progress/analytics').then(r => setData(r.data)).catch(() => { });
    }, []);

    const chartOpts = {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
            x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        },
    };

    if (!data) return <div className="loading-center"><div className="spinner" /></div>;

    // Habit Trends chart
    const habitChart = {
        labels: data.habitTrends.map(h => `Wk ${h.week}`),
        datasets: [
            { label: 'Workout %', data: data.habitTrends.map(h => h.workout), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', fill: true, tension: 0.4 },
            { label: 'Diet %', data: data.habitTrends.map(h => h.diet), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
            { label: 'Combined Score', data: data.habitTrends.map(h => h.score), borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.1)', fill: true, tension: 0.4, borderDash: [5, 5] },
        ],
    };

    // Velocity chart
    const velocityChart = {
        labels: data.velocityData.map(v => `Wk ${v.week}`),
        datasets: [{
            label: 'Weight Change (kg/week)',
            data: data.velocityData.map(v => v.change),
            backgroundColor: data.velocityData.map(v => v.change < 0 ? 'rgba(16,185,129,0.7)' : 'rgba(244,63,94,0.7)'),
            borderRadius: 6,
        }],
    };

    // Volume Trend chart
    const volumeChart = {
        labels: data.volumeTrend.map(v => `Wk ${v.week}`),
        datasets: [{
            label: 'Workout Adherence %',
            data: data.volumeTrend.map(v => v.adherence),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245,158,11,0.15)',
            fill: true, tension: 0.4,
            pointRadius: 5, pointBackgroundColor: '#f59e0b',
        }],
    };

    // Energy Trend chart
    const energyChart = data.energyTrend.length > 0 ? {
        labels: data.energyTrend.map((_, i) => `Day ${i + 1}`),
        datasets: [
            { label: 'Fatigue', data: data.energyTrend.map(e => e.fatigue), borderColor: '#f43f5e', tension: 0.4 },
            { label: 'Sleep (h)', data: data.energyTrend.map(e => e.sleep), borderColor: '#8b5cf6', tension: 0.4 },
            { label: 'Stress', data: data.energyTrend.map(e => e.stress), borderColor: '#f59e0b', tension: 0.4 },
        ],
    } : null;

    return (
        <>
            <div className="page-header">
                <h1>📊 Extended Analytics</h1>
                <p>Deep insights into your fitness journey</p>
            </div>

            <div className="grid-2">
                <div className="glass-card">
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-violet)' }} /> Multi-Week Habit Trends</div>
                    {data.habitTrends.length > 0 ? <Line data={habitChart} options={chartOpts} /> : <p style={{ color: 'var(--text-muted)' }}>Log progress to see trends</p>}
                </div>

                <div className="glass-card">
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-emerald)' }} /> Progress Velocity</div>
                    {data.velocityData.length > 0 ? <Bar data={velocityChart} options={chartOpts} /> : <p style={{ color: 'var(--text-muted)' }}>Need 2+ weight entries</p>}
                </div>
            </div>

            <div className="grid-2" style={{ marginTop: 24 }}>
                <div className="glass-card">
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-amber)' }} /> Workout Volume Progression</div>
                    {data.volumeTrend.length > 0 ? <Line data={volumeChart} options={chartOpts} /> : <p style={{ color: 'var(--text-muted)' }}>Log progress to see volume trends</p>}
                </div>

                <div className="glass-card">
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-rose)' }} /> Energy Trends</div>
                    {energyChart ? <Line data={energyChart} options={chartOpts} /> : <p style={{ color: 'var(--text-muted)' }}>Log energy check-ins to see trends</p>}
                </div>
            </div>
        </>
    );
}
