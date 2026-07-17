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

## Deploy (Vercel + hosted Postgres)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fan-code-knf%2Fknf%2Ftree%2Fclaude%2Fai-career-decision-mvp-7jnkqf&env=DATABASE_URL,NEXTAUTH_SECRET&envDescription=Postgres%20connection%20string%20(from%20Neon%2FSupabase)%20and%20a%20random%20auth%20secret&project-name=northstar&repository-name=northstar)

1. **Create a Postgres database** — [Neon](https://neon.tech) or
   [Supabase](https://supabase.com) both have a free tier. Copy the connection
   string (it should include `?sslmode=require`).
2. **Click the Deploy button above.** It imports this branch into a new
   Vercel project and prompts for env vars:
   - `DATABASE_URL` — the connection string from step 1
   - `NEXTAUTH_SECRET` — any random string (e.g. `openssl rand -base64 32`)
3. **Deploy.** The build runs `prisma migrate deploy && next build`
   automatically, so the schema is created on first deploy — no manual
   migration step.
4. **Seed market benchmark data** (one-time, from your machine, pointed at
   the hosted database):
   ```bash
   DATABASE_URL="<your hosted connection string>" npx prisma db seed
   ```
5. Open the `*.vercel.app` URL Vercel gives you — that's your live app.

`NEXTAUTH_URL` doesn't need to be set manually on Vercel; Auth.js trusts the
Vercel-provided host automatically. Set it only if you attach a custom domain.

## Revenue model (as implemented)

- **Free**: profile, should-I-interview decisions, stay-vs-offer comparison.
- **Pro**: negotiation assistant, salary/market intelligence.
- **Enterprise**: not implemented in this MVP.

Tier is stored on `User.tier` and can be toggled from the Profile page for
demo purposes (no billing integration yet).
