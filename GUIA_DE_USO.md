# 📖 Guia de Uso - Controle Fiscal

Guia completo para usar todas as funcionalidades do sistema.

## 🎯 Primeiros Passos

### 1. Acesse o Sistema
- Abra o navegador e acesse o link do seu sistema
- Não é necessário login - o acesso é público e colaborativo

### 2. Familiarize-se com a Interface
- **Barra de Navegação**: No topo, acesso rápido a todos os módulos
- **Busca Global**: Clique no botão de busca ou pressione `Ctrl+K`
- **Indicador Realtime**: Canto inferior direito mostra conexão em tempo real

## 📊 Dashboard

### O que você vê
- **Estatísticas principais**: Clientes ativos, obrigações pendentes, concluídas no mês, atrasadas
- **Obrigações críticas**: Lista de obrigações atrasadas ou vencendo hoje
- **Vencimentos da semana**: Próximas obrigações dos próximos 7 dias

### Como usar
1. Ao abrir o sistema, o Dashboard é a primeira página
2. Clique nas obrigações para ver detalhes
3. Os números são atualizados automaticamente

## 👥 Módulo de Clientes

### Cadastrar um Cliente

1. Clique em **"Clientes"** na navegação
2. Clique no botão **"Novo Cliente"**
3. Preencha:
   - **Nome**: Obrigatório (ex: "Empresa ABC Ltda")
   - **CNPJ**: Opcional (ex: "12.345.678/0001-90")
   - **Email**: Opcional
   - **Telefone**: Opcional
4. Clique em **"Criar Cliente"**

### Editar um Cliente

1. Encontre o cliente na lista
2. Clique no botão **"Editar"** (ícone de lápis)
3. Modifique os dados
4. Clique em **"Salvar Alterações"**

### Buscar Clientes

Use a barra de busca para filtrar por:
- Nome do cliente
- CNPJ
- Email

### Excluir um Cliente

⚠️ **Atenção**: Ao excluir um cliente, todas as suas obrigações também serão excluídas!

1. Clique no botão vermelho de lixeira
2. Confirme a exclusão

## 💰 Módulo de Impostos

### Cadastrar um Imposto

1. Clique em **"Impostos"** na navegação
2. Clique em **"Novo Imposto"**
3. Preencha:
   - **Nome**: Ex: "DARF Mensal", "ICMS-ST"
   - **Descrição**: Opcional, detalhes sobre o imposto
   - **Categoria**: Federal, Estadual ou Municipal
   - **Tipo de Recorrência**:
     - **Mensal**: Todo mês no mesmo dia
     - **Trimestral**: A cada 3 meses
     - **Customizado**: Intervalo específico em dias
     - **Sem recorrência**: Obrigação única
   - **Dia do Mês**: Para mensal/trimestral (ex: 15)
   - **Ajuste Fim de Semana**:
     - **Postergar**: Move para segunda-feira
     - **Antecipar**: Move para sexta-feira
     - **Manter**: Mantém a data original
   - **Responsável Padrão**: Nome de quem geralmente cuida
   - **Gerar automaticamente**: Marca para criar próximas ocorrências automaticamente
4. Clique em **"Criar Imposto"**

### Exemplo Prático

**DARF Mensal**:
- Nome: "DARF IR Pessoa Jurídica"
- Categoria: Federal
- Recorrência: Mensal
- Dia do Mês: 20
- Ajuste: Postergar
- Auto-gerar: ✅

**ICMS Trimestral**:
- Nome: "ICMS-ST Trimestral"
- Categoria: Estadual
- Recorrência: Trimestral
- Dia do Mês: 15
- Ajuste: Postergar
- Auto-gerar: ✅

### Filtrar Impostos

Use os filtros:
- **Todos**: Mostra todos os impostos
- **Ativos**: Apenas impostos em uso
- **Inativos**: Impostos desativados

## 📋 Módulo de Obrigações

Este é o coração do sistema! Aqui você gerencia as obrigações fiscais de cada cliente.

### Criar uma Obrigação

1. Clique em **"Obrigações"**
2. Clique em **"Nova Obrigação"**
3. Selecione:
   - **Imposto**: Lista de impostos cadastrados
   - **Cliente**: Lista de clientes
   - **Data de Vencimento**: Escolha a data
   - **Responsável**: Nome de quem vai executar
   - **Prioridade**: Baixa, Média ou Alta
   - **Observações**: Notas adicionais
4. Clique em **"Criar Obrigação"**

### Gerenciar Status

Cada obrigação passa por estados:

1. **Pendente** (amarelo): Obrigação criada, aguardando início
2. **Em Andamento** (azul): Clique em ▶️ para marcar como iniciada
3. **Concluída** (verde): Clique em ✅ para marcar como concluída
4. **Atrasada** (vermelho): Automaticamente marcada se passar da data

### Usar Filtros Avançados

Os filtros permitem encontrar rapidamente:

**Por Status**:
- Todos
- Pendentes
- Em Andamento
- Concluídas
- Atrasadas

**Por Cliente**:
- Selecione um cliente específico

**Por Imposto**:
- Selecione um tipo de imposto

**Busca Livre**:
- Digite parte do nome do cliente, imposto ou responsável

### Ações Rápidas

- **▶️ Iniciar**: Muda status para "Em Andamento"
- **✅ Concluir**: Marca como concluída (registra data e hora)
- **🗑️ Excluir**: Remove a obrigação

## 💳 Módulo de Parcelamentos

Para controlar parcelamentos de impostos.

### Cadastrar um Parcelamento

1. Clique em **"Parcelamentos"**
2. Clique em **"Novo Parcelamento"**
3. Preencha:
   - **Descrição**: Ex: "Parcelamento IRPJ 2024"
   - **Cliente**: Selecione o cliente
   - **Imposto**: Opcional, vincule a um imposto
   - **Parcela Atual**: Ex: 1
   - **Total de Parcelas**: Ex: 12
   - **Data da Primeira Parcela**: Escolha a data
   - **Responsável**: Opcional
   - **Observações**: Notas adicionais
4. Clique em **"Criar Parcelamento"**

### Acompanhar Progresso

- Cada parcelamento mostra uma barra de progresso
- A porcentagem é calculada automaticamente: (parcela atual / total) × 100

### Exemplo

**Parcelamento de IRPJ**:
- Descrição: "IRPJ 2024 - Empresa XYZ"
- Cliente: Empresa XYZ
- Parcela Atual: 3
- Total: 10
- Primeira Parcela: 01/03/2024
- Progresso: 30%

## 📅 Calendário

Visualização mensal de todas as obrigações.

### Navegar pelo Calendário

- **◀️ ▶️**: Navegar entre meses
- **Hoje**: Volta para o mês atual
- **Clique em um dia**: Veja detalhes das obrigações daquele dia

### Cores dos Eventos

- 🟨 **Amarelo**: Pendente
- 🟦 **Azul**: Em Andamento
- 🟩 **Verde**: Concluída
- 🟥 **Vermelho**: Atrasada

### Painel Lateral

Ao clicar em um dia:
- Veja todas as obrigações daquela data
- Status de cada uma
- Cliente responsável
- Responsável pela execução

### Estatísticas do Mês

No canto direito, veja:
- Total de obrigações do mês
- Quantas estão pendentes
- Quantas foram concluídas
- Quantas estão atrasadas

## 📊 Relatórios

Análise de desempenho e produtividade.

### Métricas Principais

**Taxa de Conclusão**:
- Porcentagem de obrigações concluídas vs total
- Meta ideal: > 90%

**Tempo Médio de Conclusão**:
- Quantos dias em média leva para concluir
- Quanto menor, melhor

**Taxa de Pontualidade**:
- Porcentagem concluída antes ou no prazo
- Meta ideal: > 95%

### Desempenho por Responsável

Veja quem está performando melhor:
- Total de obrigações concluídas
- Porcentagem concluída no prazo
- Número de atrasadas

### Ranking de Pendências

Lista dos responsáveis com mais obrigações pendentes - útil para redistribuir tarefas.

### Desempenho Mensal

Gráficos mostrando:
- Taxa de conclusão por mês
- Taxa de pontualidade por mês
- Tendências ao longo do tempo

## 🔍 Busca Global

Pressione `Ctrl+K` (Windows/Linux) ou `⌘+K` (Mac) para:
- Buscar clientes
- Buscar obrigações
- Buscar impostos
- Acesso rápido a qualquer parte do sistema

## 🔄 Colaboração em Tempo Real

### Como funciona

O sistema detecta automaticamente mudanças feitas por outros usuários:
- ✅ Novo cliente cadastrado
- ✅ Obrigação atualizada
- ✅ Status alterado

### Indicador de Conexão

No canto inferior direito:
- 🟢 **Conectado**: Sistema sincronizado
- 🔴 **Desconectado**: Verifique sua internet

### Notificações

Quando alguém faz uma alteração:
- Pop-up discreto mostra o tipo de mudança
- Os dados são atualizados automaticamente
- Não é necessário recarregar a página

## ⚡ Dicas de Produtividade

### Organize seus Clientes
- Use nomenclatura consistente
- Preencha CNPJs para fácil identificação
- Adicione emails para referência rápida

### Configure Impostos Recorrentes
- Cadastre uma vez todos os impostos regulares
- Ative "Auto-gerar" para criar automaticamente
- Revise no início de cada mês

### Use Responsáveis
- Atribua responsável a cada obrigação
- Facilita acompanhamento individual
- Melhora relatórios de desempenho

### Priorize Corretamente
- **Alta**: Vence hoje ou amanhã
- **Média**: Vence esta semana
- **Baixa**: Vence depois de 7 dias

### Revise o Dashboard Diariamente
- Comece o dia verificando obrigações críticas
- Acompanhe vencimentos da semana
- Celebre obrigações concluídas! 🎉

### Use o Calendário para Planejamento
- Visualize toda a semana/mês
- Identifique dias com muitos vencimentos
- Planeje com antecedência

## 🎓 Casos de Uso

### Escritório de Contabilidade

1. **Cadastre todos os clientes** do escritório
2. **Configure impostos recorrentes** (DARF, ICMS, ISS, etc.)
3. **Crie obrigações** para o mês
4. **Distribua entre a equipe** usando "Responsável"
5. **Acompanhe pelo Dashboard** diariamente
6. **Revise relatórios** semanalmente

### Departamento Fiscal de Empresa

1. **Cadastre a empresa** como cliente único
2. **Configure todos os impostos** aplicáveis
3. **Ative auto-geração** para recorrentes
4. **Use prioridades** para organizar
5. **Acompanhe pelo Calendário** mensalmente

### Consultor Fiscal Freelancer

1. **Cadastre seus clientes**
2. **Configure impostos personalizados** para cada um
3. **Use observações** para notas específicas
4. **Acompanhe seu desempenho** nos relatórios
5. **Compartilhe o link** com clientes para transparência

## ❓ Perguntas Frequentes

**P: Preciso criar conta?**
R: Não! O acesso é totalmente público e colaborativo.

**P: Como compartilho com minha equipe?**
R: Simplesmente envie o link do sistema. Todos podem editar.

**P: As obrigações se repetem automaticamente?**
R: Sim, se você marcar "Gerar automaticamente" no imposto e configurar a recorrência.

**P: Posso usar offline?**
R: Não, o sistema precisa de internet para sincronizar em tempo real.

**P: Os dados são seguros?**
R: Sim, armazenados no Supabase com criptografia. Mas lembre-se: acesso é público!

**P: Posso exportar dados?**
R: Atualmente não há exportação nativa, mas você pode copiar as informações manualmente.

**P: Como desfaço uma ação?**
R: Não há "desfazer" nativo. Seja cuidadoso ao excluir!

**P: Posso personalizar as cores?**
R: Sim, mas requer editar o código (veja README.md).

## 📞 Suporte

Problemas ou dúvidas?
- Revise este guia
- Consulte o README.md
- Verifique CONFIGURACAO_SUPABASE.md
- Abra uma issue no GitHub

---

**Bom uso!** 📊✨

Simplifique seu controle fiscal com este sistema!

