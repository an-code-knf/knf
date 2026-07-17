import type { Profile, Opportunity, Offer, MarketBenchmark } from "@/generated/prisma/client";

export type ProfileInput = Profile | null;
export type OpportunityInput = Opportunity;
export type OfferInput = Offer;
export type BenchmarkInput = MarketBenchmark;

export interface ScoredFactor {
  label: string;
  points: number;
}

export interface OpportunityScore {
  recommendation: "INTERVIEW" | "SKIP";
  confidence: number;
  pros: string[];
  cons: string[];
  rationale: string;
  netScore: number;
}

export interface ComparisonRow {
  label: string;
  stay: string;
  candidate: string;
  edge: "stay" | "candidate" | "even";
}

export interface OfferComparison {
  rows: ComparisonRow[];
  fiveYearStayEarnings: number;
  fiveYearNewEarnings: number;
  recommendation: string;
  rationale: string;
}

export interface NegotiationAsk {
  item: string;
  detail: string;
}

export interface NegotiationPlan {
  targetSalary: number;
  currentOfferSalary: number;
  asks: NegotiationAsk[];
  emailDraft: string;
}

export interface MarketPulse {
  benchmark: BenchmarkInput | null;
  marketDeltaPct: number | null;
  message: string;
}
