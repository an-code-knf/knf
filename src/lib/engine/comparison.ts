import type { ProfileInput, OpportunityInput, OfferInput, ComparisonRow, OfferComparison } from "./types";
import { reasoner } from "./reasoner";

const STAY_ANNUAL_RAISE = 0.03;
const NEW_JOB_ANNUAL_RAISE = 0.04;

function rating(n: number | null | undefined): string {
  if (n == null) return "Unknown";
  return `${n}/5`;
}

function edgeFromNumbers(stay: number, candidate: number, higherIsBetter = true): ComparisonRow["edge"] {
  if (stay === candidate) return "even";
  const candidateWins = higherIsBetter ? candidate > stay : candidate < stay;
  return candidateWins ? "candidate" : "stay";
}

function projectFiveYearEarnings(startingSalary: number, annualRaise: number): number {
  let total = 0;
  let salary = startingSalary;
  for (let year = 0; year < 5; year++) {
    total += salary;
    salary *= 1 + annualRaise;
  }
  return Math.round(total);
}

export function compareStayVsOffer(
  profileInput: ProfileInput,
  opportunity: OpportunityInput,
  offer: OfferInput
): Omit<OfferComparison, "rationale"> {
  const profile = profileInput ?? {
    currency: "DKK",
    currentSalary: null,
    currentPensionPct: null,
    commuteMinutes: null,
    currentVacationDays: null,
    currentLearningRating: null,
    currentManagerRating: null,
    currentCompanyStabilityRating: null,
    currentPromotionOutlook: null,
  };
  const stayCurrency = profile.currency;
  const staySalary = profile.currentSalary ?? 0;
  const rows: ComparisonRow[] = [];

  rows.push({
    label: "Salary",
    stay: staySalary ? `${staySalary.toLocaleString()} ${stayCurrency}` : "Unknown",
    candidate: `${offer.baseSalary.toLocaleString()} ${offer.currency}`,
    edge: edgeFromNumbers(staySalary, offer.baseSalary),
  });

  const stayPension = profile.currentPensionPct ?? 0;
  const newPension = offer.pensionPct ?? 0;
  rows.push({
    label: "Pension",
    stay: profile.currentPensionPct != null ? `${profile.currentPensionPct}%` : "Unknown",
    candidate: offer.pensionPct != null ? `${offer.pensionPct}%` : "Unknown",
    edge: edgeFromNumbers(stayPension, newPension),
  });

  const stayCommute = profile.commuteMinutes ?? 0;
  const newCommute = opportunity.remote ? 0 : opportunity.commuteMinutes ?? 0;
  rows.push({
    label: "Commute",
    stay: profile.commuteMinutes != null ? `${profile.commuteMinutes} min/day` : "Unknown",
    candidate: opportunity.remote ? "Remote" : opportunity.commuteMinutes != null ? `${opportunity.commuteMinutes} min/day` : "Unknown",
    edge: edgeFromNumbers(stayCommute, newCommute, false),
  });

  const stayVacation = profile.currentVacationDays ?? 0;
  const newVacation = offer.vacationDays ?? 0;
  rows.push({
    label: "Vacation",
    stay: profile.currentVacationDays != null ? `${profile.currentVacationDays} days` : "Unknown",
    candidate: offer.vacationDays != null ? `${offer.vacationDays} days` : "Unknown",
    edge: edgeFromNumbers(stayVacation, newVacation),
  });

  const stayLearning = profile.currentLearningRating ?? 3;
  const newLearning = opportunity.learningRating ?? 3;
  rows.push({
    label: "Learning",
    stay: rating(profile.currentLearningRating),
    candidate: rating(opportunity.learningRating),
    edge: edgeFromNumbers(stayLearning, newLearning),
  });

  const stayManager = profile.currentManagerRating ?? 3;
  const newManager = opportunity.leadershipRating ?? 3;
  rows.push({
    label: "Manager",
    stay: rating(profile.currentManagerRating),
    candidate: rating(opportunity.leadershipRating),
    edge: edgeFromNumbers(stayManager, newManager),
  });

  const stayStability = profile.currentCompanyStabilityRating ?? 3;
  const trajectoryToRating: Record<string, number> = { GROWING: 4, STABLE: 3, SLOWING: 2 };
  const newStability = opportunity.companyTrajectory ? trajectoryToRating[opportunity.companyTrajectory] : 3;
  rows.push({
    label: "Company stability",
    stay: rating(profile.currentCompanyStabilityRating),
    candidate: rating(newStability),
    edge: edgeFromNumbers(stayStability, newStability),
  });

  const stayPromotion = profile.currentPromotionOutlook ?? 3;
  const newPromotion = opportunity.promotionOutlook ?? 3;
  rows.push({
    label: "Promotion chance",
    stay: rating(profile.currentPromotionOutlook),
    candidate: rating(opportunity.promotionOutlook),
    edge: edgeFromNumbers(stayPromotion, newPromotion),
  });

  const fiveYearStayEarnings = projectFiveYearEarnings(staySalary, STAY_ANNUAL_RAISE);
  const fiveYearNewEarnings = projectFiveYearEarnings(offer.baseSalary, NEW_JOB_ANNUAL_RAISE);

  rows.push({
    label: "Five-year earnings",
    stay: `~${fiveYearStayEarnings.toLocaleString()} ${stayCurrency}`,
    candidate: `~${fiveYearNewEarnings.toLocaleString()} ${offer.currency}`,
    edge: edgeFromNumbers(fiveYearStayEarnings, fiveYearNewEarnings),
  });

  const candidateWins = rows.filter((r) => r.edge === "candidate").length;
  const stayWins = rows.filter((r) => r.edge === "stay").length;

  let recommendation: string;
  if (candidateWins - stayWins >= 3) {
    recommendation = `Accept the offer from ${opportunity.company}`;
  } else if (stayWins - candidateWins >= 3) {
    recommendation = "Stay in your current role";
  } else {
    recommendation = "Too close to call — negotiate before deciding";
  }

  return { rows, fiveYearStayEarnings, fiveYearNewEarnings, recommendation };
}

export async function compareStayVsOfferWithRationale(
  profile: ProfileInput,
  opportunity: OpportunityInput,
  offer: OfferInput
): Promise<OfferComparison> {
  const result = compareStayVsOffer(profile, opportunity, offer);
  const pros = result.rows.filter((r) => r.edge === "candidate").map((r) => r.label);
  const cons = result.rows.filter((r) => r.edge === "stay").map((r) => r.label);

  const rationale = await reasoner.summarize({
    kind: "stay-vs-offer",
    headline: `${result.recommendation}.`,
    pros,
    cons,
    facts: {
      fiveYearStayEarnings: result.fiveYearStayEarnings,
      fiveYearNewEarnings: result.fiveYearNewEarnings,
    },
  });

  return { ...result, rationale };
}
