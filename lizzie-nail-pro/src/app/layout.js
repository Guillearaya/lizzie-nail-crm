import './globals.css';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'Lizzie Nail Studio | Arte en cada detalle',
  description: 'Reserva tu cita de uñas con Lizzie Nail Studio. Servicios de manicure, pedicure, acrílicas y nail art con los mejores diseños y atención personalizada.',
  keywords: 'uñas, manicure, pedicure, nail art, acrílicas, esmalte permanente, salón de belleza',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body>
        <ToastProvider>
          <Navbar />
          <main style={{ paddingTop: '80px' }}>
            {children}
          </main>
          <footer style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: 'var(--space-2xl) 0',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}>
            <div className="container">
              <p style={{ marginBottom: 'var(--space-sm)' }}>
                💅 <span className="text-gradient" style={{ fontWeight: 600 }}>Lizzie Nail Studio</span> — Arte en cada detalle
              </p>
              <p>© {new Date().getFullYear()} Todos los derechos reservados</p>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
