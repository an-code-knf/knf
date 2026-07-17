"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { requireSession } from "@/lib/session";
import type { RiskTolerance } from "@/generated/prisma/enums";

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

export async function saveProfile(formData: FormData) {
  const session = await requireSession();

  const skillsRaw = str(formData.get("skills")) ?? "";
  const skills = skillsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      currentEmployer: str(formData.get("currentEmployer")),
      currentTitle: str(formData.get("currentTitle")),
      currentSalary: num(formData.get("currentSalary")),
      currency: str(formData.get("currency")) ?? "DKK",
      commuteMinutes: num(formData.get("commuteMinutes")),
      industry: str(formData.get("industry")),
      location: str(formData.get("location")),
      skills,
      yearsExperience: num(formData.get("yearsExperience")),
      familySituation: str(formData.get("familySituation")),
      careerGoals: str(formData.get("careerGoals")),
      riskTolerance: (str(formData.get("riskTolerance")) as RiskTolerance) ?? "MEDIUM",
      cvText: str(formData.get("cvText")),
      cvUpdatedAt: str(formData.get("cvText")) ? new Date() : null,
      currentPensionPct: num(formData.get("currentPensionPct")),
      currentVacationDays: num(formData.get("currentVacationDays")),
      currentManagerRating: num(formData.get("currentManagerRating")),
      currentCompanyStabilityRating: num(formData.get("currentCompanyStabilityRating")),
      currentPromotionOutlook: num(formData.get("currentPromotionOutlook")),
      currentLearningRating: num(formData.get("currentLearningRating")),
    },
    update: {
      currentEmployer: str(formData.get("currentEmployer")),
      currentTitle: str(formData.get("currentTitle")),
      currentSalary: num(formData.get("currentSalary")),
      currency: str(formData.get("currency")) ?? "DKK",
      commuteMinutes: num(formData.get("commuteMinutes")),
      industry: str(formData.get("industry")),
      location: str(formData.get("location")),
      skills,
      yearsExperience: num(formData.get("yearsExperience")),
      familySituation: str(formData.get("familySituation")),
      careerGoals: str(formData.get("careerGoals")),
      riskTolerance: (str(formData.get("riskTolerance")) as RiskTolerance) ?? "MEDIUM",
      cvText: str(formData.get("cvText")),
      cvUpdatedAt: str(formData.get("cvText")) ? new Date() : null,
      currentPensionPct: num(formData.get("currentPensionPct")),
      currentVacationDays: num(formData.get("currentVacationDays")),
      currentManagerRating: num(formData.get("currentManagerRating")),
      currentCompanyStabilityRating: num(formData.get("currentCompanyStabilityRating")),
      currentPromotionOutlook: num(formData.get("currentPromotionOutlook")),
      currentLearningRating: num(formData.get("currentLearningRating")),
    },
  });

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}

const CONNECTOR_SEED_DATA: Record<string, Record<string, unknown>> = {
  LINKEDIN: {
    headline: "Synced 1 profile, 6 past roles, 312 connections",
    lastSync: "just now",
  },
  GMAIL: {
    headline: "Scanning for interview invites, offers, and recruiter emails",
    matchedThreads: 3,
  },
  CALENDAR: {
    headline: "Watching for interview and onsite events",
    upcomingEvents: 1,
  },
  JOB_BOARDS: {
    headline: "Tracking saved searches across major job boards",
    savedSearches: 2,
  },
};

export async function toggleConnector(type: "LINKEDIN" | "GMAIL" | "CALENDAR" | "JOB_BOARDS") {
  const session = await requireSession();

  const existing = await prisma.connector.findUnique({
    where: { userId_type: { userId: session.user.id, type } },
  });

  const nextConnected = !existing?.connected;

  await prisma.connector.upsert({
    where: { userId_type: { userId: session.user.id, type } },
    create: {
      userId: session.user.id,
      type,
      connected: nextConnected,
      connectedAt: nextConnected ? new Date() : null,
      syncedData: nextConnected ? (CONNECTOR_SEED_DATA[type] as unknown as Prisma.InputJsonValue) : undefined,
    },
    update: {
      connected: nextConnected,
      connectedAt: nextConnected ? new Date() : null,
      syncedData: nextConnected ? (CONNECTOR_SEED_DATA[type] as unknown as Prisma.InputJsonValue) : undefined,
    },
  });

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}

export async function setTier(tier: "FREE" | "PRO") {
  const session = await requireSession();
  await prisma.user.update({ where: { id: session.user.id }, data: { tier } });
  revalidatePath("/", "layout");
}
