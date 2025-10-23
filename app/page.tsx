'use client';

import { Navigation } from '@/components/Layout/Navigation';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AlertCircle, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Dashboard" 
          description="Visão geral do sistema de controle fiscal"
          action={<ThemeToggle />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Estatísticas básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Clientes
              </CardTitle>
            </CardHeader>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              0
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total de clientes cadastrados
            </p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                Obrigações Pendentes
              </CardTitle>
            </CardHeader>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              0
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aguardando processamento
            </p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                Esta Semana
              </CardTitle>
            </CardHeader>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              0
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vencimentos próximos
            </p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                Concluídas
              </CardTitle>
            </CardHeader>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              0
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Obrigações finalizadas
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Obrigações Críticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                Obrigações Críticas
              </CardTitle>
            </CardHeader>
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhuma obrigação crítica encontrada
              </p>
            </div>
          </Card>

          {/* Obrigações da Semana */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                Vencimentos Esta Semana
              </CardTitle>
            </CardHeader>
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum vencimento esta semana
              </p>
            </div>
          </Card>
        </div>

        {/* Mensagem de boas-vindas */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              Bem-vindo ao Controle Fiscal
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Sistema de gerenciamento de prazos fiscais, obrigações e impostos.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Clientes
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Gerencie seus clientes e suas obrigações fiscais
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Impostos
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Configure impostos e suas regras de recorrência
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Obrigações
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Acompanhe prazos e status das obrigações
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <PageHeader
            title="Dashboard"
            description="Visão geral do status das obrigações fiscais"
          />
          <ThemeToggle />
        </div>
        
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clientes Ativos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.activeClients || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.pendingObligations || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Concluídas (mês)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.completedThisMonth || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Atrasadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.overdueObligations || 0}</p>
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
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhuma obrigação crítica no momento 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {criticalObligations.slice(0, 5).map((obligation) => (
                  <div
                    key={obligation.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-smooth"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {obligation.tax?.name || 'Imposto'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {obligation.client?.name || 'Cliente'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
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
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhuma obrigação vencendo esta semana
              </p>
            ) : (
              <div className="space-y-3">
                {weekObligations.slice(0, 5).map((obligation) => (
                  <div
                    key={obligation.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-smooth"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {obligation.tax?.name || 'Imposto'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {obligation.client?.name || 'Cliente'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          {formatDate(obligation.dueDate)}
                        </p>
                      </div>
                      {obligation.assignedTo && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
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

