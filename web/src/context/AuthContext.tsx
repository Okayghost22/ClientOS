import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.ts';

interface User {
    id: string;
    fullName: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (fullName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser && token) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse cached user', e);
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = res.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const signup = async (fullName: string, email: string, password: string) => {
        const res = await api.post('/auth/signup', { fullName, email, password });
        const { token: newToken, user: userData } = res.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
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