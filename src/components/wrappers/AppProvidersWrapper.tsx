'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect, useRef, useLayoutEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { DEFAULT_PAGE_TITLE } from '@/context/constants';
import dynamic from 'next/dynamic';
import { NotificationProvider } from '@/context/useNotificationContext';
import { ChildrenType } from '@/types/component-props';
import { usePathname } from 'next/navigation';
import { abortAll } from '@/lib/apiAbort';

const LayoutProvider = dynamic(
  () => import('@/context/useLayoutContext').then((mod) => mod.LayoutProvider),
  { ssr: false }
);

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  const pathname = usePathname();

  // 🔥 Make sure abortAll() runs ONLY once per REAL pathname change
  const lastPathnameRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (lastPathnameRef.current === pathname) {
      // Prevent double abort on same pathname
      return;
    }

    lastPathnameRef.current = pathname;

    console.log("🛑 Route changed → Aborting all previous API requests");
    abortAll(); // aborts only old-page requests, not new ones

  }, [pathname]);

  const handleChangeTitle = () => {
    document.title = DEFAULT_PAGE_TITLE;
  };

  useEffect(() => {
    const splash = document.querySelector<HTMLDivElement>('#__next_splash');
    const screen = document.querySelector('#splash-screen');

    if (splash?.hasChildNodes()) {
      screen?.classList.add('remove');
    }

    const observer = new MutationObserver(() => {
      screen?.classList.add('remove');
    });

    if (splash) {
      observer.observe(splash, { childList: true, subtree: true });
    }

    document.addEventListener('visibilitychange', handleChangeTitle);

    return () => {
      document.removeEventListener('visibilitychange', handleChangeTitle);
      observer.disconnect();
    };
  }, []);

  return (
    <SessionProvider>
      <LayoutProvider>
        <NotificationProvider>
          <div style={{ backgroundColor: '#FAF5FF', minHeight: '100vh' }}>
            {children}
          </div>
          <ToastContainer theme="colored" />
        </NotificationProvider>
      </LayoutProvider>
    </SessionProvider>
  );
};

export default AppProvidersWrapper;
