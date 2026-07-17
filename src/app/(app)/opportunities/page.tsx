import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { Badge, Button, Card, PageHeader } from "@/components/ui/primitives";
import { STAGE_LABEL } from "@/lib/stage";

export default async function OpportunitiesPage() {
  const session = await requireSession();
  const opportunities = await prisma.opportunity.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { decision: true, offer: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Opportunities"
          description="Every interview invite, application, and offer — in one workspace."
        />
        <Link href="/opportunities/new">
          <Button>+ Add opportunity</Button>
        </Link>
      </div>

      {opportunities.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-400">
            Nothing here yet. Got an interview invite in your inbox? Add it and Northstar will tell you whether
            it&apos;s worth your time.
          </p>
          <Link href="/opportunities/new" className="mt-4 inline-block">
            <Button>+ Add opportunity</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {opportunities.map((o) => (
            <Link key={o.id} href={`/opportunities/${o.id}`}>
              <Card className="transition-colors hover:border-neutral-700">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-white">
                      {o.role} @ {o.company}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      {STAGE_LABEL[o.stage]}
                      {o.offer && ` · Offer: ${o.offer.baseSalary.toLocaleString()} ${o.offer.currency}`}
                    </p>
                  </div>
                  {o.decision && (
                    <Badge tone={o.decision.recommendation === "INTERVIEW" ? "positive" : "negative"}>
                      {o.decision.recommendation === "INTERVIEW" ? "Interview" : "Skip"} · {o.decision.confidence}%
                    </Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
