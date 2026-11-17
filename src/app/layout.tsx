import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#020617'
};

export const metadata: Metadata = {
  title: 'Ekklesia Music | Gestor de Alabanza e Iglesia',
  description: 'Gestor de iglesia para músicos: acordes, claves de solfa, repertorio agrupado por artista, buscador con Gemini AI, setlists de ensayo y Biblia Reina Valera 1960 con textos cruzados.',
  manifest: '/manifest.json',
  icons: {
    icon: '/church-icon.svg',
    apple: '/church-icon.svg'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950 transition-colors">
        <ThemeProvider>
          {children}
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
