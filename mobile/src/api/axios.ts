import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

// Dynamic host IP resolution for physical phone testing & production backend
const getBaseUrl = () => {
    // Return live production backend URL
    return 'https://clientos-backend-8fyx.onrender.com/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to attach JWT token stored securely
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await storage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.error('Failed to retrieve token from storage', e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
    onUnauthorizedCallback = handler;
};

// Response interceptor to handle expired token (401/403) globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            const url = error.config?.url || '';
            // Do not fire session expired callback on initial auth attempts with invalid credentials
            if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
                console.warn('[API] Token expired or invalid session (401/403). Triggering re-authentication.');
                if (onUnauthorizedCallback) {
                    onUnauthorizedCallback();
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;

