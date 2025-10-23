# 🔧 Guia de Configuração do Supabase

Este guia detalha como configurar o Supabase para o sistema Controle Fiscal.

## 📋 Pré-requisitos

1. Conta no Supabase (gratuita): https://supabase.com
2. Projeto criado no Supabase

## 🚀 Passo a Passo

### 1. Criar o Projeto

1. Acesse o [Supabase](https://supabase.com)
2. Clique em "New Project"
3. Preencha:
   - **Name**: Controle Fiscal
   - **Database Password**: (guarde essa senha!)
   - **Region**: Escolha o mais próximo (ex: South America - São Paulo)
4. Aguarde a criação (1-2 minutos)

### 2. Executar o Schema SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Copie todo o conteúdo do arquivo `lib/supabase/schema.sql`
4. Cole no editor
5. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
6. Aguarde a mensagem de sucesso

### 3. Habilitar Realtime

O Realtime já deve estar habilitado pelo script SQL, mas confirme:

1. Vá em **Database** > **Replication**
2. Verifique se as seguintes tabelas estão com status "Enabled":
   - clients
   - taxes
   - obligations
   - installments
   - audit_logs

Se alguma não estiver, clique na tabela e ative.

### 4. Configurar Políticas de Acesso (RLS)

As políticas permissivas já foram criadas pelo script. Para verificar:

1. Vá em **Authentication** > **Policies**
2. Confirme que existe a política "Allow public access" para cada tabela
3. Se quiser restringir acesso no futuro, edite essas políticas

### 5. Obter Credenciais

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie os seguintes valores:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public**: (chave longa começando com `eyJ...`)

### 6. Configurar Variáveis de Ambiente

1. No seu projeto, copie `.env.local.example` para `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edite `.env.local` e preencha:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **IMPORTANTE**: Nunca commit o arquivo `.env.local` no Git!

## ✅ Testar Conexão

1. Execute o projeto:
   ```bash
   npm run dev
   ```

2. Acesse http://localhost:3000

3. Tente criar um cliente:
   - Clique em "Clientes"
   - Clique em "Novo Cliente"
   - Preencha os dados
   - Clique em "Criar Cliente"

4. Verifique no Supabase:
   - Vá em **Table Editor** > **clients**
   - O cliente deve aparecer na lista

## 🔄 Configurar Recorrência Automática (Opcional)

Para gerar obrigações automaticamente todo dia 1º do mês:

### Opção 1: Edge Function (Recomendado)

1. No Supabase, vá em **Edge Functions**
2. Crie uma nova função chamada `auto-recurrence`
3. Use este código:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Lógica de geração de recorrências aqui
  // (copie de lib/auto-recurrence.ts)
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

4. Configure um Cron Job no Supabase para executar diariamente

### Opção 2: API Route do Next.js

1. Crie um endpoint em `app/api/cron/route.ts`
2. Configure no Vercel Cron Jobs ou similar

## 🔒 Segurança em Produção

### Para Ambiente Corporativo

Se o sistema será usado internamente com dados sensíveis:

1. **Ative Autenticação**:
   ```typescript
   // No Supabase Dashboard
   Authentication > Providers > Enable Email
   ```

2. **Restrinja as Políticas RLS**:
   ```sql
   -- Remova a política pública
   DROP POLICY "Allow public access" ON clients;
   
   -- Crie política autenticada
   CREATE POLICY "Authenticated users" ON clients
     FOR ALL 
     USING (auth.role() = 'authenticated');
   ```

3. **Configure no código**:
   ```typescript
   // lib/supabase/client.ts
   export const supabase = createClient(url, key, {
     auth: {
       autoRefreshToken: true,
       persistSession: true
     }
   })
   ```

## 📊 Monitoramento

### Verificar Logs

1. **Logs de Queries**:
   - Database > Logs > Query Logs
   
2. **Logs de API**:
   - Logs > API Logs

3. **Métricas de Uso**:
   - Reports > Database
   - Reports > API

### Limites do Plano Gratuito

- 500 MB de armazenamento
- 50.000 requisições mensais
- 2 GB de transferência
- Realtime: 200 conexões simultâneas

Para mais, considere upgrade ou otimização de queries.

## 🐛 Troubleshooting

### "Failed to fetch"
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o projeto Supabase está ativo

### "Row Level Security policy violation"
- Verifique se as políticas RLS estão configuradas
- Confirme que as políticas permitem acesso público

### Realtime não funciona
```sql
-- Execute no SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE taxes;
ALTER PUBLICATION supabase_realtime ADD TABLE obligations;
ALTER PUBLICATION supabase_realtime ADD TABLE installments;
```

### Queries lentas
1. Adicione índices:
```sql
CREATE INDEX idx_obligations_client_date 
  ON obligations(client_id, due_date);
```

2. Use paginação nas queries grandes

## 📞 Suporte

- Documentação oficial: https://supabase.com/docs
- Discord da comunidade: https://discord.supabase.com
- Status: https://status.supabase.com

---

**Configuração concluída!** 🎉 

Agora você está pronto para usar o sistema completo.


