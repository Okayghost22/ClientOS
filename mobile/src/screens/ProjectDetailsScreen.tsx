import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';
import { storage } from '../utils/storage';

export const ProjectDetailsScreen = ({ route, navigation }: any) => {
    const { projectId, projectName } = route.params || {};

    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [taskStatus, setTaskStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING');
    const [taskDueDate, setTaskDueDate] = useState('');
    const [creating, setCreating] = useState(false);

    // Edit Modal State
    const [editingTask, setEditingTask] = useState<any | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [editStatus, setEditStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING');
    const [editDueDate, setEditDueDate] = useState('');
    const [updating, setUpdating] = useState(false);
    const [networkError, setNetworkError] = useState(false);

    const fetchTasks = useCallback(async () => {
        try {
            const res = await api.get(`/tasks/project/${projectId}`);
            const taskList = Array.isArray(res.data) ? res.data : (res.data?.tasks || []);
            setTasks(taskList);
            storage.setItem(`offline_tasks_${projectId}`, JSON.stringify(taskList));
            setNetworkError(false);
        } catch (err: any) {
            console.error('Failed to fetch tasks', err);
            if (!err.response || err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
                setNetworkError(true);
                const cached = await storage.getItem(`offline_tasks_${projectId}`);
                if (cached) {
                    setTasks(JSON.parse(cached));
                    Alert.alert('Offline Mode', 'Displaying locally cached tasks for this workspace.');
                } else {
                    Alert.alert('Network Error', 'Unable to fetch project tasks. Please check your internet connection.');
                }
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const handleCreateTask = async () => {
        if (!taskName.trim()) {
            Alert.alert('Validation Error', 'Task title is required.');
            return;
        }

        try {
            setCreating(true);
            const res = await api.post('/tasks', {
                name: taskName.trim(),
                description: taskDesc.trim() || null,
                priority: taskPriority,
                status: taskStatus,
                dueDate: taskDueDate || null,
                projectId
            });

            const newTask = res.data?.task || res.data;
            setTasks(prev => [newTask, ...prev]);
            setIsCreateModalOpen(false);
            setTaskName('');
            setTaskDesc('');
            setTaskPriority('MEDIUM');
            setTaskStatus('PENDING');
            setTaskDueDate('');
        } catch (err: any) {
            console.error('Create task error', err);
            Alert.alert('Error', err.response?.data?.error || 'Failed to create task');
        } finally {
            setCreating(false);
        }
    };

    const handleOpenEditModal = (task: any) => {
        setEditingTask(task);
        setEditName(task.name || task.title || '');
        setEditDesc(task.description || '');
        setEditPriority(task.priority || 'MEDIUM');
        setEditStatus(task.status || 'PENDING');
        setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    };

    const handleUpdateTask = async () => {
        if (!editingTask || !editName.trim()) return;

        try {
            setUpdating(true);
            const res = await api.put(`/tasks/${editingTask.id}`, {
                name: editName.trim(),
                description: editDesc.trim() || null,
                priority: editPriority,
                status: editStatus,
                dueDate: editDueDate || null
            });

            const updated = res.data?.task || res.data;
            setTasks(prev => prev.map(t => (t.id === editingTask.id ? { ...t, ...updated } : t)));
            setEditingTask(null);
        } catch (err: any) {
            console.error('Update task error', err);
            Alert.alert('Error', err.response?.data?.error || 'Failed to update task');
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleComplete = async (task: any) => {
        const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        try {
            setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, status: nextStatus } : t)));
            await api.patch(`/tasks/${task.id}/status`, { status: nextStatus }).catch(() => {
                api.put(`/tasks/${task.id}`, { status: nextStatus });
            });
        } catch (err) {
            console.error('Toggle status error', err);
            fetchTasks();
        }
    };

    const handleDeleteTask = (taskId: string) => {
        Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setTasks(prev => prev.filter(t => t.id !== taskId));
                        await api.delete(`/tasks/${taskId}`);
                    } catch (err) {
                        console.error('Delete task error', err);
                        fetchTasks();
                    }
                }
            }
        ]);
    };

    const filteredTasks = tasks.filter(t => {
        const title = t.name || t.title || '';
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            {networkError && (
                <TouchableOpacity style={styles.netErrorBanner} onPress={fetchTasks}>
                    <Text style={styles.netErrorText}>⚠️ Network connection error. Tap to retry.</Text>
                </TouchableOpacity>
            )}
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.topRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={() => setIsCreateModalOpen(true)}>
                        <Text style={styles.addButtonText}>+ New Task</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.headerTitle}>{projectName || 'Workspace Details'}</Text>

                {/* Search Bar */}
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search tasks in this workspace..."
                    placeholderTextColor="#94a3b8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                {/* Status & Priority Filter Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    <Text style={styles.filterGroupLabel}>Status:</Text>
                    {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(st => (
                        <TouchableOpacity
                            key={st}
                            style={[styles.filterBadge, statusFilter === st && styles.filterBadgeActive]}
                            onPress={() => setStatusFilter(st)}
                        >
                            <Text style={[styles.filterText, statusFilter === st && styles.filterTextActive]}>
                                {st === 'ALL' ? 'All Status' : st.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <Text style={[styles.filterGroupLabel, { marginLeft: 12 }]}>Priority:</Text>
                    {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(pr => (
                        <TouchableOpacity
                            key={pr}
                            style={[styles.filterBadge, priorityFilter === pr && styles.filterBadgeActive]}
                            onPress={() => setPriorityFilter(pr)}
                        >
                            <Text style={[styles.filterText, priorityFilter === pr && styles.filterTextActive]}>
                                {pr === 'ALL' ? 'All Priority' : pr}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Task List */}
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
                }
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 32 }} />
                ) : filteredTasks.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>
                            {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                                ? 'No tasks match your filters.'
                                : 'No tasks in this workspace. Tap "+ New Task" to add one!'}
                        </Text>
                    </View>
                ) : (
                    filteredTasks.map((task) => (
                        <View key={task.id} style={styles.taskCard}>
                            <View style={styles.taskHeader}>
                                <TouchableOpacity
                                    style={[
                                        styles.checkbox,
                                        task.status === 'COMPLETED' && styles.checkboxChecked
                                    ]}
                                    onPress={() => handleToggleComplete(task)}
                                >
                                    {task.status === 'COMPLETED' && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>

                                <Text style={[
                                    styles.taskTitle,
                                    task.status === 'COMPLETED' && styles.taskTitleDone
                                ]}>
                                    {task.name || task.title}
                                </Text>
                            </View>

                            {task.description ? (
                                <Text style={styles.taskDesc}>{task.description}</Text>
                            ) : null}

                            <View style={styles.badgeRow}>
                                <View style={[
                                    styles.priorityBadge,
                                    task.priority === 'HIGH' ? styles.priorityHigh :
                                    task.priority === 'MEDIUM' ? styles.priorityMed : styles.priorityLow
                                ]}>
                                    <Text style={styles.priorityText}>{task.priority || 'MEDIUM'}</Text>
                                </View>

                                <View style={[
                                    styles.statusBadge,
                                    task.status === 'COMPLETED' ? styles.statusDone :
                                    task.status === 'IN_PROGRESS' ? styles.statusProgress : styles.statusPending
                                ]}>
                                    <Text style={styles.statusText}>{task.status ? task.status.replace('_', ' ') : 'PENDING'}</Text>
                                </View>

                                {task.dueDate ? (
                                    <Text style={styles.dueDateText}>
                                        Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                ) : null}
                            </View>

                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEditModal(task)}>
                                    <Text style={styles.editBtnText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteTask(task.id)}>
                                    <Text style={styles.deleteBtnText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Create Task Modal */}
            <Modal visible={isCreateModalOpen} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Create New Task</Text>

                        <Text style={styles.modalLabel}>Task Title *</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Design Landing Page"
                            placeholderTextColor="#94a3b8"
                            value={taskName}
                            onChangeText={setTaskName}
                        />

                        <Text style={styles.modalLabel}>Description</Text>
                        <TextInput
                            style={[styles.modalInput, { height: 60 }]}
                            placeholder="Task details..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            value={taskDesc}
                            onChangeText={setTaskDesc}
                        />

                        <Text style={styles.modalLabel}>Due Date (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. 2026-12-31"
                            placeholderTextColor="#94a3b8"
                            value={taskDueDate}
                            onChangeText={setTaskDueDate}
                        />

                        <View style={styles.modalRow}>
                            <View style={{ flex: 1, marginRight: 6 }}>
                                <Text style={styles.modalLabel}>Priority</Text>
                                <View style={styles.selectRow}>
                                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                                        <TouchableOpacity
                                            key={p}
                                            style={[styles.selectChip, taskPriority === p && styles.selectChipActive]}
                                            onPress={() => setTaskPriority(p)}
                                        >
                                            <Text style={[styles.selectChipText, taskPriority === p && styles.selectChipTextActive]}>{p[0]}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={{ flex: 1, marginLeft: 6 }}>
                                <Text style={styles.modalLabel}>Status</Text>
                                <View style={styles.selectRow}>
                                    {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(s => (
                                        <TouchableOpacity
                                            key={s}
                                            style={[styles.selectChip, taskStatus === s && styles.selectChipActive]}
                                            onPress={() => setTaskStatus(s)}
                                        >
                                            <Text style={[styles.selectChipText, taskStatus === s && styles.selectChipTextActive]}>{s === 'IN_PROGRESS' ? 'PROG' : s.slice(0, 4)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsCreateModalOpen(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateTask} disabled={creating}>
                                {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Create Task</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Task Modal */}
            {editingTask && (
                <Modal visible={true} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>Edit Task</Text>

                            <Text style={styles.modalLabel}>Task Title *</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={editName}
                                onChangeText={setEditName}
                            />

                            <Text style={styles.modalLabel}>Description</Text>
                            <TextInput
                                style={[styles.modalInput, { height: 60 }]}
                                multiline
                                value={editDesc}
                                onChangeText={setEditDesc}
                            />

                            <Text style={styles.modalLabel}>Due Date (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#94a3b8"
                                value={editDueDate}
                                onChangeText={setEditDueDate}
                            />

                            <View style={styles.modalRow}>
                                <View style={{ flex: 1, marginRight: 6 }}>
                                    <Text style={styles.modalLabel}>Priority</Text>
                                    <View style={styles.selectRow}>
                                        {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                                            <TouchableOpacity
                                                key={p}
                                                style={[styles.selectChip, editPriority === p && styles.selectChipActive]}
                                                onPress={() => setEditPriority(p)}
                                            >
                                                <Text style={[styles.selectChipText, editPriority === p && styles.selectChipTextActive]}>{p[0]}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={{ flex: 1, marginLeft: 6 }}>
                                    <Text style={styles.modalLabel}>Status</Text>
                                    <View style={styles.selectRow}>
                                        {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(s => (
                                            <TouchableOpacity
                                                key={s}
                                                style={[styles.selectChip, editStatus === s && styles.selectChipActive]}
                                                onPress={() => setEditStatus(s)}
                                            >
                                                <Text style={[styles.selectChipText, editStatus === s && styles.selectChipTextActive]}>{s === 'IN_PROGRESS' ? 'PROG' : s.slice(0, 4)}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingTask(null)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateTask} disabled={updating}>
                                    {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ecfeff',
    },
    header: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    backButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    backText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0d9488',
    },
    addButton: {
        backgroundColor: '#0d9488',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '800',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 10,
    },
    searchInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
        fontSize: 13,
        color: '#0f172a',
        marginBottom: 10,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterGroupLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748b',
        alignSelf: 'center',
        marginRight: 6,
    },
    filterBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        marginRight: 6,
    },
    filterBadgeActive: {
        backgroundColor: '#0f172a',
    },
    filterText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748b',
    },
    filterTextActive: {
        color: '#ffffff',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    taskCard: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 2,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    checkmark: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '900',
    },
    taskTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0f172a',
        flex: 1,
    },
    taskTitleDone: {
        textDecorationLine: 'line-through',
        color: '#94a3b8',
    },
    taskDesc: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 6,
        marginLeft: 34,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
        marginLeft: 34,
    },
    priorityBadge: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
    },
    priorityHigh: { backgroundColor: '#ffe4e6' },
    priorityMed: { backgroundColor: '#fef3c7' },
    priorityLow: { backgroundColor: '#f1f5f9' },
    priorityText: { fontSize: 9, fontWeight: '900', color: '#0f172a' },
    statusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    statusDone: { backgroundColor: '#d1fae5' },
    statusProgress: { backgroundColor: '#ccfbf1' },
    statusPending: { backgroundColor: '#f1f5f9' },
    statusText: { fontSize: 9, fontWeight: '900', color: '#0f172a' },
    dueDateText: { fontSize: 10, color: '#64748b', fontWeight: '600' },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
    },
    editBtn: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#ccfbf1',
    },
    editBtnText: { color: '#0d9488', fontSize: 12, fontWeight: '800' },
    deleteBtn: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#ffe4e6',
    },
    deleteBtnText: { color: '#e11d48', fontSize: 12, fontWeight: '800' },
    emptyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    emptyText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 20,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 16,
    },
    modalLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#475569',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    modalInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 13,
        color: '#0f172a',
        marginBottom: 12,
    },
    modalRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    selectRow: {
        flexDirection: 'row',
        gap: 4,
    },
    selectChip: {
        flex: 1,
        paddingVertical: 6,
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    selectChipActive: {
        backgroundColor: '#0d9488',
    },
    selectChipText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748b',
    },
    selectChipTextActive: {
        color: '#ffffff',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#475569',
        fontWeight: '800',
        fontSize: 13,
    },
    saveBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#0d9488',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 13,
    },
    netErrorBanner: {
        backgroundColor: '#fef2f2',
        borderColor: '#fca5a5',
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    netErrorText: {
        color: '#dc2626',
        fontSize: 12,
        fontWeight: '600',
    },
});
