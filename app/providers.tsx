"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { NeynarContextProvider, Theme as NeynarTheme } from "@neynar/react";
import "@neynar/react/dist/style.css";

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);

  const getInitialTheme = (): Theme => {
    if (isClient) {
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      if (storedTheme) {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setIsClient(true);
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = storedTheme || 
     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (isClient) {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, isClient]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (!isClient) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <NeynarContextProvider
        settings={{
          clientId: process.env.NEXT_PUBLIC_NEYNAR_SOSCASTER_CLIENT_ID || "",
          defaultTheme: theme === "dark" ? NeynarTheme.Dark : NeynarTheme.Light,
          eventsCallbacks: {
            onAuthSuccess: (data) => { 
              console.log(data);
            },
            onSignout() {},
          },
        }}
      >
        {children}
      </NeynarContextProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
