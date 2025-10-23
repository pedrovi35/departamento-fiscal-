-- Schema do Banco de Dados - Controle Fiscal
-- Execute este script no SQL Editor do Supabase

-- ============ EXTENSÕES ============
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ TABELAS ============

-- Clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    email VARCHAR(255),
    phone VARCHAR(20),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Impostos/Tributos
CREATE TABLE IF NOT EXISTS taxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- Federal, Estadual, Municipal
    recurrence_rule VARCHAR(100) NOT NULL, -- monthly, quarterly, custom
    weekend_adjust VARCHAR(20) DEFAULT 'postpone', -- postpone, advance, ignore
    default_assignee VARCHAR(255),
    auto_generate BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Obrigações
CREATE TABLE IF NOT EXISTS obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tax_id UUID REFERENCES taxes(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    assigned_to VARCHAR(255),
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high, critical
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parcelamentos
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tax_id UUID REFERENCES taxes(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    current_installment INTEGER NOT NULL DEFAULT 1,
    total_installments INTEGER NOT NULL,
    first_due_date DATE NOT NULL,
    recurrence_rule VARCHAR(100) NOT NULL,
    weekend_adjust VARCHAR(20) DEFAULT 'postpone',
    assigned_to VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs de Auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- client, tax, obligation, installment
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- created, updated, deleted, status_changed
    performed_by VARCHAR(255) NOT NULL,
    changes JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Filtros Salvos
CREATE TABLE IF NOT EXISTS saved_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    module VARCHAR(50) NOT NULL, -- clients, taxes, obligations, installments
    filters JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ ÍNDICES ============

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_cnpj ON clients(cnpj);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(active);

CREATE INDEX IF NOT EXISTS idx_taxes_category ON taxes(category);
CREATE INDEX IF NOT EXISTS idx_taxes_active ON taxes(active);

CREATE INDEX IF NOT EXISTS idx_obligations_client_id ON obligations(client_id);
CREATE INDEX IF NOT EXISTS idx_obligations_tax_id ON obligations(tax_id);
CREATE INDEX IF NOT EXISTS idx_obligations_due_date ON obligations(due_date);
CREATE INDEX IF NOT EXISTS idx_obligations_status ON obligations(status);
CREATE INDEX IF NOT EXISTS idx_obligations_priority ON obligations(priority);

CREATE INDEX IF NOT EXISTS idx_installments_client_id ON installments(client_id);
CREATE INDEX IF NOT EXISTS idx_installments_tax_id ON installments(tax_id);
CREATE INDEX IF NOT EXISTS idx_installments_first_due_date ON installments(first_due_date);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

CREATE INDEX IF NOT EXISTS idx_saved_filters_module ON saved_filters(module);

-- ============ TRIGGERS ============

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_taxes_updated_at BEFORE UPDATE ON taxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obligations_updated_at BEFORE UPDATE ON obligations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON installments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============ POLÍTICAS RLS (Row Level Security) ============

-- Habilitar RLS em todas as tabelas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para acesso público (desenvolvimento/teste)
-- ATENÇÃO: Para produção, substitua por políticas mais restritivas

CREATE POLICY "Allow public access" ON clients
    FOR ALL USING (true);

CREATE POLICY "Allow public access" ON taxes
    FOR ALL USING (true);

CREATE POLICY "Allow public access" ON obligations
    FOR ALL USING (true);

CREATE POLICY "Allow public access" ON installments
    FOR ALL USING (true);

CREATE POLICY "Allow public access" ON audit_logs
    FOR ALL USING (true);

CREATE POLICY "Allow public access" ON saved_filters
    FOR ALL USING (true);

-- ============ REALTIME ============

-- Habilitar Realtime para todas as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE taxes;
ALTER PUBLICATION supabase_realtime ADD TABLE obligations;
ALTER PUBLICATION supabase_realtime ADD TABLE installments;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE saved_filters;

-- ============ DADOS INICIAIS ============

-- Inserir alguns impostos de exemplo
INSERT INTO taxes (name, description, category, recurrence_rule, weekend_adjust, default_assignee, auto_generate) VALUES
('ICMS', 'Imposto sobre Circulação de Mercadorias e Serviços', 'Estadual', 'monthly', 'postpone', 'Contador', true),
('IPI', 'Imposto sobre Produtos Industrializados', 'Federal', 'monthly', 'postpone', 'Contador', true),
('ISS', 'Imposto sobre Serviços', 'Municipal', 'monthly', 'postpone', 'Contador', true),
('PIS', 'Programa de Integração Social', 'Federal', 'monthly', 'postpone', 'Contador', true),
('COFINS', 'Contribuição para o Financiamento da Seguridade Social', 'Federal', 'monthly', 'postpone', 'Contador', true),
('IRPJ', 'Imposto de Renda Pessoa Jurídica', 'Federal', 'monthly', 'postpone', 'Contador', true),
('CSLL', 'Contribuição Social sobre o Lucro Líquido', 'Federal', 'monthly', 'postpone', 'Contador', true),
('FGTS', 'Fundo de Garantia do Tempo de Serviço', 'Federal', 'monthly', 'postpone', 'RH', true),
('INSS', 'Instituto Nacional do Seguro Social', 'Federal', 'monthly', 'postpone', 'RH', true),
('Simples Nacional', 'Regime Tributário Simplificado', 'Federal', 'monthly', 'postpone', 'Contador', true);

-- ============ FUNÇÕES ÚTEIS ============

-- Função para gerar obrigações recorrentes
CREATE OR REPLACE FUNCTION generate_recurring_obligations()
RETURNS INTEGER AS $$
DECLARE
    tax_record RECORD;
    client_record RECORD;
    next_due_date DATE;
    generated_count INTEGER := 0;
BEGIN
    -- Para cada imposto ativo com auto_generate = true
    FOR tax_record IN 
        SELECT * FROM taxes 
        WHERE active = true AND auto_generate = true
    LOOP
        -- Para cada cliente ativo
        FOR client_record IN 
            SELECT * FROM clients 
            WHERE active = true
        LOOP
            -- Calcular próxima data de vencimento baseada na regra de recorrência
            CASE tax_record.recurrence_rule
                WHEN 'monthly' THEN
                    next_due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '1 day';
                WHEN 'quarterly' THEN
                    next_due_date := DATE_TRUNC('quarter', CURRENT_DATE) + INTERVAL '3 months' + INTERVAL '1 day';
                ELSE
                    next_due_date := CURRENT_DATE + INTERVAL '1 month';
            END CASE;
            
            -- Ajustar para fim de semana se necessário
            IF tax_record.weekend_adjust = 'postpone' THEN
                WHILE EXTRACT(DOW FROM next_due_date) IN (0, 6) LOOP
                    next_due_date := next_due_date + INTERVAL '1 day';
                END LOOP;
            ELSIF tax_record.weekend_adjust = 'advance' THEN
                WHILE EXTRACT(DOW FROM next_due_date) IN (0, 6) LOOP
                    next_due_date := next_due_date - INTERVAL '1 day';
                END LOOP;
            END IF;
            
            -- Verificar se já existe obrigação para este cliente/imposto/data
            IF NOT EXISTS (
                SELECT 1 FROM obligations 
                WHERE client_id = client_record.id 
                AND tax_id = tax_record.id 
                AND due_date = next_due_date
            ) THEN
                -- Criar nova obrigação
                INSERT INTO obligations (
                    tax_id, 
                    client_id, 
                    assigned_to, 
                    due_date, 
                    status, 
                    priority
                ) VALUES (
                    tax_record.id,
                    client_record.id,
                    tax_record.default_assignee,
                    next_due_date,
                    'pending',
                    'medium'
                );
                
                generated_count := generated_count + 1;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN generated_count;
END;
$$ LANGUAGE plpgsql;

-- ============ COMENTÁRIOS ============

COMMENT ON TABLE clients IS 'Cadastro de clientes/empresas';
COMMENT ON TABLE taxes IS 'Cadastro de impostos e tributos';
COMMENT ON TABLE obligations IS 'Obrigações fiscais dos clientes';
COMMENT ON TABLE installments IS 'Parcelamentos de impostos';
COMMENT ON TABLE audit_logs IS 'Log de auditoria para rastreamento de mudanças';
COMMENT ON TABLE saved_filters IS 'Filtros salvos pelos usuários';

-- ============ FINALIZAÇÃO ============

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Schema do Controle Fiscal criado com sucesso!';
    RAISE NOTICE 'Tabelas criadas: clients, taxes, obligations, installments, audit_logs, saved_filters';
    RAISE NOTICE 'Realtime habilitado para todas as tabelas';
    RAISE NOTICE 'Políticas RLS configuradas para acesso público';
    RAISE NOTICE 'Dados iniciais inseridos (10 impostos de exemplo)';
    RAISE NOTICE 'Função generate_recurring_obligations() criada para geração automática';
END $$;
