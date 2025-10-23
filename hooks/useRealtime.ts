import { useEffect, useState } from 'react';
import { realtimeManager } from '@/lib/realtime';

type ChangeType = 'INSERT' | 'UPDATE' | 'DELETE';

interface RealtimeNotification {
  type: ChangeType;
  table: string;
  data: any;
  timestamp: Date;
}

/**
 * Hook para gerenciar notificações em tempo real
 */
export function useRealtimeNotifications(tables: string[]) {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [lastChange, setLastChange] = useState<RealtimeNotification | null>(null);
  
  useEffect(() => {
    const handleChange = (table: string, type: ChangeType) => (payload: any) => {
      const notification: RealtimeNotification = {
        type,
        table,
        data: payload.new || payload.old,
        timestamp: new Date(),
      };
      
      setLastChange(notification);
      setNotifications(prev => [notification, ...prev].slice(0, 50)); // Mantém últimas 50
    };
    
    tables.forEach(table => {
      realtimeManager.subscribeToTable(
        table,
        handleChange(table, 'INSERT'),
        handleChange(table, 'UPDATE'),
        handleChange(table, 'DELETE')
      );
    });
    
    return () => {
      tables.forEach(table => {
        realtimeManager.unsubscribeFromTable(table);
      });
    };
  }, [tables]);
  
  const clearNotifications = () => {
    setNotifications([]);
    setLastChange(null);
  };
  
  return {
    notifications,
    lastChange,
    clearNotifications,
  };
}

/**
 * Hook simplificado para recarregar dados quando houver mudanças
 */
export function useRealtimeRefresh(table: string, onRefresh: () => void) {
  useEffect(() => {
    const handleChange = () => {
      console.log(`Mudança detectada em ${table}, atualizando...`);
      onRefresh();
    };
    
    realtimeManager.subscribeToTable(
      table,
      handleChange,
      handleChange,
      handleChange
    );
    
    return () => {
      realtimeManager.unsubscribeFromTable(table);
    };
  }, [table, onRefresh]);
}


