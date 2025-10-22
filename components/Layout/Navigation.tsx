'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckSquare, 
  CreditCard, 
  Calendar, 
  BarChart3,
  Search
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/impostos', label: 'Impostos', icon: FileText },
  { href: '/obrigacoes', label: 'Obrigações', icon: CheckSquare },
  { href: '/parcelamentos', label: 'Parcelamentos', icon: CreditCard },
  { href: '/calendario', label: 'Calendário', icon: Calendar },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Atalho Ctrl+K para busca
  useKeyboardShortcut('k', () => setSearchOpen(true), { ctrl: true });
  
  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary-600">
                Controle Fiscal
              </h1>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth',
                      {
                        'bg-primary-50 text-primary-700': isActive,
                        'text-gray-600 hover:bg-gray-100 hover:text-gray-900': !isActive,
                      }
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-smooth"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Buscar</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-gray-100 rounded">
                Ctrl K
              </kbd>
            </button>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden pb-3 flex overflow-x-auto gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-smooth',
                    {
                      'bg-primary-50 text-primary-700': isActive,
                      'text-gray-600 hover:bg-gray-100': !isActive,
                    }
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* Search Modal - Placeholder */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-20"
          onClick={() => setSearchOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <input
                type="text"
                placeholder="Buscar clientes, obrigações, impostos..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                autoFocus
              />
            </div>
            <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
              Digite para buscar...
            </div>
          </div>
        </div>
      )}
    </>
  );
}

