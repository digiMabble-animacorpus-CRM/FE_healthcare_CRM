'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { DEFAULT_PAGE_TITLE } from '@/context/constants';
import dynamic from 'next/dynamic';

const LayoutProvider = dynamic(
  () => import('@/context/useLayoutContext').then((mod) => mod.LayoutProvider),
  { ssr: false },
);

import { NotificationProvider } from '@/context/useNotificationContext';
import { ChildrenType } from '@/types/component-props';

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  const handleChangeTitle = () => {
    document.title = DEFAULT_PAGE_TITLE;
  };

  useEffect(() => {
    const splash = document.querySelector<HTMLDivElement>('#__next_splash');
    const screen = document.querySelector('#splash-screen');

    if (splash?.hasChildNodes()) {
      screen?.classList.add('remove');
    }

    // ✅ Use MutationObserver instead of deprecated DOMNodeInserted
    const observer = new MutationObserver(() => {
      screen?.classList.add('remove');
    });

    if (splash) {
      observer.observe(splash, { childList: true, subtree: true });
    }

    document.addEventListener('visibilitychange', handleChangeTitle);

    return () => {
      document.removeEventListener('visibilitychange', handleChangeTitle);
      observer.disconnect(); // cleanup
    };
  }, []);

  return (
    <SessionProvider>
      <LayoutProvider>
        <NotificationProvider>
          <div style={{ backgroundColor: '#FAF5FF', minHeight: '100vh' }}>{children}</div>
          <ToastContainer theme="colored" />
        </NotificationProvider>
      </LayoutProvider>
    </SessionProvider>
  );
};

export default AppProvidersWrapper;
