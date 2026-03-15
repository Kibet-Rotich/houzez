import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    return (
        <header className="site-header">
            <nav className="site-header-inner">
                <Link to="/" className="brand-word" style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>
                    Houzez
                </Link>

                <div className="nav-links">
                    <Link className="nav-link" to="/">Home</Link>
                    {user?.role === 'OWNER' && <Link className="nav-link" to="/dashboard/owner">Owner Dashboard</Link>}
                    {user?.role === 'CUSTOMER' && <Link className="nav-link" to="/dashboard/customer">My Visits</Link>}

                {user ? (
                    <>
                            <span className="nav-link">Hello, {user.username}</span>
                            <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                            <Link className="btn btn-outline" to="/login">Login</Link>
                            <Link className="btn btn-primary" to="/register">Sign Up</Link>
                    </>
                )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;