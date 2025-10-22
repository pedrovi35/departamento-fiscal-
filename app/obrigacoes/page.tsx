'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Layout/Navigation';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Badge, getStatusLabel } from '@/components/ui/Badge';
import { RealtimeIndicator } from '@/components/RealtimeIndicator';
import { getObligations, saveObligation, updateObligationStatus, deleteObligation, getClients, getTaxes } from '@/lib/supabase/database';
import { formatDate, getRelativeDateDescription, isOverdue } from '@/lib/date-utils';
import { useRealtimeRefresh } from '@/hooks/useRealtime';
import { Plus, Filter, PlayCircle, CheckCircle, Trash2, Calendar, User } from 'lucide-react';
import type { Obligation, Client, Tax, ObligationStatus } from '@/types';

export default function ObrigacoesPage() {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState<'all' | ObligationStatus>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterTax, setFilterTax] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    taxId: '',
    clientId: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  useRealtimeRefresh('obligations', () => loadData());
  
  async function loadData() {
    try {
      setLoading(true);
      const [obligationsData, clientsData, taxesData] = await Promise.all([
        getObligations(),
        getClients(),
        getTaxes(),
      ]);
      
      // Atualiza status de atrasadas
      const updatedObligations = obligationsData.map(o => ({
        ...o,
        status: (o.status === 'pending' && isOverdue(o.dueDate)) ? 'overdue' as ObligationStatus : o.status
      }));
      
      setObligations(updatedObligations);
      setClients(clientsData);
      setTaxes(taxesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }
  
  function openCreateModal() {
    setFormData({
      taxId: taxes[0]?.id || '',
      clientId: clients[0]?.id || '',
      assignedTo: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      notes: '',
    });
    setModalOpen(true);
  }
  
  async function handleSave() {
    if (!formData.taxId || !formData.clientId || !formData.dueDate) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      const obligationData: Partial<Obligation> = {
        taxId: formData.taxId,
        clientId: formData.clientId,
        assignedTo: formData.assignedTo.trim() || undefined,
        dueDate: new Date(formData.dueDate + 'T12:00:00'),
        status: 'pending',
        priority: formData.priority,
        notes: formData.notes.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await saveObligation(obligationData);
      setModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar obrigação:', error);
      alert('Erro ao salvar obrigação');
    }
  }
  
  async function handleStartProgress(id: string) {
    try {
      await updateObligationStatus(id, 'in_progress');
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }
  
  async function handleComplete(id: string) {
    try {
      await updateObligationStatus(id, 'completed', 'Sistema');
      loadData();
    } catch (error) {
      console.error('Erro ao concluir obrigação:', error);
    }
  }
  
  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir esta obrigação?')) {
      return;
    }
    
    try {
      await deleteObligation(id);
      loadData();
    } catch (error) {
      console.error('Erro ao excluir obrigação:', error);
    }
  }
  
  // Filtragem
  const filteredObligations = obligations.filter(obligation => {
    if (filterStatus !== 'all' && obligation.status !== filterStatus) return false;
    if (filterClient !== 'all' && obligation.clientId !== filterClient) return false;
    if (filterTax !== 'all' && obligation.taxId !== filterTax) return false;
    
    if (searchTerm) {
      const client = clients.find(c => c.id === obligation.clientId);
      const tax = taxes.find(t => t.id === obligation.taxId);
      const searchLower = searchTerm.toLowerCase();
      
      return (
        client?.name.toLowerCase().includes(searchLower) ||
        tax?.name.toLowerCase().includes(searchLower) ||
        obligation.assignedTo?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Ordenação por data de vencimento
  const sortedObligations = [...filteredObligations].sort((a, b) => 
    a.dueDate.getTime() - b.dueDate.getTime()
  );
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Carregando obrigações...</p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Obrigações"
          description="Gerencie obrigações fiscais por cliente"
          action={
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Obrigação
            </Button>
          }
        />
        
        {/* Filtros */}
        <Card className="mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-700">Filtros</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'pending', label: 'Pendentes' },
                  { value: 'in_progress', label: 'Em Andamento' },
                  { value: 'completed', label: 'Concluídas' },
                  { value: 'overdue', label: 'Atrasadas' },
                ]}
                fullWidth
              />
              
              <Select
                label="Cliente"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos os clientes' },
                  ...clients.map(c => ({ value: c.id, label: c.name }))
                ]}
                fullWidth
              />
              
              <Select
                label="Imposto"
                value={filterTax}
                onChange={(e) => setFilterTax(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos os impostos' },
                  ...taxes.map(t => ({ value: t.id, label: t.name }))
                ]}
                fullWidth
              />
              
              <Input
                label="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome, cliente..."
                fullWidth
              />
            </div>
          </div>
        </Card>
        
        {/* Lista de Obrigações */}
        {sortedObligations.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma obrigação encontrada</p>
              {filterStatus === 'all' && !searchTerm && (
                <Button onClick={openCreateModal} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Obrigação
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedObligations.map((obligation) => {
              const client = clients.find(c => c.id === obligation.clientId);
              const tax = taxes.find(t => t.id === obligation.taxId);
              
              return (
                <Card key={obligation.id} className="hover:shadow-md transition-smooth">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {tax?.name || 'Imposto'}
                        </h3>
                        <Badge variant={obligation.status}>
                          {getStatusLabel(obligation.status)}
                        </Badge>
                        {obligation.priority === 'high' && (
                          <Badge variant="overdue" size="sm">Alta Prioridade</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Cliente:</span>
                          <span className="font-medium">{client?.name || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Vencimento:</span>
                          <span className="font-medium">
                            {formatDate(obligation.dueDate)} ({getRelativeDateDescription(obligation.dueDate)})
                          </span>
                        </div>
                        
                        {obligation.assignedTo && (
                          <div>
                            <span className="text-gray-600">Responsável:</span>
                            <span className="ml-2 font-medium">{obligation.assignedTo}</span>
                          </div>
                        )}
                      </div>
                      
                      {obligation.notes && (
                        <p className="mt-2 text-sm text-gray-600">{obligation.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {obligation.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStartProgress(obligation.id)}
                          title="Iniciar"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {(obligation.status === 'pending' || obligation.status === 'in_progress') && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleComplete(obligation.id)}
                          title="Concluir"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(obligation.id)}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      
      {/* Modal de Criação */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova Obrigação"
      >
        <div className="space-y-4">
          <Select
            label="Imposto"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            options={taxes.map(t => ({ value: t.id, label: t.name }))}
            required
            fullWidth
          />
          
          <Select
            label="Cliente"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            options={clients.map(c => ({ value: c.id, label: c.name }))}
            required
            fullWidth
          />
          
          <Input
            label="Data de Vencimento"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
            fullWidth
          />
          
          <Input
            label="Responsável"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            placeholder="Nome do responsável"
            fullWidth
          />
          
          <Select
            label="Prioridade"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            options={[
              { value: 'low', label: 'Baixa' },
              { value: 'medium', label: 'Média' },
              { value: 'high', label: 'Alta' },
            ]}
            fullWidth
          />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionais..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              rows={3}
            />
          </div>
        </div>
        
        <ModalFooter>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Criar Obrigação
          </Button>
        </ModalFooter>
      </Modal>
      
      <RealtimeIndicator />
    </div>
  );
}

