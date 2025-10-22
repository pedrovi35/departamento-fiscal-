// Tipos principais do sistema

export type RecurrenceType = 'none' | 'monthly' | 'quarterly' | 'custom';

export type RecurrenceRule = {
  type: RecurrenceType;
  dayOfMonth?: number; // Para mensal: dia do mês (1-31)
  customDays?: number[]; // Para custom: múltiplos dias do mês
  interval?: number; // Para custom: intervalo em dias
  months?: number[]; // Para trimestral/custom: meses específicos (1-12)
};

export type WeekendAdjustRule = 'postpone' | 'anticipate' | 'keep';

export type ObligationStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export type Client = {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Tax = {
  id: string;
  name: string;
  description?: string;
  category: string; // Ex: 'Federal', 'Estadual', 'Municipal'
  recurrenceRule: RecurrenceRule;
  weekendAdjust: WeekendAdjustRule;
  defaultAssignee?: string;
  autoGenerate: boolean; // Se deve gerar automaticamente próximas ocorrências
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
  status: ObligationStatus;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  completedAt?: Date;
  completedBy?: string;
  calculatedDueDate?: Date; // Data ajustada (fins de semana/feriados)
  createdAt: Date;
  updatedAt: Date;
};

export type Installment = {
  id: string;
  taxId: string;
  clientId: string;
  description: string;
  currentInstallment: number;
  totalInstallments: number;
  firstDueDate: Date;
  recurrenceRule: RecurrenceRule;
  weekendAdjust: WeekendAdjustRule;
  assignedTo?: string;
  status: ObligationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AuditLog = {
  id: string;
  entityType: 'client' | 'tax' | 'obligation' | 'installment';
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  performedBy: string; // Nome do usuário
  changes?: Record<string, any>;
  timestamp: Date;
};

export type SavedFilter = {
  id: string;
  name: string;
  module: 'obligations' | 'taxes' | 'installments';
  filters: Record<string, any>;
  createdAt: Date;
};

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

// Tipos para métricas de produtividade
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

