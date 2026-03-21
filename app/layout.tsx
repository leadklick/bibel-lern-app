import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'BibelMeister',
  description: 'Bibelverse lernen mit Spaced Repetition',
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
        <main className="max-w-3xl mx-auto w-full px-4 py-5 pb-24 md:pb-8 md:py-8 overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
