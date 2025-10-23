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
