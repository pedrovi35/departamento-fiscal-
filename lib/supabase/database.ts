import { supabase } from './client';
import type { Client, Tax, Obligation, Installment, AuditLog, SavedFilter } from '@/types';

// ============ CLIENTES ============

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data || []).map(mapDbToClient);
}

export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data ? mapDbToClient(data) : null;
}

export async function saveClient(client: Partial<Client>): Promise<Client> {
  const dbClient = mapClientToDb(client);
  
  const { data, error } = await supabase
    .from('clients')
    .upsert(dbClient)
    .select()
    .single();

  if (error) throw error;
  
  // Log de auditoria
  if (client.id) {
    await createAuditLog('client', data.id, 'updated', 'Sistema');
  } else {
    await createAuditLog('client', data.id, 'created', 'Sistema');
  }
  
  return mapDbToClient(data);
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
  await createAuditLog('client', id, 'deleted', 'Sistema');
}

// ============ IMPOSTOS ============

export async function getTaxes(): Promise<Tax[]> {
  const { data, error } = await supabase
    .from('taxes')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data || []).map(mapDbToTax);
}

export async function getTaxById(id: string): Promise<Tax | null> {
  const { data, error } = await supabase
    .from('taxes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data ? mapDbToTax(data) : null;
}

export async function saveTax(tax: Partial<Tax>): Promise<Tax> {
  const dbTax = mapTaxToDb(tax);
  
  const { data, error } = await supabase
    .from('taxes')
    .upsert(dbTax)
    .select()
    .single();

  if (error) throw error;
  
  if (tax.id) {
    await createAuditLog('tax', data.id, 'updated', 'Sistema');
  } else {
    await createAuditLog('tax', data.id, 'created', 'Sistema');
  }
  
  return mapDbToTax(data);
}

export async function deleteTax(id: string): Promise<void> {
  const { error } = await supabase
    .from('taxes')
    .delete()
    .eq('id', id);

  if (error) throw error;
  await createAuditLog('tax', id, 'deleted', 'Sistema');
}

// ============ OBRIGAÇÕES ============

export async function getObligations(): Promise<Obligation[]> {
  const { data, error } = await supabase
    .from('obligations')
    .select('*')
    .order('due_date');

  if (error) throw error;
  return (data || []).map(mapDbToObligation);
}

export async function getObligationsByStatus(status: string): Promise<Obligation[]> {
  const { data, error } = await supabase
    .from('obligations')
    .select('*')
    .eq('status', status)
    .order('due_date');

  if (error) throw error;
  return (data || []).map(mapDbToObligation);
}

export async function getObligationsByClient(clientId: string): Promise<Obligation[]> {
  const { data, error } = await supabase
    .from('obligations')
    .select('*')
    .eq('client_id', clientId)
    .order('due_date');

  if (error) throw error;
  return (data || []).map(mapDbToObligation);
}

export async function saveObligation(obligation: Partial<Obligation>): Promise<Obligation> {
  const dbObligation = mapObligationToDb(obligation);
  
  const { data, error } = await supabase
    .from('obligations')
    .upsert(dbObligation)
    .select()
    .single();

  if (error) throw error;
  
  if (obligation.id) {
    await createAuditLog('obligation', data.id, 'updated', 'Sistema');
  } else {
    await createAuditLog('obligation', data.id, 'created', 'Sistema');
  }
  
  return mapDbToObligation(data);
}

export async function updateObligationStatus(
  id: string, 
  status: string, 
  completedBy?: string
): Promise<void> {
  const updates: any = { status, updated_at: new Date().toISOString() };
  
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
    updates.completed_by = completedBy || 'Sistema';
  }
  
  const { error } = await supabase
    .from('obligations')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
  await createAuditLog('obligation', id, 'status_changed', completedBy || 'Sistema', { status });
}

export async function deleteObligation(id: string): Promise<void> {
  const { error } = await supabase
    .from('obligations')
    .delete()
    .eq('id', id);

  if (error) throw error;
  await createAuditLog('obligation', id, 'deleted', 'Sistema');
}

// ============ PARCELAMENTOS ============

export async function getInstallments(): Promise<Installment[]> {
  const { data, error } = await supabase
    .from('installments')
    .select('*')
    .order('first_due_date');

  if (error) throw error;
  return (data || []).map(mapDbToInstallment);
}

export async function saveInstallment(installment: Partial<Installment>): Promise<Installment> {
  const dbInstallment = mapInstallmentToDb(installment);
  
  const { data, error } = await supabase
    .from('installments')
    .upsert(dbInstallment)
    .select()
    .single();

  if (error) throw error;
  
  if (installment.id) {
    await createAuditLog('installment', data.id, 'updated', 'Sistema');
  } else {
    await createAuditLog('installment', data.id, 'created', 'Sistema');
  }
  
  return mapDbToInstallment(data);
}

export async function deleteInstallment(id: string): Promise<void> {
  const { error } = await supabase
    .from('installments')
    .delete()
    .eq('id', id);

  if (error) throw error;
  await createAuditLog('installment', id, 'deleted', 'Sistema');
}

// ============ AUDIT LOGS ============

export async function getAuditLogs(entityType: string, entityId: string): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('timestamp', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data || []).map(mapDbToAuditLog);
}

async function createAuditLog(
  entityType: string,
  entityId: string,
  action: string,
  performedBy: string,
  changes?: any
): Promise<void> {
  await supabase
    .from('audit_logs')
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      action,
      performed_by: performedBy,
      changes,
      timestamp: new Date().toISOString(),
    });
}

// ============ FILTROS SALVOS ============

export async function getSavedFilters(module: string): Promise<SavedFilter[]> {
  const { data, error } = await supabase
    .from('saved_filters')
    .select('*')
    .eq('module', module)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbToSavedFilter);
}

export async function saveSavedFilter(filter: Partial<SavedFilter>): Promise<SavedFilter> {
  const { data, error } = await supabase
    .from('saved_filters')
    .insert({
      name: filter.name,
      module: filter.module,
      filters: filter.filters,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbToSavedFilter(data);
}

export async function deleteSavedFilter(id: string): Promise<void> {
  const { error } = await supabase
    .from('saved_filters')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ MAPPERS ============

function mapDbToClient(db: any): Client {
  return {
    id: db.id,
    name: db.name,
    cnpj: db.cnpj,
    email: db.email,
    phone: db.phone,
    active: db.active,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

function mapClientToDb(client: Partial<Client>): any {
  return {
    id: client.id,
    name: client.name,
    cnpj: client.cnpj,
    email: client.email,
    phone: client.phone,
    active: client.active ?? true,
  };
}

function mapDbToTax(db: any): Tax {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    category: db.category,
    recurrenceRule: db.recurrence_rule,
    weekendAdjust: db.weekend_adjust,
    defaultAssignee: db.default_assignee,
    autoGenerate: db.auto_generate,
    active: db.active,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

function mapTaxToDb(tax: Partial<Tax>): any {
  return {
    id: tax.id,
    name: tax.name,
    description: tax.description,
    category: tax.category,
    recurrence_rule: tax.recurrenceRule,
    weekend_adjust: tax.weekendAdjust || 'postpone',
    default_assignee: tax.defaultAssignee,
    auto_generate: tax.autoGenerate ?? true,
    active: tax.active ?? true,
  };
}

function mapDbToObligation(db: any): Obligation {
  return {
    id: db.id,
    taxId: db.tax_id,
    clientId: db.client_id,
    assignedTo: db.assigned_to,
    dueDate: new Date(db.due_date),
    status: db.status,
    priority: db.priority,
    notes: db.notes,
    completedAt: db.completed_at ? new Date(db.completed_at) : undefined,
    completedBy: db.completed_by,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

function mapObligationToDb(obligation: Partial<Obligation>): any {
  return {
    id: obligation.id,
    tax_id: obligation.taxId,
    client_id: obligation.clientId,
    assigned_to: obligation.assignedTo,
    due_date: obligation.dueDate?.toISOString(),
    status: obligation.status || 'pending',
    priority: obligation.priority || 'medium',
    notes: obligation.notes,
    completed_at: obligation.completedAt?.toISOString(),
    completed_by: obligation.completedBy,
  };
}

function mapDbToInstallment(db: any): Installment {
  return {
    id: db.id,
    taxId: db.tax_id,
    clientId: db.client_id,
    description: db.description,
    currentInstallment: db.current_installment,
    totalInstallments: db.total_installments,
    firstDueDate: new Date(db.first_due_date),
    recurrenceRule: db.recurrence_rule,
    weekendAdjust: db.weekend_adjust,
    assignedTo: db.assigned_to,
    status: db.status,
    notes: db.notes,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

function mapInstallmentToDb(installment: Partial<Installment>): any {
  return {
    id: installment.id,
    tax_id: installment.taxId,
    client_id: installment.clientId,
    description: installment.description,
    current_installment: installment.currentInstallment,
    total_installments: installment.totalInstallments,
    first_due_date: installment.firstDueDate?.toISOString(),
    recurrence_rule: installment.recurrenceRule,
    weekend_adjust: installment.weekendAdjust || 'postpone',
    assigned_to: installment.assignedTo,
    status: installment.status || 'pending',
    notes: installment.notes,
  };
}

function mapDbToAuditLog(db: any): AuditLog {
  return {
    id: db.id,
    entityType: db.entity_type,
    entityId: db.entity_id,
    action: db.action,
    performedBy: db.performed_by,
    changes: db.changes,
    timestamp: new Date(db.timestamp),
  };
}

function mapDbToSavedFilter(db: any): SavedFilter {
  return {
    id: db.id,
    name: db.name,
    module: db.module,
    filters: db.filters,
    createdAt: new Date(db.created_at),
  };
}

