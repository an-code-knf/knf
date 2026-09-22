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

## Entry template

```md
## YYYY-MM-DD — Decision title

**Status:** Proposed | Accepted | Superseded

Context and decision in a few sentences.
```
