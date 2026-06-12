# FounderOS AI Phase 0 Plan

## 1. Current Repository Structure

The repository is currently empty except for Git metadata.

Current state:

- Branch: `main`
- Remote: `origin/main`
- Commit: `dfebfad Initial commit`
- Application files: none
- Existing framework/configuration: none

Implication:

- There is no legacy architecture to preserve.
- Phase 1 should scaffold the app carefully and keep the first build passing.
- We should avoid creating large placeholder surfaces before the core project flow works.

## 2. Recommended Folder Structure

Recommended starting structure:

```text
.
├── app/
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx
│   │   │       ├── research/
│   │   │       ├── personas/
│   │   │       ├── competitors/
│   │   │       ├── canvas/
│   │   │       ├── mvp/
│   │   │       ├── experiments/
│   │   │       ├── plan/
│   │   │       ├── one-pager/
│   │   │       ├── copy/
│   │   │       └── share/
│   │   └── admin/
│   │       └── page.tsx
│   ├── api/
│   │   ├── ai/
│   │   ├── research/
│   │   ├── export/
│   │   └── share/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── app-shell/
│   ├── editor/
│   ├── project/
│   ├── research/
│   ├── export/
│   └── ui/
├── lib/
│   ├── ai/
│   │   ├── types.ts
│   │   ├── mock-provider.ts
│   │   ├── openai-provider.ts
│   │   └── index.ts
│   ├── research/
│   │   ├── types.ts
│   │   ├── mock-provider.ts
│   │   ├── web-provider.ts
│   │   └── index.ts
│   ├── export/
│   │   ├── markdown.ts
│   │   └── docx.ts
│   ├── templates/
│   ├── validators/
│   ├── auth/
│   ├── db.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── server/
│   ├── actions/
│   ├── services/
│   └── queries/
├── types/
├── docs/
├── public/
└── tests/
```

Structure principles:

- `app/` owns routes and page composition.
- `components/` owns reusable UI and workflow components.
- `server/actions`, `server/services`, and `server/queries` keep business logic out of page files.
- `lib/ai` and `lib/research` are provider abstractions from day one.
- `lib/export` generates user-edited content, not regenerated AI defaults.
- `prisma/schema.prisma` is the source of truth for persisted workflow data.

## 3. Phase Plan

### Phase 1: App Foundation and Project Creation

Scope:

- Scaffold Next.js App Router with TypeScript and Tailwind.
- Add shadcn/ui baseline.
- Add Prisma and PostgreSQL configuration.
- Add basic app shell.
- Implement project list and project creation flow.
- Add industry template selection.
- Store projects and selected templates in DB.
- Add MockAIProvider and MockResearchProvider interfaces, even if only lightly used.

Completion criteria:

- `npm run build` passes.
- User can create a project with idea, industry, target customer, and template.
- Created project persists in DB and appears in project list.
- No external AI or research key is required for the demo.

### Phase 2: AI Discovery Questions and Project Workspace

Scope:

- Add project workspace navigation.
- Generate AI follow-up questions through provider abstraction.
- Let users answer and edit discovery answers.
- Persist questions and answers.
- Add usage logging for AI calls, including mock calls.

Completion criteria:

- User can open a project and generate follow-up questions.
- User can edit and save answers.
- Saved answers survive refresh.
- MockAIProvider path works without API key.
- UsageLog records the operation.

### Phase 3: Research, Sources, and Market Analysis

Scope:

- Add research provider abstraction.
- Implement mock research results with realistic citations.
- Add market research workspace.
- Save sources as first-class records.
- Save market analysis sections with source coverage.
- Mark unsourced claims as `AI 추정`.

Completion criteria:

- User can run market research for a project.
- Research results and source links persist.
- Market analysis can distinguish sourced claims from AI-estimated claims.
- User can edit the generated analysis.
- Build passes without real research API keys.

### Phase 4: Personas, Competitors, and Business Model Canvas

Scope:

- Generate and edit customer personas.
- Generate and edit competitor analysis.
- Add BM Canvas editor with structured blocks.
- Persist all sections independently.

Completion criteria:

- User can generate, edit, and save personas.
- User can generate, edit, and save competitor analysis.
- User can edit BM Canvas by block, not as one textarea.
- All changes are stored in DB and survive refresh.

### Phase 5: MVP Prioritization and Validation Experiments

Scope:

- Add MVP feature backlog.
- Add prioritization fields such as impact, confidence, effort, and priority score.
- Add validation experiment designer.
- Connect experiments to assumptions, personas, or MVP features.

Completion criteria:

- User can create and reorder MVP features.
- Priority calculation is visible and persisted.
- User can create validation experiments with hypothesis, method, success metric, and timeline.
- Edited MVP and experiment data is reflected in the project workspace.

### Phase 6: Business Plan Section Editors

Scope:

- Add business plan template with question-level editors.
- Generate draft answers per question.
- Save user edits per question.
- Add progress tracking across required sections.

Completion criteria:

- Business plan is not a single long textarea.
- Each question has its own editor and save state.
- User edits override generated drafts.
- Project progress updates based on completed questions.

### Phase 7: Export, One-Pager, Landing Copy, and Ads

Scope:

- Add IR One-Pager editor.
- Add landing page copy generator/editor.
- Add ad copy generator/editor.
- Add Markdown export.
- Add DOCX export.
- Ensure exports use saved user-edited data.

Completion criteria:

- User can generate and edit one-pager, landing copy, and ad copy.
- User can download Markdown export.
- User can download DOCX export.
- Exported content matches saved edits, not stale AI output.

### Phase 8: Sharing, Admin, Credits, and Hardening

Scope:

- Add mentor share links with read-only project views.
- Add admin dashboard.
- Add CreditLedger.
- Add usage analytics.
- Add authorization boundaries.
- Add production hardening around errors, empty states, and provider failures.

Completion criteria:

- User can create and revoke mentor share links.
- Mentor can view shared project without editing.
- Admin can inspect projects, usage logs, and credit ledger entries.
- CreditLedger records credit grants and spends.
- Provider errors are shown clearly without data loss.
- Build and core smoke flows pass.

## 4. Key Data Model Priorities

Early Prisma models should include:

- `User`
- `Project`
- `IndustryTemplate`
- `DiscoveryQuestion`
- `DiscoveryAnswer`
- `ResearchRun`
- `Source`
- `MarketInsight`
- `Persona`
- `Competitor`
- `BusinessModelCanvas`
- `MvpFeature`
- `ValidationExperiment`
- `BusinessPlanSection`
- `BusinessPlanAnswer`
- `OnePager`
- `MarketingCopy`
- `ShareLink`
- `UsageLog`
- `CreditLedger`

Important modeling decisions:

- Generated content and user-edited content should be distinguishable.
- Sources should be reusable across market insights and competitor analysis.
- Export should read from saved section records, not from transient generation responses.
- Usage and credits should be append-only where possible.

## 5. Risks and Priorities

### Highest Priority

- Keep every phase buildable and demoable.
- Establish DB schema early enough to avoid rewriting all flows later.
- Build provider abstractions before relying on OpenAI or external research APIs.
- Make user edits the canonical content for export.

### Product Risks

- The product can easily become a generic business-plan generator.
- Research without trustworthy source handling can damage user trust.
- Too many modules at once can produce a wide but shallow app.
- Admin and credits can become noisy unless usage events are designed early.

### Technical Risks

- DOCX export can drift from the edited UI content if export reads from the wrong layer.
- Provider abstractions can become too generic unless each method maps to a real workflow.
- Long generated text can create poor editor UX if sections are not chunked.
- PostgreSQL setup can slow local demo if not paired with clear seed and env defaults.

### Recommended Build Order

1. Project creation and persistence.
2. AI discovery questions with mock provider.
3. Research and source model.
4. Structured editors for personas, competitors, canvas, and plan sections.
5. Export from saved data.
6. Sharing, admin, and credit accounting.

## 6. Phase 1 Starting Recommendation

Phase 1 should not attempt to build the entire workspace. It should produce a small but real vertical slice:

- Create project.
- Select industry template.
- Persist to PostgreSQL through Prisma.
- View project dashboard.
- Show provider status for MockAI and MockResearch.
- Pass build.

This gives the rest of the product a stable spine.
