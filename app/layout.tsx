import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Bibel Lern App',
  description: 'Bibelverse lernen mit Spaced Repetition',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col">
        <Navigation />
        {/* pb-20 on mobile to clear the fixed bottom nav; md:pb-0 on desktop */}
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-24 md:pb-8 md:py-8 overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
