'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Layout/Navigation';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, getStatusLabel } from '@/components/ui/Badge';
import { RealtimeIndicator } from '@/components/RealtimeIndicator';
import { getClients, getObligations, getTaxes } from '@/lib/supabase/database';
import { calculateDashboardStats, getObligationsWithDetails, getCriticalObligations, getThisWeekObligations } from '@/lib/dashboard-utils';
import { formatDate, getRelativeDateDescription } from '@/lib/date-utils';
import { AlertCircle, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';
import type { Client, Obligation, Tax, DashboardStats } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [criticalObligations, setCriticalObligations] = useState<any[]>([]);
  const [weekObligations, setWeekObligations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  async function loadData() {
    try {
      setLoading(true);
      const [clients, obligations, taxes] = await Promise.all([
        getClients(),
        getObligations(),
        getTaxes(),
      ]);
      
      const stats = calculateDashboardStats(clients, obligations);
      setStats(stats);
      
      const obligationsWithDetails = getObligationsWithDetails(obligations, clients, taxes);
      setCriticalObligations(getCriticalObligations(obligationsWithDetails));
      setWeekObligations(getThisWeekObligations(obligationsWithDetails));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
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
          title="Dashboard"
          description="Visão geral do status das obrigações fiscais"
        />
        
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeClients || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingObligations || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Concluídas (mês)</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completedThisMonth || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.overdueObligations || 0}</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Obrigações Críticas */}
          <Card>
            <CardHeader>
              <CardTitle>Obrigações Críticas</CardTitle>
            </CardHeader>
            
            {criticalObligations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma obrigação crítica no momento 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {criticalObligations.slice(0, 5).map((obligation) => (
                  <div
                    key={obligation.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-smooth"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {obligation.tax?.name || 'Imposto'}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {obligation.client?.name || 'Cliente'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {getRelativeDateDescription(obligation.dueDate)}
                        </p>
                      </div>
                      <Badge variant={obligation.status}>
                        {getStatusLabel(obligation.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          {/* Vencimentos da Semana */}
          <Card>
            <CardHeader>
              <CardTitle>Vencimentos da Semana</CardTitle>
            </CardHeader>
            
            {weekObligations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma obrigação vencendo esta semana
              </p>
            ) : (
              <div className="space-y-3">
                {weekObligations.slice(0, 5).map((obligation) => (
                  <div
                    key={obligation.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-smooth"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {obligation.tax?.name || 'Imposto'}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {obligation.client?.name || 'Cliente'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(obligation.dueDate)}
                        </p>
                      </div>
                      {obligation.assignedTo && (
                        <span className="text-xs text-gray-500">
                          {obligation.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
      
      <RealtimeIndicator />
    </div>
  );
}

