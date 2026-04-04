import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole, requireStaff = false }) => {
    const { user } = useContext(AuthContext);
    console.log("Current User:", user);
    console.log("Required Role:", allowedRole);
    console.log("Requires staff:", requireStaff);

    // 1. If no user is logged in, send them to the login page
    if (!user) {
        console.log("No user found, redirecting to login");
        return <Navigate to="/login" replace />;
    }

    if (requireStaff && !user.is_staff) {
        console.log("Staff access required, redirecting to home");
        return <Navigate to="/" replace />;
    }

    // 2. If the route requires a specific role and the user doesn't have it, redirect them to home
    if (allowedRole && user.role !== allowedRole) {
        console.log(`Role mismatch! User has ${user.role}, needs ${allowedRole}`);
        return <Navigate to="/" replace />;
    }

    // 3. If they are logged in and have the right role, let them see the page
    return children;
};

export default ProtectedRoute;