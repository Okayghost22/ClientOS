import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const DashboardScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [dashRes, projRes] = await Promise.all([
                api.get('/dashboard').catch(() => null),
                api.get('/projects').catch(() => ({ data: [] }))
            ]);

            if (dashRes?.data?.dashboard) {
                setDashboardData(dashRes.data.dashboard);
            }
            const projList = Array.isArray(projRes.data) ? projRes.data : (projRes.data?.projects || []);
            setProjects(projList);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
                }
            >
                {/* Header Profile Bar */}
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
                        </View>
                        <View>
                            <Text style={styles.greeting}>Welcome back 👋</Text>
                            <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Dashboard Overview</Text>

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 32 }} />
                ) : (
                    <>
                        {/* 5 Metrics Cards Grid */}
                        <View style={styles.metricsGrid}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Total Projects</Text>
                                <Text style={[styles.metricValue, { color: '#0f172a' }]}>
                                    {dashboardData?.totalProjects ?? projects.length}
                                </Text>
                            </View>

                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Total Tasks</Text>
                                <Text style={[styles.metricValue, { color: '#0f172a' }]}>
                                    {dashboardData?.totalTasks ?? 0}
                                </Text>
                            </View>

                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Completed Tasks</Text>
                                <Text style={[styles.metricValue, { color: '#059669' }]}>
                                    {dashboardData?.completedTasks ?? 0}
                                </Text>
                            </View>

                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Pending Tasks</Text>
                                <Text style={[styles.metricValue, { color: '#d97706' }]}>
                                    {dashboardData?.pendingTasks ?? 0}
                                </Text>
                            </View>

                            <View style={[styles.metricCard, { width: '100%' }]}>
                                <Text style={styles.metricLabel}>Projects In Progress</Text>
                                <Text style={[styles.metricValue, { color: '#0d9488' }]}>
                                    {dashboardData?.projectsInProgress ?? 0}
                                </Text>
                            </View>
                        </View>

                        {/* Workspaces Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Project Workspaces</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
                                <Text style={styles.viewAllText}>View All ({projects.length})</Text>
                            </TouchableOpacity>
                        </View>

                        {projects.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyText}>No workspaces created yet.</Text>
                            </View>
                        ) : (
                            projects.slice(0, 4).map((project) => (
                                <TouchableOpacity
                                    key={project.id}
                                    style={styles.projectCard}
                                    onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id, projectName: project.name })}
                                >
                                    <View style={styles.projectHeader}>
                                        <Text style={styles.projectName}>{project.name}</Text>
                                        <View style={[
                                            styles.statusBadge,
                                            project.status === 'COMPLETED' ? styles.badgeSuccess :
                                            project.status === 'IN_PROGRESS' ? styles.badgeProgress : styles.badgeDefault
                                        ]}>
                                            <Text style={styles.statusText}>
                                                {project.status ? project.status.replace('_', ' ') : 'NOT STARTED'}
                                            </Text>
                                        </View>
                                    </View>
                                    {project.clientName ? (
                                        <Text style={styles.clientTag}>Client: {project.clientName}</Text>
                                    ) : null}
                                    {project.description ? (
                                        <Text style={styles.projectDesc} numberOfLines={2}>{project.description}</Text>
                                    ) : null}
                                    <View style={styles.projectFooter}>
                                        <Text style={styles.taskCountText}>
                                            {project.tasks?.length || 0} Tasks
                                        </Text>
                                        <Text style={styles.openBoardText}>Open Board →</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </>
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
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#0d9488',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '900',
    },
    greeting: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
    },
    userName: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0f172a',
    },
    logoutButton: {
        backgroundColor: '#ffe4e6',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    logoutText: {
        color: '#e11d48',
        fontSize: 12,
        fontWeight: '800',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 12,
    },
    viewAllText: {
        color: '#0d9488',
        fontSize: 13,
        fontWeight: '800',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    metricCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#0f766e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    metricLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metricValue: {
        fontSize: 22,
        fontWeight: '900',
        marginTop: 6,
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
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
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
        marginBottom: 10,
    },
    projectFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    taskCountText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94a3b8',
    },
    openBoardText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0d9488',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    badgeSuccess: {
        backgroundColor: '#ecfdf5',
    },
    badgeProgress: {
        backgroundColor: '#ccfbf1',
    },
    badgeDefault: {
        backgroundColor: '#f1f5f9',
    },
    statusText: {
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
