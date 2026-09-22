# Northstar

This file is the product and delivery source of truth. Update it when the
product direction, MVP boundary, architecture, or current priorities change.
Detailed technical context lives in [`docs/`](docs/README.md).

## Product in one sentence

Northstar helps a professional decide whether a job opportunity is worth an
interview by comparing it with their current situation and returning a clear,
evidence-backed GO or STAY verdict.

## Product status

- Stage: narrow MVP / working prototype
- Repository: `an-code-knf/knf`
- Active deployment branch: `claude/ai-career-decision-mvp-7jnkqf`
- Production project: Vercel `an-code-knfs-projects/northstar`
- Latest production commit observed on 2026-09-22: `7b68c8f`
- Stable production URL: `northstar-rho-one.vercel.app`
- Latest deployment URL: `northstar-g3h1ettwb-an-code-knfs-projects.vercel.app`

## Vision

Give people a trusted decision layer for important career choices. Northstar
should reduce research and comparison work to a short, transparent workflow
without pretending that an algorithm can make the final life decision for the
user.

## Target user

The working target is an employed professional who has been invited to
interview and wants a fast answer to: "Is this opportunity meaningfully better
than my current role?"

This is a hypothesis until validated through customer interviews. The MVP is
not currently designed for active job seekers comparing many open roles,
recruiters, or employers.

## Customer problem

Evaluating an interview invitation requires piecing together salary, commute,
company quality, career upside, personal risk tolerance, and family constraints.
The user wants to know whether the opportunity deserves more time before
entering a lengthy interview process.

## MVP promise

After the user records their current situation and supplies a job posting or
opportunity details, Northstar returns:

- a GO or STAY verdict;
- a confidence score;
- the strongest factors for and against the opportunity; and
- a short rationale traceable to those factors.

## MVP scope

In scope today:

- credentials-based signup and login;
- a reusable profile describing the user's current role and constraints;
- best-effort extraction of public job-posting metadata;
- manual entry and correction of opportunity details;
- deterministic, inspectable scoring; and
- an immediate recommendation without persisting the opportunity.

Not yet real or not in scope:

- LinkedIn, Gmail, Calendar, or job-board integrations (currently simulated);
- an LLM-backed recommendation engine;
- persisted opportunity history, side-by-side comparison, or negotiation tools;
- payment processing despite pricing language on the landing page;
- native mobile apps, employer/recruiter workflows, or team accounts.

## Product principles

1. **One decision at a time.** Keep the core workflow focused on whether an
   interview is worth pursuing.
2. **Explain every verdict.** The recommendation, score, pros, cons, and
   rationale must agree.
3. **Prefer user facts to invented certainty.** Missing data should remain
   visible; confidence should not imply evidence the system does not have.
4. **Protect personal career data.** Collect only what improves the decision
   and never imply that simulated integrations are real.
5. **Validate before expanding.** No feature enters the MVP without a clear
   customer problem and evidence that it improves the decision.

## Architecture snapshot

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- PostgreSQL through Prisma 7
- NextAuth v5 credentials provider with JWT sessions
- Server Actions for authenticated profile and decision workflows
- Deterministic scoring in `src/lib/engine/scoring.ts`
- Swappable narrative interface in `src/lib/engine/reasoner.ts`
- Vercel deployment with hosted PostgreSQL supplied through `DATABASE_URL`

See [`docs/architecture.md`](docs/architecture.md) for boundaries and data flow.

## Current priorities

1. Validate the target user, trigger event, and willingness to pay through
   customer interviews and observed tests of the current flow.
2. Define success measures for the MVP: completed decisions, perceived trust,
   decision usefulness, and whether users take or skip the interview.
3. Establish a reliability baseline before adding features: automated tests for
   scoring, authentication, and job-posting ingestion; explicit confidence
   semantics; and production error visibility.
4. Move production to a deliberately named default/release branch after the
   current MVP is reviewed.
5. Only then decide whether the next investment is better data ingestion,
   saved decisions, or an AI-backed explanation layer.

## Operating rules

- Before building a feature, state the customer problem in one sentence.
- Record durable product or technical decisions in
  [`docs/decisions.md`](docs/decisions.md).
- Keep this file current; do not create parallel strategy documents that
  conflict with it.
- Do not store credentials, tokens, production data, or copied CVs in the repo.
- Product behavior changes require a test plan and an explicit success measure.

## Open questions

- Is the first user a passive candidate, an active job seeker, or both?
- Which missing input most often changes the verdict?
- What does the displayed confidence percentage mean to users?
- Is the intended paid unit a single decision, a subscription, or something
  else?
- Should a decision be saved, and if so, for how long and with what privacy
  controls?

## Decision log

The canonical log is [`docs/decisions.md`](docs/decisions.md). The current
baseline decisions are: narrow the MVP to interview-worthiness, use a
deterministic scoring core, make narratives replaceable, keep connectors
explicitly simulated, and avoid persisting decisions in the first prototype.
