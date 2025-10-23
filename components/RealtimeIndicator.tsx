'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useRealtimeNotifications } from '@/hooks/useRealtime';

export function RealtimeIndicator() {
  const { notifications, lastChange } = useRealtimeNotifications([
    'clients',
    'taxes',
    'obligations',
    'installments',
  ]);
  
  const [showNotification, setShowNotification] = useState(false);
  
  useEffect(() => {
    if (lastChange) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastChange]);
  
  const isConnected = notifications.length >= 0; // Simplificado
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Indicador de conexão */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Conectado</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Desconectado</span>
          </>
        )}
      </div>
      
      {/* Notificação de mudança */}
      {showNotification && lastChange && (
        <div className="mt-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg shadow-lg animate-slide-up">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <strong>{lastChange.type}:</strong> {lastChange.table}
          </p>
        </div>
      )}
    </div>
  );
}


