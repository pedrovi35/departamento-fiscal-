import { supabase } from './client';
import type { UserSettings, UserSettingsFormData, Theme } from '@/types';

// ============ CONFIGURAÇÕES DE USUÁRIO ============

/**
 * Obtém configurações do usuário por identificador
 */
export async function getUserSettings(userIdentifier: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_identifier', userIdentifier)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Usuário não encontrado, retorna configurações padrão
      return null;
    }
    throw error;
  }

  return data ? mapDbToUserSettings(data) : null;
}

/**
 * Salva ou atualiza configurações do usuário
 */
export async function saveUserSettings(
  userIdentifier: string, 
  settings: Partial<UserSettingsFormData>
): Promise<UserSettings> {
  const dbSettings = mapUserSettingsToDb(settings);
  
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_identifier: userIdentifier,
      ...dbSettings,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbToUserSettings(data);
}

/**
 * Atualiza apenas o tema do usuário
 */
export async function updateUserTheme(userIdentifier: string, theme: Theme): Promise<void> {
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_identifier: userIdentifier,
      theme,
    });

  if (error) throw error;
}

/**
 * Obtém configurações padrão para novos usuários
 */
export function getDefaultUserSettings(userIdentifier: string): UserSettings {
  return {
    id: '',
    userIdentifier,
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    notificationsEnabled: true,
    emailNotifications: false,
    reminderDays: 7,
    dashboardLayout: {},
    savedFilters: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Cria configurações padrão para um novo usuário
 */
export async function createDefaultUserSettings(userIdentifier: string): Promise<UserSettings> {
  const defaultSettings = getDefaultUserSettings(userIdentifier);
  return await saveUserSettings(userIdentifier, defaultSettings);
}

// ============ FILTROS SALVOS ============

/**
 * Obtém filtros salvos do usuário por módulo
 */
export async function getSavedFilters(
  userIdentifier: string, 
  module: string
): Promise<any[]> {
  const { data, error } = await supabase
    .from('saved_filters')
    .select('*')
    .eq('user_identifier', userIdentifier)
    .eq('module', module)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbToSavedFilter);
}

/**
 * Salva um novo filtro
 */
export async function saveFilter(
  userIdentifier: string,
  name: string,
  module: string,
  filters: Record<string, any>,
  description?: string,
  isPublic: boolean = false
): Promise<any> {
  const { data, error } = await supabase
    .from('saved_filters')
    .insert({
      user_identifier: userIdentifier,
      name,
      module,
      filters,
      description,
      is_public: isPublic,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbToSavedFilter(data);
}

/**
 * Remove um filtro salvo
 */
export async function deleteSavedFilter(id: string): Promise<void> {
  const { error } = await supabase
    .from('saved_filters')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ NOTIFICAÇÕES ============

/**
 * Obtém notificações não lidas do usuário
 */
export async function getUnreadNotifications(userIdentifier: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_identifier', userIdentifier)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

/**
 * Marca notificação como lida
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Cria uma nova notificação
 */
export async function createNotification(
  userIdentifier: string,
  type: string,
  title: string,
  message: string,
  entityType?: string,
  entityId?: string,
  expiresAt?: Date
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_identifier: userIdentifier,
      type,
      title,
      message,
      entity_type: entityType,
      entity_id: entityId,
      expires_at: expiresAt?.toISOString(),
    });

  if (error) throw error;
}

// ============ MÉTRICAS DO DASHBOARD ============

/**
 * Obtém métricas do dashboard (com cache)
 */
export async function getDashboardMetrics(): Promise<any> {
  const { data, error } = await supabase
    .from('dashboard_metrics')
    .select('*')
    .eq('metric_name', 'dashboard_stats')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Cache expirado ou não existe, recalcular
      return null;
    }
    throw error;
  }

  return data?.metric_value;
}

/**
 * Salva métricas do dashboard no cache
 */
export async function saveDashboardMetrics(metrics: any): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Cache por 1 hora

  const { error } = await supabase
    .from('dashboard_metrics')
    .upsert({
      metric_name: 'dashboard_stats',
      metric_value: metrics,
      expires_at: expiresAt.toISOString(),
    });

  if (error) throw error;
}

// ============ LOGS DE SISTEMA ============

/**
 * Cria um log do sistema
 */
export async function createSystemLog(
  level: string,
  category: string,
  message: string,
  details?: Record<string, any>,
  executionTimeMs?: number
): Promise<void> {
  const { error } = await supabase
    .from('system_logs')
    .insert({
      level,
      category,
      message,
      details,
      execution_time_ms: executionTimeMs,
    });

  if (error) throw error;
}

// ============ MAPPERS ============

function mapDbToUserSettings(db: any): UserSettings {
  return {
    id: db.id,
    userIdentifier: db.user_identifier,
    theme: db.theme,
    language: db.language,
    timezone: db.timezone,
    dateFormat: db.date_format,
    timeFormat: db.time_format,
    notificationsEnabled: db.notifications_enabled,
    emailNotifications: db.email_notifications,
    reminderDays: db.reminder_days,
    dashboardLayout: db.dashboard_layout || {},
    savedFilters: db.saved_filters || {},
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

function mapUserSettingsToDb(settings: Partial<UserSettingsFormData>): any {
  return {
    theme: settings.theme,
    language: settings.language,
    timezone: settings.timezone,
    date_format: settings.dateFormat,
    time_format: settings.timeFormat,
    notifications_enabled: settings.notificationsEnabled,
    email_notifications: settings.emailNotifications,
    reminder_days: settings.reminderDays,
    dashboard_layout: settings.dashboardLayout,
    saved_filters: settings.savedFilters,
  };
}

function mapDbToSavedFilter(db: any): any {
  return {
    id: db.id,
    userIdentifier: db.user_identifier,
    name: db.name,
    module: db.module,
    filters: db.filters,
    isPublic: db.is_public,
    description: db.description,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}
