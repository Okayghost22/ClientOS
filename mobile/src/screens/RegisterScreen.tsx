import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const RegisterScreen = ({ navigation }: any) => {
    const { login } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        setError('');

        if (!fullName.trim() || !email.trim() || !password) {
            setError('Please fill in all fields.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError('Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/register', {
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                password
            });

            const { token, user } = res.data;
            await login(token, user);
        } catch (err: any) {
            console.error('Register error:', err);
            const msg = (!err.response || err.message === 'Network Error' || err.code === 'ERR_NETWORK')
                ? 'Network Error: Unable to connect to server. Please check your internet connection.'
                : (err.response?.data?.message || err.response?.data?.error || 'Registration failed. Check your inputs.');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <View style={styles.logoBadge}>
                        <Text style={styles.logoText}>C</Text>
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join ClientOS to organize projects & tasks</Text>

                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Full Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            placeholderTextColor="#94a3b8"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="user@example.com"
                            placeholderTextColor="#94a3b8"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password (min. 6 chars)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#94a3b8"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Register Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Navigation Link to Login */}
                    <TouchableOpacity
                        style={styles.linkContainer}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.linkText}>
                            Already have an account? <Text style={styles.linkBold}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ecfeff',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 28,
        padding: 24,
        shadowColor: '#0f766e',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 6,
    },
    logoBadge: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#14b8a6',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 12,
    },
    logoText: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '900',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 24,
    },
    errorBox: {
        backgroundColor: '#fff1f2',
        borderColor: '#fecdd3',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#e11d48',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#0f172a',
    },
    button: {
        backgroundColor: '#0d9488',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#0d9488',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '800',
    },
    linkContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 13,
        color: '#64748b',
    },
    linkBold: {
        color: '#0d9488',
        fontWeight: '800',
    },
});
