'use client';
import { useState } from 'react';
import { useToast } from '@/components/Toast';
import styles from './miscitas.module.css';

export default function MisCitasPage() {
    const { addToast } = useToast();
    const [phone, setPhone] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            addToast('Ingresa un teléfono válido (al menos 10 dígitos)', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/appointments?phone=${cleanPhone}`);
            const data = await res.json();
            setAppointments(data.appointments || []);
            setSearched(true);
            if ((data.appointments || []).length === 0) {
                addToast('No se encontraron citas con este teléfono', 'warning');
            }
        } catch {
            addToast('Error buscando citas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const statusConfig = {
        confirmed: { label: 'Confirmada', class: 'badge-success', icon: '✅' },
        pending: { label: 'Pendiente', class: 'badge-warning', icon: '⏳' },
        completed: { label: 'Completada', class: 'badge-info', icon: '✨' },
        cancelled: { label: 'Cancelada', class: 'badge-error', icon: '❌' },
        no_show: { label: 'No asistió', class: 'badge-error', icon: '⚠️' },
    };

    const handleCancel = async (appointmentId) => {
        if (!window.confirm('¿Estás segura de cancelar esta cita?')) return;
        try {
            const res = await fetch('/api/appointments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId, status: 'cancelled' }),
            });
            if (res.ok) {
                setAppointments((prev) =>
                    prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelled' } : a))
                );
                addToast('Cita cancelada', 'success');
            }
        } catch {
            addToast('Error cancelando cita', 'error');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.glow}></div>
            <div className={`container ${styles.content}`}>
                <div className={styles.header}>
                    <h1 className="heading-lg">
                        Mis <span className="text-gradient">Citas</span>
                    </h1>
                    <p className="text-muted">Consulta y gestiona tus citas agendadas</p>
                </div>

                {/* Search */}
                <div className={`glass-card ${styles.searchCard}`}>
                    <div className={styles.searchInner}>
                        <div className={styles.searchIcon}>📱</div>
                        <input
                            type="tel"
                            className={`input-field ${styles.searchInput}`}
                            placeholder="Ingresa tu número de teléfono..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? '⏳' : '🔍'} Buscar
                        </button>
                    </div>
                </div>

                {/* Results */}
                {searched && (
                    <div className={styles.results}>
                        {appointments.length === 0 ? (
                            <div className={styles.empty}>
                                <span className={styles.emptyIcon}>📭</span>
                                <h3>No se encontraron citas</h3>
                                <p className="text-muted">Verifica tu número de teléfono o agenda una nueva cita</p>
                            </div>
                        ) : (
                            <div className={styles.appointmentsList}>
                                {appointments.map((appt) => {
                                    const config = statusConfig[appt.status] || statusConfig.pending;
                                    const isPast = new Date(appt.appointment_date) < new Date(new Date().toDateString());
                                    return (
                                        <div key={appt.id} className={`glass-card ${styles.apptCard} ${isPast ? styles.apptPast : ''}`}>
                                            <div className={styles.apptHeader}>
                                                <div className={styles.apptDate}>
                                                    <span className={styles.apptDay}>
                                                        {new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric' })}
                                                    </span>
                                                    <span className={styles.apptMonth}>
                                                        {new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' })}
                                                    </span>
                                                </div>
                                                <div className={styles.apptInfo}>
                                                    <h3>{appt.service_name}</h3>
                                                    <p>
                                                        ⏰ {appt.appointment_time} · {appt.price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                                    </p>
                                                </div>
                                                <span className={`badge ${config.class}`}>
                                                    {config.icon} {config.label}
                                                </span>
                                            </div>
                                            {appt.status === 'confirmed' && !isPast && (
                                                <div className={styles.apptActions}>
                                                    <button
                                                        className="btn btn-ghost"
                                                        style={{ color: 'var(--error)' }}
                                                        onClick={() => handleCancel(appt.id)}
                                                    >
                                                        ❌ Cancelar cita
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
