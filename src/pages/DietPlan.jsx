import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function DietPlan() {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [swapSlot, setSwapSlot] = useState(null);
    const [swapOptions, setSwapOptions] = useState([]);
    const [customMode, setCustomMode] = useState(false);
    const [macros, setMacros] = useState({ proteinPct: 40, carbsPct: 30, fatPct: 30 });

    const fetchPlan = () => {
        setLoading(true);
        API.get('/diet/current').then(r => setPlan(r.data)).catch(() => setPlan(null)).finally(() => setLoading(false));
    };

    useEffect(fetchPlan, []);

    const generate = async () => {
        setGenerating(true);
        try {
            const { data } = await API.post('/diet/generate');
            setPlan(data);
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to generate');
        } finally {
            setGenerating(false);
        }
    };

    const generateCustom = async () => {
        const sum = macros.proteinPct + macros.carbsPct + macros.fatPct;
        if (Math.abs(sum - 100) > 1) return alert('Macros must sum to 100%');
        setGenerating(true);
        try {
            const { data } = await API.post('/diet/generate-custom', macros);
            setPlan(data);
            setCustomMode(false);
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to generate');
        } finally {
            setGenerating(false);
        }
    };

    const handleSwap = async (mealSlot, currentMealId) => {
        try {
            const { data } = await API.post('/diet/swap', { mealSlot, currentMealId });
            setSwapOptions(data.alternatives);
            setSwapSlot(mealSlot);
        } catch (err) {
            alert('Failed to load swap options');
        }
    };

    const applySwap = (option) => {
        // Replace the meal in the current plan view
        const updatedMeals = plan.meals.map(m =>
            m.name.toLowerCase() === swapSlot.toLowerCase()
                ? { ...m, foods: option.foods, calories: option.calories, protein: option.protein, carbs: option.carbs, fat: option.fat, id: option.id }
                : m
        );
        setPlan({ ...plan, meals: updatedMeals });
        setSwapSlot(null);
        setSwapOptions([]);
    };

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>🥗 Diet Plan</h1>
                    <p>Your tailored nutrition plan with macros</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setCustomMode(!customMode)}>
                        {customMode ? '✕ Close' : '⚙️ Custom Macros'}
                    </button>
                    <button className="btn btn-success" onClick={generate} disabled={generating}>
                        {generating ? 'Generating…' : plan ? '↻ Regenerate' : '+ Generate Plan'}
                    </button>
                </div>
            </div>

            {/* Custom Macro Panel (#21) */}
            {customMode && (
                <div className="glass-card" style={{ marginBottom: 24 }}>
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-violet)' }} /> Custom Macro Ratios</div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
                            <label>Protein %</label>
                            <input className="form-input" type="number" min="10" max="60"
                                value={macros.proteinPct} onChange={e => setMacros({ ...macros, proteinPct: +e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
                            <label>Carbs %</label>
                            <input className="form-input" type="number" min="10" max="60"
                                value={macros.carbsPct} onChange={e => setMacros({ ...macros, carbsPct: +e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
                            <label>Fat %</label>
                            <input className="form-input" type="number" min="10" max="60"
                                value={macros.fatPct} onChange={e => setMacros({ ...macros, fatPct: +e.target.value })} />
                        </div>
                        <div style={{ marginBottom: 8, fontSize: '0.85rem', color: macros.proteinPct + macros.carbsPct + macros.fatPct === 100 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                            Total: {macros.proteinPct + macros.carbsPct + macros.fatPct}%
                        </div>
                        <button className="btn btn-success btn-sm" onClick={generateCustom} disabled={generating}>
                            Generate Custom
                        </button>
                    </div>
                </div>
            )}

            {/* Swap Modal */}
            {swapSlot && (
                <div className="glass-card" style={{ marginBottom: 24, borderLeft: '3px solid var(--accent-cyan)' }}>
                    <div className="section-title"><span className="dot" style={{ background: 'var(--accent-cyan)' }} /> 🔄 Swap {swapSlot}</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>Pick an alternative:</p>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {swapOptions.map((opt, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                                cursor: 'pointer', border: '1px solid transparent',
                            }}
                                onClick={() => applySwap(opt)}
                                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                                onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                            >
                                <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                    {opt.foods.join(', ')}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                    {opt.calories} kcal · {opt.protein}g P
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => { setSwapSlot(null); setSwapOptions([]); }}>
                        Cancel
                    </button>
                </div>
            )}

            {!plan ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 60 }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                        No diet plan yet. Generate one based on your calorie needs!
                    </p>
                    <button className="btn btn-success btn-lg" onClick={generate} disabled={generating}>
                        Generate My Plan
                    </button>
                </div>
            ) : (
                <>
                    <div className="stats-grid" style={{ marginBottom: 24 }}>
                        <div className="stat-card stat-cyan">
                            <div className="stat-label">Daily Calories</div>
                            <div className="stat-value">{plan.dailyCalories}</div>
                        </div>
                        <div className="stat-card stat-emerald">
                            <div className="stat-label">Protein</div>
                            <div className="stat-value">{plan.protein || plan.proteinG}g</div>
                        </div>
                        <div className="stat-card stat-violet">
                            <div className="stat-label">Carbs</div>
                            <div className="stat-value">{plan.carbs || plan.carbsG}g</div>
                        </div>
                        <div className="stat-card stat-amber">
                            <div className="stat-label">Fat</div>
                            <div className="stat-value">{plan.fat || plan.fatG}g</div>
                        </div>
                    </div>

                    <div className="grid-2">
                        {plan.meals.map((meal, i) => (
                            <div className="meal-card" key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3>{meal.name}</h3>
                                    <button className="btn btn-outline btn-sm"
                                        onClick={() => handleSwap(meal.name, meal.id)}
                                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                                        🔄 Swap
                                    </button>
                                </div>
                                <div className="meal-foods">
                                    {meal.foods.map((f, j) => <div key={j}>• {f}</div>)}
                                </div>
                                <div className="meal-macros">
                                    <span>Calories:<span className="val">{meal.calories}</span></span>
                                    <span>Protein:<span className="val">{meal.protein}g</span></span>
                                    <span>Carbs:<span className="val">{meal.carbs}g</span></span>
                                    <span>Fat:<span className="val">{meal.fat}g</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="glass-card" style={{ marginTop: 24, padding: '16px 20px', borderLeft: '3px solid var(--accent-amber)', opacity: 0.85 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                    ⚠️ <strong style={{ color: 'var(--accent-amber)' }}>Medical Disclaimer:</strong> This nutrition plan is generated for informational purposes only and is not a substitute for professional dietary advice. Consult a registered dietitian or healthcare provider before making significant changes to your diet, especially if you have food allergies, medical conditions, or are on medication.
                </p>
            </div>
        </>
    );
}
