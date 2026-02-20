'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import styles from './admin.module.css';

export default function AdminPage() {
    const { addToast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginLoading, setLoginLoading] = useState(false);

    const [dashboardData, setDashboardData] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleLogin = async () => {
        setLoginLoading(true);
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm),
            });
            const data = await res.json();

            if (res.ok) {
                setIsAuthenticated(true);
                addToast('✅ Bienvenida, acceso concedido', 'success');
                loadDashboard();
                loadAppointments();
            } else {
                addToast(data.error || 'Credenciales inválidas', 'error');
            }
        } catch {
            addToast('Error de conexión', 'error');
        } finally {
            setLoginLoading(false);
        }
    };

    const loadDashboard = async () => {
        try {
            const res = await fetch('/api/admin/dashboard');
            const data = await res.json();
            setDashboardData(data);
        } catch {
            addToast('Error cargando dashboard', 'error');
        }
    };

    const loadAppointments = async (date) => {
        try {
            const url = date ? `/api/appointments?date=${date}` : '/api/appointments';
            const res = await fetch(url);
            const data = await res.json();
            setAppointments(data.appointments || []);
        } catch {
            addToast('Error cargando citas', 'error');
        }
    };

    const handleStatusChange = async (appointmentId, status) => {
        try {
            const res = await fetch('/api/appointments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId, status }),
            });
            if (res.ok) {
                setAppointments((prev) =>
                    prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
                );
                addToast('Estado actualizado', 'success');
                loadDashboard();
            }
        } catch {
            addToast('Error actualizando estado', 'error');
        }
    };

    useEffect(() => {
        if (filterDate) {
            loadAppointments(filterDate);
        }
    }, [filterDate]);

    const statusConfig = {
        confirmed: { label: 'Confirmada', class: 'badge-success', icon: '✅' },
        pending: { label: 'Pendiente', class: 'badge-warning', icon: '⏳' },
        completed: { label: 'Completada', class: 'badge-info', icon: '✨' },
        cancelled: { label: 'Cancelada', class: 'badge-error', icon: '❌' },
        no_show: { label: 'No asistió', class: 'badge-error', icon: '⚠️' },
    };

    // ═══ LOGIN SCREEN ═══
    if (!isAuthenticated) {
        return (
            <div className={styles.loginPage}>
                <div className={styles.loginGlow}></div>
                <div className={`glass-card ${styles.loginCard}`}>
                    <div className={styles.loginIcon}>🔐</div>
                    <h1 className="heading-md">Panel Administrativo</h1>
                    <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>
                        Ingresa tus credenciales para acceder
                    </p>

                    <div className={styles.loginForm}>
                        <div className="input-group">
                            <label className="input-label">Usuario</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="admin"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Contraseña</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        <button
                            className="btn btn-primary btn-full btn-lg"
                            onClick={handleLogin}
                            disabled={loginLoading}
                        >
                            {loginLoading ? '⏳ Verificando...' : '🔓 Ingresar'}
                        </button>
                    </div>

                    <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 'var(--space-lg)' }}>
                        Credenciales por defecto: admin / admin123
                    </p>
                </div>
            </div>
        );
    }

    // ═══ DASHBOARD ═══
    return (
        <div className={styles.page}>
            <div className={styles.glow}></div>
            <div className={`container ${styles.content}`}>
                <div className={styles.adminHeader}>
                    <div>
                        <h1 className="heading-lg">
                            Panel <span className="text-gradient">Admin</span>
                        </h1>
                        <p className="text-muted">Gestiona tu negocio desde aquí</p>
                    </div>
                    <button
                        className="btn btn-ghost"
                        onClick={() => {
                            setIsAuthenticated(false);
                            addToast('Sesión cerrada', 'success');
                        }}
                    >
                        🚪 Cerrar Sesión
                    </button>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    {[
                        { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
                        { id: 'appointments', label: '📅 Citas', icon: '📅' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && dashboardData && (
                    <div className={styles.dashboard}>
                        {/* Stats Grid */}
                        <div className={styles.statsGrid}>
                            {[
                                { label: 'Citas Hoy', value: dashboardData.stats.todayAppointments, icon: '📅', color: 'var(--rose-gold-light)' },
                                { label: 'Esta Semana', value: dashboardData.stats.weekAppointments, icon: '📆', color: 'var(--plum-300)' },
                                { label: 'Total Clientas', value: dashboardData.stats.totalClients, icon: '👥', color: 'var(--success)' },
                                { label: 'Ingresos del Mes', value: dashboardData.stats.monthRevenue.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }), icon: '💰', color: 'var(--warning)' },
                            ].map((stat, idx) => (
                                <div key={idx} className={`glass-card ${styles.statCard}`}>
                                    <div className={styles.statIcon}>{stat.icon}</div>
                                    <div className={styles.statValue} style={{ color: stat.color }}>{stat.value}</div>
                                    <div className={styles.statLabel}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Upcoming Appointments */}
                        <div className={`glass-card ${styles.upcomingSection}`}>
                            <h3 className="heading-sm" style={{ marginBottom: 'var(--space-lg)' }}>
                                📋 Próximas Citas
                            </h3>
                            {dashboardData.upcomingAppointments.length === 0 ? (
                                <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                                    No hay citas próximas
                                </p>
                            ) : (
                                <div className={styles.upcomingList}>
                                    {dashboardData.upcomingAppointments.map((appt) => (
                                        <div key={appt.id} className={styles.upcomingItem}>
                                            <div className={styles.upcomingDate}>
                                                <span className={styles.upcomingDay}>
                                                    {new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric' })}
                                                </span>
                                                <span className={styles.upcomingMonth}>
                                                    {new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' })}
                                                </span>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{appt.full_name}</div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                    {appt.service_name} · {appt.appointment_time} · {appt.price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                                </div>
                                            </div>
                                            <span className={`badge ${statusConfig[appt.status]?.class || 'badge-info'}`}>
                                                {statusConfig[appt.status]?.label || appt.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Popular Services */}
                        <div className={`glass-card ${styles.popularSection}`}>
                            <h3 className="heading-sm" style={{ marginBottom: 'var(--space-lg)' }}>
                                🔥 Servicios Populares
                            </h3>
                            <div className={styles.popularList}>
                                {dashboardData.popularServices.map((svc, idx) => (
                                    <div key={idx} className={styles.popularItem}>
                                        <span className={styles.popularRank}>#{idx + 1}</span>
                                        <span style={{ flex: 1, fontWeight: 500 }}>{svc.name}</span>
                                        <span className="text-muted">{svc.bookings} reservas</span>
                                        <span style={{ color: 'var(--rose-gold-light)', fontWeight: 600 }}>
                                            {svc.price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Appointments Tab */}
                {activeTab === 'appointments' && (
                    <div className={styles.appointmentsTab}>
                        <div className={styles.filterBar}>
                            <input
                                type="date"
                                className="input-field"
                                style={{ maxWidth: '220px', colorScheme: 'dark' }}
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                            <button className="btn btn-secondary" onClick={() => { setFilterDate(''); loadAppointments(); }}>
                                Ver todas
                            </button>
                        </div>

                        <div className={styles.appointmentsList}>
                            {appointments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
                                    No hay citas {filterDate ? 'para esta fecha' : 'próximas'}
                                </div>
                            ) : appointments.map((appt) => (
                                <div key={appt.id} className={`glass-card ${styles.apptRow}`}>
                                    <div className={styles.apptRowDate}>
                                        <span className={styles.apptRowDay}>
                                            {new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <span className={styles.apptRowTime}>{appt.appointment_time}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>{appt.full_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {appt.service_name} · 📱 {appt.phone}
                                        </div>
                                    </div>
                                    <span className={`badge ${statusConfig[appt.status]?.class || 'badge-info'}`}>
                                        {statusConfig[appt.status]?.label || appt.status}
                                    </span>
                                    <select
                                        className={styles.statusSelect}
                                        value={appt.status}
                                        onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                                    >
                                        <option value="confirmed">✅ Confirmada</option>
                                        <option value="completed">✨ Completada</option>
                                        <option value="cancelled">❌ Cancelada</option>
                                        <option value="no_show">⚠️ No asistió</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
