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
import { getInstallments, saveInstallment, deleteInstallment, getClients, getTaxes } from '@/lib/supabase/database';
import { formatDate } from '@/lib/date-utils';
import { useRealtimeRefresh } from '@/hooks/useRealtime';
import { Plus, Trash2, DollarSign, Calendar } from 'lucide-react';
import type { Installment, Client, Tax } from '@/types';

export default function ParcelamentosPage() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    taxId: '',
    clientId: '',
    currentInstallment: 1,
    totalInstallments: 12,
    firstDueDate: '',
    assignedTo: '',
    notes: '',
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  useRealtimeRefresh('installments', loadData);
  
  async function loadData() {
    try {
      setLoading(true);
      const [installmentsData, clientsData, taxesData] = await Promise.all([
        getInstallments(),
        getClients(),
        getTaxes(),
      ]);
      
      setInstallments(installmentsData);
      setClients(clientsData);
      setTaxes(taxesData);
    } catch (error) {
      console.error('Erro ao carregar parcelamentos:', error);
    } finally {
      setLoading(false);
    }
  }
  
  function openCreateModal() {
    setFormData({
      description: '',
      taxId: taxes[0]?.id || '',
      clientId: clients[0]?.id || '',
      currentInstallment: 1,
      totalInstallments: 12,
      firstDueDate: new Date().toISOString().split('T')[0],
      assignedTo: '',
      notes: '',
    });
    setModalOpen(true);
  }
  
  async function handleSave() {
    if (!formData.description || !formData.clientId || !formData.firstDueDate) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      const installmentData: Partial<Installment> = {
        description: formData.description.trim(),
        taxId: formData.taxId || undefined,
        clientId: formData.clientId,
        currentInstallment: formData.currentInstallment,
        totalInstallments: formData.totalInstallments,
        firstDueDate: new Date(formData.firstDueDate + 'T12:00:00'),
        recurrenceRule: { type: 'monthly', dayOfMonth: new Date(formData.firstDueDate).getDate() },
        weekendAdjust: 'postpone',
        assignedTo: formData.assignedTo.trim() || undefined,
        status: 'pending',
        notes: formData.notes.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await saveInstallment(installmentData);
      setModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar parcelamento:', error);
      alert('Erro ao salvar parcelamento');
    }
  }
  
  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir este parcelamento?')) {
      return;
    }
    
    try {
      await deleteInstallment(id);
      loadData();
    } catch (error) {
      console.error('Erro ao excluir parcelamento:', error);
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Carregando parcelamentos...</p>
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
          title="Parcelamentos"
          description="Controle parcelamentos de impostos e obrigações"
          action={
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Parcelamento
            </Button>
          }
        />
        
        {installments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum parcelamento cadastrado</p>
              <Button onClick={openCreateModal} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Parcelamento
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {installments.map((installment) => {
              const client = clients.find(c => c.id === installment.clientId);
              const tax = taxes.find(t => t.id === installment.taxId);
              const progress = (installment.currentInstallment / installment.totalInstallments) * 100;
              
              return (
                <Card key={installment.id} className="hover:shadow-md transition-smooth">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <DollarSign className="w-5 h-5 text-primary-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {installment.description}
                        </h3>
                        <Badge variant={installment.status}>
                          {getStatusLabel(installment.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Cliente:</span>
                          <p className="font-medium">{client?.name || 'N/A'}</p>
                        </div>
                        
                        {tax && (
                          <div>
                            <span className="text-sm text-gray-600">Imposto:</span>
                            <p className="font-medium">{tax.name}</p>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-sm text-gray-600">Parcelas:</span>
                          <p className="font-medium">
                            {installment.currentInstallment} de {installment.totalInstallments}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-600">Primeira parcela:</span>
                            <p className="font-medium">{formatDate(installment.firstDueDate)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Barra de Progresso */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progresso</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-600 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      
                      {installment.assignedTo && (
                        <div className="text-sm">
                          <span className="text-gray-600">Responsável:</span>
                          <span className="ml-2 font-medium">{installment.assignedTo}</span>
                        </div>
                      )}
                      
                      {installment.notes && (
                        <p className="mt-2 text-sm text-gray-600">{installment.notes}</p>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(installment.id)}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
        title="Novo Parcelamento"
      >
        <div className="space-y-4">
          <Input
            label="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ex: Parcelamento IRPJ 2024"
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
          
          <Select
            label="Imposto (opcional)"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            options={[
              { value: '', label: 'Nenhum' },
              ...taxes.map(t => ({ value: t.id, label: t.name }))
            ]}
            fullWidth
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Parcela Atual"
              type="number"
              min={1}
              value={formData.currentInstallment}
              onChange={(e) => setFormData({ ...formData, currentInstallment: parseInt(e.target.value) || 1 })}
              required
              fullWidth
            />
            
            <Input
              label="Total de Parcelas"
              type="number"
              min={1}
              value={formData.totalInstallments}
              onChange={(e) => setFormData({ ...formData, totalInstallments: parseInt(e.target.value) || 1 })}
              required
              fullWidth
            />
          </div>
          
          <Input
            label="Data da Primeira Parcela"
            type="date"
            value={formData.firstDueDate}
            onChange={(e) => setFormData({ ...formData, firstDueDate: e.target.value })}
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
            Criar Parcelamento
          </Button>
        </ModalFooter>
      </Modal>
      
      <RealtimeIndicator />
    </div>
  );
}

