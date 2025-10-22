'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Layout/Navigation';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { RealtimeIndicator } from '@/components/RealtimeIndicator';
import { getObligations } from '@/lib/supabase/database';
import { calculateProductivityMetrics, getTopPendingAssignees } from '@/lib/metrics';
import { BarChart3, TrendingUp, Clock, Target, Users } from 'lucide-react';
import type { Obligation, ProductivityMetrics } from '@/types';

export default function RelatoriosPage() {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  async function loadData() {
    try {
      setLoading(true);
      const obligationsData = await getObligations();
      setObligations(obligationsData);
      
      const metricsData = calculateProductivityMetrics(obligationsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  }
  
  const topPending = getTopPendingAssignees(obligations);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Carregando relatórios...</p>
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
          title="Relatórios"
          description="Análises e métricas de produtividade"
        />
        
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.completionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.averageCompletionTime.toFixed(1)} dias
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Pontualidade</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.onTimeRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Obrigações</p>
                <p className="text-2xl font-bold text-gray-900">
                  {obligations.length}
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Desempenho por Responsável */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                <CardTitle>Desempenho por Responsável</CardTitle>
              </div>
            </CardHeader>
            
            {metrics && Object.keys(metrics.byAssignee).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(metrics.byAssignee).map(([assignee, data]) => {
                  const total = data.completed;
                  const onTimePercentage = total > 0 ? (data.onTime / total) * 100 : 0;
                  
                  return (
                    <div key={assignee}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{assignee}</span>
                        <span className="text-sm text-gray-600">
                          {data.completed} concluídas
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${onTimePercentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-[60px] text-right">
                          {onTimePercentage.toFixed(0)}% no prazo
                        </span>
                      </div>
                      
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>No prazo: {data.onTime}</span>
                        <span>Atrasadas: {data.late}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum dado disponível
              </p>
            )}
          </Card>
          
          {/* Responsáveis com Mais Pendências */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" />
                <CardTitle>Mais Pendências</CardTitle>
              </div>
            </CardHeader>
            
            {topPending.length > 0 ? (
              <div className="space-y-3">
                {topPending.map((item, index) => (
                  <div
                    key={item.assignee}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full font-semibold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">
                        {item.assignee}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhuma pendência no momento
              </p>
            )}
          </Card>
          
          {/* Desempenho Mensal */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                <CardTitle>Desempenho Mensal</CardTitle>
              </div>
            </CardHeader>
            
            {metrics && Object.keys(metrics.byMonth).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(metrics.byMonth)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 6)
                  .map(([month, data]) => {
                    const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
                    const onTimeRate = data.completed > 0 ? (data.onTime / data.completed) * 100 : 0;
                    
                    return (
                      <div key={month}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">
                            {new Date(month + '-01').toLocaleDateString('pt-BR', { 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </span>
                          <span className="text-sm text-gray-600">
                            {data.completed} de {data.total} concluídas
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              Taxa de Conclusão
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {completionRate.toFixed(0)}%
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              Taxa de Pontualidade
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${onTimeRate}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {onTimeRate.toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum dado mensal disponível
              </p>
            )}
          </Card>
        </div>
      </main>
      
      <RealtimeIndicator />
    </div>
  );
}

