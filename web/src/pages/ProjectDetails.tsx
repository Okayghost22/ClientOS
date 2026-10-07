import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.ts';
import {
    ArrowLeft,
    Plus,
    CheckCircle2,
    Search,
    Trash2,
    Layers,
    Pencil,
    Calendar,
    Clock
} from 'lucide-react';

interface Task {
    id: string;
    title?: string;
    name?: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: string | null;
    createdAt?: string;
}

interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
    tasks?: Task[];
}

export const ProjectDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
    const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');

    // New Task Modal State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [taskStatus, setTaskStatus] = useState<'TODO' | 'IN_PROGRESS' | 'COMPLETED'>('TODO');
    const [taskDueDate, setTaskDueDate] = useState('');
    const [creatingTask, setCreatingTask] = useState(false);

    // Edit Task Modal State
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [editStatus, setEditStatus] = useState<'TODO' | 'IN_PROGRESS' | 'COMPLETED'>('TODO');
    const [editDueDate, setEditDueDate] = useState('');
    const [updatingTask, setUpdatingTask] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProjectDetails();

            // Auto-poll every 15 seconds to pick up task changes from mobile app
            const pollInterval = setInterval(() => {
                fetchProjectDetails();
            }, 15000);

            // Refetch instantly when the user switches back to this tab
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    fetchProjectDetails();
                }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                clearInterval(pollInterval);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/projects/${id}`);
            const projectData = res.data?.project || res.data;
            setProject(projectData);
            setTasks(projectData?.tasks || []);
        } catch (err) {
            console.error('Failed to load project details', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim() || !id) return;

        try {
            setCreatingTask(true);
            const res = await api.post(`/tasks`, {
                projectId: id,
                name: taskTitle,
                title: taskTitle,
                description: taskDescription,
                priority: taskPriority,
                status: taskStatus,
                dueDate: taskDueDate || null
            });
            const newTask = res.data?.task || res.data;
            setTasks(prev => [newTask, ...(Array.isArray(prev) ? prev : [])]);
            setTaskTitle('');
            setTaskDescription('');
            setTaskDueDate('');
            setIsTaskModalOpen(false);
        } catch (err) {
            console.error('Failed to create task', err);
        } finally {
            setCreatingTask(false);
        }
    };

    const handleOpenEditModal = (task: Task) => {
        setEditingTask(task);
        setEditTitle(task.title || task.name || '');
        setEditDescription(task.description || '');
        setEditPriority(task.priority || 'MEDIUM');
        setEditStatus(task.status === 'PENDING' ? 'TODO' : (task.status as any));
        setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask || !editTitle.trim()) return;

        try {
            setUpdatingTask(true);
            const payload = {
                name: editTitle,
                title: editTitle,
                description: editDescription,
                priority: editPriority,
                status: editStatus,
                dueDate: editDueDate || null
            };

            setTasks(prev => (Array.isArray(prev) ? prev : []).map(t =>
                t.id === editingTask.id ? { ...t, ...payload } : t
            ));

            await api.put(`/tasks/${editingTask.id}`, payload);
            setEditingTask(null);
        } catch (err) {
            console.error('Failed to update task', err);
            fetchProjectDetails();
        } finally {
            setUpdatingTask(false);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'COMPLETED') => {
        try {
            setTasks(prev => (Array.isArray(prev) ? prev : []).map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            await api.patch(`/tasks/${taskId}`, { status: newStatus });
        } catch (err) {
            console.error('Failed to update task status', err);
            fetchProjectDetails();
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            setTasks(prev => (Array.isArray(prev) ? prev : []).filter(t => t.id !== taskId));
            await api.delete(`/tasks/${taskId}`);
        } catch (err) {
            console.error('Failed to delete task', err);
            fetchProjectDetails();
        }
    };

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const filteredTasks = safeTasks.filter(t => {
        const matchesQuery = (t.title || t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const normalizedStatus = (t.status as string) === 'PENDING' ? 'TODO' : t.status;
        const matchesStatus = statusFilter === 'ALL' || normalizedStatus === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || (t.priority || 'MEDIUM') === priorityFilter;
        return matchesQuery && matchesStatus && matchesPriority;
    });

    const todoTasks = filteredTasks.filter(t => t.status === 'TODO' || (t.status as string) === 'PENDING');
    const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
    const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED');

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs font-bold text-teal-800">Loading Beachside Board...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-100 text-slate-800 flex flex-col font-sans selection:bg-teal-200 selection:text-teal-900 relative">
            {/* Dynamic Background Ambient Water Glows */}
            <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Top Navbar */}
            <header className="bg-white/70 backdrop-blur-2xl border-b border-teal-100/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 rounded-xl bg-white/80 hover:bg-teal-50 text-slate-600 hover:text-teal-900 border border-teal-100/80 transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
                    >
                        <ArrowLeft size={16} /> Workspaces
                    </button>

                    <div className="h-4 w-px bg-teal-200/60 hidden sm:block" />

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-slate-900 tracking-tight">{project?.name || 'Workspace Board'}</span>
                            <span className="text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200/60">
                                Active Board
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate max-w-md">
                            {project?.description || 'Manage client deliverables and task columns.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="inline-flex items-center gap-2 py-2.5 px-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 text-xs transition transform active:scale-95"
                    >
                        <Plus size={16} /> Add New Task
                    </button>
                </div>
            </header>

            {/* Main Board Area */}
            <main className="flex-1 p-6 md:p-8 space-y-6 overflow-x-auto">
                {/* Board Search & Control Strip */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-3.5 rounded-2xl border border-white shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
                        <div className="relative w-full sm:w-64">
                            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search tasks by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200/80 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-xs font-medium transition"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                            <span className="text-[11px] font-bold text-slate-500 shrink-0">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e: any) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-slate-800 text-xs font-bold focus:outline-none focus:border-teal-500 transition cursor-pointer w-full sm:w-auto"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                            <span className="text-[11px] font-bold text-slate-500 shrink-0">Priority:</span>
                            <select
                                value={priorityFilter}
                                onChange={(e: any) => setPriorityFilter(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-slate-800 text-xs font-bold focus:outline-none focus:border-teal-500 transition cursor-pointer w-full sm:w-auto"
                            >
                                <option value="ALL">All Priorities</option>
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600 shrink-0">
                        <span className="flex items-center gap-1.5"><Layers size={14} className="text-teal-600" /> Total Tasks: {tasks.length}</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-600" /> Done: {completedTasks.length}</span>
                    </div>
                </div>

                {/* 3-Column Kanban Board Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

                    {/* TO DO COLUMN */}
                    <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-cyan-100 p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between pb-2 border-b border-cyan-100/80">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">To Do</h3>
                                <span className="text-[10px] font-black bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full">
                                    {todoTasks.length}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 min-h-[250px]">
                            {todoTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onStatusChange={handleStatusChange}
                                    onEdit={handleOpenEditModal}
                                    onDelete={handleDeleteTask}
                                />
                            ))}
                            {todoTasks.length === 0 && (
                                <div className="h-32 border-2 border-dashed border-cyan-200/60 rounded-xl flex items-center justify-center text-xs font-medium text-slate-400">
                                    No tasks to do
                                </div>
                            )}
                        </div>
                    </div>

                    {/* IN PROGRESS COLUMN */}
                    <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-teal-100 p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between pb-2 border-b border-teal-100/80">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">In Progress</h3>
                                <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                    {inProgressTasks.length}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 min-h-[250px]">
                            {inProgressTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onStatusChange={handleStatusChange}
                                    onEdit={handleOpenEditModal}
                                    onDelete={handleDeleteTask}
                                />
                            ))}
                            {inProgressTasks.length === 0 && (
                                <div className="h-32 border-2 border-dashed border-teal-200/60 rounded-xl flex items-center justify-center text-xs font-medium text-slate-400">
                                    No tasks in progress
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COMPLETED COLUMN */}
                    <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-emerald-100 p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-100/80">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Completed</h3>
                                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                    {completedTasks.length}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 min-h-[250px]">
                            {completedTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onStatusChange={handleStatusChange}
                                    onEdit={handleOpenEditModal}
                                    onDelete={handleDeleteTask}
                                />
                            ))}
                            {completedTasks.length === 0 && (
                                <div className="h-32 border-2 border-dashed border-emerald-200/60 rounded-xl flex items-center justify-center text-xs font-medium text-slate-400">
                                    No completed tasks yet
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            {/* New Task Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl border border-white p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Add Task to Board</h3>
                            <p className="text-xs text-slate-500 mt-1">Create a new deliverable item for this workspace.</p>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Implement Coastal Theme Headers"
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Task details..."
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                        Priority
                                    </label>
                                    <select
                                        value={taskPriority}
                                        onChange={(e: any) => setTaskPriority(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                        Initial Column
                                    </label>
                                    <select
                                        value={taskStatus}
                                        onChange={(e: any) => setTaskStatus(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                    >
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={taskDueDate}
                                    onChange={(e) => setTaskDueDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsTaskModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingTask}
                                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-teal-600/20 disabled:opacity-50"
                                >
                                    {creatingTask ? 'Adding...' : 'Add Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {editingTask && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl border border-white p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Edit Task</h3>
                            <p className="text-xs text-slate-500 mt-1">Update task details and due date for this board item.</p>
                        </div>

                        <form onSubmit={handleUpdateTask} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
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

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                        Priority
                                    </label>
                                    <select
                                        value={editPriority}
                                        onChange={(e: any) => setEditPriority(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                        Column Status
                                    </label>
                                    <select
                                        value={editStatus}
                                        onChange={(e: any) => setEditStatus(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                    >
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingTask(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatingTask}
                                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-teal-600/20 disabled:opacity-50"
                                >
                                    {updatingTask ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Subcomponent for individual task card
const TaskCard: React.FC<{
    task: Task;
    onStatusChange: (id: string, status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED') => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}> = ({ task, onStatusChange, onEdit, onDelete }) => {
    const getPriorityBadge = (p?: string) => {
        switch (p) {
            case 'HIGH':
                return <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold">High</span>;
            case 'LOW':
                return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">Low</span>;
            default:
                return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">Medium</span>;
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

    const formattedCreated = formatDate(task.createdAt);
    const formattedDue = formatDate(task.dueDate);

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white p-4 shadow-sm hover:shadow-md transition space-y-3 group">
            <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition leading-snug">
                    {task.title || task.name}
                </h4>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                        onClick={() => onEdit(task)}
                        className="text-slate-400 hover:text-teal-600 p-1 rounded hover:bg-slate-100 transition"
                        title="Edit task"
                    >
                        <Pencil size={13} />
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-slate-100 transition"
                        title="Delete task"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {task.description && (
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Date Badges Row (Created & Due Dates) */}
            <div className="flex items-center flex-wrap gap-2 text-[10px] text-slate-400 font-semibold pt-1">
                {formattedCreated && (
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        <Calendar size={10} className="text-teal-600" />
                        Created: {formattedCreated}
                    </span>
                )}
                {formattedDue && (
                    <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-amber-800 font-bold border border-amber-200/60">
                        <Clock size={10} className="text-amber-600" />
                        Due: {formattedDue}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>{getPriorityBadge(task.priority)}</div>

                {/* Quick status cycle button */}
                <div className="flex gap-1">
                    {task.status !== 'TODO' && (task.status as string) !== 'PENDING' && (
                        <button
                            onClick={() => onStatusChange(task.id, 'TODO')}
                            className="p-1 rounded hover:bg-cyan-50 text-[10px] font-bold text-cyan-700"
                            title="Move to To Do"
                        >
                            ← To Do
                        </button>
                    )}
                    {task.status !== 'IN_PROGRESS' && (
                        <button
                            onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                            className="p-1 rounded hover:bg-amber-50 text-[10px] font-bold text-amber-700"
                            title="Move to In Progress"
                        >
                            Progress
                        </button>
                    )}
                    {task.status !== 'COMPLETED' && (
                        <button
                            onClick={() => onStatusChange(task.id, 'COMPLETED')}
                            className="p-1 rounded hover:bg-emerald-50 text-[10px] font-bold text-emerald-700"
                            title="Move to Completed"
                        >
                            Done →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};