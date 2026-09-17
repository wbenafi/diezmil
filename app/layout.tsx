import type { Metadata, Viewport } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import './globals.css';
export const metadata: Metadata = { title: '10.000 · Misma mesa. Mejores partidas.', description: 'El marcador para tus partidas de 10.000. Agregá jugadores, anotá puntos y disfrutá la partida.' };
export const viewport: Viewport = { themeColor: '#071014', width: 'device-width', initialScale: 1 };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="es"><body>{children}</body></html>; }
