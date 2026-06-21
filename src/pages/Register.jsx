import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) { setError('Passwords do not match'); return; }
        setError('');
        setLoading(true);
        try {
            const { data } = await API.post('/auth/register', { email, password });
            localStorage.setItem('fitai_token', data.token);
            localStorage.setItem('fitai_user', JSON.stringify(data.user));
            navigate('/profile-setup');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Create Account</h1>
                <p className="subtitle">Start your adaptive fitness journey</p>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input className="form-input" type="email" placeholder="you@email.com"
                            value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="form-input" type="password" placeholder="Min 6 characters"
                            value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input className="form-input" type="password" placeholder="Re-enter password"
                            value={confirm} onChange={e => setConfirm(e.target.value)} required />
                    </div>
                    <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? 'Creating…' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
