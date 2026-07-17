# Northstar — the operating system for your career

Northstar helps professionals decide whether to stay, interview, negotiate, or
accept — with confidence, backed by personalized analysis instead of
guesswork.

This is the MVP: a Next.js app that scores incoming opportunities, compares
staying vs. an offer, drafts a negotiation plan, and keeps a permanent career
memory timeline.

## Stack

- **Next.js 16** (App Router, Server Actions, TypeScript)
- **PostgreSQL** via **Prisma 7** (driver adapter: `@prisma/adapter-pg`)
- **NextAuth v5** (Credentials provider, JWT sessions)
- **Tailwind CSS v4**

## What's real vs. mocked in this MVP

- **Real**: auth, profile, the decision engine (should-I-interview scoring,
  stay-vs-offer comparison, negotiation plan + email draft), career memory,
  Free/Pro tier gating, market benchmarks (seeded).
- **Mocked**: "Connect LinkedIn / Gmail / Calendar / Job boards" — these
  simulate what Northstar would automatically ingest, since wiring real OAuth
  requires registering apps with each provider. Swapping in real integrations
  later only touches `src/lib/actions/profile.ts` (`toggleConnector`).
- **AI-ready, not AI-backed**: the recommendation engine is deterministic
  rules (see `src/lib/engine/`), not an LLM call. Narrative generation is
  factored behind a `Reasoner` interface (`src/lib/engine/reasoner.ts`) so a
  real model call can be swapped in later without touching the scoring logic
  or the UI.

## Getting started

```bash
npm install

# Point DATABASE_URL at a Postgres instance (see .env.example)
cp .env.example .env

npx prisma migrate dev   # creates schema
npx prisma db seed       # seeds market benchmark data

npm run dev
```

Open http://localhost:3000.

## Project structure

```
prisma/schema.prisma        Data model (User, Profile, Opportunity, Offer,
                             Decision, Comparison, NegotiationDraft, CareerEvent, ...)
src/lib/engine/              The decision engine — scoring, comparison,
                             negotiation, market pulse, and the swappable
                             narrative Reasoner.
src/lib/actions/             Server Actions — the only way data is written.
src/app/(auth)/              Login / signup.
src/app/(app)/               The authenticated product: dashboard,
                             onboarding/profile, opportunities, career memory.
```

## Revenue model (as implemented)

- **Free**: profile, should-I-interview decisions, stay-vs-offer comparison.
- **Pro**: negotiation assistant, salary/market intelligence.
- **Enterprise**: not implemented in this MVP.

Tier is stored on `User.tier` and can be toggled from the Profile page for
demo purposes (no billing integration yet).
