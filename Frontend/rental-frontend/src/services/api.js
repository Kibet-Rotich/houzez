import axios from 'axios';

// Create an Axios instance with your Django backend's base URL
const api = axios.create({
    baseURL: 'https://onegb.co.ke/backend/api/', // Change this to your actual backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: This runs before EVERY request you make
api.interceptors.request.use(
    (config) => {
        // Check if we have a token saved in localStorage
        const authTokens = localStorage.getItem('authTokens') 
            ? JSON.parse(localStorage.getItem('authTokens')) 
            : null;

        // If we have a token, attach it to the Authorization header
        if (authTokens) {
            config.headers.Authorization = `Bearer ${authTokens.access}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;