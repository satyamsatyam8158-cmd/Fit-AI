import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const STEPS = [
    { title: 'Basic Info', fields: ['name', 'age', 'sex'] },
    { title: 'Body Stats', fields: ['heightCm', 'weightKg', 'targetWeightKg'] },
    { title: 'Goals', fields: ['goal', 'activityLevel', 'experience'] },
];

export default function ProfileSetup() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        name: '', age: '', sex: '', heightCm: '', weightKg: '',
        targetWeightKg: '', goal: '', activityLevel: '', experience: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const next = () => { if (step < 2) setStep(step + 1); };
    const prev = () => { if (step > 0) setStep(step - 1); };

    const submit = async () => {
        setError('');
        setLoading(true);
        try {
            const payload = {
                ...form,
                age: Number(form.age),
                heightCm: Number(form.heightCm),
                weightKg: Number(form.weightKg),
                targetWeightKg: Number(form.targetWeightKg),
            };
            await API.put('/profile', payload);
            const u = JSON.parse(localStorage.getItem('fitai_user') || '{}');
            u.profileComplete = true;
            localStorage.setItem('fitai_user', JSON.stringify(u));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: 520 }}>
                <h1>Profile Setup</h1>
                <p className="subtitle">Step {step + 1} of 3 — {STEPS[step].title}</p>

                <div className="wizard-steps">
                    {STEPS.map((_, i) => (
                        <div key={i} className={`wizard-step ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`} />
                    ))}
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                {step === 0 && (
                    <>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input className="form-input" placeholder="John Doe"
                                value={form.name} onChange={e => set('name', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Age</label>
                            <input className="form-input" type="number" placeholder="25"
                                value={form.age} onChange={e => set('age', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Sex</label>
                            <select className="form-select" value={form.sex} onChange={e => set('sex', e.target.value)}>
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </>
                )}

                {step === 1 && (
                    <>
                        <div className="form-group">
                            <label>Height (cm)</label>
                            <input className="form-input" type="number" placeholder="175"
                                value={form.heightCm} onChange={e => set('heightCm', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Current Weight (kg)</label>
                            <input className="form-input" type="number" placeholder="75"
                                value={form.weightKg} onChange={e => set('weightKg', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Target Weight (kg)</label>
                            <input className="form-input" type="number" placeholder="70"
                                value={form.targetWeightKg} onChange={e => set('targetWeightKg', e.target.value)} />
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="form-group">
                            <label>Goal</label>
                            <select className="form-select" value={form.goal} onChange={e => set('goal', e.target.value)}>
                                <option value="">Select your goal</option>
                                <option value="lose_weight">Lose Weight</option>
                                <option value="build_muscle">Build Muscle</option>
                                <option value="body_recomposition">Body Recomposition</option>
                                <option value="maintain">Maintain</option>
                                <option value="improve_endurance">Improve Endurance</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Activity Level</label>
                            <select className="form-select" value={form.activityLevel} onChange={e => set('activityLevel', e.target.value)}>
                                <option value="">Select</option>
                                <option value="sedentary">Sedentary (desk job)</option>
                                <option value="light">Light (1–3 days/week)</option>
                                <option value="moderate">Moderate (3–5 days/week)</option>
                                <option value="active">Active (6–7 days/week)</option>
                                <option value="very_active">Very Active (athlete)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Experience Level</label>
                            <select className="form-select" value={form.experience} onChange={e => set('experience', e.target.value)}>
                                <option value="">Select</option>
                                <option value="beginner">Beginner (0–1 year)</option>
                                <option value="intermediate">Intermediate (1–3 years)</option>
                                <option value="advanced">Advanced (3+ years)</option>
                            </select>
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    {step > 0 && <button className="btn btn-outline" onClick={prev}>Back</button>}
                    <div style={{ flex: 1 }} />
                    {step < 2 ? (
                        <button className="btn btn-primary" onClick={next}>Continue</button>
                    ) : (
                        <button className="btn btn-success btn-lg" onClick={submit} disabled={loading}>
                            {loading ? 'Saving…' : 'Complete Setup ✓'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
