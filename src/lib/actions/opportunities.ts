"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { scoreOpportunityWithRationale } from "@/lib/engine/scoring";
import type { OpportunitySource, OpportunityStage, CompanyStage, CompanyTrajectory } from "@/generated/prisma/enums";

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

export async function createOpportunity(formData: FormData) {
  const session = await requireSession();

  const opportunity = await prisma.opportunity.create({
    data: {
      userId: session.user.id,
      company: str(formData.get("company")) ?? "Unknown company",
      role: str(formData.get("role")) ?? "Unknown role",
      source: (str(formData.get("source")) as OpportunitySource) ?? "APPLIED",
      stage: (str(formData.get("stage")) as OpportunityStage) ?? "INVITED",
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
      hiringManager: str(formData.get("hiringManager")),
      notes: str(formData.get("notes")),
    },
  });

  await prisma.careerEvent.create({
    data: {
      userId: session.user.id,
      opportunityId: opportunity.id,
      type: "NOTE",
      title: `New opportunity: ${opportunity.role} @ ${opportunity.company}`,
      description: str(formData.get("notes")) ?? undefined,
    },
  });

  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  redirect(`/opportunities/${opportunity.id}`);
}

export async function runDecision(opportunityId: string) {
  const session = await requireSession();

  const [profile, opportunity] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.opportunity.findFirstOrThrow({
      where: { id: opportunityId, userId: session.user.id },
    }),
  ]);

  const score = await scoreOpportunityWithRationale(profile, opportunity);

  const decision = await prisma.decision.upsert({
    where: { opportunityId },
    create: {
      opportunityId,
      recommendation: score.recommendation,
      confidence: score.confidence,
      pros: score.pros,
      cons: score.cons,
      rationale: score.rationale,
    },
    update: {
      recommendation: score.recommendation,
      confidence: score.confidence,
      pros: score.pros,
      cons: score.cons,
      rationale: score.rationale,
    },
  });

  await prisma.careerEvent.create({
    data: {
      userId: session.user.id,
      opportunityId,
      type: "INTERVIEW",
      title: `Northstar recommendation: ${decision.recommendation === "INTERVIEW" ? "Interview" : "Skip"} (${decision.confidence}%)`,
      description: `${opportunity.role} @ ${opportunity.company}`,
    },
  });

  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/dashboard");
  revalidatePath("/career-memory");
}

const STAGE_EVENT_TITLE: Record<string, string> = {
  INTERVIEWING: "Started interviewing",
  OFFER: "Received offer",
  NEGOTIATING: "Started negotiating",
  ACCEPTED: "Accepted offer",
  DECLINED: "Declined offer",
  REJECTED: "Rejected by company",
  WITHDRAWN: "Withdrew from process",
};

const STAGE_EVENT_TYPE: Record<string, "STAGE_CHANGE" | "OFFER" | "REJECTION" | "NEGOTIATION"> = {
  OFFER: "OFFER",
  NEGOTIATING: "NEGOTIATION",
  REJECTED: "REJECTION",
};

export async function updateStage(opportunityId: string, stage: OpportunityStage) {
  const session = await requireSession();

  await prisma.opportunity.findFirstOrThrow({
    where: { id: opportunityId, userId: session.user.id },
  });

  const opportunity = await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { stage },
  });

  await prisma.careerEvent.create({
    data: {
      userId: session.user.id,
      opportunityId,
      type: STAGE_EVENT_TYPE[stage] ?? "STAGE_CHANGE",
      title: `${STAGE_EVENT_TITLE[stage] ?? "Stage updated"}: ${opportunity.role} @ ${opportunity.company}`,
    },
  });

  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  revalidatePath("/career-memory");
}
