import { format, isWeekend, addDays, subDays, startOfMonth, endOfMonth, isBefore, isAfter, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { WeekendAdjustRule } from '@/types';

/**
 * Ajusta uma data se cair em fim de semana
 */
export function adjustForWeekend(date: Date, rule: WeekendAdjustRule = 'postpone'): Date {
  if (rule === 'keep' || !isWeekend(date)) {
    return date;
  }

  const day = date.getDay();
  
  if (rule === 'postpone') {
    // Se sábado (6), adiciona 2 dias; se domingo (0), adiciona 1 dia
    const daysToAdd = day === 6 ? 2 : 1;
    return addDays(date, daysToAdd);
  } else {
    // 'anticipate': move para sexta-feira anterior
    const daysToSubtract = day === 0 ? 2 : 1;
    return subDays(date, daysToSubtract);
  }
}

/**
 * Verifica se uma data está atrasada (antes de hoje)
 */
export function isOverdue(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return isBefore(compareDate, today);
}

/**
 * Verifica se uma data é hoje
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
}

/**
 * Verifica se uma data está na semana atual
 */
export function isThisWeek(date: Date): boolean {
  const today = new Date();
  const weekFromNow = addDays(today, 7);
  return !isBefore(date, today) && isBefore(date, weekFromNow);
}

/**
 * Formata uma data para exibição
 */
export function formatDate(date: Date, formatStr: string = 'dd/MM/yyyy'): string {
  return format(date, formatStr, { locale: ptBR });
}

/**
 * Formata uma data e hora
 */
export function formatDateTime(date: Date): string {
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/**
 * Calcula diferença em dias entre duas datas
 */
export function daysBetween(date1: Date, date2: Date): number {
  return differenceInDays(date2, date1);
}

/**
 * Retorna o primeiro e último dia do mês
 */
export function getMonthBounds(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

/**
 * Verifica se uma data é feriado (cache local)
 */
let holidaysCache: Date[] = [];
let holidaysCacheYear: number | null = null;

export async function isHoliday(date: Date): Promise<boolean> {
  const year = date.getFullYear();
  
  // Atualiza cache se necessário
  if (holidaysCacheYear !== year) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOLIDAYS_API_URL || 'https://brasilapi.com.br/api/feriados/v1'}/${year}`);
      if (response.ok) {
        const holidays = await response.json();
        holidaysCache = holidays.map((h: any) => new Date(h.date + 'T00:00:00'));
        holidaysCacheYear = year;
      }
    } catch (error) {
      console.error('Erro ao buscar feriados:', error);
    }
  }
  
  return holidaysCache.some(holiday => 
    format(holiday, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  );
}

/**
 * Ajusta data considerando fins de semana E feriados
 */
export async function adjustForWeekendsAndHolidays(
  date: Date, 
  rule: WeekendAdjustRule = 'postpone'
): Promise<Date> {
  let adjustedDate = adjustForWeekend(date, rule);
  
  // Verifica feriados e ajusta se necessário
  let attempts = 0;
  while (attempts < 10 && await isHoliday(adjustedDate)) {
    adjustedDate = rule === 'anticipate' 
      ? subDays(adjustedDate, 1)
      : addDays(adjustedDate, 1);
    adjustedDate = adjustForWeekend(adjustedDate, rule);
    attempts++;
  }
  
  return adjustedDate;
}

/**
 * Retorna descrição relativa da data (ex: "Hoje", "Amanhã", "Em 3 dias")
 */
export function getRelativeDateDescription(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  const days = differenceInDays(compareDate, today);
  
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  if (days === -1) return 'Ontem';
  if (days > 0 && days <= 7) return `Em ${days} dias`;
  if (days < 0 && days >= -7) return `Há ${Math.abs(days)} dias`;
  
  return formatDate(date);
}



