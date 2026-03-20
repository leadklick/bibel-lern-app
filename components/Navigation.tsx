'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDueVerses } from '@/lib/storage';

const links = [
  { href: '/', label: 'Start', icon: '🏠' },
  { href: '/verse', label: 'Verse', icon: '📖' },
  { href: '/learn', label: 'Lernen', icon: '🧠' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    setDueCount(getDueVerses().length);
  }, [pathname]);

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:block bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✝</span>
            <span className="font-semibold text-blue-900 text-lg tracking-tight">
              Bibel Lern App
            </span>
          </Link>
          <div className="flex gap-1">
            {links.map(({ href, label }) => {
              const isActive =
                href === '/' ? pathname === '/' : pathname.startsWith(href);
              const showBadge = href === '/learn' && dueCount > 0;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  {label}
                  {showBadge && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {dueCount > 99 ? '99+' : dueCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-blue-100 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch">
          {links.map(({ href, label, icon }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href);
            const showBadge = href === '/learn' && dueCount > 0;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-blue-400 hover:text-blue-600'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-600 rounded-full" />
                )}
                {/* Active background pill */}
                {isActive && (
                  <span className="absolute inset-x-2 inset-y-1 bg-blue-50 rounded-xl -z-10" />
                )}
                <span className="text-xl leading-none relative">
                  {icon}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {dueCount > 9 ? '9+' : dueCount}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[11px] font-semibold leading-tight ${
                    isActive ? 'text-blue-600' : 'text-blue-400'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
