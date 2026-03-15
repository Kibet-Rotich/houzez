import { createContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    // Get tokens from local storage if they exist
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );

    // Decode the token to get user info (role, id, etc.) if tokens exist
    const [user, setUser] = useState(() => {
    const tokens = localStorage.getItem('authTokens');
    if (tokens) {
        const parsed = JSON.parse(tokens);
        return jwtDecode(parsed.access); // Decode the ACCESS token specifically
    }
    return null;
    });

    const [loading] = useState(false);

    const loginUser = async (email, password) => {
    try {
        const response = await api.post('/auth/login/', {
            username: email,
            password: password
        });

        if (response.status === 200) {
            setAuthTokens(response.data);
            // Decode the access property of the response
            const decodedUser = jwtDecode(response.data.access);
            setUser(decodedUser); 
            
            localStorage.setItem('authTokens', JSON.stringify(response.data));
            return true;
        }
    } catch (error) {
        console.error("Login failed:", error.response?.data);
        return false;
    }
};

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    };

    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};