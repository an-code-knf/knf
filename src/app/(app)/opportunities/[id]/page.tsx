import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { runDecision, updateStage } from "@/lib/actions/opportunities";
import { addOffer, runComparison, runNegotiation, updateNegotiationEmail } from "@/lib/actions/offers";
import { Badge, Button, Card, Field, Input, PageHeader, Textarea } from "@/components/ui/primitives";
import { STAGE_LABEL, STAGE_ORDER } from "@/lib/stage";
import type { ComparisonRow, NegotiationAsk } from "@/lib/engine/types";
import Link from "next/link";

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();

  const opportunity = await prisma.opportunity.findFirst({
    where: { id, userId: session.user.id },
    include: { decision: true, offer: true, comparison: true, negotiationDraft: true },
  });

  if (!opportunity) notFound();

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const isPro = user.tier === "PRO";

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={`${opportunity.role} @ ${opportunity.company}`} description={STAGE_LABEL[opportunity.stage]} />
        <StageControls opportunityId={opportunity.id} currentStage={opportunity.stage} />
      </div>

      {opportunity.notes && (
        <Card>
          <p className="text-sm text-neutral-300">{opportunity.notes}</p>
        </Card>
      )}

      {/* Should I even take this interview? */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Should I even take this interview?</h2>
          <form action={runDecision.bind(null, opportunity.id)}>
            <Button type="submit" variant={opportunity.decision ? "secondary" : "primary"}>
              {opportunity.decision ? "Re-run" : "Get Northstar's take"}
            </Button>
          </form>
        </div>

        {opportunity.decision ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge tone={opportunity.decision.recommendation === "INTERVIEW" ? "positive" : "negative"}>
                {opportunity.decision.recommendation === "INTERVIEW" ? "Interview" : "Skip"}
              </Badge>
              <span className="text-sm text-neutral-400">Confidence: {opportunity.decision.confidence}%</span>
            </div>
            <p className="text-sm text-neutral-300">{opportunity.decision.rationale}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">Pros</h3>
                <ul className="space-y-1 text-sm text-neutral-300">
                  {opportunity.decision.pros.length === 0 && <li className="text-neutral-600">None found</li>}
                  {opportunity.decision.pros.map((p) => (
                    <li key={p}>+ {p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-400">Cons</h3>
                <ul className="space-y-1 text-sm text-neutral-300">
                  {opportunity.decision.cons.length === 0 && <li className="text-neutral-600">None found</li>}
                  {opportunity.decision.cons.map((c) => (
                    <li key={c}>− {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            Northstar will weigh salary, commute, leadership, growth trajectory, and your risk tolerance to tell
            you whether this is worth your time — before you spend a single hour prepping.
          </p>
        )}
      </Card>

      {/* Offer + comparison */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-white">Offer</h2>
        {!opportunity.offer ? (
          <OfferForm opportunityId={opportunity.id} defaultCurrency={opportunity.currency} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Stat label="Base salary" value={`${opportunity.offer.baseSalary.toLocaleString()} ${opportunity.offer.currency}`} />
              <Stat label="Bonus" value={opportunity.offer.bonusPct ? `${opportunity.offer.bonusPct}%` : "—"} />
              <Stat label="Pension" value={opportunity.offer.pensionPct ? `${opportunity.offer.pensionPct}%` : "—"} />
              <Stat label="Vacation" value={opportunity.offer.vacationDays ? `${opportunity.offer.vacationDays} days` : "—"} />
              <Stat label="Sign-on bonus" value={opportunity.offer.signOnBonus ? opportunity.offer.signOnBonus.toLocaleString() : "—"} />
              <Stat label="Remote policy" value={opportunity.offer.remotePolicy ?? "—"} />
            </div>

            <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
              <p className="text-sm text-neutral-400">Would you like Northstar to compare this with staying?</p>
              <form action={runComparison.bind(null, opportunity.id)}>
                <Button type="submit" variant={opportunity.comparison ? "secondary" : "primary"}>
                  {opportunity.comparison ? "Re-run comparison" : "Compare with staying"}
                </Button>
              </form>
            </div>

            {opportunity.comparison && (
              <ComparisonView
                rows={opportunity.comparison.rows as unknown as ComparisonRow[]}
                recommendation={opportunity.comparison.recommendation}
                rationale={opportunity.comparison.rationale}
              />
            )}
          </div>
        )}
      </Card>

      {/* Negotiation */}
      {opportunity.offer && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Negotiation</h2>
          {!isPro ? (
            <UpgradeTeaser feature="the negotiation assistant" />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-neutral-400">
                  Northstar knows what this role pays in the market. Don&apos;t accept yet.
                </p>
                <form action={runNegotiation.bind(null, opportunity.id)}>
                  <Button type="submit" variant={opportunity.negotiationDraft ? "secondary" : "primary"}>
                    {opportunity.negotiationDraft ? "Rebuild plan" : "Build negotiation plan"}
                  </Button>
                </form>
              </div>
              {opportunity.negotiationDraft && (
                <NegotiationView
                  opportunityId={opportunity.id}
                  targetSalary={opportunity.negotiationDraft.targetSalary}
                  currentOfferSalary={opportunity.offer.baseSalary}
                  currency={opportunity.offer.currency}
                  asks={opportunity.negotiationDraft.asks as unknown as NegotiationAsk[]}
                  emailDraft={opportunity.negotiationDraft.emailDraft}
                />
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-neutral-200">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}

function StageControls({
  opportunityId,
  currentStage,
}: {
  opportunityId: string;
  currentStage: (typeof STAGE_ORDER)[number];
}) {
  const idx = STAGE_ORDER.indexOf(currentStage);
  const next = STAGE_ORDER.slice(idx + 1).filter((s) => !["DECLINED", "REJECTED", "WITHDRAWN"].includes(s));
  const terminal: (typeof STAGE_ORDER)[number][] = ["REJECTED", "DECLINED", "WITHDRAWN"];

  return (
    <div className="flex flex-wrap gap-2">
      {next.slice(0, 1).map((stage) => (
        <form key={stage} action={updateStage.bind(null, opportunityId, stage)}>
          <Button type="submit" variant="secondary">
            Mark as {STAGE_LABEL[stage]}
          </Button>
        </form>
      ))}
      {!terminal.includes(currentStage) &&
        currentStage !== "ACCEPTED" &&
        terminal.map((stage) => (
          <form key={stage} action={updateStage.bind(null, opportunityId, stage)}>
            <Button type="submit" variant="ghost">
              {STAGE_LABEL[stage]}
            </Button>
          </form>
        ))}
    </div>
  );
}

function OfferForm({ opportunityId, defaultCurrency }: { opportunityId: string; defaultCurrency: string }) {
  return (
    <form action={addOffer.bind(null, opportunityId)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Base salary (annual)">
          <Input type="number" name="baseSalary" required />
        </Field>
        <Field label="Currency">
          <Input name="currency" defaultValue={defaultCurrency} />
        </Field>
        <Field label="Bonus (%)">
          <Input type="number" step="0.5" name="bonusPct" />
        </Field>
        <Field label="Sign-on bonus">
          <Input type="number" name="signOnBonus" />
        </Field>
        <Field label="Pension (%)">
          <Input type="number" step="0.5" name="pensionPct" />
        </Field>
        <Field label="Vacation days">
          <Input type="number" name="vacationDays" />
        </Field>
        <Field label="Equity">
          <Input name="equity" placeholder="Optional" />
        </Field>
        <Field label="Remote policy">
          <Input name="remotePolicy" placeholder="e.g. 2 days/week home office" />
        </Field>
      </div>
      <Field label="Benefits notes">
        <Textarea name="benefitsNotes" rows={2} />
      </Field>
      <Button type="submit">Save offer</Button>
    </form>
  );
}

function ComparisonView({
  rows,
  recommendation,
  rationale,
}: {
  rows: ComparisonRow[];
  recommendation: string;
  rationale: string;
}) {
  return (
    <div className="space-y-4 border-t border-neutral-800 pt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="pb-2 pr-4">Factor</th>
              <th className="pb-2 pr-4">Stay</th>
              <th className="pb-2">New job</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="py-2 pr-4 text-neutral-400">{row.label}</td>
                <td className={`py-2 pr-4 ${row.edge === "stay" ? "font-medium text-emerald-400" : "text-neutral-300"}`}>
                  {row.stay}
                </td>
                <td className={`py-2 ${row.edge === "candidate" ? "font-medium text-emerald-400" : "text-neutral-300"}`}>
                  {row.candidate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl bg-neutral-800/50 p-4">
        <div className="font-medium text-white">{recommendation}</div>
        <p className="mt-1 text-sm text-neutral-400">{rationale}</p>
      </div>
    </div>
  );
}

function NegotiationView({
  opportunityId,
  targetSalary,
  currentOfferSalary,
  currency,
  asks,
  emailDraft,
}: {
  opportunityId: string;
  targetSalary: number;
  currentOfferSalary: number;
  currency: string;
  asks: NegotiationAsk[];
  emailDraft: string;
}) {
  return (
    <div className="space-y-5 border-t border-neutral-800 pt-4">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-white">
          {targetSalary.toLocaleString()} {currency}
        </span>
        <span className="text-sm text-neutral-500">
          target vs. {currentOfferSalary.toLocaleString()} {currency} offered
        </span>
      </div>
      <ul className="space-y-2 text-sm">
        {asks.map((ask) => (
          <li key={ask.item} className="rounded-lg border border-neutral-800 p-3">
            <div className="font-medium text-neutral-100">{ask.item}</div>
            <div className="mt-1 text-xs text-neutral-500">{ask.detail}</div>
          </li>
        ))}
      </ul>
      <form action={updateNegotiationEmail.bind(null, opportunityId)} className="space-y-2">
        <Field label="Draft negotiation email" hint="Edit freely — this is your starting point, not a script.">
          <Textarea name="emailDraft" rows={12} defaultValue={emailDraft} className="font-mono text-xs" />
        </Field>
        <Button type="submit" variant="secondary">
          Save edits
        </Button>
      </form>
    </div>
  );
}

function UpgradeTeaser({ feature }: { feature: string }) {
  return (
    <div className="rounded-xl border border-violet-800 bg-violet-500/5 p-4 text-sm text-violet-200">
      {feature.charAt(0).toUpperCase() + feature.slice(1)} is a Pro feature.{" "}
      <Link href="/onboarding" className="underline">
        Upgrade to Pro
      </Link>{" "}
      to unlock salary intelligence and AI-drafted negotiation emails.
    </div>
  );
}
