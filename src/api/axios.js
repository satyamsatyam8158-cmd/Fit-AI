import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Session timeout: 2 hours of inactivity
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in ms
let lastActivity = Date.now();

// Track user activity
if (typeof window !== 'undefined') {
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        window.addEventListener(event, () => { lastActivity = Date.now(); }, { passive: true });
    });
}

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('fitai_token');

    // Check session timeout
    if (token && Date.now() - lastActivity > SESSION_TIMEOUT) {
        localStorage.removeItem('fitai_token');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired'));
    }

    if (token) config.headers.Authorization = `Bearer ${token}`;
    lastActivity = Date.now();
    return config;
});

// Handle 401 responses (expired/invalid token)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('fitai_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
