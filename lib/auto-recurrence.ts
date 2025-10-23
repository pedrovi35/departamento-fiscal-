import { getObligations, getTaxes, saveObligation } from './supabase/database';
import { getNextDueDate } from './recurrence-utils';
import { startOfMonth, format } from 'date-fns';
import type { Obligation, Tax } from '@/types';

/**
 * Verifica e gera recorrências automáticas
 * Deve ser executado diariamente (idealmente no primeiro dia do mês)
 */
export async function checkAndGenerateRecurrences(): Promise<void> {
  console.log('Iniciando verificação de recorrências automáticas...');
  
  const now = new Date();
  const isFirstDayOfMonth = now.getDate() === 1;
  
  if (!isFirstDayOfMonth) {
    console.log('Não é o primeiro dia do mês. Pulando geração automática.');
    return;
  }
  
  try {
    const [obligations, taxes] = await Promise.all([
      getObligations(),
      getTaxes()
    ]);
    
    // Filtra impostos com auto_generate ativo
    const autoGenerateTaxes = taxes.filter(t => t.autoGenerate && t.active);
    
    console.log(`Encontrados ${autoGenerateTaxes.length} impostos com geração automática ativa`);
    
    for (const tax of autoGenerateTaxes) {
      await generateRecurrencesForTax(tax, obligations);
    }
    
    console.log('Verificação de recorrências concluída.');
  } catch (error) {
    console.error('Erro ao gerar recorrências:', error);
  }
}

/**
 * Gera recorrências para um imposto específico
 */
async function generateRecurrencesForTax(tax: Tax, obligations: Obligation[]): Promise<void> {
  // Agrupa obrigações por cliente para este imposto
  const obligationsByClient = obligations
    .filter(o => o.taxId === tax.id)
    .reduce((acc, o) => {
      if (!acc[o.clientId]) {
        acc[o.clientId] = [];
      }
      acc[o.clientId].push(o);
      return acc;
    }, {} as Record<string, Obligation[]>);
  
  // Para cada cliente que já tem obrigações deste imposto
  for (const [clientId, clientObligations] of Object.entries(obligationsByClient)) {
    // Encontra a última obrigação
    const lastObligation = clientObligations
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())[0];
    
    // Verifica se já existe uma obrigação futura
    const hasNextObligation = clientObligations.some(o => 
      o.dueDate > new Date() && o.status === 'pending'
    );
    
    if (!hasNextObligation) {
      // Gera próxima ocorrência
      const nextDueDate = await getNextDueDate(
        lastObligation.dueDate,
        tax.recurrenceRule,
        tax.weekendAdjust
      );
      
      // Verifica se a próxima data não é muito no passado (margem de 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (nextDueDate >= thirtyDaysAgo) {
        const newObligation: Partial<Obligation> = {
          taxId: tax.id,
          clientId: clientId,
          assignedTo: lastObligation.assignedTo || tax.defaultAssignee,
          dueDate: nextDueDate,
          status: 'pending',
          priority: lastObligation.priority || 'medium',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await saveObligation(newObligation);
        console.log(`Gerada nova obrigação: ${tax.name} para cliente ${clientId} em ${format(nextDueDate, 'dd/MM/yyyy')}`);
      }
    }
  }
}

/**
 * Gera múltiplas ocorrências futuras de uma obrigação
 * Útil para criar várias ocorrências de uma vez
 */
export async function generateFutureOccurrences(
  obligation: Obligation,
  tax: Tax,
  count: number = 12
): Promise<Obligation[]> {
  const generated: Obligation[] = [];
  let currentDate = obligation.dueDate;
  
  for (let i = 0; i < count; i++) {
    currentDate = await getNextDueDate(
      currentDate,
      tax.recurrenceRule,
      tax.weekendAdjust
    );
    
    const newObligation: Partial<Obligation> = {
      taxId: obligation.taxId,
      clientId: obligation.clientId,
      assignedTo: obligation.assignedTo,
      dueDate: currentDate,
      status: 'pending',
      priority: obligation.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const saved = await saveObligation(newObligation);
    generated.push(saved);
  }
  
  return generated;
}


