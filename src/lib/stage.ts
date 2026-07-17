import type { OpportunityStage } from "@/generated/prisma/enums";

export const STAGE_LABEL: Record<OpportunityStage, string> = {
  SAVED: "Saved",
  INVITED: "Interview invited",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer received",
  NEGOTIATING: "Negotiating",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const STAGE_ORDER: OpportunityStage[] = [
  "SAVED",
  "INVITED",
  "INTERVIEWING",
  "OFFER",
  "NEGOTIATING",
  "ACCEPTED",
  "DECLINED",
  "REJECTED",
  "WITHDRAWN",
];
