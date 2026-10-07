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
    SafeAreaView
} from 'react-native';
import api from '../api/axios';

export const ProjectsScreen = ({ navigation }: any) => {
    const [projects, setProjects] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProjects = useCallback(async () => {
        try {
            const res = await api.get('/projects');
            const projectList = Array.isArray(res.data) ? res.data : (res.data?.projects || []);
            setProjects(projectList);
        } catch (err) {
            console.error('Failed to fetch projects', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProjects();
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter || (!p.status && statusFilter === 'NOT_STARTED');
        return matchesSearch && matchesStatus;
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>All Workspaces</Text>
                <Text style={styles.headerSubtitle}>Select a project to view tasks & Kanban board</Text>

                {/* Search Bar */}
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search workspaces or client name..."
                    placeholderTextColor="#94a3b8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                {/* Status Filter Buttons */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    {(['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const).map(st => (
                        <TouchableOpacity
                            key={st}
                            style={[
                                styles.filterBadge,
                                statusFilter === st && styles.filterBadgeActive
                            ]}
                            onPress={() => setStatusFilter(st)}
                        >
                            <Text style={[
                                styles.filterText,
                                statusFilter === st && styles.filterTextActive
                            ]}>
                                {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
                }
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 32 }} />
                ) : filteredProjects.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>
                            {searchQuery || statusFilter !== 'ALL'
                                ? 'No workspaces match your filter.'
                                : 'No workspaces available.'}
                        </Text>
                    </View>
                ) : (
                    filteredProjects.map((project) => (
                        <TouchableOpacity
                            key={project.id}
                            style={styles.projectCard}
                            onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id, projectName: project.name })}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.projectName}>{project.name}</Text>
                                <View style={[
                                    styles.statusBadge,
                                    project.status === 'COMPLETED' ? styles.badgeSuccess :
                                    project.status === 'IN_PROGRESS' ? styles.badgeProgress : styles.badgeDefault
                                ]}>
                                    <Text style={styles.statusBadgeText}>
                                        {project.status ? project.status.replace('_', ' ') : 'NOT STARTED'}
                                    </Text>
                                </View>
                            </View>

                            {project.clientName ? (
                                <Text style={styles.clientTag}>Client: {project.clientName}</Text>
                            ) : null}

                            {project.description ? (
                                <Text style={styles.projectDesc}>{project.description}</Text>
                            ) : null}

                            <View style={styles.cardFooter}>
                                <Text style={styles.taskCount}>
                                    {project.tasks?.length || 0} Tasks
                                </Text>
                                <Text style={styles.openText}>Open Board →</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ecfeff',
    },
    header: {
        padding: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
        marginBottom: 12,
    },
    searchInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 13,
        color: '#0f172a',
        marginBottom: 12,
    },
    filterRow: {
        flexDirection: 'row',
    },
    filterBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
    },
    filterBadgeActive: {
        backgroundColor: '#0d9488',
    },
    filterText: {
        fontSize: 11,
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
        padding: 20,
    },
    projectCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    projectName: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0f172a',
        flex: 1,
    },
    clientTag: {
        fontSize: 11,
        fontWeight: '700',
        color: '#0f766e',
        marginBottom: 4,
    },
    projectDesc: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    taskCount: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94a3b8',
    },
    openText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0d9488',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    badgeSuccess: {
        backgroundColor: '#d1fae5',
    },
    badgeProgress: {
        backgroundColor: '#ccfbf1',
    },
    badgeDefault: {
        backgroundColor: '#f1f5f9',
    },
    statusBadgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#0f172a',
        textTransform: 'uppercase',
    },
    emptyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
    },
});
