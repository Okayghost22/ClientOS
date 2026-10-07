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
    Alert,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { storage } from '../utils/storage';

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

export const MainScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();

    // Top Navigation Bar Tab: 'workspaces' | 'clients' | 'metrics'
    const [activeTab, setActiveTab] = useState<'workspaces' | 'clients' | 'metrics'>('workspaces');

    // Data states
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [networkError, setNetworkError] = useState(false);

    // Filters & Searches
    const [projectSearch, setProjectSearch] = useState('');
    const [projectStatusFilter, setProjectStatusFilter] = useState('ALL');

    const [clientSearch, setClientSearch] = useState('');
    const [clientStatusFilter, setClientStatusFilter] = useState('ALL');

    // Modals
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [newProjName, setNewProjName] = useState('');
    const [newProjClient, setNewProjClient] = useState('');
    const [newProjDesc, setNewProjDesc] = useState('');
    const [newProjStatus, setNewProjStatus] = useState<'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>('NOT_STARTED');
    const [newProjStartDate, setNewProjStartDate] = useState('');
    const [newProjEndDate, setNewProjEndDate] = useState('');
    const [creatingProj, setCreatingProj] = useState(false);

    const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientEmail, setNewClientEmail] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const [newClientCompany, setNewClientCompany] = useState('');
    const [newClientStatus, setNewClientStatus] = useState<'PENDING' | 'ACTIVE' | 'INACTIVE' | 'LEAD'>('ACTIVE');
    const [creatingClient, setCreatingClient] = useState(false);

    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [editClientEmail, setEditClientEmail] = useState('');
    const [editClientPhone, setEditClientPhone] = useState('');
    const [editClientCompany, setEditClientCompany] = useState('');
    const [editClientStatus, setEditClientStatus] = useState<'PENDING' | 'ACTIVE' | 'INACTIVE' | 'LEAD'>('ACTIVE');
    const [updatingClient, setUpdatingClient] = useState(false);

    const fetchAllData = useCallback(async () => {
        let isNetErr = false;
        try {
            const [projRes, clientRes, dashRes] = await Promise.all([
                api.get('/projects').catch((err) => {
                    if (!err.response || err.message === 'Network Error' || err.code === 'ERR_NETWORK') isNetErr = true;
                    return { data: [] };
                }),
                api.get('/clients').catch((err) => {
                    if (!err.response || err.message === 'Network Error' || err.code === 'ERR_NETWORK') isNetErr = true;
                    return { data: [] };
                }),
                api.get('/dashboard').catch((err) => {
                    if (!err.response || err.message === 'Network Error' || err.code === 'ERR_NETWORK') isNetErr = true;
                    return null;
                })
            ]);

            const projList = Array.isArray(projRes.data) ? projRes.data : (projRes.data?.projects || []);
            const clientList = Array.isArray(clientRes.data) ? clientRes.data : (clientRes.data?.clients || []);

            if (projList.length > 0) {
                setProjects(projList);
                storage.setItem('offline_projects', JSON.stringify(projList));
            } else if (isNetErr) {
                const cached = await storage.getItem('offline_projects');
                if (cached) setProjects(JSON.parse(cached));
            } else {
                setProjects([]);
            }

            if (clientList.length > 0) {
                setClients(clientList);
                storage.setItem('offline_clients', JSON.stringify(clientList));
            } else if (isNetErr) {
                const cachedClients = await storage.getItem('offline_clients');
                if (cachedClients) setClients(JSON.parse(cachedClients));
            } else {
                setClients([]);
            }

            if (dashRes?.data?.dashboard) {
                setDashboardData(dashRes.data.dashboard);
            }

            if (isNetErr) {
                setNetworkError(true);
                Alert.alert('Offline Mode', 'Unable to reach server. Displaying cached workspaces offline.');
            } else {
                setNetworkError(false);
            }
        } catch (e: any) {
            console.error('Fetch error:', e);
            setNetworkError(true);
            Alert.alert('Network Error', 'Unable to load workspace data. Please check your network connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllData();
    };

    // Workspace Handlers
    const handleCreateProject = async () => {
        if (!newProjName.trim()) {
            Alert.alert('Validation Error', 'Workspace name is required.');
            return;
        }

        try {
            setCreatingProj(true);
            const res = await api.post('/projects', {
                name: newProjName.trim(),
                clientName: newProjClient.trim() || null,
                description: newProjDesc.trim() || null,
                status: newProjStatus,
                startDate: newProjStartDate || null,
                endDate: newProjEndDate || null
            });
            const created = res.data?.project || res.data;
            setProjects(prev => [created, ...prev]);
            setNewProjName('');
            setNewProjClient('');
            setNewProjDesc('');
            setNewProjStatus('NOT_STARTED');
            setNewProjStartDate('');
            setNewProjEndDate('');
            setIsCreateProjectOpen(false);
            fetchAllData();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to create workspace');
        } finally {
            setCreatingProj(false);
        }
    };

    const handleDeleteProject = (id: string, name: string) => {
        Alert.alert('Delete Workspace', `Are you sure you want to delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    // Optimistic UI update
                    setProjects(prev => prev.filter(p => p.id !== id));
                    try {
                        await api.delete(`/projects/${id}`);
                    } catch (err: any) {
                        // Revert on failure and show error
                        console.error('Failed to delete project:', err?.response?.data || err.message);
                        Alert.alert('Error', 'Failed to delete workspace. Please try again.');
                        fetchAllData(); // Re-fetch to restore correct state
                    }
                }
            }
        ]);
    };

    // Client Handlers
    const handleCreateClient = async () => {
        if (!newClientName.trim()) {
            Alert.alert('Validation Error', 'Client name is required.');
            return;
        }

        try {
            setCreatingClient(true);
            const res = await api.post('/clients', {
                name: newClientName.trim(),
                email: newClientEmail.trim() || null,
                phone: newClientPhone.trim() || null,
                company: newClientCompany.trim() || null,
                status: newClientStatus
            });
            const created = res.data?.client || res.data;
            setClients(prev => [created, ...prev]);
            setNewClientName('');
            setNewClientEmail('');
            setNewClientPhone('');
            setNewClientCompany('');
            setNewClientStatus('ACTIVE');
            setIsCreateClientOpen(false);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to create client');
        } finally {
            setCreatingClient(false);
        }
    };

    const handleOpenEditClient = (client: Client) => {
        setEditingClient(client);
        setEditClientEmail(client.email || '');
        setEditClientPhone(client.phone || '');
        setEditClientCompany(client.company || '');
        setEditClientStatus(client.status === 'PENDING' ? 'ACTIVE' : client.status);
    };

    const handleUpdateClient = async () => {
        if (!editingClient) return;

        try {
            setUpdatingClient(true);
            const res = await api.put(`/clients/${editingClient.id}`, {
                email: editClientEmail.trim() || null,
                phone: editClientPhone.trim() || null,
                company: editClientCompany.trim() || null,
                status: editClientStatus
            });
            const updated = res.data?.client || res.data;
            setClients(prev => prev.map(c => (c.id === editingClient.id ? { ...c, ...updated } : c)));
            setEditingClient(null);
        } catch (err) {
            Alert.alert('Error', 'Failed to update client details');
        } finally {
            setUpdatingClient(false);
        }
    };

    const handleDeleteClient = (id: string, name: string) => {
        Alert.alert('Delete Client', `Delete "${name}" from directory?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    setClients(prev => prev.filter(c => c.id !== id));
                    await api.delete(`/clients/${id}`).catch(() => fetchAllData());
                }
            }
        ]);
    };

    // Filter calculations
    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(projectSearch.toLowerCase()) ||
            (p.clientName && p.clientName.toLowerCase().includes(projectSearch.toLowerCase()));
        const matchesStatus = projectStatusFilter === 'ALL' || p.status === projectStatusFilter || (!p.status && projectStatusFilter === 'NOT_STARTED');
        return matchesSearch && matchesStatus;
    });

    const filteredClients = clients.filter(c => {
        const matchesSearch = c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
            (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase())) ||
            (c.company && c.company.toLowerCase().includes(clientSearch.toLowerCase()));
        const matchesStatus = clientStatusFilter === 'ALL' || c.status === clientStatusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingClientsCount = clients.filter(c => c.status === 'PENDING').length;

    // Metric Calculations
    const allTasks = projects.flatMap(p => p.tasks || []);
    const totalProjectsCount = projects.length;
    const totalTasksCount = dashboardData?.totalTasks ?? allTasks.length;
    const completedTasksCount = dashboardData?.completedTasks ?? allTasks.filter(t => t.status === 'COMPLETED').length;
    const pendingTasksCount = dashboardData?.pendingTasks ?? allTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
    const projectsInProgressCount = dashboardData?.projectsInProgress ?? projects.filter(p => p.status === 'IN_PROGRESS').length;

    // Tasks due tomorrow push alert calculation
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const tasksDueTomorrow = allTasks.filter(t => {
        if (!t.dueDate || t.status === 'COMPLETED') return false;
        try {
            const taskDateStr = new Date(t.dueDate).toISOString().split('T')[0];
            return taskDateStr === tomorrowStr;
        } catch (e) {
            return false;
        }
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Clean Top Branding & Profile Header */}
            <View style={styles.topHeader}>
                <View style={styles.brandRow}>
                    <View style={styles.brandBadge}>
                        <Text style={styles.brandText}>C</Text>
                    </View>
                    <View>
                        <Text style={styles.brandTitle}>ClientOS Mobile</Text>
                    </View>
                </View>

                <View style={styles.userProfileRow}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.avatarLetter}>{user?.fullName?.charAt(0) || 'U'}</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <Text style={styles.logoutBtnText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {tasksDueTomorrow.length > 0 && (
                <View style={styles.pushNotificationBanner}>
                    <Text style={styles.pushNotificationTitle}>🔔 Reminder: {tasksDueTomorrow.length} Task{tasksDueTomorrow.length > 1 ? 's' : ''} Due Tomorrow!</Text>
                    <Text style={styles.pushNotificationBody}>
                        {tasksDueTomorrow.map(t => t.name || t.title).join(', ')}
                    </Text>
                </View>
            )}

            {networkError && (
                <TouchableOpacity style={styles.netErrorBanner} onPress={fetchAllData}>
                    <Text style={styles.netErrorText}>⚠️ Connection Error: Unable to reach server. Tap to retry.</Text>
                </TouchableOpacity>
            )}

            {/* Top Navigation Bar Tabs */}
            <View style={styles.tabNavBar}>
                <TouchableOpacity
                    style={[styles.navTab, activeTab === 'workspaces' && styles.navTabActive]}
                    onPress={() => setActiveTab('workspaces')}
                >
                    <Text style={[styles.navTabText, activeTab === 'workspaces' && styles.navTabTextActive]}>
                        📁 Workspaces
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navTab, activeTab === 'clients' && styles.navTabActive]}
                    onPress={() => setActiveTab('clients')}
                >
                    <Text style={[styles.navTabText, activeTab === 'clients' && styles.navTabTextActive]}>
                        👥 Directory {pendingClientsCount > 0 ? `(${pendingClientsCount})` : ''}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navTab, activeTab === 'metrics' && styles.navTabActive]}
                    onPress={() => setActiveTab('metrics')}
                >
                    <Text style={[styles.navTabText, activeTab === 'metrics' && styles.navTabTextActive]}>
                        📊 Metrics
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Main Content Area */}
            <ScrollView
                style={styles.mainContainer}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
                }
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 40 }} />
                ) : activeTab === 'workspaces' ? (
                    /* WORKSPACES TAB */
                    <View>
                        <View style={styles.sectionHeaderRow}>
                            <View>
                                <Text style={styles.sectionHeaderTitle}>Project Workspaces</Text>
                                <Text style={styles.sectionHeaderSub}>Manage deliverables & task boards</Text>
                            </View>
                            <TouchableOpacity style={styles.primaryBtn} onPress={() => setIsCreateProjectOpen(true)}>
                                <Text style={styles.primaryBtnText}>+ Workspace</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Search & Filter */}
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search workspaces by name or client..."
                            placeholderTextColor="#94a3b8"
                            value={projectSearch}
                            onChangeText={setProjectSearch}
                        />

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
                            {(['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const).map(st => (
                                <TouchableOpacity
                                    key={st}
                                    style={[styles.filterChip, projectStatusFilter === st && styles.filterChipActive]}
                                    onPress={() => setProjectStatusFilter(st)}
                                >
                                    <Text style={[styles.filterChipText, projectStatusFilter === st && styles.filterChipTextActive]}>
                                        {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Projects Cards List */}
                        {filteredProjects.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyCardTitle}>No Workspaces Found</Text>
                                <Text style={styles.emptyCardSub}>Create your first workspace to begin managing tasks.</Text>
                            </View>
                        ) : (
                            filteredProjects.map(project => (
                                <TouchableOpacity
                                    key={project.id}
                                    style={styles.cardItem}
                                    onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id, projectName: project.name })}
                                >
                                    <View style={styles.cardHeaderRow}>
                                        <Text style={styles.cardTitle}>{project.name}</Text>
                                        <View style={[
                                            styles.statusPill,
                                            project.status === 'COMPLETED' ? styles.pillSuccess :
                                            project.status === 'IN_PROGRESS' ? styles.pillProgress : styles.pillDefault
                                        ]}>
                                            <Text style={styles.pillText}>
                                                {project.status ? project.status.replace('_', ' ') : 'NOT STARTED'}
                                            </Text>
                                        </View>
                                    </View>

                                    {project.clientName ? (
                                        <View style={styles.clientBadgeContainer}>
                                            <Text style={styles.clientBadgeText}>👤 Client: {project.clientName}</Text>
                                        </View>
                                    ) : null}

                                    {project.description ? (
                                        <Text style={styles.cardDesc} numberOfLines={2}>{project.description}</Text>
                                    ) : null}

                                    <View style={styles.cardFooterRow}>
                                        <Text style={styles.cardTaskCount}>{project.tasks?.length || 0} Tasks</Text>
                                        <View style={styles.cardRightActions}>
                                            <TouchableOpacity onPress={() => handleDeleteProject(project.id, project.name)}>
                                                <Text style={styles.deleteLinkText}>Delete</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.openBoardText}>Open Board →</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                ) : activeTab === 'clients' ? (
                    /* CLIENT DIRECTORY TAB */
                    <View>
                        <View style={styles.sectionHeaderRow}>
                            <View>
                                <Text style={styles.sectionHeaderTitle}>Client Directory</Text>
                                <Text style={styles.sectionHeaderSub}>Auto-created & active directory</Text>
                            </View>
                            <TouchableOpacity style={styles.primaryBtn} onPress={() => setIsCreateClientOpen(true)}>
                                <Text style={styles.primaryBtnText}>+ New Client</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Search & Status Filter */}
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search clients by name, email, or company..."
                            placeholderTextColor="#94a3b8"
                            value={clientSearch}
                            onChangeText={setClientSearch}
                        />

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
                            {(['ALL', 'PENDING', 'ACTIVE', 'LEAD', 'INACTIVE'] as const).map(st => (
                                <TouchableOpacity
                                    key={st}
                                    style={[styles.filterChip, clientStatusFilter === st && styles.filterChipActive]}
                                    onPress={() => setClientStatusFilter(st)}
                                >
                                    <Text style={[styles.filterChipText, clientStatusFilter === st && styles.filterChipTextActive]}>
                                        {st === 'ALL' ? 'All Clients' : st === 'PENDING' ? 'Pending Details' : st}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Client Cards Grid */}
                        {filteredClients.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyCardTitle}>No Clients Found</Text>
                                <Text style={styles.emptyCardSub}>Add a workspace with a client name or tap "+ New Client".</Text>
                            </View>
                        ) : (
                            filteredClients.map(client => (
                                <TouchableOpacity
                                    key={client.id}
                                    style={styles.cardItem}
                                    onPress={() => handleOpenEditClient(client)}
                                >
                                    <View style={styles.cardHeaderRow}>
                                        <View style={styles.clientAvatarBadge}>
                                            <Text style={styles.clientAvatarText}>{client.name.charAt(0).toUpperCase()}</Text>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text style={styles.cardTitle}>{client.name}</Text>
                                            {client.company ? (
                                                <Text style={styles.clientCompanyText}>🏢 {client.company}</Text>
                                            ) : null}
                                        </View>

                                        <View style={[
                                            styles.statusPill,
                                            client.status === 'PENDING' ? styles.pillPending :
                                            client.status === 'ACTIVE' ? styles.pillSuccess :
                                            client.status === 'LEAD' ? styles.pillLead : styles.pillDefault
                                        ]}>
                                            <Text style={styles.pillText}>
                                                {client.status === 'PENDING' ? 'PENDING DETAILS' : client.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.clientDetailsBox}>
                                        <Text style={styles.clientDetailRow}>
                                            📧 {client.email || <Text style={styles.pendingText}>Email Pending — Tap to edit</Text>}
                                        </Text>
                                        {client.phone ? (
                                            <Text style={styles.clientDetailRow}>📞 {client.phone}</Text>
                                        ) : null}
                                    </View>

                                    <View style={styles.cardFooterRow}>
                                        <Text style={styles.cardTaskCount}>Tap card to complete/edit details</Text>
                                        <TouchableOpacity onPress={() => handleDeleteClient(client.id, client.name)}>
                                            <Text style={styles.deleteLinkText}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                ) : (
                    /* METRICS DASHBOARD TAB */
                    <View>
                        <Text style={styles.sectionHeaderTitle}>Dashboard Overview</Text>
                        <Text style={styles.sectionHeaderSub}>Live analytics for your account</Text>

                        <View style={styles.metricsGrid}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Total Projects</Text>
                                <Text style={[styles.metricVal, { color: '#0f172a' }]}>{totalProjectsCount}</Text>
                            </View>

                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Total Tasks</Text>
                                <Text style={[styles.metricVal, { color: '#0f172a' }]}>{totalTasksCount}</Text>
                            </View>

                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Completed Tasks</Text>
                                <Text style={[styles.metricVal, { color: '#10b981' }]}>{completedTasksCount}</Text>
                            </View>

                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Pending Tasks</Text>
                                <Text style={[styles.metricVal, { color: '#f59e0b' }]}>{pendingTasksCount}</Text>
                            </View>

                            <View style={[styles.metricCard, { width: '100%' }]}>
                                <Text style={styles.metricLabel}>Projects In Progress</Text>
                                <Text style={[styles.metricVal, { color: '#0d9488' }]}>{projectsInProgressCount}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Create Workspace Modal */}
            <Modal visible={isCreateProjectOpen} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Create Workspace</Text>

                        <Text style={styles.modalLabel}>Workspace Name *</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Mobile Banking App"
                            placeholderTextColor="#94a3b8"
                            value={newProjName}
                            onChangeText={setNewProjName}
                        />

                        <Text style={styles.modalLabel}>Client Name (Auto-creates in Directory)</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Acme Corp"
                            placeholderTextColor="#94a3b8"
                            value={newProjClient}
                            onChangeText={setNewProjClient}
                        />

                        <Text style={styles.modalLabel}>Description</Text>
                        <TextInput
                            style={[styles.modalInput, { height: 50 }]}
                            placeholder="Workspace goals..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            value={newProjDesc}
                            onChangeText={setNewProjDesc}
                        />

                        <Text style={styles.modalLabel}>Status</Text>
                        <View style={styles.statusChipRow}>
                            {(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const).map(st => (
                                <TouchableOpacity
                                    key={st}
                                    style={[styles.statusChip, newProjStatus === st && styles.statusChipActive]}
                                    onPress={() => setNewProjStatus(st)}
                                >
                                    <Text style={[styles.statusChipText, newProjStatus === st && styles.statusChipTextActive]}>
                                        {st.replace('_', ' ')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalTwoCol}>
                            <View style={{ flex: 1, marginRight: 4 }}>
                                <Text style={styles.modalLabel}>Start Date</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#94a3b8"
                                    value={newProjStartDate}
                                    onChangeText={setNewProjStartDate}
                                />
                            </View>

                            <View style={{ flex: 1, marginLeft: 4 }}>
                                <Text style={styles.modalLabel}>End Date</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#94a3b8"
                                    value={newProjEndDate}
                                    onChangeText={setNewProjEndDate}
                                />
                            </View>
                        </View>

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setIsCreateProjectOpen(false)}>
                                <Text style={styles.cancelModalText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitModalBtn} onPress={handleCreateProject} disabled={creatingProj}>
                                {creatingProj ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitModalText}>Create</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Create Client Modal */}
            <Modal visible={isCreateClientOpen} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Add New Client</Text>

                        <Text style={styles.modalLabel}>Client Name *</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Jane Doe / Acme Inc."
                            placeholderTextColor="#94a3b8"
                            value={newClientName}
                            onChangeText={setNewClientName}
                        />

                        <Text style={styles.modalLabel}>Email Address</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="client@company.com"
                            placeholderTextColor="#94a3b8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={newClientEmail}
                            onChangeText={setNewClientEmail}
                        />

                        <View style={styles.modalTwoCol}>
                            <View style={{ flex: 1, marginRight: 4 }}>
                                <Text style={styles.modalLabel}>Phone</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="+1 555-0199"
                                    placeholderTextColor="#94a3b8"
                                    value={newClientPhone}
                                    onChangeText={setNewClientPhone}
                                />
                            </View>

                            <View style={{ flex: 1, marginLeft: 4 }}>
                                <Text style={styles.modalLabel}>Company</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Acme Corp"
                                    placeholderTextColor="#94a3b8"
                                    value={newClientCompany}
                                    onChangeText={setNewClientCompany}
                                />
                            </View>
                        </View>

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setIsCreateClientOpen(false)}>
                                <Text style={styles.cancelModalText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitModalBtn} onPress={handleCreateClient} disabled={creatingClient}>
                                {creatingClient ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitModalText}>Add Client</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Complete / Edit Client Modal */}
            {editingClient && (
                <Modal visible={true} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>Edit Client Details</Text>

                            <Text style={styles.modalLabel}>Client Name 🔒 (Locked from workspace)</Text>
                            <TextInput
                                style={[styles.modalInput, styles.lockedInput]}
                                editable={false}
                                value={editingClient.name}
                            />

                            <Text style={styles.modalLabel}>Email Address</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="client@company.com"
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={editClientEmail}
                                onChangeText={setEditClientEmail}
                            />

                            <View style={styles.modalTwoCol}>
                                <View style={{ flex: 1, marginRight: 4 }}>
                                    <Text style={styles.modalLabel}>Phone</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="+1 555-0199"
                                        placeholderTextColor="#94a3b8"
                                        value={editClientPhone}
                                        onChangeText={setEditClientPhone}
                                    />
                                </View>

                                <View style={{ flex: 1, marginLeft: 4 }}>
                                    <Text style={styles.modalLabel}>Company</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Acme Corp"
                                        placeholderTextColor="#94a3b8"
                                        value={editClientCompany}
                                        onChangeText={setEditClientCompany}
                                    />
                                </View>
                            </View>

                            <Text style={styles.modalLabel}>Status</Text>
                            <View style={styles.statusChipRow}>
                                {(['ACTIVE', 'PENDING', 'LEAD', 'INACTIVE'] as const).map(st => (
                                    <TouchableOpacity
                                        key={st}
                                        style={[styles.statusChip, editClientStatus === st && styles.statusChipActive]}
                                        onPress={() => setEditClientStatus(st)}
                                    >
                                        <Text style={[styles.statusChipText, editClientStatus === st && styles.statusChipTextActive]}>
                                            {st}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.modalBtnRow}>
                                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setEditingClient(null)}>
                                    <Text style={styles.cancelModalText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.submitModalBtn} onPress={handleUpdateClient} disabled={updatingClient}>
                                    {updatingClient ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitModalText}>Save Details</Text>}
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
        backgroundColor: '#f8fafc',
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    brandBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#0d9488',
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '900',
    },
    brandTitle: {
        fontSize: 15,
        fontWeight: '900',
        color: '#0f172a',
    },
    brandSubtitle: {
        fontSize: 9,
        fontWeight: '700',
        color: '#0f766e',
        textTransform: 'uppercase',
    },
    userProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ccfbf1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLetter: {
        color: '#0f766e',
        fontSize: 14,
        fontWeight: '900',
    },
    logoutBtn: {
        backgroundColor: '#ffe4e6',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    logoutBtnText: {
        color: '#e11d48',
        fontSize: 11,
        fontWeight: '800',
    },
    tabNavBar: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingHorizontal: 8,
    },
    navTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    navTabActive: {
        borderBottomColor: '#0d9488',
    },
    navTabText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
    },
    navTabTextActive: {
        color: '#0d9488',
        fontWeight: '900',
    },
    mainContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionHeaderTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
    },
    sectionHeaderSub: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
    },
    primaryBtn: {
        backgroundColor: '#0d9488',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    primaryBtnText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '800',
    },
    searchInput: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 13,
        color: '#0f172a',
        marginBottom: 10,
    },
    filterChipScroll: {
        flexDirection: 'row',
        marginBottom: 14,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: '#e2e8f0',
        marginRight: 6,
    },
    filterChipActive: {
        backgroundColor: '#0f172a',
    },
    filterChipText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
    },
    filterChipTextActive: {
        color: '#ffffff',
    },
    cardItem: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 2,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '900',
        color: '#0f172a',
        flex: 1,
    },
    clientBadgeContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#ccfbf1',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginTop: 4,
    },
    clientBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#0f766e',
    },
    cardDesc: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 6,
    },
    cardFooterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    cardTaskCount: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94a3b8',
    },
    cardRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    deleteLinkText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#e11d48',
    },
    openBoardText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0d9488',
    },
    clientAvatarBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#0d9488',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clientAvatarText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '900',
    },
    clientCompanyText: {
        fontSize: 11,
        color: '#0f766e',
        fontWeight: '700',
    },
    clientDetailsBox: {
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        padding: 8,
        marginTop: 8,
        gap: 4,
    },
    clientDetailRow: {
        fontSize: 12,
        color: '#334155',
        fontWeight: '600',
    },
    pendingText: {
        color: '#d97706',
        fontWeight: '700',
    },
    statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    pillSuccess: { backgroundColor: '#d1fae5' },
    pillProgress: { backgroundColor: '#ccfbf1' },
    pillPending: { backgroundColor: '#fef3c7' },
    pillLead: { backgroundColor: '#e0f2fe' },
    pillDefault: { backgroundColor: '#f1f5f9' },
    pillText: { fontSize: 9, fontWeight: '900', color: '#0f172a' },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 12,
    },
    metricCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    metricLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    metricVal: {
        fontSize: 22,
        fontWeight: '900',
        marginTop: 4,
    },
    emptyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
        marginTop: 20,
    },
    emptyCardTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0f172a',
    },
    emptyCardSub: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 4,
    },
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
        marginBottom: 14,
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
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 13,
        color: '#0f172a',
        marginBottom: 10,
    },
    lockedInput: {
        backgroundColor: '#e2e8f0',
        color: '#64748b',
    },
    modalTwoCol: {
        flexDirection: 'row',
    },
    statusChipRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 12,
    },
    statusChip: {
        flex: 1,
        paddingVertical: 6,
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    statusChipActive: {
        backgroundColor: '#0d9488',
    },
    statusChipText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#64748b',
    },
    statusChipTextActive: {
        color: '#ffffff',
    },
    modalBtnRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
    },
    cancelModalBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        alignItems: 'center',
    },
    cancelModalText: {
        color: '#475569',
        fontSize: 13,
        fontWeight: '800',
    },
    submitModalBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#0d9488',
        alignItems: 'center',
    },
    submitModalText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '800',
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
    pushNotificationBanner: {
        backgroundColor: '#f0fdf4',
        borderColor: '#86efac',
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 12,
    },
    pushNotificationTitle: {
        color: '#166534',
        fontSize: 12,
        fontWeight: '800',
    },
    pushNotificationBody: {
        color: '#15803d',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
});
