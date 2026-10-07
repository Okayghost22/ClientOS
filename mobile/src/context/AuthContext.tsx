import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { storage } from '../utils/storage';
import api, { setUnauthorizedHandler } from '../api/axios';

interface User {
    id: string;
    fullName: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setUnauthorizedHandler(async () => {
            Alert.alert(
                'Session Expired',
                'Your login session has expired or is invalid. Please log in again.'
            );
            await logout();
        });
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await storage.getItem('token');
            const storedUser = await storage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                // Verify session with /api/auth/me
                api.get('/auth/me').catch(async () => {
                    await logout();
                });
            }
        } catch (e) {
            console.error('Failed to load auth state', e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        await storage.setItem('token', newToken);
        await storage.setItem('user', JSON.stringify(newUser));
    };

    const logout = async () => {
        setToken(null);
        setUser(null);
        await storage.removeItem('token');
        await storage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
