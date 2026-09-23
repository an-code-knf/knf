# Decision log

Record decisions that future contributors should not have to rediscover. Keep
entries short; link to a pull request or research note when deeper evidence
exists.

## 2026-07-18 — Narrow the MVP to interview-worthiness

**Status:** Accepted

Northstar answers whether an opportunity is worth interviewing for. Broader
career operating-system concepts remain outside the MVP until this decision is
validated with users.

## 2026-07-18 — Use a deterministic scoring core

**Status:** Accepted

Recommendations are produced by explicit rules so that the verdict, score,
pros, and cons remain inspectable and internally consistent.

## 2026-07-18 — Keep narrative generation replaceable

**Status:** Accepted

The `Reasoner` interface separates prose generation from scoring. The current
implementation is template-based; a model-backed implementation may replace it
without moving decision authority out of the scoring layer.

## 2026-07-18 — Simulate connectors in the prototype

**Status:** Accepted for prototype only

LinkedIn, Gmail, Calendar, and job-board controls demonstrate the intended
experience but do not perform OAuth or external synchronization. The UI and
documentation must continue to state this clearly.

## 2026-07-18 — Do not persist opportunities or decisions

**Status:** Accepted for prototype only

The first prototype computes and displays each result immediately. Persistence
should be added only after validating that history, comparison, or follow-up
creates enough user value to justify the privacy and data-retention burden.

## 2026-09-22 — Establish one source of truth

**Status:** Accepted

`NORTHSTAR.md` owns product direction and MVP boundaries. `docs/architecture.md`
owns current system facts. This file owns durable decisions. The README remains
the quick-start guide.

## 2026-09-23 — Refuse low-evidence verdicts

**Status:** Accepted

The engine returns MORE INFO when fewer than two comparable evidence dimensions
are present or when supported factors are tied. A neutral score is not evidence
for taking an interview. Numeric “confidence” is replaced with a count and
low/medium/high evidence label because the existing percentage was not
calibrated.

## 2026-09-23 — Remove unsupported trust claims from the active MVP

**Status:** Accepted

The landing page no longer claims an AI decision or advertises an unimplemented
$1.99 purchase. Simulated connector controls are removed from active onboarding.
Optional CV, family, skills, and goals fields remain available but collapsed.
These changes favor honest product behavior over prototype theater.

## 2026-09-23 — Treat synthetic evaluation as hypothesis generation

**Status:** Accepted

The 300-persona synthetic study in `docs/research/` is useful for finding
internal contradictions and generating priorities, but it is not customer
validation. No pricing, retention, or expansion decision may rely on it without
real interviews or behavioral evidence.

## Entry template

```md
## YYYY-MM-DD — Decision title

**Status:** Proposed | Accepted | Superseded

Context and decision in a few sentences.
```
