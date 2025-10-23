'use client';

import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';
import { ClientOnly } from '@/components/ClientOnly';

interface ThemeToggleProps {
  variant?: 'icon' | 'text';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { theme, toggleTheme, isLoading } = useTheme();

  return (
    <ClientOnly fallback={
      <button
        className={clsx(
          'p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200',
          className
        )}
        disabled
      >
        <div className="w-5 h-5 animate-pulse bg-gray-200 dark:bg-gray-600 rounded-full"></div>
      </button>
    }>
      {isLoading ? (
        <button
          className={clsx(
            'p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200',
            className
          )}
          disabled
        >
          <div className="w-5 h-5 animate-pulse bg-gray-200 dark:bg-gray-600 rounded-full"></div>
        </button>
      ) : (
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          className={clsx(
            'flex items-center justify-center gap-2 p-2 rounded-lg transition-colors duration-200',
            'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
            className
          )}
        >
          {variant === 'icon' ? (
            theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600" />
            )
          ) : (
            <>
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-blue-600" />
              )}
              <span className="hidden sm:inline">
                {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              </span>
            </>
          )}
        </button>
      )}
    </ClientOnly>
  );
}