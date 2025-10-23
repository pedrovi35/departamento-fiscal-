import { supabase } from './supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

type ChangeCallback = (payload: any) => void;

/**
 * Sistema de notificações em tempo real para colaboração
 */
export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  
  /**
   * Inscreve-se para mudanças em uma tabela
   */
  subscribeToTable(
    table: string,
    onInsert?: ChangeCallback,
    onUpdate?: ChangeCallback,
    onDelete?: ChangeCallback
  ): void {
    if (this.channels.has(table)) {
      console.warn(`Já inscrito na tabela ${table}`);
      return;
    }
    
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table },
        (payload) => {
          console.log(`[${table}] INSERT:`, payload);
          onInsert?.(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table },
        (payload) => {
          console.log(`[${table}] UPDATE:`, payload);
          onUpdate?.(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table },
        (payload) => {
          console.log(`[${table}] DELETE:`, payload);
          onDelete?.(payload);
        }
      )
      .subscribe((status) => {
        console.log(`[${table}] Status da inscrição:`, status);
      });
    
    this.channels.set(table, channel);
  }
  
  /**
   * Cancela inscrição em uma tabela
   */
  unsubscribeFromTable(table: string): void {
    const channel = this.channels.get(table);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(table);
      console.log(`Desinscrição de ${table} concluída`);
    }
  }
  
  /**
   * Cancela todas as inscrições
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, table) => {
      supabase.removeChannel(channel);
      console.log(`Desinscrição de ${table} concluída`);
    });
    this.channels.clear();
  }
}

// Instância singleton
export const realtimeManager = new RealtimeManager();


