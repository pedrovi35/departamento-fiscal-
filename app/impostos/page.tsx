'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Layout/Navigation';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { RealtimeIndicator } from '@/components/RealtimeIndicator';
import { getTaxes, saveTax, deleteTax } from '@/lib/supabase/database';
import { getRecurrenceDescription } from '@/lib/recurrence-utils';
import { useRealtimeRefresh } from '@/hooks/useRealtime';
import { Plus, Edit2, Trash2, Filter, Tag } from 'lucide-react';
import type { Tax, RecurrenceType, RecurrenceRule, WeekendAdjustRule } from '@/types';

export default function ImpostosPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Federal',
    recurrenceType: 'monthly' as RecurrenceType,
    dayOfMonth: 15,
    customDays: [] as number[],
    interval: 30,
    months: [] as number[],
    weekendAdjust: 'postpone' as WeekendAdjustRule,
    defaultAssignee: '',
    autoGenerate: true,
  });
  
  useEffect(() => {
    loadTaxes();
  }, []);
  
  useRealtimeRefresh('taxes', loadTaxes);
  
  async function loadTaxes() {
    try {
      const data = await getTaxes();
      setTaxes(data);
    } catch (error) {
      console.error('Erro ao carregar impostos:', error);
    } finally {
      setLoading(false);
    }
  }
  
  function openCreateModal() {
    setEditingTax(null);
    setFormData({
      name: '',
      description: '',
      category: 'Federal',
      recurrenceType: 'monthly',
      dayOfMonth: 15,
      customDays: [],
      interval: 30,
      months: [],
      weekendAdjust: 'postpone',
      defaultAssignee: '',
      autoGenerate: true,
    });
    setModalOpen(true);
  }
  
  function openEditModal(tax: Tax) {
    setEditingTax(tax);
    setFormData({
      name: tax.name,
      description: tax.description || '',
      category: tax.category,
      recurrenceType: tax.recurrenceRule.type,
      dayOfMonth: tax.recurrenceRule.dayOfMonth || 15,
      customDays: tax.recurrenceRule.customDays || [],
      interval: tax.recurrenceRule.interval || 30,
      months: tax.recurrenceRule.months || [],
      weekendAdjust: tax.weekendAdjust,
      defaultAssignee: tax.defaultAssignee || '',
      autoGenerate: tax.autoGenerate,
    });
    setModalOpen(true);
  }
  
  async function handleSave() {
    if (!formData.name.trim()) {
      alert('Nome do imposto é obrigatório');
      return;
    }
    
    try {
      const recurrenceRule: RecurrenceRule = {
        type: formData.recurrenceType,
        dayOfMonth: formData.dayOfMonth,
        customDays: formData.customDays,
        interval: formData.interval,
        months: formData.months,
      };
      
      const taxData: Partial<Tax> = {
        id: editingTax?.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        recurrenceRule,
        weekendAdjust: formData.weekendAdjust,
        defaultAssignee: formData.defaultAssignee.trim() || undefined,
        autoGenerate: formData.autoGenerate,
        active: true,
        createdAt: editingTax?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      
      await saveTax(taxData);
      setModalOpen(false);
      loadTaxes();
    } catch (error) {
      console.error('Erro ao salvar imposto:', error);
      alert('Erro ao salvar imposto');
    }
  }
  
  async function handleDelete(tax: Tax) {
    if (!confirm(`Deseja realmente excluir o imposto "${tax.name}"?`)) {
      return;
    }
    
    try {
      await deleteTax(tax.id);
      loadTaxes();
    } catch (error) {
      console.error('Erro ao excluir imposto:', error);
      alert('Erro ao excluir imposto');
    }
  }
  
  const filteredTaxes = taxes.filter(tax => {
    if (filterStatus === 'active') return tax.active;
    if (filterStatus === 'inactive') return !tax.active;
    return true;
  });
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Carregando impostos...</p>
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
          title="Impostos"
          description="Cadastre e gerencie impostos e tributos"
          action={
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Imposto
            </Button>
          }
        />
        
        {/* Filtros */}
        <Card className="mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'primary' : 'ghost'}
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'active' ? 'primary' : 'ghost'}
                onClick={() => setFilterStatus('active')}
              >
                Ativos
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'inactive' ? 'primary' : 'ghost'}
                onClick={() => setFilterStatus('inactive')}
              >
                Inativos
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Lista de Impostos */}
        {filteredTaxes.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum imposto cadastrado</p>
              <Button onClick={openCreateModal} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Imposto
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTaxes.map((tax) => (
              <Card key={tax.id} className="hover:shadow-md transition-smooth">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Tag className="w-5 h-5 text-primary-600" />
                      <CardTitle className="!mb-0">{tax.name}</CardTitle>
                      <Badge variant={tax.active ? 'default' : 'overdue'} size="sm">
                        {tax.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {tax.autoGenerate && (
                        <Badge variant="completed" size="sm">
                          Auto-gerar
                        </Badge>
                      )}
                    </div>
                    
                    {tax.description && (
                      <p className="text-sm text-gray-600 mb-3">{tax.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Categoria:</span>
                        <span className="ml-2 font-medium">{tax.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Recorrência:</span>
                        <span className="ml-2 font-medium">
                          {getRecurrenceDescription(tax.recurrenceRule)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Ajuste fim de semana:</span>
                        <span className="ml-2 font-medium">
                          {tax.weekendAdjust === 'postpone' ? 'Postergar' : 
                           tax.weekendAdjust === 'anticipate' ? 'Antecipar' : 'Manter'}
                        </span>
                      </div>
                    </div>
                    
                    {tax.defaultAssignee && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Responsável padrão:</span>
                        <span className="ml-2 font-medium">{tax.defaultAssignee}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openEditModal(tax)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(tax)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      {/* Modal de Criação/Edição */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTax ? 'Editar Imposto' : 'Novo Imposto'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nome do Imposto"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: DARF Mensal"
            required
            fullWidth
          />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o imposto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              rows={3}
            />
          </div>
          
          <Select
            label="Categoria"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[
              { value: 'Federal', label: 'Federal' },
              { value: 'Estadual', label: 'Estadual' },
              { value: 'Municipal', label: 'Municipal' },
            ]}
            fullWidth
          />
          
          <Select
            label="Tipo de Recorrência"
            value={formData.recurrenceType}
            onChange={(e) => setFormData({ ...formData, recurrenceType: e.target.value as RecurrenceType })}
            options={[
              { value: 'monthly', label: 'Mensal' },
              { value: 'quarterly', label: 'Trimestral' },
              { value: 'custom', label: 'Customizado' },
              { value: 'none', label: 'Sem recorrência' },
            ]}
            fullWidth
          />
          
          {(formData.recurrenceType === 'monthly' || formData.recurrenceType === 'quarterly') && (
            <Input
              label="Dia do Mês"
              type="number"
              min={1}
              max={31}
              value={formData.dayOfMonth}
              onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) || 1 })}
              fullWidth
            />
          )}
          
          {formData.recurrenceType === 'custom' && (
            <Input
              label="Intervalo (dias)"
              type="number"
              min={1}
              value={formData.interval}
              onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) || 30 })}
              fullWidth
            />
          )}
          
          <Select
            label="Ajuste Fim de Semana"
            value={formData.weekendAdjust}
            onChange={(e) => setFormData({ ...formData, weekendAdjust: e.target.value as WeekendAdjustRule })}
            options={[
              { value: 'postpone', label: 'Postergar (próximo dia útil)' },
              { value: 'anticipate', label: 'Antecipar (dia útil anterior)' },
              { value: 'keep', label: 'Manter data original' },
            ]}
            fullWidth
          />
          
          <Input
            label="Responsável Padrão"
            value={formData.defaultAssignee}
            onChange={(e) => setFormData({ ...formData, defaultAssignee: e.target.value })}
            placeholder="Nome do responsável"
            fullWidth
          />
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoGenerate}
              onChange={(e) => setFormData({ ...formData, autoGenerate: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              Gerar automaticamente próximas ocorrências
            </span>
          </label>
        </div>
        
        <ModalFooter>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editingTax ? 'Salvar Alterações' : 'Criar Imposto'}
          </Button>
        </ModalFooter>
      </Modal>
      
      <RealtimeIndicator />
    </div>
  );
}


