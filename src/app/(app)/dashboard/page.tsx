import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { getMarketPulse } from "@/lib/engine/market";
import { Badge, Button, Card, PageHeader } from "@/components/ui/primitives";
import { STAGE_LABEL } from "@/lib/stage";

export default async function DashboardPage() {
  const session = await requireSession();
  const [user, profile, opportunities, events] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.opportunity.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { decision: true },
    }),
    prisma.careerEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { eventDate: "desc" },
      take: 5,
    }),
  ]);
  const isPro = user.tier === "PRO";

  const pulse = profile ? await getMarketPulse(profile) : null;

  const activeCount = await prisma.opportunity.count({
    where: {
      userId: session.user.id,
      stage: { in: ["SAVED", "INVITED", "INTERVIEWING", "OFFER", "NEGOTIATING"] },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="Dashboard" description="Your career, at a glance." />
        <Link href="/opportunities/new">
          <Button>+ Add opportunity</Button>
        </Link>
      </div>

      {!profile && (
        <Card className="border-violet-800 bg-violet-500/5">
          <p className="text-sm text-violet-200">
            Your profile is empty. <Link href="/onboarding" className="underline">Complete onboarding</Link> so
            Northstar can score opportunities and compare offers for you.
          </p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-1 text-lg font-semibold text-white">Market pulse</h2>
          {!pulse ? (
            <p className="text-sm text-neutral-500">Complete your profile to unlock market intelligence.</p>
          ) : !isPro ? (
            <div className="rounded-xl border border-violet-800 bg-violet-500/5 p-4 text-sm text-violet-200">
              Salary benchmarks, YoY growth, and open-role counts for your profile are ready.{" "}
              <Link href="/onboarding" className="underline">
                Upgrade to Pro
              </Link>{" "}
              to see them.
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-300">{pulse.message}</p>
              {pulse.benchmark && (
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-white">
                      {pulse.benchmark.medianSalary.toLocaleString()}
                    </div>
                    <div className="text-xs text-neutral-500">Median salary ({pulse.benchmark.region})</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white">+{pulse.benchmark.yoyGrowthPct.toFixed(1)}%</div>
                    <div className="text-xs text-neutral-500">YoY salary growth</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white">{pulse.benchmark.openRolesCount}</div>
                    <div className="text-xs text-neutral-500">Open roles like yours</div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Active opportunities</h2>
          <div className="mt-2 text-3xl font-semibold text-white">{activeCount}</div>
          <p className="text-xs text-neutral-500">in your pipeline right now</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent opportunities</h2>
          <Link href="/opportunities" className="text-sm text-violet-400 hover:text-violet-300">
            View all
          </Link>
        </div>
        {opportunities.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Nothing yet. When you get an interview invite, add it and Northstar will tell you whether it&apos;s
            worth taking.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {opportunities.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <Link href={`/opportunities/${o.id}`} className="font-medium text-white hover:text-violet-300">
                    {o.role} @ {o.company}
                  </Link>
                  <div className="mt-0.5 text-xs text-neutral-500">{STAGE_LABEL[o.stage]}</div>
                </div>
                {o.decision && (
                  <Badge tone={o.decision.recommendation === "INTERVIEW" ? "positive" : "negative"}>
                    {o.decision.recommendation === "INTERVIEW" ? "Interview" : "Skip"} · {o.decision.confidence}%
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Career memory</h2>
          <Link href="/career-memory" className="text-sm text-violet-400 hover:text-violet-300">
            View timeline
          </Link>
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-neutral-500">Your career timeline will build itself as you use Northstar.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((e) => (
              <li key={e.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                <div>
                  <span className="text-neutral-200">{e.title}</span>
                  <span className="ml-2 text-xs text-neutral-500">
                    {new Date(e.eventDate).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
