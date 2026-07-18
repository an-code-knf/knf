# Northstar — should you stay, or should you go?

Northstar answers one question: is the job you've been invited to interview
for actually worth it? Paste the posting, confirm a few details, and get a
confidence-scored GO/STAY verdict backed by your salary, commute, and risk
tolerance — not another spreadsheet.

## Stack

- **Next.js 16** (App Router, Server Actions, TypeScript)
- **PostgreSQL** via **Prisma 7** (driver adapter: `@prisma/adapter-pg`)
- **NextAuth v5** (Credentials provider, JWT sessions)
- **Tailwind CSS v4**

## What's real vs. mocked in this MVP

- **Real**: auth, profile, the decision engine (deterministic scoring —
  salary delta, commute, company trajectory, leadership, promotion/learning
  outlook, risk tolerance fit), and best-effort job-posting URL parsing
  (`src/lib/job-fetch.ts` reads schema.org `JobPosting` structured data where
  a site provides it, falling back to page metadata).
- **Mocked**: "Connect LinkedIn / Gmail / Calendar / Job boards" on the
  Profile page — these simulate what Northstar would automatically ingest,
  since wiring real OAuth requires registering apps with each provider (and
  Glassdoor-equivalent data has no legitimate public API at all). Swapping in
  real integrations later only touches `src/lib/actions/profile.ts`
  (`toggleConnector`).
- **AI-ready, not AI-backed**: the recommendation engine is deterministic
  rules (see `src/lib/engine/scoring.ts`), not an LLM call. Narrative
  generation is factored behind a `Reasoner` interface
  (`src/lib/engine/reasoner.ts`) so a real model call can be swapped in later
  without touching the scoring logic or the UI.

## Getting started

```bash
npm install

# Point DATABASE_URL at a Postgres instance (see .env.example)
cp .env.example .env

npx prisma migrate dev   # creates schema

npm run dev
```

Open http://localhost:3000.

## Project structure

```
prisma/schema.prisma    Data model — User, Profile, Connector. Opportunities
                         are not persisted; each decision is computed fresh
                         from the form + profile and shown immediately.
src/lib/engine/          The decision engine — scoring.ts (the rules) and
                         reasoner.ts (the swappable narrative generator).
src/lib/job-fetch.ts     Server-side job-posting URL fetch + parse, with
                         basic SSRF guardrails.
src/lib/actions/         Server Actions — the only way data is written.
src/app/(auth)/          Login / signup.
src/app/(app)/decide/    The product: paste a URL or fill in the details,
                         hit the big button, get GO or STAY.
src/app/(app)/onboarding/ Profile setup + mocked connectors.
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
4. Open the `*.vercel.app` URL Vercel gives you — that's your live app.

`NEXTAUTH_URL` doesn't need to be set manually on Vercel; Auth.js trusts the
Vercel-provided host automatically. Set it only if you attach a custom domain.
