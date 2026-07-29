import type { Metadata } from 'next';
import {
  Plus_Jakarta_Sans as PlusJakartaSans,
  DM_Mono as DmMono
} from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

const plusJakartaSans = PlusJakartaSans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800']
});

const dmMono = DmMono({
  variable: '--font-fragment-mono',
  subsets: ['latin'],
  weight: ['400', '500']
});

export const metadata: Metadata = {
  title: 'Aztec | Centro de Proyectos',
  description:
    'Gestión operativa de proyectos para el equipo de entrega de IA de Aztec'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${dmMono.variable} antialiased`}
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
