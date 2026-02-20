'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import styles from './agendar.module.css';

export default function AgendarPage() {
    const { addToast } = useToast();
    const [step, setStep] = useState(1);
    const [services, setServices] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        serviceId: null,
        date: '',
        time: '',
        notes: '',
    });

    // Fetch services
    useEffect(() => {
        fetch('/api/services')
            .then((r) => r.json())
            .then((data) => setServices(data.services || []))
            .catch(() => addToast('Error cargando servicios', 'error'));
    }, []);

    // Fetch available slots when date changes
    useEffect(() => {
        if (!form.date) return;
        setLoading(true);
        fetch(`/api/appointments/slots?date=${form.date}`)
            .then((r) => r.json())
            .then((data) => {
                setSlots(data.slots || []);
                setForm((prev) => ({ ...prev, time: '' }));
            })
            .catch(() => addToast('Error cargando horarios', 'error'))
            .finally(() => setLoading(false));
    }, [form.date]);

    const selectedService = services.find((s) => s.id === form.serviceId);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (res.ok) {
                addToast('🎉 ¡Cita confirmada exitosamente!', 'success');
                setStep(4); // Success step
            } else {
                addToast(data.error || 'Error al crear la cita', 'error');
            }
        } catch {
            addToast('Error de conexión', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const canAdvance = () => {
        switch (step) {
            case 1: return form.serviceId !== null;
            case 2: return form.date && form.time;
            case 3: return form.fullName && form.phone.replace(/\D/g, '').length >= 10;
            default: return false;
        }
    };

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const categoryIcons = {
        manicure: '💅',
        pedicure: '🦶',
        nail_art: '🎨',
        general: '✨',
    };

    return (
        <div className={styles.page}>
            <div className={styles.glow}></div>

            <div className={`container ${styles.content}`}>
                <div className={styles.header}>
                    <h1 className="heading-lg">
                        Reserva tu <span className="text-gradient">cita</span>
                    </h1>
                    <p className="text-muted">Elige tu servicio, fecha y hora preferida</p>
                </div>

                {/* Progress Steps */}
                {step < 4 && (
                    <div className={styles.progress}>
                        {[
                            { num: 1, label: 'Servicio' },
                            { num: 2, label: 'Fecha y Hora' },
                            { num: 3, label: 'Tus Datos' },
                        ].map((s) => (
                            <div key={s.num} className={`${styles.progressStep} ${step >= s.num ? styles.progressStepActive : ''} ${step === s.num ? styles.progressStepCurrent : ''}`}>
                                <div className={styles.progressNum}>{step > s.num ? '✓' : s.num}</div>
                                <span className={styles.progressLabel}>{s.label}</span>
                            </div>
                        ))}
                        <div className={styles.progressLine}>
                            <div className={styles.progressLineFill} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                        </div>
                    </div>
                )}

                {/* Step 1: Select Service */}
                {step === 1 && (
                    <div className={styles.stepContent}>
                        <h2 className="heading-md" style={{ marginBottom: 'var(--space-lg)' }}>
                            ¿Qué servicio te gustaría?
                        </h2>
                        <div className={styles.servicesGrid}>
                            {services.map((service) => (
                                <button
                                    key={service.id}
                                    className={`glass-card ${styles.serviceOption} ${form.serviceId === service.id ? styles.serviceOptionSelected : ''}`}
                                    onClick={() => setForm({ ...form, serviceId: service.id })}
                                >
                                    <div className={styles.serviceOptionIcon}>
                                        {categoryIcons[service.category] || '✨'}
                                    </div>
                                    <div className={styles.serviceOptionInfo}>
                                        <h3>{service.name}</h3>
                                        <p>{service.description}</p>
                                    </div>
                                    <div className={styles.serviceOptionMeta}>
                                        <span className={styles.serviceOptionPrice}>
                                            {service.price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                        </span>
                                        <span className={styles.serviceOptionDuration}>⏱ {service.duration_minutes} min</span>
                                    </div>
                                    {form.serviceId === service.id && (
                                        <div className={styles.selectedCheck}>✓</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Date & Time */}
                {step === 2 && (
                    <div className={styles.stepContent}>
                        <h2 className="heading-md" style={{ marginBottom: 'var(--space-lg)' }}>
                            Elige fecha y hora
                        </h2>

                        <div className={styles.dateTimeGrid}>
                            <div className={styles.dateSection}>
                                <label className="input-label">📅 Selecciona la fecha</label>
                                <input
                                    type="date"
                                    className={`input-field ${styles.dateInput}`}
                                    min={today}
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                />
                            </div>

                            <div className={styles.timeSection}>
                                <label className="input-label">⏰ Horarios disponibles</label>
                                {!form.date ? (
                                    <p className="text-muted" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                                        Primero selecciona una fecha
                                    </p>
                                ) : loading ? (
                                    <div className={styles.loadingSlots}>
                                        <div className={styles.spinner}></div>
                                        Cargando horarios...
                                    </div>
                                ) : (
                                    <div className={styles.slotsGrid}>
                                        {slots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                className={`${styles.slotBtn} ${!slot.available ? styles.slotUnavailable : ''} ${form.time === slot.time ? styles.slotSelected : ''}`}
                                                disabled={!slot.available}
                                                onClick={() => setForm({ ...form, time: slot.time })}
                                            >
                                                {slot.time}
                                                {!slot.available && <span className={styles.slotX}>✕</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Personal Info */}
                {step === 3 && (
                    <div className={styles.stepContent}>
                        <h2 className="heading-md" style={{ marginBottom: 'var(--space-lg)' }}>
                            Tus datos de contacto
                        </h2>

                        <div className={styles.formGrid}>
                            <div className="input-group">
                                <label className="input-label">👤 Nombre completo *</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Ej: María García"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">📱 Teléfono (WhatsApp) *</label>
                                <input
                                    type="tel"
                                    className="input-field"
                                    placeholder="Ej: +54 9 11 1234-5678"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">📧 Email (opcional)</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="tu@email.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">📝 Notas (opcional)</label>
                                <textarea
                                    className="input-field"
                                    rows="3"
                                    placeholder="¿Algún diseño en mente? ¿Alergia a algún producto?"
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        {/* Summary Card */}
                        <div className={`glass-card ${styles.summaryCard}`}>
                            <h3 className="heading-sm" style={{ marginBottom: 'var(--space-md)' }}>📋 Resumen de tu cita</h3>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Servicio</span>
                                    <span className={styles.summaryValue}>{selectedService?.name}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Precio</span>
                                    <span className={styles.summaryValue} style={{ color: 'var(--rose-gold-light)' }}>
                                        {selectedService?.price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                    </span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Fecha</span>
                                    <span className={styles.summaryValue}>
                                        {form.date ? new Date(form.date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) : '-'}
                                    </span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Hora</span>
                                    <span className={styles.summaryValue}>{form.time || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className={styles.successContent}>
                        <div className={styles.successIcon}>🎉</div>
                        <h2 className="heading-lg">¡Cita Confirmada!</h2>
                        <p className="text-muted" style={{ maxWidth: '400px', textAlign: 'center' }}>
                            Tu cita ha sido agendada exitosamente. Te esperamos con mucho gusto.
                        </p>
                        <div className={`glass-card ${styles.summaryCard}`} style={{ width: '100%', maxWidth: '400px' }}>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Servicio</span>
                                    <span className={styles.summaryValue}>{selectedService?.name}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Fecha</span>
                                    <span className={styles.summaryValue}>
                                        {form.date ? new Date(form.date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) : '-'}
                                    </span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Hora</span>
                                    <span className={styles.summaryValue}>{form.time}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => {
                                setStep(1);
                                setForm({ fullName: '', phone: '', email: '', serviceId: null, date: '', time: '', notes: '' });
                            }}
                        >
                            Agendar otra cita
                        </button>
                    </div>
                )}

                {/* Navigation */}
                {step < 4 && (
                    <div className={styles.navigation}>
                        {step > 1 && (
                            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                                ← Anterior
                            </button>
                        )}
                        <div style={{ flex: 1 }}></div>
                        {step < 3 ? (
                            <button
                                className="btn btn-primary"
                                disabled={!canAdvance()}
                                onClick={() => setStep(step + 1)}
                                style={{ opacity: canAdvance() ? 1 : 0.5, pointerEvents: canAdvance() ? 'auto' : 'none' }}
                            >
                                Siguiente →
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary btn-lg"
                                disabled={!canAdvance() || submitting}
                                onClick={handleSubmit}
                                style={{ opacity: canAdvance() && !submitting ? 1 : 0.5, pointerEvents: canAdvance() && !submitting ? 'auto' : 'none' }}
                            >
                                {submitting ? '⏳ Confirmando...' : '✅ Confirmar Cita'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
