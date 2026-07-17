import type { ProfileInput, OpportunityInput, OfferInput, BenchmarkInput, NegotiationAsk, NegotiationPlan } from "./types";

function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

export function buildNegotiationPlan(
  profile: ProfileInput,
  opportunity: OpportunityInput,
  offer: OfferInput,
  benchmark: BenchmarkInput | null
): NegotiationPlan {
  const asks: NegotiationAsk[] = [];

  const marketCeiling = benchmark ? benchmark.p75Salary : offer.baseSalary * 1.08;
  const targetSalary = roundToNearest(Math.max(offer.baseSalary * 1.05, marketCeiling), 1000);
  const salaryAsk = targetSalary - offer.baseSalary;

  if (salaryAsk > 0) {
    asks.push({
      item: `+${salaryAsk.toLocaleString()} ${offer.currency} base salary`,
      detail: benchmark
        ? `Market median for ${benchmark.title} in ${benchmark.region} is ${benchmark.medianSalary.toLocaleString()} ${offer.currency}, with the top quartile at ${benchmark.p75Salary.toLocaleString()}. Their offer sits below that range.`
        : `A ${((salaryAsk / offer.baseSalary) * 100).toFixed(0)}% increase brings the offer in line with typical increases for a competitive move.`,
    });
  }

  if ((offer.vacationDays ?? 0) < 28) {
    const bump = 28 - (offer.vacationDays ?? 25);
    asks.push({
      item: `${Math.max(bump, 3)} extra vacation days`,
      detail: "Bring total time off up to a competitive standard.",
    });
  }

  if ((offer.pensionPct ?? 0) < 12) {
    asks.push({
      item: "+2% pension contribution",
      detail: "Pension match is below what's typical for comparable roles.",
    });
  }

  if (!offer.signOnBonus) {
    asks.push({
      item: `${Math.round(offer.baseSalary * 0.05).toLocaleString()} ${offer.currency} sign-on bonus`,
      detail: "Offsets unvested equity or bonus left behind at your current employer.",
    });
  }

  if (!offer.remotePolicy || !/\d/.test(offer.remotePolicy)) {
    asks.push({
      item: "2 days/week home office",
      detail: "Formalize flexible work as part of the written offer, not a verbal promise.",
    });
  }

  const emailDraft = buildEmailDraft(opportunity, offer, asks, targetSalary);

  return {
    targetSalary,
    currentOfferSalary: offer.baseSalary,
    asks,
    emailDraft,
  };
}

function buildEmailDraft(
  opportunity: OpportunityInput,
  offer: OfferInput,
  asks: NegotiationAsk[],
  targetSalary: number
): string {
  const askLines = asks.map((a) => `- ${a.item}`).join("\n");

  return `Subject: Excited about the ${opportunity.role} offer — a few points before I sign

Hi,

Thank you for the offer for the ${opportunity.role} role — I'm genuinely excited about the team and what we discussed during the process.

Before I confirm, I'd like to align on a few points based on my experience and current market benchmarks for this role:

${askLines}

Specifically on base salary, ${targetSalary.toLocaleString()} ${offer.currency} would reflect the scope of the role and my track record, and would let me accept with full confidence.

I'm very keen to make this work and can hop on a call this week if that's easier. Looking forward to hearing your thoughts.

Best,
[Your name]`.trim();
}
