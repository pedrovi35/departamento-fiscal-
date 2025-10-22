import type { Client, Obligation, Tax, ObligationWithDetails, DashboardStats } from '@/types';
import { isOverdue, isToday, isThisWeek, adjustForWeekend } from './date-utils';
import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * Processa obrigações e anexa detalhes de cliente e imposto
 */
export function getObligationsWithDetails(
  obligations: Obligation[],
  clients: Client[],
  taxes: Tax[]
): ObligationWithDetails[] {
  return obligations.map(obligation => {
    const client = clients.find(c => c.id === obligation.clientId);
    const tax = taxes.find(t => t.id === obligation.taxId);
    
    // Calcula data ajustada
    const calculatedDueDate = adjustForWeekend(
      obligation.dueDate,
      tax?.weekendAdjust || 'postpone'
    );
    
    return {
      ...obligation,
      calculatedDueDate,
      client: client!,
      tax: tax!,
    };
  });
}

/**
 * Calcula estatísticas do dashboard
 */
export function calculateDashboardStats(
  clients: Client[],
  obligations: Obligation[]
): DashboardStats {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const activeClients = clients.filter(c => c.active);
  
  const pendingObligations = obligations.filter(o => o.status === 'pending');
  
  const completedThisMonth = obligations.filter(o => 
    o.status === 'completed' && 
    o.completedAt &&
    o.completedAt >= monthStart &&
    o.completedAt <= monthEnd
  );
  
  const overdueObligations = obligations.filter(o => 
    o.status === 'pending' && isOverdue(o.dueDate)
  );
  
  const dueTodayCount = obligations.filter(o => 
    o.status === 'pending' && isToday(o.dueDate)
  );
  
  const dueThisWeekCount = obligations.filter(o => 
    o.status === 'pending' && isThisWeek(o.dueDate)
  );
  
  return {
    totalClients: clients.length,
    activeClients: activeClients.length,
    totalObligations: obligations.length,
    pendingObligations: pendingObligations.length,
    completedThisMonth: completedThisMonth.length,
    overdueObligations: overdueObligations.length,
    dueTodayCount: dueTodayCount.length,
    dueThisWeekCount: dueThisWeekCount.length,
  };
}

/**
 * Agrupa obrigações por cliente
 */
export function groupObligationsByClient(
  obligations: ObligationWithDetails[]
): Map<string, ObligationWithDetails[]> {
  const grouped = new Map<string, ObligationWithDetails[]>();
  
  obligations.forEach(obligation => {
    const clientId = obligation.clientId;
    if (!grouped.has(clientId)) {
      grouped.set(clientId, []);
    }
    grouped.get(clientId)!.push(obligation);
  });
  
  return grouped;
}

/**
 * Agrupa obrigações por status
 */
export function groupObligationsByStatus(
  obligations: ObligationWithDetails[]
): Record<string, ObligationWithDetails[]> {
  return obligations.reduce((acc, obligation) => {
    const status = obligation.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(obligation);
    return acc;
  }, {} as Record<string, ObligationWithDetails[]>);
}

/**
 * Retorna obrigações da semana atual
 */
export function getThisWeekObligations(
  obligations: ObligationWithDetails[]
): ObligationWithDetails[] {
  return obligations.filter(o => 
    o.status === 'pending' && isThisWeek(o.dueDate)
  ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

/**
 * Retorna obrigações críticas (atrasadas ou vencendo hoje)
 */
export function getCriticalObligations(
  obligations: ObligationWithDetails[]
): ObligationWithDetails[] {
  return obligations.filter(o => 
    o.status === 'pending' && (isOverdue(o.dueDate) || isToday(o.dueDate))
  ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

