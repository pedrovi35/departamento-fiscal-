import { addMonths, addDays, setDate } from 'date-fns';
import type { RecurrenceRule, RecurrenceType } from '@/types';
import { adjustForWeekendsAndHolidays } from './date-utils';

/**
 * Gera a próxima data de vencimento baseada na regra de recorrência
 */
export async function getNextDueDate(
  currentDate: Date,
  rule: RecurrenceRule,
  weekendAdjust: 'postpone' | 'anticipate' | 'keep' = 'postpone'
): Promise<Date> {
  let nextDate: Date;

  switch (rule.type) {
    case 'monthly':
      nextDate = addMonths(currentDate, 1);
      if (rule.dayOfMonth) {
        nextDate = setDate(nextDate, rule.dayOfMonth);
      }
      break;

    case 'quarterly':
      nextDate = addMonths(currentDate, 3);
      if (rule.dayOfMonth) {
        nextDate = setDate(nextDate, rule.dayOfMonth);
      }
      break;

    case 'custom':
      if (rule.interval) {
        nextDate = addDays(currentDate, rule.interval);
      } else {
        // Se tiver meses específicos, encontra o próximo mês válido
        nextDate = addMonths(currentDate, 1);
        if (rule.months && rule.months.length > 0) {
          while (!rule.months.includes(nextDate.getMonth() + 1)) {
            nextDate = addMonths(nextDate, 1);
          }
        }
        if (rule.dayOfMonth) {
          nextDate = setDate(nextDate, rule.dayOfMonth);
        }
      }
      break;

    case 'none':
    default:
      return currentDate;
  }

  // Ajusta para fins de semana e feriados
  return await adjustForWeekendsAndHolidays(nextDate, weekendAdjust);
}

/**
 * Retorna descrição legível da regra de recorrência
 */
export function getRecurrenceDescription(rule: RecurrenceRule): string {
  switch (rule.type) {
    case 'monthly':
      if (rule.dayOfMonth) {
        return `Mensal - Todo dia ${rule.dayOfMonth}`;
      }
      return 'Mensal';

    case 'quarterly':
      if (rule.dayOfMonth) {
        return `Trimestral - Dia ${rule.dayOfMonth} dos meses ${getQuarterlyMonths(rule).join(', ')}`;
      }
      return 'Trimestral';

    case 'custom':
      if (rule.interval) {
        return `A cada ${rule.interval} dias`;
      }
      if (rule.customDays && rule.customDays.length > 0) {
        return `Dias ${rule.customDays.join(', ')} do mês`;
      }
      if (rule.months && rule.months.length > 0) {
        const monthNames = rule.months.map(m => getMonthName(m)).join(', ');
        return `Meses: ${monthNames}${rule.dayOfMonth ? ` - dia ${rule.dayOfMonth}` : ''}`;
      }
      return 'Recorrência customizada';

    case 'none':
    default:
      return 'Sem recorrência';
  }
}

/**
 * Retorna os meses de uma recorrência trimestral
 */
function getQuarterlyMonths(rule: RecurrenceRule): number[] {
  if (rule.months && rule.months.length > 0) {
    return rule.months;
  }
  // Padrão: janeiro, abril, julho, outubro
  return [1, 4, 7, 10];
}

/**
 * Retorna nome do mês
 */
function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month - 1] || '';
}

/**
 * Valida se uma regra de recorrência está correta
 */
export function validateRecurrenceRule(rule: RecurrenceRule): { valid: boolean; error?: string } {
  if (!rule.type) {
    return { valid: false, error: 'Tipo de recorrência é obrigatório' };
  }

  if (rule.type === 'monthly' || rule.type === 'quarterly') {
    if (rule.dayOfMonth && (rule.dayOfMonth < 1 || rule.dayOfMonth > 31)) {
      return { valid: false, error: 'Dia do mês deve estar entre 1 e 31' };
    }
  }

  if (rule.type === 'custom') {
    if (!rule.interval && !rule.customDays && !rule.months) {
      return { valid: false, error: 'Recorrência customizada requer intervalo, dias ou meses específicos' };
    }
  }

  return { valid: true };
}

/**
 * Gera múltiplas datas futuras baseadas na regra de recorrência
 */
export async function generateFutureDates(
  startDate: Date,
  rule: RecurrenceRule,
  weekendAdjust: 'postpone' | 'anticipate' | 'keep',
  count: number = 12
): Promise<Date[]> {
  const dates: Date[] = [];
  let currentDate = startDate;

  for (let i = 0; i < count; i++) {
    currentDate = await getNextDueDate(currentDate, rule, weekendAdjust);
    dates.push(currentDate);
  }

  return dates;
}

