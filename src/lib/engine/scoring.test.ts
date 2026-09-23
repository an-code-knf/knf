import { describe, expect, it } from "vitest";
import { scoreOpportunity } from "./scoring";
import type { ProfileInput } from "./types";

const profile: NonNullable<ProfileInput> = {
  currentSalary: 100_000,
  commuteMinutes: 40,
  riskTolerance: "MEDIUM",
  familySituation: null,
  currentPromotionOutlook: 3,
  currentLearningRating: 3,
};

describe("scoreOpportunity", () => {
  it("refuses to invent a verdict without evidence", () => {
    const score = scoreOpportunity(null, { company: "Acme", role: "Engineer" });

    expect(score.recommendation).toBe("MORE_INFO");
    expect(score.evidenceCount).toBe(0);
    expect(score.missingInputs).toContain("salary comparison");
  });

  it("asks for more information when only one dimension is known", () => {
    const score = scoreOpportunity(profile, { company: "Acme", role: "Engineer", remote: true });

    expect(score.recommendation).toBe("MORE_INFO");
    expect(score.evidenceCount).toBe(1);
  });

  it("recommends an interview when two supported factors are positive", () => {
    const score = scoreOpportunity(profile, {
      company: "Acme",
      role: "Engineer",
      remote: true,
      salaryEstimateMin: 120_000,
      salaryEstimateMax: 120_000,
    });

    expect(score.recommendation).toBe("INTERVIEW");
    expect(score.evidenceCount).toBe(2);
    expect(score.netScore).toBeGreaterThan(0);
  });

  it("recommends skipping when supported factors are materially negative", () => {
    const score = scoreOpportunity(profile, {
      company: "Acme",
      role: "Engineer",
      commuteMinutes: 80,
      salaryEstimateMin: 80_000,
      salaryEstimateMax: 80_000,
    });

    expect(score.recommendation).toBe("SKIP");
    expect(score.evidenceCount).toBe(2);
    expect(score.netScore).toBeLessThan(0);
  });

  it("counts neutral evidence without inventing a positive verdict", () => {
    const score = scoreOpportunity(profile, {
      company: "Acme",
      role: "Engineer",
      companyTrajectory: "STABLE",
      leadershipRating: 3,
    });

    expect(score.recommendation).toBe("MORE_INFO");
    expect(score.evidenceCount).toBe(2);
    expect(score.pros).toEqual([]);
    expect(score.cons).toEqual([]);
  });
});
