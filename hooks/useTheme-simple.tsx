'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme } from '@/types';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Inicialização segura
  useEffect(() => {
    setMounted(true);
    setIsLoading(false);
  }, []);

  // Aplicar tema ao DOM de forma segura
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    try {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Salvar no localStorage como fallback
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Erro ao aplicar tema:', error);
    }
  }, [theme, mounted]);

  // Carregar tema do localStorage de forma segura
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeState(savedTheme);
      } else {
        // Detectar preferência do sistema
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setThemeState(systemTheme);
      }
    } catch (error) {
      console.warn('Erro ao carregar tema:', error);
      setThemeState('light');
    }
  }, [mounted]);

  const toggleTheme = () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setThemeState(newTheme);
    } catch (error) {
      console.warn('Erro ao alternar tema:', error);
    }
  };

  const setTheme = (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
    } catch (error) {
      console.warn('Erro ao definir tema:', error);
    }
  };

  // Durante o SSR, sempre retorna tema claro
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ 
        theme: 'light', 
        toggleTheme: () => {}, 
        setTheme: () => {}, 
        isLoading: true 
      }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Fallback seguro para evitar erros
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
      isLoading: false,
    };
  }
  return context;
}
