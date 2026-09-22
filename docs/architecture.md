# Architecture

## System shape

Northstar is a single Next.js application deployed to Vercel. Pages and Server
Actions share one codebase. PostgreSQL stores users, profiles, and simulated
connector state. Opportunity inputs and recommendations are currently computed
per request and are not persisted.

## Main flows

### Authentication

1. `POST /api/signup` validates input, hashes the password, and creates a user.
2. NextAuth's Credentials provider verifies the password.
3. A JWT session carries the user ID to authenticated pages and Server Actions.

### Profile

1. The user records their current role, salary, commute, career context, and
   risk tolerance on `/onboarding`.
2. `saveProfile` upserts the single profile associated with the user.
3. Connector toggles write simulated data only; no third-party OAuth or sync is
   active.

### Decision

1. The user optionally supplies a public job-posting URL.
2. `fetchJobPosting` attempts to read schema.org `JobPosting` JSON-LD and falls
   back to basic page metadata.
3. The user confirms or manually supplies the opportunity facts.
4. `scoreOpportunity` compares those facts with the stored profile using
   deterministic rules.
5. The reasoner formats the same scored factors into a short rationale.
6. The result is rendered immediately and is not stored.

## Boundaries

| Area | Location | Responsibility |
| --- | --- | --- |
| Routes and pages | `src/app/` | Navigation, rendering, auth boundaries |
| Reusable UI | `src/components/` | Forms, navigation, visual primitives |
| Server workflows | `src/lib/actions/` | Authenticated writes and decision requests |
| Decision engine | `src/lib/engine/` | Scoring rules, types, narrative abstraction |
| Job ingestion | `src/lib/job-fetch.ts` | Public page retrieval and metadata parsing |
| Authentication | `src/lib/auth.ts`, `src/lib/session.ts` | Credentials login and session enforcement |
| Persistence | `prisma/`, `src/lib/db.ts` | Schema, migrations, database client |

## Data model

- `User`: credentials identity.
- `Profile`: one-to-one career baseline and personal decision factors.
- `Connector`: one record per simulated connector type and user.
- No `Opportunity` or `Decision` model exists in the current MVP.

## Deployment

- Vercel project: `an-code-knfs-projects/northstar`
- Source repository: `an-code-knf/knf`
- Observed production branch: `claude/ai-career-decision-mvp-7jnkqf`
- Observed production commit: `7b68c8f7d0924b1e8c9ec75f9d2127694b6748a4`
- Stable production URL: `northstar-rho-one.vercel.app`
- Required environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`
- Build command from `package.json`: `prisma migrate deploy && next build`

Do not copy production environment values into documentation or local files.

## Known gaps and risks

- There is no automated test suite or CI configuration.
- The confidence percentage is derived directly from score points and is not a
  calibrated probability.
- Job ingestion applies useful first-pass SSRF checks but does not resolve DNS,
  so it is not a complete security boundary.
- Password login has no email verification, reset flow, or visible rate limit.
- Simulated connectors write sample state to the database but never contact the
  named services.
- The package name (`knf`), product name (`Northstar`), and long-lived feature
  branch should be normalized when release ownership is decided.
