'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ChildrenType } from '@/types/component-props';
import type {
  LayoutState,
  LayoutType,
  MenuType,
  OffcanvasControlType,
  LayoutOffcanvasStatesType,
  ThemeType,
} from '@/types/context';

import { toggleDocumentAttribute } from '@/utils/layout';

const ThemeContext = createContext<LayoutType | undefined>(undefined);

export const useLayoutContext = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useLayoutContext must be used within provider');
  return context;
};

const FORCED_STATE: LayoutState = {
  theme: 'light',
  topbarTheme: 'light',
  menu: {
    theme: 'light',
    size: 'hidden',
  },
};

const LayoutProvider = ({ children }: ChildrenType) => {
  const [settings, setSettings] = useState<LayoutState>(FORCED_STATE);

  const [offcanvasStates, setOffcanvasStates] =
    useState<LayoutOffcanvasStatesType>({
      showThemeCustomizer: false,
      showActivityStream: false,
      showBackdrop: false,
    });

  // Hard reset old configs + force close sidebar
  useEffect(() => {
    localStorage.removeItem('__REBACK_NEXT_CONFIG__');
    setSettings(FORCED_STATE);
    document.documentElement.classList.remove('sidebar-enable');
  }, []);

  // Apply locked layout attributes
  useEffect(() => {
    toggleDocumentAttribute('data-bs-theme', 'light');
    toggleDocumentAttribute('data-topbar-color', 'light');
    toggleDocumentAttribute('data-menu-color', 'light');
    toggleDocumentAttribute('data-menu-size', 'hidden');
  }, []);

  // Toggle sidebar (works on desktop + mobile)
  const toggleBackdrop = useCallback(() => {
    setOffcanvasStates((prev) => {
      const html = document.documentElement;

      if (prev.showBackdrop) html.classList.remove('sidebar-enable');
      else html.classList.add('sidebar-enable');

      return { ...prev, showBackdrop: !prev.showBackdrop };
    });
  }, []);

  // Auto-close sidebar when screen becomes mobile-sized
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (window.innerWidth < 768) {
        document.documentElement.classList.remove('sidebar-enable');
        setOffcanvasStates((prev) => ({ ...prev, showBackdrop: false }));
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleThemeCustomizer: OffcanvasControlType['toggle'] = () => {};
  const toggleActivityStream: OffcanvasControlType['toggle'] = () => {};

  const value = useMemo<LayoutType>(
    () => ({
      ...settings,
      themeMode: 'light',
      changeTheme: () => {},
      changeTopbarTheme: () => {},
      changeMenu: {
        theme: () => {},
        size: () => {},
      },
      themeCustomizer: { open: false, toggle: toggleThemeCustomizer },
      activityStream: { open: false, toggle: toggleActivityStream },
      toggleBackdrop,
      resetSettings: () => setSettings(FORCED_STATE),
    }),
    [settings, toggleBackdrop],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {offcanvasStates.showBackdrop && (
        <div
          className="offcanvas-backdrop fade show"
          onClick={toggleBackdrop}
        />
      )}
    </ThemeContext.Provider>
  );
};

export { LayoutProvider };
