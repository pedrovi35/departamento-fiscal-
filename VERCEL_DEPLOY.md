# 🚀 Como Corrigir Erro de Deploy no Vercel

## ❌ Erro Comum

Se você está vendo este erro no log de build do Vercel:

```
Error: supabaseUrl is required.
Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Não se preocupe!** Isso significa apenas que as variáveis de ambiente do Supabase não estão configuradas no Vercel.

---

## ✅ Solução em 5 Passos

### Passo 1: Obter Credenciais do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login e abra seu projeto
3. No menu lateral, vá em **Settings** (ícone de engrenagem)
4. Clique em **API**
5. Você verá duas informações importantes:
   
   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   
   **anon public (API Key):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   ```
   
6. **Copie ambos os valores** (você vai precisar deles no próximo passo)

---

### Passo 2: Acessar Configurações no Vercel

1. Acesse [vercel.com](https://vercel.com/dashboard)
2. Clique no seu projeto "departamento-fiscal"
3. Clique na aba **Settings** no topo da página
4. No menu lateral esquerdo, clique em **Environment Variables**

---

### Passo 3: Adicionar as Variáveis de Ambiente

Na página de Environment Variables, você vai adicionar **duas variáveis**:

#### Variável 1: NEXT_PUBLIC_SUPABASE_URL

1. No campo **Key**, digite:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```

2. No campo **Value**, cole a URL do seu projeto Supabase:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

3. Em **Environment**, marque **todas** as opções:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Clique em **Save**

#### Variável 2: NEXT_PUBLIC_SUPABASE_ANON_KEY

1. Clique em **Add Another** para adicionar a segunda variável

2. No campo **Key**, digite:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

3. No campo **Value**, cole a chave anônima do Supabase:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   ```

4. Em **Environment**, marque **todas** as opções novamente:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Clique em **Save**

---

### Passo 4: Refazer o Deploy

Agora que as variáveis estão configuradas, você precisa refazer o deploy:

**Opção A - Redeploy Manual (Mais Rápido):**

1. Volte para a aba **Deployments**
2. Localize o último deploy que falhou
3. Clique nos **três pontinhos (...)** no lado direito
4. Clique em **Redeploy**
5. Na modal que aparecer, clique em **Redeploy** novamente

**Opção B - Novo Push no GitHub:**

1. Faça qualquer mudança no código (pode ser só adicionar um espaço)
2. Commit e push:
   ```bash
   git add .
   git commit -m "Configurar variáveis de ambiente"
   git push
   ```
3. O Vercel vai fazer deploy automaticamente

---

### Passo 5: Verificar o Deploy

1. Aguarde 2-3 minutos enquanto o build é executado
2. Você vai ver a mensagem: **"Building"** → **"Deploying"** → **"Ready"**
3. Clique em **Visit** para acessar seu site
4. Se tudo estiver correto, você verá o dashboard funcionando!

---

## 🎉 Pronto!

Seu sistema agora está online em: `https://seu-projeto.vercel.app`

---

## 🐛 Troubleshooting

### "O build continua falhando"

**Verifique:**
1. Se você copiou as variáveis **completas** (a chave anon é bem longa!)
2. Se não há espaços extras no começo ou fim dos valores
3. Se marcou todos os ambientes (Production, Preview, Development)

**Como verificar:**
- Vá em Settings > Environment Variables
- Clique no ícone de "olho" para ver os valores
- Compare com os valores do Supabase

### "O site carrega mas não mostra dados"

Isso significa que o build foi bem-sucedido, mas há um problema de conexão:

1. Verifique se o projeto Supabase está ativo
2. Confirme que executou o SQL schema (`lib/supabase/schema.sql`)
3. Verifique as políticas RLS no Supabase

### "Ainda não funciona!"

Tente limpar o cache:

1. No Vercel, vá em Settings > General
2. Role até o final
3. Clique em **Clear Build Cache & Redeploy**

---

## 📚 Documentação Adicional

- [CONFIGURACAO_SUPABASE.md](./CONFIGURACAO_SUPABASE.md) - Guia completo de setup do Supabase
- [DEPLOY.md](./DEPLOY.md) - Guia completo de deploy em várias plataformas
- [README.md](./README.md) - Documentação geral do projeto

---

## 💡 Dicas

### Desenvolvimento Local

Para rodar localmente, crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

**NUNCA** commite este arquivo no Git!

### Preview Deploys

Com as variáveis configuradas, cada Pull Request vai gerar automaticamente um deploy de preview. Muito útil para testar mudanças antes de ir pra produção!

### Domínio Personalizado

Depois que tudo estiver funcionando, você pode configurar um domínio próprio:

1. Settings > Domains
2. Add Domain
3. Configure os DNS conforme instruções

---

**Precisa de ajuda?** Abra uma issue no GitHub ou consulte a [documentação do Vercel](https://vercel.com/docs).

