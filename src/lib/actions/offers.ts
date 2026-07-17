"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { requireSession } from "@/lib/session";
import { compareStayVsOfferWithRationale } from "@/lib/engine/comparison";
import { buildNegotiationPlan } from "@/lib/engine/negotiation";
import { findBenchmarkForOpportunity } from "@/lib/engine/market";
import { STAGE_ORDER } from "@/lib/stage";
import type { OpportunityStage } from "@/generated/prisma/enums";

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

async function ownedOpportunity(opportunityId: string, userId: string) {
  return prisma.opportunity.findFirstOrThrow({ where: { id: opportunityId, userId } });
}

function stageIndex(stage: OpportunityStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export async function addOffer(opportunityId: string, formData: FormData) {
  const session = await requireSession();
  const opportunity = await ownedOpportunity(opportunityId, session.user.id);

  const baseSalary = num(formData.get("baseSalary")) ?? 0;

  await prisma.offer.upsert({
    where: { opportunityId },
    create: {
      opportunityId,
      baseSalary,
      currency: str(formData.get("currency")) ?? opportunity.currency,
      bonusPct: num(formData.get("bonusPct")),
      signOnBonus: num(formData.get("signOnBonus")),
      pensionPct: num(formData.get("pensionPct")),
      vacationDays: num(formData.get("vacationDays")),
      equity: str(formData.get("equity")),
      remotePolicy: str(formData.get("remotePolicy")),
      benefitsNotes: str(formData.get("benefitsNotes")),
    },
    update: {
      baseSalary,
      currency: str(formData.get("currency")) ?? opportunity.currency,
      bonusPct: num(formData.get("bonusPct")),
      signOnBonus: num(formData.get("signOnBonus")),
      pensionPct: num(formData.get("pensionPct")),
      vacationDays: num(formData.get("vacationDays")),
      equity: str(formData.get("equity")),
      remotePolicy: str(formData.get("remotePolicy")),
      benefitsNotes: str(formData.get("benefitsNotes")),
    },
  });

  if (stageIndex(opportunity.stage) < stageIndex("OFFER")) {
    await prisma.opportunity.update({ where: { id: opportunityId }, data: { stage: "OFFER" } });
  }

  await prisma.careerEvent.create({
    data: {
      userId: session.user.id,
      opportunityId,
      type: "OFFER",
      title: `Offer received: ${opportunity.role} @ ${opportunity.company}`,
      description: `${baseSalary.toLocaleString()} ${str(formData.get("currency")) ?? opportunity.currency}`,
    },
  });

  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/dashboard");
  revalidatePath("/career-memory");
}

export async function runComparison(opportunityId: string) {
  const session = await requireSession();
  const opportunity = await ownedOpportunity(opportunityId, session.user.id);
  const [profile, offer] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.offer.findUniqueOrThrow({ where: { opportunityId } }),
  ]);

  const result = await compareStayVsOfferWithRationale(profile, opportunity, offer);

  await prisma.comparison.upsert({
    where: { opportunityId },
    create: {
      opportunityId,
      rows: result.rows as unknown as Prisma.InputJsonValue,
      fiveYearStayEarnings: result.fiveYearStayEarnings,
      fiveYearNewEarnings: result.fiveYearNewEarnings,
      recommendation: result.recommendation,
      rationale: result.rationale,
    },
    update: {
      rows: result.rows as unknown as Prisma.InputJsonValue,
      fiveYearStayEarnings: result.fiveYearStayEarnings,
      fiveYearNewEarnings: result.fiveYearNewEarnings,
      recommendation: result.recommendation,
      rationale: result.rationale,
    },
  });

  await prisma.careerEvent.create({
    data: {
      userId: session.user.id,
      opportunityId,
      type: "NOTE",
      title: `Compared staying vs. offer from ${opportunity.company}`,
      description: result.recommendation,
    },
  });

  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/career-memory");
}

export async function runNegotiation(opportunityId: string) {
  const session = await requireSession();
  const opportunity = await ownedOpportunity(opportunityId, session.user.id);
  const [profile, offer] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.offer.findUniqueOrThrow({ where: { opportunityId } }),
  ]);

  const benchmark = await findBenchmarkForOpportunity(opportunity.industry, opportunity.role);
  const plan = buildNegotiationPlan(profile, opportunity, offer, benchmark);

  await prisma.negotiationDraft.upsert({
    where: { opportunityId },
    create: {
      opportunityId,
      targetSalary: plan.targetSalary,
      asks: plan.asks as unknown as Prisma.InputJsonValue,
      emailDraft: plan.emailDraft,
    },
    update: {
      targetSalary: plan.targetSalary,
      asks: plan.asks as unknown as Prisma.InputJsonValue,
      emailDraft: plan.emailDraft,
    },
  });

  if (stageIndex(opportunity.stage) < stageIndex("NEGOTIATING")) {
    await prisma.opportunity.update({ where: { id: opportunityId }, data: { stage: "NEGOTIATING" } });
  }

  await prisma.careerEvent.create({
    data: {
      userId: session.user.id,
      opportunityId,
      type: "NEGOTIATION",
      title: `Negotiation plan drafted for ${opportunity.company}`,
      description: `Target: ${plan.targetSalary.toLocaleString()} ${offer.currency}`,
    },
  });

  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/dashboard");
  revalidatePath("/career-memory");
}

export async function updateNegotiationEmail(opportunityId: string, formData: FormData) {
  const session = await requireSession();
  await ownedOpportunity(opportunityId, session.user.id);

  await prisma.negotiationDraft.update({
    where: { opportunityId },
    data: { emailDraft: str(formData.get("emailDraft")) ?? "" },
  });

  revalidatePath(`/opportunities/${opportunityId}`);
}
