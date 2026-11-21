import type { Metadata, Viewport } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import './globals.css';
import ServiceWorkerRegister from './service-worker-register';
export const metadata: Metadata = { title: 'DiezMil | Marcador para el juego de dados 10.000', description: 'Anotá puntos, seguí los turnos y jugá al 10.000 con tus amigos. DiezMil guarda la partida en tu dispositivo y funciona sin cuentas.', applicationName: 'DiezMil', appleWebApp: { capable: true, title: 'DiezMil', statusBarStyle: 'black' }, formatDetection: { telephone: false } };
export const viewport: Viewport = { themeColor: '#071014', width: 'device-width', initialScale: 1 };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="es"><body>{children}<ServiceWorkerRegister /></body></html>; }
