'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Layout/Navigation';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusLabel } from '@/components/ui/Badge';
import { RealtimeIndicator } from '@/components/RealtimeIndicator';
import { getObligations, getClients, getTaxes } from '@/lib/supabase/database';
import { formatDate } from '@/lib/date-utils';
import { useRealtimeRefresh } from '@/hooks/useRealtime';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Obligation, Client, Tax, CalendarEvent } from '@/types';

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'obligation'>('all');
  
  useEffect(() => {
    loadData();
  }, []);
  
  useRealtimeRefresh('obligations', loadData);
  
  async function loadData() {
    try {
      setLoading(true);
      const [obligationsData, clientsData, taxesData] = await Promise.all([
        getObligations(),
        getClients(),
        getTaxes(),
      ]);
      
      setObligations(obligationsData);
      setClients(clientsData);
      setTaxes(taxesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }
  
  // Converte obrigações em eventos de calendário
  const events: CalendarEvent[] = obligations.map(obligation => {
    const client = clients.find(c => c.id === obligation.clientId);
    const tax = taxes.find(t => t.id === obligation.taxId);
    
    return {
      id: obligation.id,
      title: tax?.name || 'Obrigação',
      date: obligation.dueDate,
      type: 'obligation',
      status: obligation.status,
      client: client?.name || 'N/A',
      assignedTo: obligation.assignedTo,
      priority: obligation.priority,
    };
  });
  
  // Filtra eventos do mês atual
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const eventsInMonth = events.filter(event => 
    event.date >= monthStart && event.date <= monthEnd
  );
  
  // Gera dias do calendário (incluindo dias de outros meses para completar semanas)
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Obtém eventos de um dia específico
  function getEventsForDay(day: Date) {
    return eventsInMonth.filter(event => isSameDay(event.date, day));
  }
  
  // Eventos do dia selecionado
  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];
  
  function previousMonth() {
    setCurrentDate(subMonths(currentDate, 1));
  }
  
  function nextMonth() {
    setCurrentDate(addMonths(currentDate, 1));
  }
  
  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Carregando calendário...</p>
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
          title="Calendário"
          description="Visualize todos os vencimentos de forma integrada"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendário Principal */}
          <div className="lg:col-span-3">
            <Card>
              {/* Controles do Calendário */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="ghost" onClick={previousMonth}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
                  </h2>
                  <Button size="sm" variant="ghost" onClick={nextMonth}>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
                
                <Button size="sm" onClick={goToToday}>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Hoje
                </Button>
              </div>
              
              {/* Grade do Calendário */}
              <div className="grid grid-cols-7 gap-1">
                {/* Cabeçalho dos dias da semana */}
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="text-center py-2 text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
                
                {/* Dias do mês */}
                {calendarDays.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[100px] p-2 border rounded-lg text-left transition-smooth
                        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                        ${isToday ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'}
                        ${isSelected ? 'bg-primary-50 border-primary-400' : ''}
                        hover:border-primary-300 hover:shadow-sm
                      `}
                    >
                      <div className={`
                        text-sm font-medium mb-1
                        ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                        ${isToday ? 'text-primary-600 font-bold' : ''}
                      `}>
                        {format(day, 'd')}
                      </div>
                      
                      {/* Eventos do dia */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`
                              px-1 py-0.5 rounded text-xs truncate
                              ${event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                event.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                event.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}
                            `}
                            title={`${event.title} - ${event.client}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 px-1">
                            +{dayEvents.length - 3} mais
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
          
          {/* Painel Lateral - Eventos do Dia Selecionado */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedDate ? formatDate(selectedDate) : 'Selecione uma data'}
              </h3>
              
              {selectedDate && selectedDayEvents.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  Nenhuma obrigação nesta data
                </p>
              )}
              
              {selectedDate && selectedDayEvents.length > 0 && (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-smooth"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm text-gray-900">
                          {event.title}
                        </h4>
                        <Badge variant={event.status} size="sm">
                          {getStatusLabel(event.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-1">
                        Cliente: {event.client}
                      </p>
                      
                      {event.assignedTo && (
                        <p className="text-xs text-gray-600">
                          Responsável: {event.assignedTo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            {/* Legenda */}
            <Card className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Legenda</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
                  <span>Pendente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
                  <span>Em Andamento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
                  <span>Concluída</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
                  <span>Atrasada</span>
                </div>
              </div>
            </Card>
            
            {/* Estatísticas do Mês */}
            <Card className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Estatísticas do Mês
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{eventsInMonth.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pendentes:</span>
                  <span className="font-medium text-yellow-600">
                    {eventsInMonth.filter(e => e.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Concluídas:</span>
                  <span className="font-medium text-green-600">
                    {eventsInMonth.filter(e => e.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Atrasadas:</span>
                  <span className="font-medium text-red-600">
                    {eventsInMonth.filter(e => e.status === 'overdue').length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <RealtimeIndicator />
    </div>
  );
}


