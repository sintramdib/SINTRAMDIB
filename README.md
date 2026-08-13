# Dash Assinatura

Sistema web com dashboard administrativa e página pública de assinatura acessada por link exclusivo.

## Stack

- **Monorepo** (npm workspaces)
- **Backend** (`apps/api`): Node.js + TypeScript + Fastify + Prisma + PostgreSQL
- **Frontend** (`apps/web`): Vite + React + TypeScript + React Router

## Estrutura

```
apps/
  api/   # backend (rotas, webhook, serviço de pagamento plugável, auth, Prisma)
  web/   # frontend (dashboard administrativa + páginas públicas /assinar/:token)
```

## Como rodar

1. Tenha o PostgreSQL rodando e crie o banco `dash_assinatura`.
2. Copie os arquivos `.env.example` para `.env`:
   - `apps/api/.env`
   - `apps/web/.env`
3. Instale as dependências e gere/migre o banco:

```bash
npm install
npm run db:migrate
npm run db:seed      # opcional: cria um plano de exemplo
```

4. Inicie o desenvolvimento:

```bash
npm run dev          # sobe API (porta 3333) e web (porta 5173)
```

5. Entre na dashboard em `http://localhost:5173` (login admin construído dos env `ADMIN_EMAIL`/`ADMIN_PASSWORD`).

## Pagamentos no MVP

O fluxo de pagamento é preparado para plugar um gateway real via camada de serviço
(`apps/api/src/modules/payment/`). Para o MVP funcionar de ponta a ponta sem gateway,
use `PAYMENT_PROVIDER=mock` (ambiente de desenvolvimento/sandbox). O mock gera um QR Code
simulado e expõe um endpoint de desenvolvimento que **simula** a confirmação do webhook —
permitindo exercitar o fluxo completo:

```
DASHBOARD → CRIAR LINK → CLIENTE ABRE LINK → ASSINAR
→ GERAR PAGAMENTO → QR CODE → PAGAMENTO → WEBHOOK
→ CONFIRMAÇÃO → ASSINATURA ATIVA → INÍCIO → VENCIMENTO
```

**Importante:** a assinatura só fica **ACTIVE** após uma notificação de webhook validada
pelo backend. Um clique em "Assinar" ou a exibição do QR Code **nunca** ativa a assinatura.

## Regras de negócio

- Início da assinatura = data/hora da confirmação do pagamento (nunca a data de criação do link).
- Vencimento = início + `Plan.duration_days`.
- Página com refresh polling consulta o backend; a confirmação oficial vem sempre do webhook.
- Webhook é idempotente (não processa o mesmo pagamento duas vezes).