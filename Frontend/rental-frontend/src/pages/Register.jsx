import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        role: 'CUSTOMER' // Default role
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('auth/register/', formData);
            if (response.status === 201) {
                // If creation is successful, send them to login
                navigate('/login');
            }
        } catch (err) {
            // DRF usually returns an object with errors for specific fields
            setError(err.response?.data?.username?.[0] || 'An error occurred during registration.');
            console.error(err.response?.data);
        }
    };

    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <span className="eyebrow" style={{ color: 'var(--secondary)' }}>Join us</span>
                <h2>Create your OneGB account</h2>

                {error && <p className="message error">{error}</p>}

                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-grid grid-2">
                        <div>
                        <label>First Name</label>
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
                    </div>
                        <div>
                        <label>Last Name</label>
                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
                        </div>
                    </div>

                <div>
                    <label>Username *</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                </div>

                <div>
                    <label>Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div>
                    <label>Password *</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>

                <div>
                    <label>Phone Number</label>
                    <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="e.g., 0712345678" />
                </div>

                <div>
                    <label>What are you here to do? *</label>
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="CUSTOMER">I am looking for a house</option>
                        <option value="OWNER">I want to list my properties</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.35rem' }}>
                    Sign Up
                </button>
            </form>

                <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;