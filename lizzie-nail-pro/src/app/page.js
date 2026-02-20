'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => setServices(data.services || []))
      .catch(() => { });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: `${(e.clientX / window.innerWidth) * 100}%`,
        y: `${(e.clientY / window.innerHeight) * 100}%`,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const categoryIcons = {
    manicure: '💅',
    pedicure: '🦶',
    nail_art: '🎨',
    general: '✨',
  };

  return (
    <>
      {/* ═══ HERO SECTION ═══ */}
      <section
        className={styles.hero}
        style={{ '--mouse-x': mousePos.x, '--mouse-y': mousePos.y }}
      >
        <div className={styles.heroGlow}></div>
        <div className={styles.heroOrbs}>
          <div className={styles.orb1}></div>
          <div className={styles.orb2}></div>
          <div className={styles.orb3}></div>
        </div>

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            Reservas abiertas
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLine1}>El arte</span>
            <span className={styles.heroTitleLine2}>en cada</span>
            <span className={styles.heroTitleAccent}>detalle</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Transforma tus uñas en obras de arte. Diseños exclusivos,
            materiales premium y atención personalizada en cada visita.
          </p>

          <div className={styles.heroCTA}>
            <Link href="/agendar" className="btn btn-primary btn-lg">
              📅 Reservar mi Cita
            </Link>
            <Link href="#servicios" className="btn btn-secondary btn-lg">
              Ver Servicios
            </Link>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>500+</span>
              <span className={styles.heroStatLabel}>Clientas felices</span>
            </div>
            <div className={styles.heroDivider}></div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>4.9★</span>
              <span className={styles.heroStatLabel}>Calificación</span>
            </div>
            <div className={styles.heroDivider}></div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>3+</span>
              <span className={styles.heroStatLabel}>Años de experiencia</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES SECTION ═══ */}
      <section id="servicios" className={`section ${styles.servicesSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Nuestros servicios</span>
            <h2 className="heading-lg">
              Servicios <span className="text-gradient">Premium</span>
            </h2>
            <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto' }}>
              Cada servicio es personalizado para que tus uñas reflejen tu estilo único
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {services.map((service, idx) => (
              <div
                key={service.id}
                className={`glass-card ${styles.serviceCard}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={styles.serviceIcon}>
                  {categoryIcons[service.category] || '✨'}
                </div>
                <h3 className={styles.serviceName}>{service.name}</h3>
                <p className={styles.serviceDesc}>{service.description}</p>
                <div className={styles.serviceFooter}>
                  <span className={styles.servicePrice}>
                    {service.price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                  </span>
                  <span className={styles.serviceDuration}>
                    ⏱ {service.duration_minutes} min
                  </span>
                </div>
                <Link href="/agendar" className={`btn btn-secondary btn-full ${styles.serviceBtn}`}>
                  Reservar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY US SECTION ═══ */}
      <section className={`section ${styles.whySection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>¿Por qué elegirnos?</span>
            <h2 className="heading-lg">
              Una experiencia <span className="text-gradient">única</span>
            </h2>
          </div>

          <div className={styles.whyGrid}>
            {[
              {
                icon: '💎',
                title: 'Materiales Premium',
                desc: 'Trabajamos solo con las mejores marcas para garantizar durabilidad y brillo.',
              },
              {
                icon: '🎨',
                title: 'Diseños Exclusivos',
                desc: 'Cada diseño es único y personalizado según tu estilo y preferencias.',
              },
              {
                icon: '🕐',
                title: 'Puntualidad',
                desc: 'Respetamos tu tiempo. Sistema de citas organizado sin esperas innecesarias.',
              },
              {
                icon: '💖',
                title: 'Atención Personalizada',
                desc: 'Te acompañamos en cada paso para que la experiencia sea perfecta.',
              },
            ].map((item, idx) => (
              <div key={idx} className={`glass-card ${styles.whyCard}`}>
                <div className={styles.whyIcon}>{item.icon}</div>
                <h3 className="heading-sm">{item.title}</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className={styles.ctaContent}>
            <h2 className="heading-lg" style={{ color: 'white' }}>
              ¿Lista para lucir <span className="text-gradient">increíble</span>?
            </h2>
            <p style={{ color: 'var(--neutral-300)', maxWidth: '450px', margin: '0 auto' }}>
              Reserva tu próxima cita y déjanos crear algo hermoso para ti
            </p>
            <Link href="/agendar" className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-lg)' }}>
              💅 Agendar mi Cita Ahora
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
