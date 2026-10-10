import axios from 'axios';

const getBaseUrl = (): string => {
    let url: string = import.meta.env.VITE_API_URL || 'https://clientos-backend-8fyx.onrender.com/api';
    // Remove trailing slash if present
    url = url.replace(/\/+$/, '');
    // Ensure /api suffix
    if (!url.endsWith('/api')) {
        url = `${url}/api`;
    }
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;