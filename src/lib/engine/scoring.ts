import type { ProfileInput, OpportunityInput, OpportunityScore, ScoredFactor } from "./types";
import { reasoner } from "./reasoner";

function pct(delta: number, base: number): number {
  if (!base) return 0;
  return (delta / base) * 100;
}

/**
 * Deterministic "should I even take this interview?" scoring.
 * Every factor below is a rule, not a guess — each one produces a labeled,
 * signed point value so the pros/cons list and the confidence score always
 * agree with each other.
 */
export function scoreOpportunity(
  profileInput: ProfileInput,
  opportunity: OpportunityInput
): OpportunityScore {
  const profile = profileInput ?? {
    currentSalary: null,
    commuteMinutes: null,
    riskTolerance: "MEDIUM" as const,
    familySituation: null,
    currentPromotionOutlook: null,
    currentLearningRating: null,
  };
  const factors: ScoredFactor[] = [];

  // Salary
  {
    const min = opportunity.salaryEstimateMin ?? opportunity.salaryEstimateMax;
    const max = opportunity.salaryEstimateMax ?? opportunity.salaryEstimateMin;
    const est = min != null && max != null ? (min + max) / 2 : 0;
    if (profile.currentSalary && est) {
      const deltaPct = pct(est - profile.currentSalary, profile.currentSalary);
      const points = Math.max(-30, Math.min(30, Math.round(deltaPct * 1.8)));
      if (deltaPct >= 3) {
        factors.push({ label: `+${deltaPct.toFixed(0)}% salary`, points });
      } else if (deltaPct <= -3) {
        factors.push({ label: `${deltaPct.toFixed(0)}% lower salary`, points });
      }
    }
  }

  // Commute / remote
  if (opportunity.remote) {
    factors.push({ label: "remote", points: 15 });
  } else if (opportunity.commuteMinutes != null && profile.commuteMinutes != null) {
    const delta = opportunity.commuteMinutes - profile.commuteMinutes;
    if (delta >= 10) {
      factors.push({ label: `longer commute (+${delta}min)`, points: -Math.min(15, Math.round(delta / 2)) });
    } else if (delta <= -10) {
      factors.push({ label: `shorter commute (${delta}min)`, points: Math.min(12, Math.round(-delta / 2)) });
    }
  }

  // Company trajectory
  if (opportunity.companyTrajectory === "GROWING") {
    factors.push({ label: "company growing", points: 10 });
  } else if (opportunity.companyTrajectory === "SLOWING") {
    factors.push({ label: "company growth slowing", points: -10 });
  }

  // Leadership
  if (opportunity.leadershipRating != null) {
    if (opportunity.leadershipRating >= 4) {
      factors.push({ label: "stronger leadership", points: 8 });
    } else if (opportunity.leadershipRating <= 2) {
      factors.push({ label: "weaker leadership team", points: -8 });
    }
  }

  // Promotion outlook vs current baseline
  const promotionBaseline = profile.currentPromotionOutlook ?? 3;
  if (opportunity.promotionOutlook != null) {
    const delta = opportunity.promotionOutlook - promotionBaseline;
    if (delta <= -1) {
      factors.push({ label: "promotion opportunities lower", points: -8 });
    } else if (delta >= 1) {
      factors.push({ label: "better promotion path", points: 8 });
    }
  }

  // Learning & development vs current baseline
  const learningBaseline = profile.currentLearningRating ?? 3;
  if (opportunity.learningRating != null) {
    const delta = opportunity.learningRating - learningBaseline;
    if (delta <= -1) {
      factors.push({ label: "fewer learning opportunities", points: -6 });
    } else if (delta >= 1) {
      factors.push({ label: "stronger learning & development", points: 6 });
    }
  }

  // Risk tolerance vs company stage
  if (opportunity.companyStage === "STARTUP") {
    if (profile.riskTolerance === "HIGH") {
      factors.push({ label: "matches your risk appetite", points: 5 });
    } else if (profile.riskTolerance === "LOW") {
      factors.push({ label: "startup risk may not fit your risk tolerance", points: -8 });
    }
  } else if (opportunity.companyStage === "ENTERPRISE") {
    if (profile.riskTolerance === "LOW") {
      factors.push({ label: "stability matches your risk tolerance", points: 5 });
    } else if (profile.riskTolerance === "HIGH") {
      factors.push({ label: "may move slower than you'd like", points: -3 });
    }
  }

  // Family situation heuristic
  const familyText = (profile.familySituation ?? "").toLowerCase();
  const hasFamilyConstraint = /child|kid|baby|parent|caregiv/.test(familyText);
  if (hasFamilyConstraint && !opportunity.remote && (opportunity.commuteMinutes ?? 0) > (profile.commuteMinutes ?? 0)) {
    factors.push({ label: "less flexibility for family commitments", points: -5 });
  }

  const netScore = factors.reduce((sum, f) => sum + f.points, 0);
  const confidence = Math.max(5, Math.min(97, Math.round(50 + netScore)));
  const recommendation: OpportunityScore["recommendation"] = netScore >= 0 ? "INTERVIEW" : "SKIP";

  const pros = factors.filter((f) => f.points > 0).sort((a, b) => b.points - a.points).map((f) => f.label);
  const cons = factors.filter((f) => f.points < 0).sort((a, b) => a.points - b.points).map((f) => f.label);

  return {
    recommendation,
    confidence,
    pros,
    cons,
    netScore,
    rationale: "",
  };
}

export async function scoreOpportunityWithRationale(
  profile: ProfileInput,
  opportunity: OpportunityInput
): Promise<OpportunityScore> {
  const score = scoreOpportunity(profile, opportunity);
  const headline =
    score.recommendation === "INTERVIEW"
      ? `Take the interview with ${opportunity.company}.`
      : `Skip this one from ${opportunity.company} for now.`;

  const rationale = await reasoner.summarize({
    kind: "interview-decision",
    headline,
    pros: score.pros,
    cons: score.cons,
    facts: { role: opportunity.role, company: opportunity.company, confidence: score.confidence },
  });

  return { ...score, rationale };
}
