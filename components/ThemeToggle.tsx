"use client"

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/providers';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <button onClick={toggleTheme} className="opacity-[.9]">
      {isClient ? (theme === 'light' ? <Moon /> : <Sun />) : ''}
    </button>
  );
};
