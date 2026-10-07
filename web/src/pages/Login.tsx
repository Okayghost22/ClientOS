import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Shield,
    ArrowRight,
    CheckCircle2,
    Lock,
    Mail,
    Eye,
    EyeOff,
    Sparkles,
    Layers,
    BarChart3,
    Users,
    Clock,
    KeyRound
} from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'kanban' | 'analytics' | 'clients'>('kanban');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-100 text-slate-800 flex flex-col lg:flex-row font-sans selection:bg-teal-200 selection:text-teal-900 relative overflow-x-hidden">
            {/* Background Decorative Ambient Water Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Left Branding & Showcase Side */}
            <div className="flex flex-col justify-between w-full lg:w-5/12 bg-cyan-900/10 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-teal-200/50 p-8 lg:p-12 relative">
                <div>
                    {/* Header & Logo */}
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-teal-500/30">
                                OS
                            </div>
                            <div>
                                <span className="text-2xl font-black tracking-tight text-teal-950 block leading-none">
                                    ClientOS
                                </span>
                                <span className="text-[10px] font-bold tracking-widest text-teal-700 uppercase">
                                    Beachside Workspace
                                </span>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-teal-200/60 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-xs font-semibold text-teal-900">v3.2 Ocean Cloud</span>
                        </div>
                    </div>

                    {/* Main Copy */}
                    <div className="space-y-6 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-800 text-xs font-bold">
                            <Sparkles size={14} className="text-teal-600" />
                            Welcome Back to Your Hub
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-teal-950">
                            Manage clients, tasks, and deliverables in one unified workspace.
                        </h1>

                        <p className="text-teal-800/80 text-base leading-relaxed font-medium">
                            ClientOS equips teams with real-time task management, workspace tracking, and streamlined client interactions.
                        </p>

                        {/* Checkmark Bullets */}
                        <div className="space-y-3.5 pt-2">
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 backdrop-blur border border-teal-100 shadow-sm text-teal-950 text-sm font-semibold">
                                <div className="p-1 rounded-lg bg-teal-500/10 text-teal-600">
                                    <CheckCircle2 size={18} />
                                </div>
                                <span>Real-time project tracking & Kanban status boards</span>
                            </div>

                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 backdrop-blur border border-teal-100 shadow-sm text-teal-950 text-sm font-semibold">
                                <div className="p-1 rounded-lg bg-teal-500/10 text-teal-600">
                                    <CheckCircle2 size={18} />
                                </div>
                                <span>Centralized client workspace management</span>
                            </div>

                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 backdrop-blur border border-teal-100 shadow-sm text-teal-950 text-sm font-semibold">
                                <div className="p-1 rounded-lg bg-teal-500/10 text-teal-600">
                                    <CheckCircle2 size={18} />
                                </div>
                                <span>Role-based access & team collaboration</span>
                            </div>
                        </div>
                    </div>

                    {/* Live Interactive Workspace Showcase */}
                    <div className="mt-8 rounded-2xl bg-white/80 backdrop-blur-md border border-teal-100 p-4 shadow-xl shadow-teal-900/5">
                        <div className="flex gap-2 mb-3 border-b border-teal-100/80 pb-2">
                            <button
                                onClick={() => setActiveTab('kanban')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'kanban'
                                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                                        : 'text-teal-700 hover:bg-teal-50'
                                    }`}
                            >
                                <Layers size={13} /> Kanban Live
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'analytics'
                                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                                        : 'text-teal-700 hover:bg-teal-50'
                                    }`}
                            >
                                <BarChart3 size={13} /> Analytics Live
                            </button>
                            <button
                                onClick={() => setActiveTab('clients')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'clients'
                                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                                        : 'text-teal-700 hover:bg-teal-50'
                                    }`}
                            >
                                <Users size={13} /> Clients Live
                            </button>
                        </div>

                        {activeTab === 'kanban' && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs text-teal-900 font-bold mb-1">
                                    <span>Client Board Sprint</span>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                        In Sync
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-cyan-50/80 p-2.5 rounded-xl border border-cyan-100">
                                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-700 block mb-1">
                                            To Do (3)
                                        </span>
                                        <div className="bg-white p-2 rounded-lg shadow-sm text-xs font-semibold text-slate-700 border border-slate-100">
                                            Beachfront UI Redesign
                                            <span className="block text-[10px] text-teal-600 mt-1 font-medium flex items-center gap-1">
                                                <Clock size={10} /> Today
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-teal-50/80 p-2.5 rounded-xl border border-teal-100">
                                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-teal-700 block mb-1">
                                            In Progress (2)
                                        </span>
                                        <div className="bg-white p-2 rounded-lg shadow-sm text-xs font-semibold text-slate-700 border border-slate-100">
                                            Aqua Checkout API
                                            <div className="w-full bg-slate-100 rounded-full h-1 mt-2">
                                                <div className="bg-teal-500 h-1 rounded-full w-2/3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100 flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-teal-700 font-bold block">Monthly Active Workspaces</span>
                                    <span className="text-xl font-black text-teal-950">$48,290 MRR</span>
                                </div>
                                <div className="h-10 w-24 bg-teal-500/10 rounded-lg flex items-end p-1 gap-1 justify-around">
                                    <div className="w-2 bg-teal-400 rounded-t h-4" />
                                    <div className="w-2 bg-teal-500 rounded-t h-7" />
                                    <div className="w-2 bg-teal-600 rounded-t h-10" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'clients' && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-teal-100 shadow-sm text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center text-[10px]">
                                            AC
                                        </div>
                                        <span className="font-bold text-slate-800">AquaCraft Labs</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                        Active Client
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Left Footer Badges */}
                <div className="flex items-center gap-6 text-teal-800/70 text-xs font-semibold pt-8 border-t border-teal-200/50 mt-8">
                    <span className="flex items-center gap-1.5">
                        <Shield size={14} className="text-teal-600" /> Enterprise Grade
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-teal-600" /> Fast Setup
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-teal-600" /> Multi-Tenant
                    </span>
                </div>
            </div>

            {/* Right Login Form Side */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
                <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 p-8 sm:p-10 shadow-2xl shadow-teal-950/5 relative">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign in</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            Welcome back! Please enter your details.
                        </p>
                    </div>

                    {/* Social SSO Options */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs transition shadow-sm hover:shadow"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-md shadow-slate-900/20"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                    <div className="relative my-6 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200/80" />
                        </div>
                        <span className="relative bg-white/80 px-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                            Or sign in with email
                        </span>
                    </div>

                    {error && (
                        <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="alex@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200/90 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-medium transition shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                                    Password
                                </label>
                                <a
                                    href="#forgot"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        alert('Password reset link has been sent to your email.');
                                    }}
                                    className="text-xs font-bold text-teal-600 hover:text-teal-700 transition"
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-slate-200/90 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-medium transition shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                />
                                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-800 transition">
                                    Remember this device
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] text-sm disabled:opacity-50 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <>
                                    <KeyRound size={18} /> Sign In to Workspace <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Bottom Switch to Signup */}
                    <p className="text-center text-xs font-semibold text-slate-500 mt-6 pt-4 border-t border-slate-100">
                        Don't have an account yet?{' '}
                        <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-extrabold transition">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};