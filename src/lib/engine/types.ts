import type { Profile } from "@/generated/prisma/client";

export type ProfileInput = Profile | null;

export type CompanyStage = "STARTUP" | "GROWTH" | "ESTABLISHED" | "ENTERPRISE";
export type CompanyTrajectory = "GROWING" | "STABLE" | "SLOWING";

export interface OpportunityInput {
  company: string;
  role: string;
  industry?: string | null;
  salaryEstimateMin?: number | null;
  salaryEstimateMax?: number | null;
  currency?: string;
  commuteMinutes?: number | null;
  remote?: boolean;
  companyStage?: CompanyStage | null;
  companyTrajectory?: CompanyTrajectory | null;
  leadershipRating?: number | null;
  promotionOutlook?: number | null;
  learningRating?: number | null;
}

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
