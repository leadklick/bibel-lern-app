import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'BibelMeister',
  description: 'Bibelverse lernen mit Spaced Repetition',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="flex flex-col bg-[#f0f6ff]">
        <Navigation />
        <main className="max-w-3xl mx-auto w-full px-4 pt-5 md:py-8 overflow-x-hidden">
          {children}
          {/* Spacer so content clears the fixed mobile bottom nav */}
          <div className="h-20 md:hidden" aria-hidden="true" />
        </main>
      </body>
    </html>
  );
}
