'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    {
      name: 'Home',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: '/',
    },
    {
      name: 'Discover',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      href: '/coming-soon',
    },
    {
      name: 'Create',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      ),
      href: '/coming-soon',
      isCenter: true,
    },
    {
      name: 'Messages',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      href: '/coming-soon',
    },
    {
      name: 'Profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '/coming-soon',
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-ink border-t border-paper/20 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-8"
              >
                <div className="w-14 h-14 bg-rust rounded-full flex items-center justify-center border-4 border-ink shadow-lg hover:bg-rust/90 transition-colors">
                  <span className="text-paper">
                    {item.icon}
                  </span>
                </div>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${
                isActive ? 'text-mustard' : 'text-paper/60 hover:text-paper'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-label font-semibold tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
