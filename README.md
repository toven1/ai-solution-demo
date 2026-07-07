# FounderOS AI

FounderOS AI는 초기 창업자를 위한 AI 사업화 워크스페이스 SaaS 데모입니다. 아이디어를 프로젝트로 저장하고, 업종 템플릿을 기준으로 추가 질문, 시장조사, 경쟁사 분석, 페르소나, BM Canvas, MVP, 검증 실험, 사업계획서, IR One-Pager, 마케팅 카피, Export, 멘토 공유까지 단계별로 생성·수정·저장할 수 있습니다.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible local components
- Prisma
- PostgreSQL
- zod
- react-hook-form
- MockAIProvider / OpenAIProvider
- MockResearchProvider / TavilyProvider / SerperProvider
- Markdown and DOCX export
- Cookie session demo auth
- Mock PG billing flow

## Requirements

- Node.js 20+
- npm
- Docker Desktop, recommended for local PostgreSQL

## Environment

Create `.env`:

```bash
cp .env.example .env
```

Default local DB:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/founderos_ai?schema=public"
```

Provider behavior:

- `OPENAI_API_KEY` exists: use `OpenAIProvider`
- no `OPENAI_API_KEY`: fallback to `MockAIProvider`
- `RESEARCH_PROVIDER=mock`: use `MockResearchProvider`
- `RESEARCH_PROVIDER=tavily` with `TAVILY_API_KEY` or `RESEARCH_API_KEY`: use `TavilyProvider`
- `RESEARCH_PROVIDER=serper` with `SERPER_API_KEY` or `RESEARCH_API_KEY`: use `SerperProvider`
- missing research API key: fallback to `MockResearchProvider`

API keys are used only in server-side provider files. They must not be prefixed with `NEXT_PUBLIC_`.

Billing behavior:

- `BILLING_PROVIDER=mock` blocks live checkout and shows the missing PG requirements.
- The app must not collect raw card numbers in production. Real card entry should happen inside the PG checkout/billing-key flow.
- Real PG integration should be enabled after business registration, PG review, terms/privacy/refund policy pages, and settlement account preparation.
- Suggested Korean PG options for later integration are Toss Payments or PortOne. The current code is intentionally provider-ready but not connected to a live PG account.
- Set `BILLING_PROVIDER=live` and `PG_PROVIDER=toss` or `PG_PROVIDER=portone` only when live credentials are ready.

OpenAI and research keys:

- One `OPENAI_API_KEY` is enough for the AI generation provider.
- Market research can keep using `MockResearchProvider`, or use a separate Tavily/Serper key if live web research is needed.
- PG credentials are separate from OpenAI credentials.

## Setup

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Install dependencies:

```bash
npm install
```

Apply Prisma schema and generate client:

```bash
npm run prisma:push
```

Seed demo data:

```bash
npm run seed
```

Run development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Verification

Production build:

```bash
npm run build
```

Main demo project after seed:

```text
동네 학원을 위한 AI 상담·학습 리포트 자동화 SaaS
```

Demo login after seed:

```text
email: demo@founderos.ai
password: founderos-demo-1234
```

Optional test admin:

Set `TEST_ADMIN_EMAIL` and `TEST_ADMIN_PASSWORD` in local `.env`, then run `npm run seed`.
Those values are intentionally not documented in git-tracked files.

Useful routes:

- `/` Landing Page
- `/signup` Sign Up
- `/login` Login
- `/dashboard` Dashboard
- `/billing` Billing and payment method registration
- `/billing/checkout` Checkout alias
- `/projects/new` Project Creation
- `/projects/demo-project-ai-academy` Workspace
- `/projects/demo-project-ai-academy/questions` Follow-up Questions
- `/projects/demo-project-ai-academy/research` Research Report
- `/projects/demo-project-ai-academy/competitors` Competitor Matrix
- `/projects/demo-project-ai-academy/personas` Personas
- `/projects/demo-project-ai-academy/canvas` BM Canvas
- `/projects/demo-project-ai-academy/mvp` MVP Planning
- `/projects/demo-project-ai-academy/experiments` Validation Experiments
- `/projects/demo-project-ai-academy/plan` Business Plan Editor
- `/projects/demo-project-ai-academy/one-pager` IR One-Pager
- `/projects/demo-project-ai-academy/copy` Marketing Copy
- `/projects/demo-project-ai-academy/export` Markdown/DOCX Export
- `/projects/demo-project-ai-academy/share` Mentor Share
- `/admin` Admin Dashboard

## Delivery Demo Flow

1. Open `/dashboard` and show the demo project.
2. Sign up from `/signup`, then show `/billing`.
3. Register mock payment information and activate a plan.
4. Create a new project from `/projects/new`.
5. Open the demo workspace and walk through the left sidebar.
6. Generate follow-up questions and save answers.
7. Generate market research and show source cards, confidence badges, and AI assumption badges.
8. Generate competitor matrix.
9. Generate personas, BM Canvas, MVP features, and validation experiments.
10. Generate business plan drafts, edit one section, and save it.
11. Generate IR One-Pager and marketing copy.
12. Export Markdown and DOCX from Export page and show version history.
13. Create a mentor share link, open the read-only share page, and add a mentor comment.
14. Open `/admin` and show DB-backed metrics.

## Credit System

- Signup grants 300 trial credits as a `CreditLedger` GRANT entry. Balance is the sum of ledger amounts.
- Each AI generation deducts credits from the project owner: follow-up questions 5, market research 10, competitor matrix 10, personas 8, BM Canvas 8, MVP features 8, validation experiments 8, business plan full draft 20, per-section draft 3, IR One-Pager 8, marketing copy 10. Export is free.
- Deduction happens only after generation succeeds; insufficient balance returns HTTP 402 and the workspace toast shows the message.
- Users with `hasUnlimitedCredits` or super admins are never charged.
- The current balance is shown in the app header, and `/billing` lists the recent ledger history.
- Admins manage balances in the `/admin` credit section (positive amount = GRANT, negative = ADJUSTMENT) backed by `POST /api/admin/credits`.

## Notes

- PDF export has a TODO interface only.
- Authentication uses a simple httpOnly cookie session for demo delivery.
- Billing uses a mock PG flow until business registration and live PG review are complete.
- Mentor share pages are token-based and read-only except for mentor comments.
- Market research from mock provider uses demo sources. Source-less insights are marked as AI assumptions.
