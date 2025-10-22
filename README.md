# 📅 Controle Fiscal - Sistema de Gerenciamento de Prazos

Sistema web colaborativo e simples para gerenciamento de prazos fiscais, focado exclusivamente em controle de vencimentos de obrigações, impostos e parcelamentos.

## ✨ Características Principais

- 🌐 **Acesso Público**: Sem necessidade de login, acessível via link compartilhado
- ⚡ **Colaboração em Tempo Real**: Edições simultâneas com notificações instantâneas
- 📊 **Dashboard Completo**: Visão geral com estatísticas e alertas
- 📆 **Calendário Visual**: Interface estilo Google Calendar para visualização intuitiva
- 🔄 **Recorrência Automática**: Geração inteligente de obrigações futuras
- 📱 **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- ♿ **Acessível**: Design WCAG-compliant com alto contraste e navegação por teclado

## 🚀 Funcionalidades

### Módulos Principais

1. **Dashboard**
   - Estatísticas em tempo real
   - Obrigações críticas (atrasadas e vencendo hoje)
   - Vencimentos da semana
   - Visão por cliente

2. **Clientes**
   - Cadastro completo de clientes
   - CRUD completo com busca
   - Gerenciamento de informações de contato

3. **Impostos**
   - Cadastro de impostos e tributos
   - Configuração de recorrência (mensal, trimestral, customizada)
   - Ajuste automático para fins de semana e feriados
   - Geração automática de próximas ocorrências

4. **Obrigações**
   - Gerenciamento de obrigações fiscais
   - Filtros avançados (status, cliente, imposto)
   - Ações rápidas (iniciar, concluir)
   - Rastreamento de responsáveis

5. **Parcelamentos**
   - Controle de parcelamentos
   - Acompanhamento de progresso
   - Vencimentos automáticos

6. **Calendário**
   - Visualização mensal estilo Google Calendar
   - Codificação por cores (status)
   - Detalhes de eventos por dia
   - Estatísticas do mês

7. **Relatórios**
   - Métricas de produtividade
   - Taxa de conclusão e pontualidade
   - Desempenho por responsável
   - Análise mensal

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilização**: Tailwind CSS
- **Banco de Dados**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime
- **Datas**: date-fns
- **Ícones**: Lucide React
- **State Management**: Zustand
- **API de Feriados**: Brasil API

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd controle-fiscal
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**

   a) Crie um projeto no [Supabase](https://supabase.com)
   
   b) No SQL Editor do Supabase, execute o script:
   ```
   lib/supabase/schema.sql
   ```
   
   c) Copie `.env.local.example` para `.env.local` e preencha:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

4. **Execute o projeto**
```bash
npm run dev
```

5. **Acesse no navegador**
```
http://localhost:3000
```

## 🌐 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub/GitLab
2. Conecte seu repositório no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático!

### Outras Plataformas

O projeto é compatível com:
- Netlify
- Railway
- Render
- AWS Amplify

## 🔧 Configuração Avançada

### Recorrência Automática

O sistema gera automaticamente novas ocorrências no primeiro dia de cada mês. Para ativar em produção:

1. Configure um Cron Job ou Edge Function no Supabase
2. Execute diariamente:
```typescript
import { checkAndGenerateRecurrences } from './lib/auto-recurrence';
await checkAndGenerateRecurrences();
```

### API de Feriados

O sistema usa a Brasil API para detectar feriados nacionais brasileiros automaticamente. Para usar outra API ou adicionar feriados locais, edite:
```typescript
lib/date-utils.ts -> função isHoliday()
```

## 📝 Estrutura do Projeto

```
controle-fiscal/
├── app/                      # Páginas Next.js (App Router)
│   ├── page.tsx             # Dashboard
│   ├── clientes/            # Módulo de Clientes
│   ├── impostos/            # Módulo de Impostos
│   ├── obrigacoes/          # Módulo de Obrigações
│   ├── parcelamentos/       # Módulo de Parcelamentos
│   ├── calendario/          # Calendário Visual
│   └── relatorios/          # Relatórios e Métricas
├── components/              # Componentes React
│   ├── ui/                  # Componentes de UI reutilizáveis
│   └── Layout/              # Componentes de layout
├── lib/                     # Bibliotecas e utilitários
│   ├── supabase/           # Configuração e funções do Supabase
│   ├── date-utils.ts       # Utilitários de data
│   ├── recurrence-utils.ts # Lógica de recorrência
│   ├── metrics.ts          # Cálculo de métricas
│   └── auto-recurrence.ts  # Geração automática
├── hooks/                   # React Hooks customizados
├── types/                   # Definições TypeScript
└── public/                  # Arquivos estáticos
```

## 🎨 Personalização

### Cores

Edite `tailwind.config.js` para alterar o tema de cores:
```js
theme: {
  extend: {
    colors: {
      primary: {
        // Suas cores aqui
      }
    }
  }
}
```

### Categorias de Impostos

Edite as opções em `app/impostos/page.tsx`:
```typescript
options={[
  { value: 'Federal', label: 'Federal' },
  { value: 'Estadual', label: 'Estadual' },
  { value: 'Municipal', label: 'Municipal' },
  // Adicione suas categorias
]}
```

## 🔐 Segurança

**Importante**: O sistema foi projetado para acesso público sem autenticação. Para ambientes sensíveis:

1. Configure Row Level Security (RLS) no Supabase
2. Implemente autenticação (Supabase Auth, NextAuth, etc.)
3. Ajuste as políticas de acesso nas tabelas

## 🤝 Colaboração

O sistema detecta mudanças em tempo real e notifica todos os usuários conectados:
- Inserções (novos registros)
- Atualizações (edições)
- Exclusões (remoções)

## 📱 Atalhos de Teclado

- `Ctrl + K` ou `⌘ + K`: Busca global
- `Esc`: Fechar modais

## 🐛 Solução de Problemas

### Erro de conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o projeto Supabase está ativo
- Verifique as políticas RLS no Supabase

### Datas não ajustam para feriados
- Verifique a API de feriados (Brasil API pode estar indisponível)
- Configure fallback ou cache local de feriados

### Realtime não funciona
- Verifique se habilitou Realtime nas tabelas do Supabase
- Confirme que executou: `ALTER PUBLICATION supabase_realtime ADD TABLE <nome_tabela>`

## 📄 Licença

Este projeto é de código aberto. Sinta-se livre para usar, modificar e distribuir.

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Brasil API](https://brasilapi.com.br/)

## 📞 Suporte

Para dúvidas ou sugestões:
- Abra uma issue no GitHub
- Entre em contato através do email configurado

---

**Desenvolvido com ❤️ para simplificar o controle fiscal**

