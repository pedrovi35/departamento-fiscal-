'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Layout/Navigation';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { RealtimeIndicator } from '@/components/RealtimeIndicator';
import { getClients, saveClient, deleteClient } from '@/lib/supabase/database';
import { useRealtimeRefresh } from '@/hooks/useRealtime';
import { Plus, Search, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import type { Client } from '@/types';

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
  });
  
  useEffect(() => {
    loadClients();
  }, []);
  
  useRealtimeRefresh('clients', loadClients);
  
  async function loadClients() {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  }
  
  function openCreateModal() {
    setEditingClient(null);
    setFormData({ name: '', cnpj: '', email: '', phone: '' });
    setModalOpen(true);
  }
  
  function openEditModal(client: Client) {
    setEditingClient(client);
    setFormData({
      name: client.name,
      cnpj: client.cnpj || '',
      email: client.email || '',
      phone: client.phone || '',
    });
    setModalOpen(true);
  }
  
  async function handleSave() {
    if (!formData.name.trim()) {
      alert('Nome do cliente é obrigatório');
      return;
    }
    
    try {
      const clientData: Partial<Client> = {
        id: editingClient?.id,
        name: formData.name.trim(),
        cnpj: formData.cnpj.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        active: true,
        createdAt: editingClient?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      
      await saveClient(clientData);
      setModalOpen(false);
      loadClients();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente');
    }
  }
  
  async function handleDelete(client: Client) {
    if (!confirm(`Deseja realmente excluir o cliente "${client.name}"?`)) {
      return;
    }
    
    try {
      await deleteClient(client.id);
      loadClients();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente');
    }
  }
  
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Carregando clientes...</p>
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
          title="Clientes"
          description="Gerencie os clientes da contabilidade"
          action={
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          }
        />
        
        {/* Busca */}
        <Card className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 text-gray-900"
            />
          </div>
        </Card>
        
        {/* Lista de Clientes */}
        {filteredClients.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </p>
              {!searchTerm && (
                <Button onClick={openCreateModal} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Cliente
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-smooth">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {client.name}
                    </h3>
                    
                    {client.cnpj && (
                      <p className="text-sm text-gray-600 mb-1">
                        CNPJ: {client.cnpj}
                      </p>
                    )}
                    
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openEditModal(client)}
                      className="flex-1"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(client)}
                    >
                      <Trash2 className="w-3 h-3" />
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
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <div className="space-y-4">
          <Input
            label="Nome do Cliente"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Empresa ABC Ltda"
            required
            fullWidth
          />
          
          <Input
            label="CNPJ"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
            fullWidth
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contato@empresa.com"
            fullWidth
          />
          
          <Input
            label="Telefone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(00) 00000-0000"
            fullWidth
          />
        </div>
        
        <ModalFooter>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editingClient ? 'Salvar Alterações' : 'Criar Cliente'}
          </Button>
        </ModalFooter>
      </Modal>
      
      <RealtimeIndicator />
    </div>
  );
}


