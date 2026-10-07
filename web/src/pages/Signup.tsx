import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Shield,
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    Sparkles,
    Lock,
    Mail,
    User,
    Zap,
    Users,
    Layers,
    BarChart3,
    Check,
    Clock
} from 'lucide-react';

export const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [activeTab, setActiveTab] = useState<'kanban' | 'analytics' | 'clients'>('kanban');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const calculateStrength = (pass: string) => {
        let score = 0;
        if (!pass) return score;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strength = calculateStrength(password);

    const getStrengthLabel = (score: number) => {
        switch (score) {
            case 0: return { label: 'Weak', color: 'bg-cyan-200/60', text: 'text-cyan-700/60' };
            case 1: return { label: 'Weak', color: 'bg-rose-400', text: 'text-rose-500' };
            case 2: return { label: 'Fair', color: 'bg-amber-400', text: 'text-amber-600' };
            case 3: return { label: 'Good', color: 'bg-emerald-400', text: 'text-emerald-600' };
            case 4: return { label: 'Strong', color: 'bg-teal-500', text: 'text-teal-700' };
            default: return { label: '', color: 'bg-cyan-200/60', text: '' };
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreeTerms) return;

        setError('');
        setLoading(true);

        try {
            await signup(fullName, email, password);
            setSubmitted(true);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-cyan-50 via-sky-100/70 to-teal-100/60 text-slate-800 flex font-sans selection:bg-teal-500 selection:text-white relative overflow-x-hidden">

            {/* Dynamic Coastal Water Radial Glow Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-cyan-200/60 via-teal-200/40 to-sky-300/30 blur-[130px]" />
                <div className="absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-teal-300/40 via-cyan-300/30 to-blue-200/30 blur-[150px]" />
                <div className="absolute -bottom-[10%] left-[25%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-sky-200/50 via-teal-100/50 to-cyan-200/40 blur-[110px]" />
            </div>

            { }
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10 border-r border-teal-200/40 bg-white/30 backdrop-blur-2xl">

                {/* Brand Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-sky-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform duration-300">
                            OS
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-teal-950 via-cyan-900 to-slate-800 bg-clip-text text-transparent">
                                ClientOS
                            </span>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-teal-700">Beachside Workspace</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/70 border border-teal-200/60 px-3.5 py-1.5 rounded-full shadow-sm text-xs font-bold text-teal-800 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                        v3.2 Ocean Cloud
                    </div>
                </div>

                {/* Hero Copy & Feature Showcase */}
                <div className="my-auto py-6 max-w-xl space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold shadow-sm backdrop-blur">
                            <Sparkles size={14} className="text-teal-600 animate-pulse" />
                            <span>Next-Gen Operating System</span>
                        </div>

                        {/* Exact requested primary headline */}
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                            Manage clients, tasks, and deliverables in one unified workspace.
                        </h1>

                        {/* Exact requested subtext */}
                        <p className="text-slate-600 text-base leading-relaxed font-medium">
                            ClientOS equips teams with real-time task management, workspace tracking, and streamlined client interactions.
                        </p>
                    </div>

                    {/* Exact requested 3 bullet feature items */}
                    <div className="space-y-3.5 pt-1">
                        <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-white/50 border border-teal-100/80 p-3 rounded-xl shadow-sm backdrop-blur">
                            <CheckCircle2 size={20} className="text-teal-500 shrink-0" />
                            <span>Real-time project tracking & Kanban status boards</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-white/50 border border-teal-100/80 p-3 rounded-xl shadow-sm backdrop-blur">
                            <CheckCircle2 size={20} className="text-teal-500 shrink-0" />
                            <span>Centralized client workspace management</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-white/50 border border-teal-100/80 p-3 rounded-xl shadow-sm backdrop-blur">
                            <CheckCircle2 size={20} className="text-teal-500 shrink-0" />
                            <span>Role-based access & team collaboration</span>
                        </div>
                    </div>

                    { }
                    <div className="space-y-3 pt-2">
                        <div className="flex gap-2 p-1.5 bg-cyan-200/40 rounded-xl border border-teal-200/50 backdrop-blur">
                            {(['kanban', 'analytics', 'clients'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 capitalize flex items-center justify-center gap-1.5 ${activeTab === tab
                                        ? 'bg-white text-teal-700 shadow-md shadow-teal-500/10 scale-[1.02]'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
                                        }`}
                                >
                                    {tab === 'kanban' && <Layers size={14} />}
                                    {tab === 'analytics' && <BarChart3 size={14} />}
                                    {tab === 'clients' && <Users size={14} />}
                                    {tab} Live
                                </button>
                            ))}
                        </div>

                        {/* Coastal Glassmorphism Workspace Card */}
                        <div className="relative rounded-2xl bg-gradient-to-b from-white/90 via-sky-50/80 to-teal-50/90 border border-white p-5 shadow-2xl shadow-teal-600/10 backdrop-blur-2xl transition-all duration-300 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl pointer-events-none" />

                            {activeTab === 'kanban' && (
                                <div className="space-y-3 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-teal-500" />
                                            Client Board Sprint
                                        </span>
                                        <span className="text-[10px] bg-teal-100/80 text-teal-800 font-bold px-2.5 py-0.5 rounded-full">
                                            In Sync
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-sky-50/80 border border-sky-100 p-2.5 rounded-xl space-y-1.5">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                                <span>TO DO</span>
                                                <span className="bg-sky-200/60 px-1.5 py-0.5 rounded text-sky-800">3</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-sky-100 shadow-sm space-y-1">
                                                <p className="text-xs font-bold text-slate-800">Beachfront UI Redesign</p>
                                                <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                                                    <Clock size={10} /> Today
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-teal-50/80 border border-teal-100 p-2.5 rounded-xl space-y-1.5">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-teal-800">
                                                <span>IN PROGRESS</span>
                                                <span className="bg-teal-200/60 px-1.5 py-0.5 rounded text-teal-900">2</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-teal-100 shadow-sm space-y-1">
                                                <p className="text-xs font-bold text-slate-800">Aqua Checkout API</p>
                                                <div className="w-full bg-cyan-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-gradient-to-r from-cyan-500 to-teal-500 h-full w-[75%]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'analytics' && (
                                <div className="space-y-3 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                                        <span className="text-xs font-extrabold text-slate-800">Monthly Delivered Scope</span>
                                        <span className="text-xs font-black text-teal-600">+42.1%</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-slate-900">$34,800.00</span>
                                        <span className="text-xs font-bold text-slate-400">USD</span>
                                    </div>
                                    <div className="flex items-end gap-1.5 h-14 pt-1">
                                        {[35, 55, 45, 75, 60, 85, 65, 95, 80, 100].map((val, idx) => (
                                            <div key={idx} className="flex-1 bg-cyan-200/70 rounded-t-sm hover:bg-teal-500 transition-colors duration-200" style={{ height: `${val}%` }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'clients' && (
                                <div className="space-y-2 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between border-b border-teal-100 pb-1.5">
                                        <span className="text-xs font-extrabold text-slate-800">Active Clients</span>
                                        <span className="text-[10px] text-slate-400">14 Active</span>
                                    </div>
                                    {[
                                        { name: 'Pacific Design Co', revenue: '$14,200', status: 'Active' },
                                        { name: 'Coral Island Tech', revenue: '$9,800', status: 'Review' }
                                    ].map((client, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-teal-100 text-xs">
                                            <span className="font-bold text-slate-800">{client.name}</span>
                                            <span className="text-teal-700 font-extrabold">{client.revenue}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Exact requested bottom footer badges */}
                <div className="flex items-center justify-between text-xs text-slate-600 font-bold border-t border-teal-200/60 pt-5">
                    <span className="flex items-center gap-1.5"><Shield size={15} className="text-teal-600" /> Enterprise Grade</span>
                    <span className="flex items-center gap-1.5"><Zap size={15} className="text-cyan-600" /> Fast Setup</span>
                    <span className="flex items-center gap-1.5"><Users size={15} className="text-sky-600" /> Multi-Tenant</span>
                </div>
            </div>

            { }
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative z-10">
                <div className="w-full max-w-md space-y-8 bg-white/60 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/80 shadow-2xl shadow-cyan-900/10">

                    {/* Mobile Header Logo */}
                    <div className="lg:hidden flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center font-black text-white text-base">
                                OS
                            </div>
                            <span className="text-xl font-black text-slate-900 tracking-tight">ClientOS</span>
                        </div>
                        <span className="text-xs font-bold text-teal-700 bg-teal-100/80 px-2.5 py-1 rounded-full">v3.2</span>
                    </div>

                    {/* Form Header */}
                    <div className="space-y-1.5">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">
                            Create an account
                        </h2>
                        <p className="text-slate-600 text-sm font-medium">
                            Get started with your client workspace today.
                        </p>
                    </div>

                    {/* Social SSO Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/90 border border-teal-100 text-slate-700 font-bold text-xs shadow-sm hover:bg-cyan-50 hover:border-teal-200 transition-all duration-200 active:scale-[0.98]"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            Google
                        </button>

                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/90 border border-teal-100 text-slate-700 font-bold text-xs shadow-sm hover:bg-cyan-50 hover:border-teal-200 transition-all duration-200 active:scale-[0.98]"
                        >
                            <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center">
                        <div className="border-t border-teal-200/60 w-full" />
                        <span className="bg-white/80 px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider absolute rounded-full backdrop-blur">
                            or continue with email
                        </span>
                    </div>

                    {error && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Full Name Input */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                                Full Name
                            </label>
                            <div className="relative group">
                                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Alex Morgan"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 border border-teal-100 text-slate-900 placeholder-slate-400 text-sm font-medium shadow-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="alex@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 border border-teal-100 text-slate-900 placeholder-slate-400 text-sm font-medium shadow-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/90 border border-teal-100 text-slate-900 placeholder-slate-400 text-sm font-medium shadow-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="pt-1.5 space-y-1 animate-in fade-in duration-200">
                                    <div className="flex gap-1 h-1.5 w-full">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`flex-1 rounded-full transition-all duration-300 ${strength >= level ? getStrengthLabel(strength).color : 'bg-cyan-100'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-extrabold">
                                        <span className="text-slate-400">Security</span>
                                        <span className={getStrengthLabel(strength).text}>{getStrengthLabel(strength).label}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3 pt-1">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="h-4 w-4 rounded border-teal-200 text-teal-600 focus:ring-teal-500 transition cursor-pointer"
                                />
                            </div>
                            <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer select-none font-medium">
                                I agree to the{' '}
                                <a href="#" className="font-bold text-teal-700 hover:underline">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="font-bold text-teal-700 hover:underline">Privacy Policy</a>.
                            </label>
                        </div>

                        {/* Gradient CTA Button */}
                        <button
                            type="submit"
                            disabled={loading || !agreeTerms}
                            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-600 to-sky-600 text-white font-black text-sm shadow-xl shadow-teal-500/25 hover:shadow-teal-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Setting up your workspace...</span>
                                </div>
                            ) : submitted ? (
                                <div className="flex items-center gap-2 text-white font-bold">
                                    <Check size={18} />
                                    <span>Account Created! Redirecting...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Get Started</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Already Have An Account Prompt */}
                    <div className="text-center text-xs font-bold text-slate-500 pt-1">
                        Already have an account?{' '}
                        <Link to="/login" className="font-black text-teal-700 hover:text-teal-800 hover:underline">
                            Sign In
                        </Link>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Signup;