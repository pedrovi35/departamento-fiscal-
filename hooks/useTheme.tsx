'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserSettings, saveUserSettings, updateUserTheme, getDefaultUserSettings } from '@/lib/supabase/user-settings';
import type { Theme } from '@/types';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Função para gerar identificador único do usuário
function getUserIdentifier(): string {
  // Verifica se está no lado do cliente
  if (typeof window === 'undefined') {
    return 'server-side';
  }
  
  // Tenta obter do localStorage primeiro
  let identifier = localStorage.getItem('user_identifier');
  
  if (!identifier) {
    // Gera um identificador único baseado no navegador
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint', 2, 2);
    }
    
    const fingerprint = canvas.toDataURL();
    identifier = btoa(fingerprint).slice(0, 32);
    localStorage.setItem('user_identifier', identifier);
  }
  
  return identifier;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);

  // Carregar tema do banco de dados
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Verifica se está no lado do cliente
        if (typeof window === 'undefined') {
          setThemeState('light');
          setMounted(true);
          setIsLoading(false);
          return;
        }

        const identifier = getUserIdentifier();
        setUserIdentifier(identifier);
        
        // Primeiro tenta carregar do banco de dados
        const userSettings = await getUserSettings(identifier);
        
        if (userSettings) {
          setThemeState(userSettings.theme);
        } else {
          // Se não existe, detecta preferência do sistema
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          setThemeState(systemTheme);
          
          // Salva configurações padrão no banco
          await saveUserSettings(identifier, {
            theme: systemTheme,
            language: 'pt-BR',
            timezone: 'America/Sao_Paulo',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            notificationsEnabled: true,
            emailNotifications: false,
            reminderDays: 7,
            dashboardLayout: {},
            savedFilters: {},
          });
        }
      } catch (error) {
        console.warn('Erro ao carregar tema do banco:', error);
        // Fallback para preferência do sistema
        if (typeof window !== 'undefined') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          setThemeState(systemTheme);
        }
      } finally {
        setMounted(true);
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Aplicar tema ao DOM
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Salvar no localStorage como fallback
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  // Salvar no banco de dados quando o tema mudar
  useEffect(() => {
    if (mounted && userIdentifier && theme !== 'light') {
      updateUserTheme(userIdentifier, theme).catch(error => {
        console.warn('Erro ao salvar tema no banco:', error);
      });
    }
  }, [theme, mounted, userIdentifier]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Evitar hidratação incorreta
  if (!mounted) {
    return <>{children}</>;
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
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
