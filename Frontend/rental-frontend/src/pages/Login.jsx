import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Call the login function from our AuthContext
        const success = await loginUser(username, password);
        
        if (success) {
            // Redirect to the home page on successful login
            navigate('/');
        } else {
            setError('Invalid username or password. Please try again.');
        }
    };

    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <span className="eyebrow" style={{ color: 'var(--secondary)' }}>Welcome back</span>
                <h2>Sign in to OneGB</h2>

                {error && <p className="message error">{error}</p>}

                <form onSubmit={handleSubmit} className="form-grid">
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.35rem' }}>
                    Log In
                </button>
            </form>

                <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--muted)' }}>
                    Don&apos;t have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;