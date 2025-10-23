# 🗄️ Schema Completo do Banco de Dados - Controle Fiscal v2.0

Este documento descreve o schema completo do PostgreSQL para o Supabase, incluindo todas as funcionalidades do sistema com modo escuro e melhorias.

## 📋 Visão Geral

O schema foi completamente redesenhado para incluir:
- ✅ **Modo Escuro Persistente** - Configurações salvas no banco
- ✅ **Auditoria Avançada** - Logs completos de todas as operações
- ✅ **Sistema de Notificações** - Alertas e lembretes
- ✅ **Métricas em Cache** - Performance otimizada
- ✅ **Filtros Salvos** - Personalização por usuário
- ✅ **Relatórios Salvos** - Histórico de relatórios
- ✅ **Logs de Sistema** - Monitoramento de operações automáticas

## 🚀 Como Executar

### 1. **Acesse o Supabase**
- Vá para [https://supabase.com](https://supabase.com)
- Abra seu projeto
- Clique em **SQL Editor**

### 2. **Execute o Schema**
- Copie todo o conteúdo do arquivo `lib/supabase/schema-completo.sql`
- Cole no SQL Editor
- Clique em **Run** (ou Ctrl+Enter)

### 3. **Verifique a Execução**
- Aguarde a mensagem de sucesso
- Verifique se todas as tabelas foram criadas
- Confirme que o Realtime está habilitado

## 📊 Estrutura das Tabelas

### 🏢 **Tabelas Principais**

#### `clients` - Clientes/Empresas
```sql
- id (UUID, PK)
- name (VARCHAR, NOT NULL)
- cnpj (VARCHAR, UNIQUE)
- email (VARCHAR, com validação)
- phone (VARCHAR)
- address, city, state, zip_code (endereço completo)
- contact_person (pessoa de contato)
- notes (observações)
- active (BOOLEAN)
- created_at, updated_at (TIMESTAMPS)
```

#### `taxes` - Impostos/Tributos
```sql
- id (UUID, PK)
- name (VARCHAR, NOT NULL)
- description (TEXT)
- category (ENUM: Federal, Estadual, Municipal, Trabalhista, Previdenciário)
- code (VARCHAR) - Código do imposto (ICMS, IPI, etc.)
- recurrence_type (ENUM: none, monthly, quarterly, custom)
- recurrence_config (JSONB) - Configuração detalhada
- weekend_adjust (ENUM: postpone, anticipate, keep)
- holiday_adjust (BOOLEAN) - Ajuste para feriados
- default_assignee (VARCHAR)
- auto_generate (BOOLEAN)
- generation_days_ahead (INTEGER) - Dias antes para gerar
- active (BOOLEAN)
- created_at, updated_at (TIMESTAMPS)
```

#### `obligations` - Obrigações Fiscais
```sql
- id (UUID, PK)
- tax_id (UUID, FK)
- client_id (UUID, FK)
- assigned_to (VARCHAR)
- due_date (DATE, NOT NULL)
- calculated_due_date (DATE) - Data ajustada
- status (ENUM: pending, in_progress, completed, overdue, cancelled)
- priority (ENUM: low, medium, high, critical)
- amount (DECIMAL) - Valor da obrigação
- reference_period (VARCHAR) - Período de referência
- notes (TEXT)
- completed_at, completed_by (completion info)
- completion_notes (TEXT)
- reminder_sent, reminder_sent_at (controle de lembretes)
- created_at, updated_at (TIMESTAMPS)
```

#### `installments` - Parcelamentos
```sql
- id (UUID, PK)
- tax_id, client_id (UUID, FK)
- description (VARCHAR, NOT NULL)
- total_amount, installment_amount (DECIMAL)
- current_installment, total_installments (INTEGER)
- first_due_date (DATE)
- recurrence_type, recurrence_config (configuração)
- weekend_adjust (ENUM)
- assigned_to (VARCHAR)
- status (ENUM)
- notes (TEXT)
- created_at, updated_at (TIMESTAMPS)
```

### ⚙️ **Tabelas de Configuração**

#### `user_settings` - Configurações do Usuário (MODO ESCURO)
```sql
- id (UUID, PK)
- user_identifier (VARCHAR, NOT NULL) - ID único do usuário
- theme (ENUM: light, dark, auto) - 🎨 MODO ESCURO
- language (VARCHAR) - Idioma
- timezone (VARCHAR) - Fuso horário
- date_format, time_format (VARCHAR) - Formato de data/hora
- notifications_enabled (BOOLEAN) - Notificações habilitadas
- email_notifications (BOOLEAN) - Notificações por email
- reminder_days (INTEGER) - Dias antes para lembrar
- dashboard_layout (JSONB) - Layout personalizado
- saved_filters (JSONB) - Filtros salvos
- created_at, updated_at (TIMESTAMPS)
```

#### `saved_filters` - Filtros Salvos
```sql
- id (UUID, PK)
- user_identifier (VARCHAR, NOT NULL)
- name (VARCHAR, NOT NULL)
- module (ENUM: clients, taxes, obligations, installments, calendar, reports)
- filters (JSONB, NOT NULL)
- is_public (BOOLEAN) - Pode ser compartilhado
- description (TEXT)
- created_at, updated_at (TIMESTAMPS)
```

### 📝 **Tabelas de Auditoria**

#### `audit_logs` - Logs de Auditoria Avançados
```sql
- id (UUID, PK)
- entity_type (ENUM: client, tax, obligation, installment, user_settings)
- entity_id (UUID, NOT NULL)
- action (ENUM: created, updated, deleted, status_changed, bulk_operation)
- performed_by (VARCHAR, NOT NULL)
- user_identifier (VARCHAR) - ID do usuário
- old_values, new_values, changes (JSONB) - Valores detalhados
- ip_address (INET) - IP do usuário
- user_agent (TEXT) - Navegador
- session_id (VARCHAR) - ID da sessão
- timestamp (TIMESTAMP)
```

#### `system_logs` - Logs do Sistema
```sql
- id (UUID, PK)
- level (ENUM: info, warning, error, debug, critical)
- category (VARCHAR) - Categoria da operação
- message (TEXT, NOT NULL)
- details (JSONB) - Detalhes adicionais
- execution_time_ms (INTEGER) - Tempo de execução
- created_at (TIMESTAMP)
```

#### `status_history` - Histórico de Mudanças de Status
```sql
- id (UUID, PK)
- entity_type, entity_id (identificação da entidade)
- old_status, new_status (status anterior e novo)
- changed_by (VARCHAR) - Quem mudou
- reason (TEXT) - Motivo da mudança
- timestamp (TIMESTAMP)
```

### 📊 **Tabelas de Relatórios e Métricas**

#### `dashboard_metrics` - Cache de Métricas
```sql
- id (UUID, PK)
- metric_name (VARCHAR, NOT NULL)
- metric_value (JSONB, NOT NULL)
- calculated_at (TIMESTAMP)
- expires_at (TIMESTAMP) - Expiração do cache
```

#### `saved_reports` - Relatórios Salvos
```sql
- id (UUID, PK)
- user_identifier (VARCHAR, NOT NULL)
- name (VARCHAR, NOT NULL)
- report_type (ENUM: productivity, compliance, financial, custom)
- parameters (JSONB, NOT NULL)
- generated_at (TIMESTAMP)
- file_path (VARCHAR) - Caminho do arquivo
- is_public (BOOLEAN)
- created_at (TIMESTAMP)
```

### 🔔 **Tabelas de Notificações**

#### `notifications` - Sistema de Notificações
```sql
- id (UUID, PK)
- user_identifier (VARCHAR, NOT NULL)
- type (ENUM: reminder, alert, info, warning, success)
- title (VARCHAR, NOT NULL)
- message (TEXT, NOT NULL)
- entity_type, entity_id (referência opcional)
- is_read (BOOLEAN)
- read_at (TIMESTAMP)
- expires_at (TIMESTAMP) - Expiração da notificação
- created_at (TIMESTAMP)
```

## 🔧 Funcionalidades Avançadas

### 🎨 **Modo Escuro Persistente**
- Configurações salvas na tabela `user_settings`
- Identificador único por usuário (fingerprint do navegador)
- Fallback para localStorage se o banco não estiver disponível
- Detecção automática da preferência do sistema

### 📈 **Auditoria Completa**
- Log de todas as operações (CREATE, UPDATE, DELETE)
- Rastreamento de mudanças com valores antigos e novos
- Informações de sessão (IP, User-Agent, Session ID)
- Histórico de mudanças de status

### ⚡ **Performance Otimizada**
- Índices GIN para busca de texto
- Índices compostos para consultas complexas
- Cache de métricas do dashboard
- Limpeza automática de logs antigos

### 🔔 **Sistema de Notificações**
- Notificações por usuário
- Diferentes tipos (lembrete, alerta, info)
- Controle de leitura
- Expiração automática

## 🚀 Funções Automáticas

### `generate_recurring_obligations()`
- Gera obrigações recorrentes automaticamente
- Respeita configurações de fim de semana e feriados
- Log da operação no `system_logs`

### `cleanup_old_logs()`
- Remove logs antigos automaticamente
- Auditoria: 1 ano
- Sistema: 6 meses
- Métricas: expiradas

## 📊 Índices Otimizados

### **Busca de Texto**
- `gin_trgm_ops` para busca fuzzy em nomes
- Índices GIN para campos JSONB

### **Consultas Complexas**
- Índices compostos para filtros múltiplos
- Índices específicos para consultas do dashboard
- Índices para obrigações vencidas e próximas

## 🔒 Segurança

### **Row Level Security (RLS)**
- Habilitado em todas as tabelas
- Políticas permissivas para desenvolvimento
- **IMPORTANTE**: Configure políticas restritivas para produção

### **Validações**
- Constraints de validação em campos críticos
- Validação de email com regex
- Validação de CNPJ com tamanho mínimo
- Validação de valores monetários

## 🔄 Realtime

Todas as tabelas principais têm Realtime habilitado:
- `clients`, `taxes`, `obligations`, `installments`
- `user_settings`, `saved_filters`
- `audit_logs`, `notifications`

## 📝 Dados Iniciais

O schema inclui 10 impostos pré-configurados:
- ICMS, IPI, ISS, PIS, COFINS
- IRPJ, CSLL, FGTS, INSS, Simples Nacional

## 🎯 Próximos Passos

1. **Execute o schema** no Supabase
2. **Configure as variáveis de ambiente** no `.env.local`
3. **Teste o modo escuro** - deve persistir entre sessões
4. **Verifique os logs de auditoria** - todas as operações são registradas
5. **Configure políticas RLS** para produção se necessário

## 🐛 Troubleshooting

### **Erro de permissão**
- Verifique se o usuário tem permissões de CREATE TABLE
- Execute como superuser se necessário

### **Realtime não funciona**
- Verifique se as tabelas foram adicionadas à publicação
- Confirme que o Realtime está habilitado no projeto

### **Modo escuro não persiste**
- Verifique se a tabela `user_settings` foi criada
- Confirme que as políticas RLS permitem acesso
- Verifique os logs do navegador para erros

---

**🎉 Schema v2.0 Completo!** 

Agora você tem um sistema robusto com modo escuro persistente, auditoria completa e performance otimizada!
