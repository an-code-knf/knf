import { prisma } from "@/lib/db";
import type { Profile } from "@/generated/prisma/client";
import type { MarketPulse } from "./types";

export async function findBenchmarkForProfile(profile: Profile) {
  if (!profile.industry) return null;

  const byTitle = profile.currentTitle
    ? await prisma.marketBenchmark.findFirst({
        where: {
          industry: profile.industry,
          title: { contains: profile.currentTitle, mode: "insensitive" },
        },
      })
    : null;
  if (byTitle) return byTitle;

  return prisma.marketBenchmark.findFirst({ where: { industry: profile.industry } });
}

export async function findBenchmarkForOpportunity(industry: string | null, title: string) {
  if (industry) {
    const match = await prisma.marketBenchmark.findFirst({
      where: { industry, title: { contains: title, mode: "insensitive" } },
    });
    if (match) return match;
    const byIndustry = await prisma.marketBenchmark.findFirst({ where: { industry } });
    if (byIndustry) return byIndustry;
  }
  return prisma.marketBenchmark.findFirst({ where: { title: { contains: title, mode: "insensitive" } } });
}

export async function getMarketPulse(profile: Profile): Promise<MarketPulse> {
  const benchmark = await findBenchmarkForProfile(profile);
  if (!benchmark) {
    return {
      benchmark: null,
      marketDeltaPct: null,
      message: "Add your industry and title to your profile to unlock market intelligence.",
    };
  }

  const marketDeltaPct = profile.currentSalary
    ? ((benchmark.medianSalary - profile.currentSalary) / profile.currentSalary) * 100
    : null;

  const openingsLine = `${benchmark.openRolesCount} companies are hiring profiles like yours in ${benchmark.region}.`;
  const growthLine = `Median pay for ${benchmark.title} has grown ${benchmark.yoyGrowthPct.toFixed(1)}% in the last year.`;

  let valueLine = "";
  if (marketDeltaPct != null) {
    if (marketDeltaPct >= 8) {
      valueLine = `Your market value looks about ${marketDeltaPct.toFixed(0)}% above your current salary — this could be a good window to start interviewing. `;
    } else if (marketDeltaPct <= -5) {
      valueLine = `Your current salary is tracking ahead of the market median by ${Math.abs(marketDeltaPct).toFixed(0)}%. `;
    } else {
      valueLine = "Your current salary is roughly in line with the market. ";
    }
  }

  return {
    benchmark,
    marketDeltaPct,
    message: `${valueLine}${growthLine} ${openingsLine}`,
  };
}
