import { prisma } from "../src/lib/db";

const benchmarks = [
  { industry: "Software Engineering", title: "Software Engineer", region: "Copenhagen", p25Salary: 480000, medianSalary: 560000, p75Salary: 650000, yoyGrowthPct: 6.2, demandIndex: 78, openRolesCount: 412 },
  { industry: "Software Engineering", title: "Senior Software Engineer", region: "Copenhagen", p25Salary: 620000, medianSalary: 710000, p75Salary: 820000, yoyGrowthPct: 7.1, demandIndex: 81, openRolesCount: 298 },
  { industry: "Software Engineering", title: "Engineering Manager", region: "Copenhagen", p25Salary: 720000, medianSalary: 840000, p75Salary: 960000, yoyGrowthPct: 5.4, demandIndex: 64, openRolesCount: 87 },
  { industry: "Product Management", title: "Product Manager", region: "Copenhagen", p25Salary: 560000, medianSalary: 650000, p75Salary: 740000, yoyGrowthPct: 4.8, demandIndex: 69, openRolesCount: 143 },
  { industry: "Product Management", title: "Senior Product Manager", region: "Copenhagen", p25Salary: 680000, medianSalary: 780000, p75Salary: 890000, yoyGrowthPct: 5.9, demandIndex: 71, openRolesCount: 96 },
  { industry: "Data & Analytics", title: "Data Scientist", region: "Copenhagen", p25Salary: 520000, medianSalary: 610000, p75Salary: 700000, yoyGrowthPct: 8.3, demandIndex: 85, openRolesCount: 176 },
  { industry: "Sales", title: "Account Executive", region: "Copenhagen", p25Salary: 450000, medianSalary: 540000, p75Salary: 650000, yoyGrowthPct: 3.6, demandIndex: 58, openRolesCount: 201 },
  { industry: "Marketing", title: "Marketing Manager", region: "Copenhagen", p25Salary: 440000, medianSalary: 510000, p75Salary: 590000, yoyGrowthPct: 2.9, demandIndex: 52, openRolesCount: 118 },
  { industry: "Finance", title: "Finance Manager", region: "Copenhagen", p25Salary: 560000, medianSalary: 650000, p75Salary: 750000, yoyGrowthPct: 3.4, demandIndex: 55, openRolesCount: 74 },
  { industry: "Human Resources", title: "HR Business Partner", region: "Copenhagen", p25Salary: 460000, medianSalary: 530000, p75Salary: 610000, yoyGrowthPct: 2.1, demandIndex: 46, openRolesCount: 61 },
  { industry: "Software Engineering", title: "Software Engineer", region: "Remote (EU)", p25Salary: 460000, medianSalary: 540000, p75Salary: 630000, yoyGrowthPct: 5.8, demandIndex: 74, openRolesCount: 620 },
  { industry: "Consulting", title: "Strategy Consultant", region: "Copenhagen", p25Salary: 580000, medianSalary: 680000, p75Salary: 800000, yoyGrowthPct: 4.1, demandIndex: 60, openRolesCount: 52 },
];

async function main() {
  for (const b of benchmarks) {
    await prisma.marketBenchmark.upsert({
      where: { industry_title_region: { industry: b.industry, title: b.title, region: b.region } },
      update: b,
      create: b,
    });
  }
  console.log(`Seeded ${benchmarks.length} market benchmarks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
