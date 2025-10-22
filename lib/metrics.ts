import type { Obligation, ProductivityMetrics } from '@/types';
import { differenceInDays, startOfMonth, format } from 'date-fns';

/**
 * Calcula métricas de produtividade
 */
export function calculateProductivityMetrics(obligations: Obligation[]): ProductivityMetrics {
  const completedObligations = obligations.filter(o => o.status === 'completed');
  const totalObligations = obligations.length;
  
  // Taxa de conclusão
  const completionRate = totalObligations > 0 
    ? (completedObligations.length / totalObligations) * 100 
    : 0;
  
  // Tempo médio de conclusão
  const completionTimes = completedObligations
    .filter(o => o.completedAt)
    .map(o => differenceInDays(o.completedAt!, o.dueDate));
  
  const averageCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
    : 0;
  
  // Taxa de pontualidade (concluídas antes ou no prazo)
  const onTimeObligations = completedObligations.filter(o => 
    o.completedAt && o.completedAt <= o.dueDate
  );
  
  const onTimeRate = completedObligations.length > 0
    ? (onTimeObligations.length / completedObligations.length) * 100
    : 0;
  
  // Métricas por responsável
  const byAssignee: Record<string, { completed: number; onTime: number; late: number }> = {};
  
  completedObligations.forEach(o => {
    const assignee = o.assignedTo || 'Não atribuído';
    if (!byAssignee[assignee]) {
      byAssignee[assignee] = { completed: 0, onTime: 0, late: 0 };
    }
    
    byAssignee[assignee].completed++;
    
    if (o.completedAt && o.completedAt <= o.dueDate) {
      byAssignee[assignee].onTime++;
    } else {
      byAssignee[assignee].late++;
    }
  });
  
  // Métricas por mês
  const byMonth: Record<string, { total: number; completed: number; onTime: number }> = {};
  
  obligations.forEach(o => {
    const monthKey = format(startOfMonth(o.dueDate), 'yyyy-MM');
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { total: 0, completed: 0, onTime: 0 };
    }
    
    byMonth[monthKey].total++;
    
    if (o.status === 'completed') {
      byMonth[monthKey].completed++;
      if (o.completedAt && o.completedAt <= o.dueDate) {
        byMonth[monthKey].onTime++;
      }
    }
  });
  
  return {
    completionRate,
    averageCompletionTime,
    onTimeRate,
    byAssignee,
    byMonth,
  };
}

/**
 * Calcula taxa de pontualidade por período
 */
export function getOnTimeRateByPeriod(
  obligations: Obligation[],
  startDate: Date,
  endDate: Date
): number {
  const periodObligations = obligations.filter(o => 
    o.dueDate >= startDate && o.dueDate <= endDate && o.status === 'completed'
  );
  
  if (periodObligations.length === 0) return 0;
  
  const onTime = periodObligations.filter(o => 
    o.completedAt && o.completedAt <= o.dueDate
  ).length;
  
  return (onTime / periodObligations.length) * 100;
}

/**
 * Retorna responsáveis com mais tarefas pendentes
 */
export function getTopPendingAssignees(obligations: Obligation[]): Array<{ assignee: string; count: number }> {
  const pending = obligations.filter(o => o.status === 'pending');
  const counts: Record<string, number> = {};
  
  pending.forEach(o => {
    const assignee = o.assignedTo || 'Não atribuído';
    counts[assignee] = (counts[assignee] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([assignee, count]) => ({ assignee, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

