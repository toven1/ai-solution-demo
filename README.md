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

Useful routes:

- `/` Landing Page
- `/dashboard` Dashboard
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
2. Create a new project from `/projects/new`.
3. Open the demo workspace and walk through the left sidebar.
4. Generate follow-up questions and save answers.
5. Generate market research and show source cards, confidence badges, and AI assumption badges.
6. Generate competitor matrix.
7. Generate personas, BM Canvas, MVP features, and validation experiments.
8. Generate business plan drafts, edit one section, and save it.
9. Generate IR One-Pager and marketing copy.
10. Export Markdown and DOCX from Export page and show version history.
11. Create a mentor share link, open the read-only share page, and add a mentor comment.
12. Open `/admin` and show DB-backed metrics.

## Notes

- PDF export has a TODO interface only.
- Authentication and authorization are intentionally simplified for demo delivery.
- Mentor share pages are token-based and read-only except for mentor comments.
- Market research from mock provider uses demo sources. Source-less insights are marked as AI assumptions.
