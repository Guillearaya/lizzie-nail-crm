'use client';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.type}`} onClick={() => removeToast(toast.id)}>
                        <span style={{ fontSize: '1.2rem' }}>
                            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : '⚠️'}
                        </span>
                        <span style={{ flex: 1, fontSize: '0.9rem' }}>{toast.message}</span>
                        <button style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }} onClick={() => removeToast(toast.id)}>✕</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
