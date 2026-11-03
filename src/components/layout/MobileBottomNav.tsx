import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { House, PackagePlus, Radar, UserRound } from 'lucide-react';

type MobileNavItem = {
  label: string;
  ariaLabel: string;
  path: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isActive: (pathname: string) => boolean;
};

const NAV_ITEMS: MobileNavItem[] = [
  {
    label: 'Home',
    ariaLabel: 'Home',
    path: '/',
    icon: House,
    isActive: (pathname) => pathname === '/',
  },
  {
    label: 'Request',
    ariaLabel: 'Request a delivery',
    path: '/request',
    icon: PackagePlus,
    isActive: (pathname) => pathname.startsWith('/request'),
  },
  {
    label: 'Track',
    ariaLabel: 'Track your orders',
    path: '/track',
    icon: Radar,
    isActive: (pathname) => pathname.startsWith('/track'),
  },
  {
    label: 'Account',
    ariaLabel: 'Account — log in or register',
    path: '/login',
    icon: UserRound,
    isActive: (pathname) => pathname.startsWith('/login'),
  },
];

export const MobileBottomNav: React.FC = () => {
  const { pathname } = useLocation();

  // Keep the nav out of focused private-payment flows.
  if (pathname.startsWith('/quote/') || pathname.startsWith('/payment/')) {
    return null;
  }

  const activeIndex = NAV_ITEMS.findIndex((item) => item.isActive(pathname));

  return (
    <>
      {/* Extends the dark footer so the floating bar never covers content */}
      <div
        aria-hidden="true"
        className="h-[calc(6rem+env(safe-area-inset-bottom))] bg-slate-950 md:hidden"
      />
      <nav
        aria-label="Primary mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      >
        <div className="mx-auto max-w-md px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="relative grid grid-cols-4 rounded-2xl border border-slate-200/80 bg-white/85 p-1.5 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            {/* Soft emerald hairline along the top edge */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent"
            />

            {/* Sliding active pill */}
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute bottom-1.5 left-1.5 top-1.5 w-[calc((100%-0.75rem)/4)] rounded-xl bg-gradient-to-b from-emerald-50 to-emerald-100/70 ring-1 ring-inset ring-emerald-200/70 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                activeIndex < 0 ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ transform: `translateX(${Math.max(activeIndex, 0) * 100}%)` }}
            />

            {NAV_ITEMS.map((item, index) => {
              const isActive = index === activeIndex;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-label={item.ariaLabel}
                  aria-current={isActive ? 'page' : undefined}
                  className="group relative z-10 flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                >
                  <span className="relative flex h-8 w-11 items-center justify-center">
                    {/* Hover / active glow behind the icon */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 rounded-full transition-all duration-300 ease-out ${
                        isActive
                          ? 'scale-100 bg-emerald-500/10'
                          : 'scale-50 bg-emerald-500/0 group-hover:scale-100 group-hover:bg-emerald-500/10'
                      }`}
                    />
                    <Icon
                      strokeWidth={isActive ? 2.4 : 2}
                      className={`relative h-[21px] w-[21px] transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 ${
                        isActive
                          ? 'text-emerald-600'
                          : 'text-slate-500 group-hover:text-emerald-700'
                      }`}
                    />
                    {/* Active dot */}
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-0.5 h-1 w-1 rounded-full bg-emerald-500 transition-all duration-300 ${
                        isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                      }`}
                    />
                  </span>

                  <span
                    className={`text-[10px] font-semibold leading-none tracking-tight transition-colors duration-300 ${
                      isActive
                        ? 'text-emerald-700'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
