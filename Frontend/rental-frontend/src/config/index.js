// Configuration for API and media URLs
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = API_URL.replace('/api', ''); // Remove '/api' to get base URL

export { API_URL, BASE_URL };
