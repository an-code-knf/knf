"use server";

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { scoreOpportunityWithRationale } from "@/lib/engine/scoring";
import { fetchJobPosting } from "@/lib/job-fetch";
import type { CompanyStage, CompanyTrajectory } from "@/lib/engine/types";
import type { FetchJobMetaState, DecideState } from "./decide-types";

function num(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function str(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const s = value.toString().trim();
  return s.length ? s : null;
}

export async function fetchJobMetaAction(
  _prev: FetchJobMetaState,
  formData: FormData
): Promise<FetchJobMetaState> {
  await requireSession();

  const url = str(formData.get("url"));
  if (!url) {
    return { status: "error", error: "Paste a job posting URL first." };
  }

  const result = await fetchJobPosting(url);
  if (!result.ok || !result.meta) {
    return { status: "error", error: result.error ?? "Couldn't read that page." };
  }

  return { status: "ok", meta: result.meta };
}

export async function decideAction(_prev: DecideState, formData: FormData): Promise<DecideState> {
  const session = await requireSession();

  const company = str(formData.get("company"));
  const role = str(formData.get("role"));
  if (!company || !role) {
    return { status: "error", error: "Company and role are required." };
  }

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });

  const score = await scoreOpportunityWithRationale(profile, {
    company,
    role,
    industry: str(formData.get("industry")),
    salaryEstimateMin: num(formData.get("salaryEstimateMin")),
    salaryEstimateMax: num(formData.get("salaryEstimateMax")),
    currency: str(formData.get("currency")) ?? "DKK",
    commuteMinutes: num(formData.get("commuteMinutes")),
    remote: formData.get("remote") === "on",
    companyStage: (str(formData.get("companyStage")) as CompanyStage) || null,
    companyTrajectory: (str(formData.get("companyTrajectory")) as CompanyTrajectory) || null,
    leadershipRating: num(formData.get("leadershipRating")),
    promotionOutlook: num(formData.get("promotionOutlook")),
    learningRating: num(formData.get("learningRating")),
  });

  return { status: "ok", score, company, role };
}
