// Tipos principais do sistema - Versão 2.0 com Modo Escuro e Melhorias

export type RecurrenceType = 'none' | 'monthly' | 'quarterly' | 'custom';

export type RecurrenceRule = {
  type: RecurrenceType;
  dayOfMonth?: number; // Para mensal: dia do mês (1-31)
  customDays?: number[]; // Para custom: múltiplos dias do mês
  interval?: number; // Para custom: intervalo em dias
  months?: number[]; // Para trimestral/custom: meses específicos (1-12)
};

export type WeekendAdjustRule = 'postpone' | 'anticipate' | 'keep';

export type ObligationStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type TaxCategory = 'Federal' | 'Estadual' | 'Municipal' | 'Trabalhista' | 'Previdenciário';

export type EntityType = 'client' | 'tax' | 'obligation' | 'installment' | 'user_settings';

export type AuditAction = 'created' | 'updated' | 'deleted' | 'status_changed' | 'bulk_operation';

export type Theme = 'light' | 'dark' | 'auto';

export type NotificationType = 'reminder' | 'alert' | 'info' | 'warning' | 'success';

export type ReportType = 'productivity' | 'compliance' | 'financial' | 'custom';

// ============ ENTIDADES PRINCIPAIS ============

export type Client = {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPerson?: string;
  notes?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Tax = {
  id: string;
  name: string;
  description?: string;
  category: TaxCategory;
  code?: string; // Código do imposto (ex: ICMS, IPI)
  recurrenceType: RecurrenceType;
  recurrenceConfig?: RecurrenceRule; // Configuração detalhada
  weekendAdjust: WeekendAdjustRule;
  holidayAdjust?: boolean; // Se ajusta para feriados
  defaultAssignee?: string;
  autoGenerate: boolean;
  generationDaysAhead?: number; // Dias antes para gerar obrigações
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Obligation = {
  id: string;
  taxId: string;
  clientId: string;
  assignedTo?: string;
  dueDate: Date;
  calculatedDueDate?: Date; // Data ajustada para fins de semana/feriados
  status: ObligationStatus;
  priority: PriorityLevel;
  amount?: number; // Valor da obrigação
  referencePeriod?: string; // Período de referência (ex: 2024-01)
  notes?: string;
  completedAt?: Date;
  completedBy?: string;
  completionNotes?: string;
  reminderSent?: boolean;
  reminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Installment = {
  id: string;
  taxId: string;
  clientId: string;
  description: string;
  totalAmount?: number;
  currentInstallment: number;
  totalInstallments: number;
  installmentAmount?: number;
  firstDueDate: Date;
  recurrenceType: RecurrenceType;
  recurrenceConfig?: RecurrenceRule;
  weekendAdjust: WeekendAdjustRule;
  assignedTo?: string;
  status: ObligationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

// ============ CONFIGURAÇÕES E PREFERÊNCIAS ============

export type UserSettings = {
  id: string;
  userIdentifier: string; // Identificador único do usuário
  theme: Theme;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  reminderDays?: number; // Dias antes para lembrar
  dashboardLayout?: Record<string, any>; // Layout personalizado
  savedFilters?: Record<string, any>; // Filtros salvos personalizados
  createdAt: Date;
  updatedAt: Date;
};

export type SavedFilter = {
  id: string;
  userIdentifier: string;
  name: string;
  module: 'clients' | 'taxes' | 'obligations' | 'installments' | 'calendar' | 'reports';
  filters: Record<string, any>;
  isPublic?: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

// ============ AUDITORIA E LOGS ============

export type AuditLog = {
  id: string;
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  performedBy: string;
  userIdentifier?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: Date;
};

export type SystemLog = {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug' | 'critical';
  category: string;
  message: string;
  details?: Record<string, any>;
  executionTimeMs?: number;
  createdAt: Date;
};

export type StatusHistory = {
  id: string;
  entityType: EntityType;
  entityId: string;
  oldStatus?: string;
  newStatus: string;
  changedBy: string;
  reason?: string;
  timestamp: Date;
};

// ============ RELATÓRIOS E MÉTRICAS ============

export type DashboardMetrics = {
  id: string;
  metricName: string;
  metricValue: Record<string, any>;
  calculatedAt: Date;
  expiresAt: Date;
};

export type SavedReport = {
  id: string;
  userIdentifier: string;
  name: string;
  reportType: ReportType;
  parameters: Record<string, any>;
  generatedAt?: Date;
  filePath?: string;
  isPublic?: boolean;
  createdAt: Date;
};

// ============ NOTIFICAÇÕES ============

export type Notification = {
  id: string;
  userIdentifier: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: EntityType;
  entityId?: string;
  isRead: boolean;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
};

// ============ TIPOS COMPOSTOS ============

export type DashboardStats = {
  totalClients: number;
  activeClients: number;
  totalObligations: number;
  pendingObligations: number;
  completedThisMonth: number;
  overdueObligations: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
};

export type ObligationWithDetails = Obligation & {
  tax: Tax;
  client: Client;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: 'obligation' | 'tax' | 'installment';
  status: ObligationStatus;
  client: string;
  assignedTo?: string;
  priority?: string;
};

export type ProductivityMetrics = {
  completionRate: number;
  averageCompletionTime: number; // em dias
  onTimeRate: number;
  byAssignee: Record<string, {
    completed: number;
    onTime: number;
    late: number;
  }>;
  byMonth: Record<string, {
    total: number;
    completed: number;
    onTime: number;
  }>;
};

// ============ TIPOS PARA FORMULÁRIOS ============

export type ClientFormData = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type TaxFormData = Omit<Tax, 'id' | 'createdAt' | 'updatedAt'>;
export type ObligationFormData = Omit<Obligation, 'id' | 'createdAt' | 'updatedAt'>;
export type InstallmentFormData = Omit<Installment, 'id' | 'createdAt' | 'updatedAt'>;
export type UserSettingsFormData = Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>;

// ============ TIPOS PARA API ============

export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type FilterOptions = {
  search?: string;
  status?: ObligationStatus;
  priority?: PriorityLevel;
  category?: TaxCategory;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  clientId?: string;
  taxId?: string;
};

// ============ TIPOS PARA CONFIGURAÇÕES ============

export type AppConfig = {
  version: string;
  features: {
    darkMode: boolean;
    notifications: boolean;
    realtime: boolean;
    reports: boolean;
    audit: boolean;
  };
  limits: {
    maxClients: number;
    maxObligations: number;
    maxFileSize: number;
  };
};

