# Synthetic MVP evaluation — 300 target-user identities

**Date:** 2026-09-23  
**Owner:** Chief Product Officer  
**Evidence type:** Deterministic synthetic evaluation; not customer research

## Executive decision

Do not add decision history, integrations, or an LLM yet. The current MVP first
needs to earn trust. The most serious defect is that missing information can
produce a confident-looking binary verdict. The active product also claims AI,
pricing, and breadth that it does not implement.

This review resulted in four immediate changes:

1. return MORE INFO when fewer than two comparable dimensions are present or
   the supported factors are tied;
2. replace the uncalibrated confidence percentage with visible evidence depth;
3. remove unsupported AI and $1.99 claims plus simulated connector controls;
4. move sensitive personalization fields behind a clearly optional disclosure.

## Method

A seeded generator created 300 employed professionals who had received an
interview invitation. The cohort varied across seniority, urgency, risk
tolerance, family constraints, privacy sensitivity, trust sensitivity, price
sensitivity, job-page readability, and available comparison data.

The simulation evaluated the product as implemented before this report:

- acquisition promise on the landing page;
- signup and profile burden;
- job URL fallback behavior;
- decision evidence available to the scoring engine; and
- whether the displayed verdict overstated what the inputs supported.

The generated cohort and summary are reproducible from the dated simulation
script used during this review. Individual synthetic records are intentionally
not committed because they are generated evidence, not customer records.

## Cohort

| Dimension | Distribution |
| --- | --- |
| Seniority | 50 early, 105 mid, 104 senior, 41 leaders |
| Urgency | 116 curious, 93 deciding this week, 91 deciding today |
| Risk tolerance | 75 low, 144 medium, 81 high |
| High trust sensitivity | 204 of 300 |
| High privacy sensitivity | 155 of 300 |

## Results

| Finding | Synthetic users affected | Product interpretation |
| --- | ---: | --- |
| AI/confidence claims exceed implementation | 204 | Primary trust leak |
| Sensitive profile burden before demonstrated value | 155 | Activation and privacy risk |
| Job URL needed manual fallback | 105 | Expected ingestion limitation; fallback must stay obvious |
| $1.99 claim lacks a purchase or pricing explanation | 92 | Credibility defect, not a monetization test |
| Fewer than two comparable evidence dimensions | 94 | Verdict should be withheld |
| Low-evidence case still receiving GO | 72 | Critical decision-quality defect |
| Expressed preference for decision history | 117 | Interesting, but below trust/reliability work |

The modeled activation expectation was 60.7%. That number is directional only;
it is produced by explicit synthetic penalties and is not a forecast of real
conversion.

## CPO interpretation

### 1. Trust is the MVP bottleneck

The target user is considering a consequential career decision. Unsupported AI
language, pseudo-precise confidence, and fake connector affordances make the
product feel less trustworthy precisely when credibility matters most.

### 2. Missing data must be a first-class outcome

Before this change, no scored factors produced a net score of zero, which the
engine mapped to INTERVIEW. A lack of evidence was therefore treated as a
positive decision. MORE INFO is a product feature, not an error state.

### 3. Profile depth should be earned

Salary, commute, current promotion outlook, learning outlook, and risk tolerance
can support the first comparison. CV text, skills, family context, and goals may
improve later personalization, but asking prominently before value is shown
creates avoidable privacy friction.

### 4. History is plausible but premature

117 synthetic users preferred saved decisions, but persistence adds privacy,
retention, and comparison complexity. Real observed use must show repeat intent
before it enters scope.

## Changes applied

- Added a seven-dimension evidence model, a two-dimension minimum, and a neutral
  tie guard.
- Added MORE INFO with concrete prompts for useful missing inputs.
- Replaced numeric confidence with evidence count and low/medium/high depth.
- Added deterministic scoring tests for missing, positive, negative, and neutral
  evidence cases.
- Corrected landing-page and metadata claims to match the actual MVP.
- Removed simulated connectors from active onboarding.
- Collapsed sensitive optional profile fields.

## Success measures for real validation

The next evidence must come from people, not more simulation:

1. Ten interviews with employed professionals who received an interview invite
   in the previous 90 days.
2. Five observed usability sessions from signup through verdict.
3. Instrumented rates for profile completion, decision submission, MORE INFO,
   resubmission after MORE INFO, and “recommendation was useful.”
4. Qualitative checks that users correctly understand evidence depth and do not
   read it as probability or certainty.

## Explicit limitations

- Personas were generated from product hypotheses, not sampled from a market.
- Activation weights were assigned by the product team.
- No willingness-to-pay conclusion is supported.
- No conclusion about retention or decision history demand is supported.
- The exercise can reveal contradictions in the product; it cannot prove demand.
