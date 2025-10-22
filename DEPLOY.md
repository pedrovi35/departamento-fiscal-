# 🚀 Guia de Deploy - Controle Fiscal

Este guia cobre diversas opções de deploy para o sistema Controle Fiscal.

## 📋 Pré-requisitos

- Projeto configurado localmente
- Supabase configurado (veja CONFIGURACAO_SUPABASE.md)
- Código commitado no Git (GitHub, GitLab, etc.)

## 🌟 Vercel (Recomendado)

### Por que Vercel?
- ✅ Deploy automático a cada push
- ✅ Preview deployments para PRs
- ✅ CDN global
- ✅ SSL automático
- ✅ Totalmente gratuito para projetos pessoais

### Passo a Passo

1. **Faça push do código para GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/seu-usuario/controle-fiscal.git
   git push -u origin main
   ```

2. **Conecte no Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Add New Project"
   - Importe seu repositório do GitHub

3. **⚠️ IMPORTANTE: Configure as variáveis de ambiente**
   
   **ANTES DE FAZER O DEPLOY**, você DEVE adicionar as variáveis de ambiente:
   
   **Opção A - Durante o setup inicial:**
   - Na tela de configuração do projeto, expanda "Environment Variables"
   - Adicione as variáveis abaixo
   
   **Opção B - Depois do primeiro deploy (se esqueceu):**
   - Vá em Settings > Environment Variables
   - Adicione as variáveis
   - Faça um Redeploy
   
   **Variáveis necessárias:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seuprojetoid.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   
   **Como obter os valores:**
   1. Acesse [supabase.com](https://supabase.com) e abra seu projeto
   2. Vá em Settings > API
   3. Copie "Project URL" e "anon public" key
   
   **Marque todos os ambientes:**
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

4. **Deploy!**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - Pronto! Seu site estará em: `https://seu-projeto.vercel.app`
   
   ⚠️ **Se o build falhar com erro "supabaseUrl is required"**, significa que você esqueceu de adicionar as variáveis de ambiente. Volte ao passo 3.

### Domínio Personalizado

1. No Vercel, vá em Settings > Domains
2. Adicione seu domínio
3. Configure os DNS conforme instruções

## 🌐 Netlify

### Passo a Passo

1. **Conecte o repositório**
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "Add new site" > "Import an existing project"
   - Conecte seu Git

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Adicione variáveis de ambiente**
   - Site settings > Environment variables
   - Adicione as variáveis do Supabase

4. **Deploy**
   - Clique em "Deploy site"

## 🚂 Railway

### Passo a Passo

1. **Crie o projeto**
   - Acesse [railway.app](https://railway.app)
   - New Project > Deploy from GitHub repo

2. **Configure**
   - Railway detecta Next.js automaticamente
   - Adicione as variáveis de ambiente

3. **Deploy**
   - Railway faz deploy automático

## 🎨 Render

### Passo a Passo

1. **Novo Web Service**
   - Acesse [render.com](https://render.com)
   - New > Web Service
   - Conecte seu repo

2. **Configure**
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Variáveis de ambiente**
   - Adicione as variáveis do Supabase

4. **Create Web Service**

## ☁️ AWS Amplify

### Passo a Passo

1. **Console AWS**
   - Acesse AWS Amplify Console
   - New app > Host web app

2. **Conecte repositório**
   - GitHub/GitLab/Bitbucket

3. **Configure build**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Variáveis de ambiente**
   - App settings > Environment variables

## 🐳 Docker (Auto-hospedagem)

### Criar Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Deploy

```bash
# Build
docker build -t controle-fiscal .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=sua_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave \
  controle-fiscal
```

## 🔧 Configurações Pós-Deploy

### 1. Teste o Sistema

Após o deploy, teste:
- ✅ Dashboard carrega
- ✅ Criar um cliente
- ✅ Criar um imposto
- ✅ Criar uma obrigação
- ✅ Visualizar calendário
- ✅ Realtime funciona (abra em 2 abas)

### 2. Configure Custom Domain

Todas as plataformas suportam domínios personalizados:
- Adicione o domínio nas configurações
- Atualize os DNS (A/CNAME records)
- Aguarde propagação (2-48h)

### 3. Configure Analytics (Opcional)

#### Vercel Analytics
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### Google Analytics
```typescript
// app/layout.tsx
import Script from 'next/script'

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 4. Backup do Supabase

Configure backups automáticos:
1. Supabase Dashboard > Database > Backups
2. No plano gratuito: backup diário (7 dias de retenção)
3. Planos pagos: backups mais frequentes

## 📊 Monitoramento

### Vercel
- Analytics integrado
- Logs em tempo real
- Métricas de performance

### Uptime Monitoring
Use serviços gratuitos:
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

## 🔒 Segurança em Produção

### Headers de Segurança

Adicione em `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

### Rate Limiting

Para proteger APIs, use Vercel Edge Config ou Upstash Redis.

## 💰 Custos

### Totalmente Gratuito
- **Frontend**: Vercel/Netlify (Free Tier)
- **Backend**: Supabase (Free Tier)
- **Total**: R$ 0/mês

### Escalando (estimativa)
- **Vercel Pro**: $20/mês
- **Supabase Pro**: $25/mês
- **Total**: ~$45/mês (~R$ 225/mês)

## 🐛 Troubleshooting

### Build falha
```bash
# Teste localmente primeiro
npm run build

# Verifique os logs
# Geralmente é dependência faltando ou erro de TypeScript
```

### Variáveis de ambiente não funcionam
- Confirme que começam com `NEXT_PUBLIC_`
- Redeploye após adicionar variáveis
- Verifique se não tem espaços extras

### "Unable to connect to Supabase"
- Verifique as URLs no .env
- Confirme que o projeto Supabase está ativo
- Teste a conexão localmente

## 📞 Ajuda

Se tiver problemas:
1. Verifique os logs da plataforma
2. Teste localmente com `npm run build && npm start`
3. Consulte a documentação da plataforma
4. Abra uma issue no GitHub

---

**Deploy concluído!** 🎉

Seu sistema está online e acessível globalmente!

