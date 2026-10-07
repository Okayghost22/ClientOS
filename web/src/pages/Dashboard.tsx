import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios.ts';
import {
    FolderPlus,
    LogOut,
    Search,
    Plus,
    LayoutDashboard,
    CheckCircle2,
    Clock,
    Layers,
    Users,
    BarChart3,
    Sparkles,
    ChevronRight,
    Pencil,
    Trash2,
    Calendar,
    Mail,
    Phone,
    Building,
    UserPlus,
    UserCheck,
    X,
    Lock,
    User,
    ShieldCheck,
    Activity,
    FileText
} from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description?: string;
    clientName?: string | null;
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    startDate?: string | null;
    endDate?: string | null;
    createdAt?: string;
    tasks?: any[];
}

interface Client {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'LEAD';
    createdAt?: string;
}

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState<'workspaces' | 'clients' | 'audit'>('workspaces');

    // Audit Log State
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loadingAudit, setLoadingAudit] = useState(false);

    // Projects State
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

    // New Project Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectClientName, setProjectClientName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projectStatus, setProjectStatus] = useState<'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>('NOT_STARTED');
    const [projectStartDate, setProjectStartDate] = useState('');
    const [projectEndDate, setProjectEndDate] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    // Edit Project Modal State
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editName, setEditName] = useState('');
    const [editClientName, setEditClientName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStatus, setEditStatus] = useState<'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>('NOT_STARTED');
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [updating, setUpdating] = useState(false);

    // Client Directory State
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const [clientSearchQuery, setClientSearchQuery] = useState('');
    const [clientStatusFilter, setClientStatusFilter] = useState<string>('ALL');

    // Add Client Modal State
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientCompany, setClientCompany] = useState('');
    const [clientStatus, setClientStatus] = useState<'PENDING' | 'ACTIVE' | 'INACTIVE' | 'LEAD'>('ACTIVE');
    const [creatingClient, setCreatingClient] = useState(false);
    const [clientError, setClientError] = useState('');

    // Edit Client Modal State
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [editClientEmail, setEditClientEmail] = useState('');
    const [editClientPhone, setEditClientPhone] = useState('');
    const [editClientCompany, setEditClientCompany] = useState('');
    const [editClientStatus, setEditClientStatus] = useState<'PENDING' | 'ACTIVE' | 'INACTIVE' | 'LEAD'>('ACTIVE');
    const [updatingClient, setUpdatingClient] = useState(false);

    useEffect(() => {
        fetchProjects();
        fetchClients();

        // Auto-poll every 15 seconds silently to pick up changes from mobile app
        const pollInterval = setInterval(() => {
            fetchProjects(true);
            fetchClients(true);
        }, 15000);

        // Refetch instantly (silently) when the user switches back to this tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchProjects(true);
                fetchClients(true);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(pollInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'audit') {
            fetchAuditLogs();
        }
    }, [activeTab]);

    const fetchAuditLogs = async () => {
        try {
            setLoadingAudit(true);
            const res = await api.get('/audit-logs');
            setAuditLogs(res.data?.logs || []);
        } catch (err: any) {
            console.error('Failed to fetch audit logs', err);
        } finally {
            setLoadingAudit(false);
        }
    };

    const fetchProjects = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const res = await api.get('/projects');
            const projectList = Array.isArray(res.data) ? res.data : (res.data?.projects || []);
            setProjects(projectList);
        } catch (err: any) {
            console.error('Failed to fetch projects', err);
            if (!silent) setProjects([]);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const fetchClients = async (silent = false) => {
        try {
            if (!silent) setLoadingClients(true);
            const res = await api.get('/clients');
            const clientList = Array.isArray(res.data) ? res.data : (res.data?.clients || []);
            setClients(clientList);
        } catch (err: any) {
            console.error('Failed to fetch clients', err);
            if (!silent) setClients([]);
        } finally {
            if (!silent) setLoadingClients(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName.trim()) return;

        try {
            setCreating(true);
            setError('');
            const res = await api.post('/projects', {
                name: projectName,
                clientName: projectClientName || null,
                description: projectDescription,
                status: projectStatus,
                startDate: projectStartDate || null,
                endDate: projectEndDate || null
            });
            const newProject = res.data?.project || res.data;
            setProjects(prev => [newProject, ...(Array.isArray(prev) ? prev : [])]);
            setProjectName('');
            setProjectClientName('');
            setProjectDescription('');
            setProjectStatus('NOT_STARTED');
            setProjectStartDate('');
            setProjectEndDate('');
            setIsModalOpen(false);

            // Refetch clients so auto-created PENDING client shows up immediately in Client Directory
            fetchClients();
        } catch (err: any) {
            console.error('Failed to create project', err);
            setError(err.response?.data?.message || 'Failed to create workspace');
        } finally {
            setCreating(false);
        }
    };

    const handleOpenEditModal = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingProject(project);
        setEditName(project.name);
        setEditClientName(project.clientName || '');
        setEditDescription(project.description || '');
        setEditStatus(project.status || 'NOT_STARTED');
        setEditStartDate(project.startDate ? project.startDate.split('T')[0] : '');
        setEditEndDate(project.endDate ? project.endDate.split('T')[0] : '');
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProject || !editName.trim()) return;

        try {
            setUpdating(true);
            const res = await api.put(`/projects/${editingProject.id}`, {
                name: editName,
                clientName: editClientName || null,
                description: editDescription,
                status: editStatus,
                startDate: editStartDate || null,
                endDate: editEndDate || null
            });
            const updated = res.data?.project || res.data;
            setProjects(prev => (Array.isArray(prev) ? prev : []).map(p => (p.id === editingProject.id ? { ...p, ...updated } : p)));
            setEditingProject(null);
            fetchClients();
        } catch (err: any) {
            console.error('Failed to update project', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this workspace? All associated tasks will be permanently removed.')) {
            return;
        }

        try {
            setProjects(prev => (Array.isArray(prev) ? prev : []).filter(p => p.id !== projectId));
            await api.delete(`/projects/${projectId}`);
        } catch (err: any) {
            console.error('Failed to delete project', err);
            fetchProjects();
        }
    };

    // Client CRUD Handlers
    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientName.trim()) {
            setClientError('Client name is required.');
            return;
        }

        try {
            setCreatingClient(true);
            setClientError('');
            const res = await api.post('/clients', {
                name: clientName,
                email: clientEmail || null,
                phone: clientPhone || null,
                company: clientCompany || null,
                status: clientStatus
            });
            const newClient = res.data?.client || res.data;
            setClients(prev => [newClient, ...prev]);
            setClientName('');
            setClientEmail('');
            setClientPhone('');
            setClientCompany('');
            setClientStatus('ACTIVE');
            setIsClientModalOpen(false);
        } catch (err: any) {
            console.error('Failed to create client', err);
            setClientError(err.response?.data?.error || 'Failed to create client');
        } finally {
            setCreatingClient(false);
        }
    };

    const handleOpenEditClientModal = (client: Client) => {
        setEditingClient(client);
        setEditClientEmail(client.email || '');
        setEditClientPhone(client.phone || '');
        setEditClientCompany(client.company || '');
        // If status is PENDING, default form dropdown to ACTIVE so user easily transitions them
        setEditClientStatus(client.status === 'PENDING' ? 'ACTIVE' : client.status);
    };

    const handleUpdateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClient) return;

        try {
            setUpdatingClient(true);
            const res = await api.put(`/clients/${editingClient.id}`, {
                email: editClientEmail || null,
                phone: editClientPhone || null,
                company: editClientCompany || null,
                status: editClientStatus
            });
            const updated = res.data?.client || res.data;
            setClients(prev => prev.map(c => (c.id === editingClient.id ? { ...c, ...updated } : c)));
            setEditingClient(null);
        } catch (err: any) {
            console.error('Failed to update client', err);
        } finally {
            setUpdatingClient(false);
        }
    };

    const handleDeleteClient = async (clientId: string) => {
        if (!window.confirm('Are you sure you want to delete this client from your directory?')) return;

        try {
            setClients(prev => prev.filter(c => c.id !== clientId));
            await api.delete(`/clients/${clientId}`);
        } catch (err: any) {
            console.error('Failed to delete client', err);
            fetchClients();
        }
    };

    // Calculate project metrics
    const safeProjects = Array.isArray(projects) ? projects : [];
    const totalProjects = safeProjects.length;
    const allTasks = safeProjects.flatMap(p => p.tasks || []);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
    const pendingTasks = allTasks.filter(t => t.status === 'PENDING' || t.status === 'TODO').length;
    const projectsInProgress = safeProjects.filter(p => p.status === 'IN_PROGRESS').length;

    const filteredProjects = safeProjects.filter(p => {
        const matchesQuery = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter || (!p.status && statusFilter === 'NOT_STARTED');
        return matchesQuery && matchesStatus;
    });

    // Calculate client metrics
    const safeClients = Array.isArray(clients) ? clients : [];
    const totalClientsCount = safeClients.length;
    const pendingClientsCount = safeClients.filter(c => c.status === 'PENDING').length;
    const activeClientsCount = safeClients.filter(c => c.status === 'ACTIVE').length;
    const leadsCount = safeClients.filter(c => c.status === 'LEAD').length;

    const filteredClients = safeClients.filter(c => {
        const matchesQuery = c.name?.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
            (c.email && c.email.toLowerCase().includes(clientSearchQuery.toLowerCase())) ||
            (c.company && c.company.toLowerCase().includes(clientSearchQuery.toLowerCase()));
        const matchesStatus = clientStatusFilter === 'ALL' || c.status === clientStatusFilter;
        return matchesQuery && matchesStatus;
    });

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'COMPLETED':
                return (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Completed
                    </span>
                );
            case 'IN_PROGRESS':
                return (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                        In Progress
                    </span>
                );
            default:
                return (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        Not Started
                    </span>
                );
        }
    };

    const getClientStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300 animate-pulse flex items-center gap-1">
                        <Clock size={10} /> Pending Details
                    </span>
                );
            case 'ACTIVE':
                return (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Active Client
                    </span>
                );
            case 'LEAD':
                return (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                        Prospect / Lead
                    </span>
                );
            default:
                return (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        Inactive
                    </span>
                );
        }
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-100 text-slate-800 flex font-sans selection:bg-teal-200 selection:text-teal-900 relative">
            {/* Coastal Background Glows */}
            <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-cyan-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white/70 backdrop-blur-2xl border-r border-teal-100/80 p-6 flex flex-col justify-between hidden md:flex shrink-0 shadow-sm">
                <div className="space-y-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white font-black shadow-lg shadow-teal-500/20">
                            C
                        </div>
                        <div>
                            <span className="text-base font-black text-slate-900 tracking-tight block">
                                ClientOS
                            </span>
                            <span className="text-[9px] font-bold tracking-widest text-teal-700 uppercase">
                                Beachside Workspace
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-1.5">
                        <button
                            onClick={() => setActiveTab('workspaces')}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                                activeTab === 'workspaces'
                                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                                    : 'text-slate-600 hover:bg-teal-50 hover:text-teal-900 font-semibold'
                            }`}
                        >
                            <LayoutDashboard size={16} /> Workspaces
                        </button>
                        <button
                            onClick={() => setActiveTab('clients')}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition relative ${
                                activeTab === 'clients'
                                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                                    : 'text-slate-600 hover:bg-teal-50 hover:text-teal-900 font-semibold'
                            }`}
                        >
                            <Users size={16} /> Client Directory
                            {pendingClientsCount > 0 && (
                                <span className="ml-auto px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-sm">
                                    {pendingClientsCount} pending
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                                activeTab === 'audit'
                                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                                    : 'text-slate-600 hover:bg-teal-50 hover:text-teal-900 font-semibold'
                            }`}
                        >
                            <ShieldCheck size={16} /> Audit Trail
                        </button>
                    </nav>
                </div>

                {/* User Card & Logout */}
                <div className="pt-6 border-t border-teal-100/80 space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-teal-50/80 border border-teal-100">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="truncate flex-1">
                            <p className="text-xs font-black text-slate-900 truncate">{user?.fullName || 'User'}</p>
                            <p className="text-[10px] text-teal-700 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-100"
                    >
                        <LogOut size={14} /> Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-8 overflow-y-auto w-full">
                {activeTab === 'workspaces' ? (
                    <>
                        {/* Workspaces Top Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-800 text-[11px] font-bold mb-2">
                                    <Sparkles size={12} className="text-teal-600" /> Active Workspace
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Workspaces</h1>
                                <p className="text-xs font-medium text-slate-500 mt-1">
                                    Manage client deliverables, Kanban sprints, and status boards.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 text-xs transition transform active:scale-95 shrink-0"
                            >
                                <Plus size={16} /> Create New Workspace
                            </button>
                        </div>

                        {/* 5 Metric Cards Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                        Total Projects
                                    </span>
                                    <h3 className="text-2xl font-black text-slate-900 mt-1">{totalProjects}</h3>
                                </div>
                                <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                                    <Layers size={20} />
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                        Total Tasks
                                    </span>
                                    <h3 className="text-2xl font-black text-slate-900 mt-1">{totalTasks}</h3>
                                </div>
                                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                                    <BarChart3 size={20} />
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                        Completed Tasks
                                    </span>
                                    <h3 className="text-2xl font-black text-emerald-600 mt-1">{completedTasks}</h3>
                                </div>
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <CheckCircle2 size={20} />
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                        Pending Tasks
                                    </span>
                                    <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingTasks}</h3>
                                </div>
                                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                    <Clock size={20} />
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                        Projects In Progress
                                    </span>
                                    <h3 className="text-2xl font-black text-teal-600 mt-1">{projectsInProgress}</h3>
                                </div>
                                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                                    <Sparkles size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Search & Status Filter Controls */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-3.5 rounded-2xl border border-white/80 shadow-sm">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search workspaces by name, client, or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                {(['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const).map(st => (
                                    <button
                                        key={st}
                                        onClick={() => setStatusFilter(st)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                            statusFilter === st
                                                ? 'bg-slate-900 text-white shadow-sm'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Workspaces Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white animate-pulse h-48" />
                                ))}
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="text-center py-16 bg-white/40 backdrop-blur-xl rounded-3xl border border-white p-8">
                                <div className="w-16 h-16 rounded-full bg-teal-100/50 text-teal-600 flex items-center justify-center mx-auto mb-4">
                                    <FolderPlus size={32} />
                                </div>
                                <h3 className="text-base font-bold text-slate-800">No workspaces found</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                    {searchQuery || statusFilter !== 'ALL'
                                        ? 'No projects match your search query or status filter.'
                                        : 'Get started by creating your first workspace to manage deliverables.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map(project => (
                                    <div
                                        key={project.id}
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                        className="group bg-white/80 hover:bg-white backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between relative"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-2xl bg-teal-50 group-hover:bg-teal-500 text-teal-600 group-hover:text-white flex items-center justify-center transition-colors shadow-inner">
                                                    <FolderPlus size={20} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(project.status)}
                                                    <button
                                                        onClick={(e) => handleOpenEditModal(project, e)}
                                                        title="Edit Project"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteProject(project.id, e)}
                                                        title="Delete Project"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-900 transition-colors">
                                                {project.name}
                                            </h3>

                                            {project.clientName && (
                                                <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/80 text-[11px] font-bold">
                                                    <User size={11} className="text-teal-600" />
                                                    <span>Client: {project.clientName}</span>
                                                </div>
                                            )}

                                            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                                {project.description || 'No description provided for this workspace.'}
                                            </p>

                                            {(project.startDate || project.endDate) && (
                                                <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg w-fit">
                                                    <Calendar size={12} className="text-teal-600" />
                                                    <span>
                                                        {formatDate(project.startDate) || 'TBD'} — {formatDate(project.endDate) || 'TBD'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold">
                                            <span>{project.tasks?.length || 0} Tasks</span>
                                            <span className="flex items-center gap-1 text-teal-600 group-hover:translate-x-1 transition-transform">
                                                Open Board <ChevronRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : activeTab === 'clients' ? (
                    <>
                        {/* Client Directory Top Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-800 text-[11px] font-bold mb-2">
                                    <Users size={12} className="text-teal-600" /> Client Management
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Client Directory</h1>
                                <p className="text-xs font-medium text-slate-500 mt-1">
                                    Clients created from workspaces appear here automatically with pending status.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setClientError('');
                                    setIsClientModalOpen(true);
                                }}
                                className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 text-xs transition transform active:scale-95 shrink-0"
                            >
                                <UserPlus size={16} /> Add New Client
                            </button>
                        </div>

                        {/* Client Directory Metrics Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                        Total Clients
                                    </span>
                                    <h3 className="text-2xl font-black text-slate-900 mt-1">{totalClientsCount}</h3>
                                </div>
                                <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                                    <Users size={20} />
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                        Pending Details
                                    </span>
                                    <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingClientsCount}</h3>
                                </div>
                                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                    <Clock size={20} />
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                        Active Clients
                                    </span>
                                    <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeClientsCount}</h3>
                                </div>
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <UserCheck size={20} />
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                        Prospects / Leads
                                    </span>
                                    <h3 className="text-2xl font-black text-cyan-600 mt-1">{leadsCount}</h3>
                                </div>
                                <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                                    <Sparkles size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Search & Filter Bar for Clients */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-3.5 rounded-2xl border border-white/80 shadow-sm">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search clients by name, email, or company..."
                                    value={clientSearchQuery}
                                    onChange={(e) => setClientSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                {(['ALL', 'PENDING', 'ACTIVE', 'LEAD', 'INACTIVE'] as const).map(st => (
                                    <button
                                        key={st}
                                        onClick={() => setClientStatusFilter(st)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                            clientStatusFilter === st
                                                ? 'bg-slate-900 text-white shadow-sm'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {st === 'ALL' ? 'All Statuses' : st === 'PENDING' ? 'Pending' : st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Client Cards Grid */}
                        {loadingClients ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white animate-pulse h-44" />
                                ))}
                            </div>
                        ) : filteredClients.length === 0 ? (
                            <div className="text-center py-16 bg-white/40 backdrop-blur-xl rounded-3xl border border-white p-8">
                                <div className="w-16 h-16 rounded-full bg-teal-100/50 text-teal-600 flex items-center justify-center mx-auto mb-4">
                                    <Users size={32} />
                                </div>
                                <h3 className="text-base font-bold text-slate-800">No clients found</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                    {clientSearchQuery || clientStatusFilter !== 'ALL'
                                        ? 'No client records match your search filter.'
                                        : 'Add a workspace with a client name or create a new client to populate this directory.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredClients.map(client => (
                                    <div
                                        key={client.id}
                                        onClick={() => handleOpenEditClientModal(client)}
                                        className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-white font-black flex items-center justify-center text-sm shadow-md">
                                                        {client.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-black text-slate-900 leading-tight group-hover:text-teal-900 transition-colors">
                                                            {client.name}
                                                        </h3>
                                                        {client.company ? (
                                                            <span className="text-[11px] font-semibold text-teal-700 flex items-center gap-1 mt-0.5">
                                                                <Building size={12} /> {client.company}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 italic">No company listed</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleOpenEditClientModal(client)}
                                                        title="Complete / Edit Client Info"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClient(client.id)}
                                                        title="Delete Client"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-xs font-medium text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-2 truncate">
                                                    <Mail size={14} className="text-teal-600 shrink-0" />
                                                    {client.email ? (
                                                        <a href={`mailto:${client.email}`} className="hover:underline truncate text-slate-800 font-semibold">
                                                            {client.email}
                                                        </a>
                                                    ) : (
                                                        <span className="text-amber-800 font-medium italic">Email pending — click to add</span>
                                                    )}
                                                </div>
                                                {client.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone size={14} className="text-teal-600 shrink-0" />
                                                        <a href={`tel:${client.phone}`} className="hover:underline text-slate-700">
                                                            {client.phone}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                            {getClientStatusBadge(client.status)}
                                            <span className="text-[10px] font-medium text-slate-400">
                                                Added {formatDate(client.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Audit Trail Top Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-800 text-[11px] font-bold mb-2">
                                    <ShieldCheck size={12} className="text-teal-600" /> Immutable Security Logs
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Audit Trail</h1>
                                <p className="text-xs font-medium text-slate-500 mt-1">
                                    Track system events, user logins, workspace creations, and deletions in real-time.
                                </p>
                            </div>
                        </div>

                        {loadingAudit ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <div className="text-center py-16 bg-white/60 backdrop-blur-xl rounded-3xl border border-white p-8">
                                <Activity size={36} className="mx-auto text-slate-300 mb-3" />
                                <h3 className="text-sm font-black text-slate-800">No audit events recorded yet</h3>
                                <p className="text-xs text-slate-500 mt-1">Activities will automatically populate as actions are performed.</p>
                            </div>
                        ) : (
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                            <tr>
                                                <th className="py-3.5 px-5">Timestamp</th>
                                                <th className="py-3.5 px-5">Event Action</th>
                                                <th className="py-3.5 px-5">Details</th>
                                                <th className="py-3.5 px-5">User</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                            {auditLogs.map((log: any) => (
                                                <tr key={log.id} className="hover:bg-teal-50/30 transition">
                                                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="py-3.5 px-5 font-bold">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-extrabold text-slate-700">
                                                            <Activity size={10} className="text-teal-600" />
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-5 text-slate-800 font-semibold">{log.details || 'N/A'}</td>
                                                    <td className="py-3.5 px-5 text-slate-600">
                                                        {log.user ? `${log.user.fullName} (${log.user.email})` : log.userId}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <FolderPlus size={18} className="text-teal-600" /> Create Workspace
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Workspace Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Mobile Banking App"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Client Name (Creates Client in Directory)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Acme Corp / John Smith"
                                    value={projectClientName}
                                    onChange={(e) => setProjectClientName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition"
                                />
                                <span className="text-[10px] text-teal-700 font-medium mt-1 block">
                                    ✨ Entering a client name automatically adds them to your Client Directory.
                                </span>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief overview of project goals..."
                                    value={projectDescription}
                                    onChange={(e) => setProjectDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <select
                                    value={projectStatus}
                                    onChange={(e: any) => setProjectStatus(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                >
                                    <option value="NOT_STARTED">Not Started</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={projectStartDate}
                                        onChange={(e) => setProjectStartDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={projectEndDate}
                                        onChange={(e) => setProjectEndDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20 disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create Workspace'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {editingProject && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Pencil size={18} className="text-teal-600" /> Edit Workspace
                            </h3>
                            <button
                                onClick={() => setEditingProject(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProject} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Workspace Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Client Name
                                </label>
                                <input
                                    type="text"
                                    value={editClientName}
                                    onChange={(e) => setEditClientName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <select
                                    value={editStatus}
                                    onChange={(e: any) => setEditStatus(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                >
                                    <option value="NOT_STARTED">Not Started</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editStartDate}
                                        onChange={(e) => setEditStartDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editEndDate}
                                        onChange={(e) => setEditEndDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingProject(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-teal-600/20 disabled:opacity-50"
                                >
                                    {updating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Client Modal */}
            {isClientModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <UserPlus size={18} className="text-teal-600" /> Add New Client
                            </h3>
                            <button
                                onClick={() => setIsClientModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {clientError && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                                {clientError}
                            </div>
                        )}

                        <form onSubmit={handleCreateClient} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Client Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Acme Corp / Jane Doe"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="client@company.com"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={clientPhone}
                                        onChange={(e) => setClientPhone(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Acme Inc."
                                        value={clientCompany}
                                        onChange={(e) => setClientCompany(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <select
                                    value={clientStatus}
                                    onChange={(e: any) => setClientStatus(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                >
                                    <option value="ACTIVE">Active Client</option>
                                    <option value="PENDING">Pending Details</option>
                                    <option value="LEAD">Prospect / Lead</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsClientModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingClient}
                                    className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20 disabled:opacity-50"
                                >
                                    {creatingClient ? 'Adding...' : 'Add Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit / Complete Client Info Modal */}
            {editingClient && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Pencil size={18} className="text-teal-600" /> Complete Client Details
                            </h3>
                            <button
                                onClick={() => setEditingClient(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateClient} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                                    <span>Client Name</span>
                                    <span className="text-teal-700 flex items-center gap-1 font-bold text-[10px] lowercase">
                                        <Lock size={10} /> locked (linked from workspace)
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        disabled
                                        value={editingClient.name}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold cursor-not-allowed pr-8"
                                    />
                                    <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="client@company.com"
                                    value={editClientEmail}
                                    onChange={(e) => setEditClientEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={editClientPhone}
                                        onChange={(e) => setEditClientPhone(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Acme Inc."
                                        value={editClientCompany}
                                        onChange={(e) => setEditClientCompany(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <select
                                    value={editClientStatus}
                                    onChange={(e: any) => setEditClientStatus(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                >
                                    <option value="ACTIVE">Active Client</option>
                                    <option value="PENDING">Pending Details</option>
                                    <option value="LEAD">Prospect / Lead</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingClient(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatingClient}
                                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-teal-600/20 disabled:opacity-50"
                                >
                                    {updatingClient ? 'Saving...' : 'Save Client Info'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};