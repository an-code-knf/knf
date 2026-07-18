import type { OpportunityScore } from "@/lib/engine/types";
import type { JobMeta } from "@/lib/job-fetch";

export interface FetchJobMetaState {
  status: "idle" | "ok" | "error";
  meta?: JobMeta;
  error?: string;
}

export const initialFetchJobMetaState: FetchJobMetaState = { status: "idle" };

export interface DecideState {
  status: "idle" | "ok" | "error";
  score?: OpportunityScore;
  company?: string;
  role?: string;
  error?: string;
}

export const initialDecideState: DecideState = { status: "idle" };
