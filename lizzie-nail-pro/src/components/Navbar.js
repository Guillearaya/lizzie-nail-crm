'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = [
        { href: '/', label: 'Inicio', icon: '✨' },
        { href: '/agendar', label: 'Agendar', icon: '📅' },
        { href: '/mis-citas', label: 'Mis Citas', icon: '💫' },
        { href: '/admin', label: 'Admin', icon: '⚙️' },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-inner">
                <Link href="/" className="navbar-brand">
                    <div className="navbar-brand-icon">
                        <img
                            src="/logo.png"
                            alt="Lizzie Nail"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                        />
                        <span style={{ display: 'none' }}>💅</span>
                    </div>
                    Lizzie Nail
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? '✕' : '☰'}
                </button>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            <span>{link.icon}</span> {link.label}
                        </Link>
                    ))}
                    <Link href="/agendar" className="btn btn-primary" style={{ marginLeft: '0.5rem' }}>
                        Reservar Ahora
                    </Link>
                </div>
            </div>
        </nav>
    );
}
