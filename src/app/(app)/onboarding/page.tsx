import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { saveProfile, toggleConnector } from "@/lib/actions/profile";
import { Button, Card, Field, Input, PageHeader, Select, Textarea, Badge } from "@/components/ui/primitives";
import type { ConnectorType } from "@/generated/prisma/enums";

const CONNECTORS: { type: ConnectorType; label: string; description: string }[] = [
  { type: "LINKEDIN", label: "LinkedIn", description: "Current role, history, skills, network." },
  { type: "GMAIL", label: "Gmail", description: "Detect interview invites, offers, and rejections automatically." },
  { type: "CALENDAR", label: "Calendar", description: "Spot interview and onsite events as they're scheduled." },
  { type: "JOB_BOARDS", label: "Job boards", description: "Track saved searches and new matching roles." },
];

export default async function OnboardingPage() {
  const session = await requireSession();
  const [profile, connectors] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.connector.findMany({ where: { userId: session.user.id } }),
  ]);

  const connectorState = new Map(connectors.map((c) => [c.type, c]));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your profile"
        description="Northstar uses this to judge whether an opportunity is worth your time. Nothing here is shared automatically."
      />

      <Card>
        <h2 className="mb-1 text-lg font-semibold text-white">Connect your accounts</h2>
        <p className="mb-4 text-sm text-neutral-400">
          Real LinkedIn / Gmail / Calendar sync is coming soon — for this MVP, connecting simulates what
          Northstar would automatically detect, so you can see the product end to end.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {CONNECTORS.map((c) => {
            const state = connectorState.get(c.type);
            return (
              <div
                key={c.type}
                className="flex items-start justify-between gap-3 rounded-xl border border-neutral-800 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{c.label}</span>
                    {state?.connected && <Badge tone="positive">Connected</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">{c.description}</p>
                  {state?.connected && state.syncedData && (
                    <p className="mt-2 text-xs text-violet-300">
                      {(state.syncedData as Record<string, unknown>).headline as string}
                    </p>
                  )}
                </div>
                <form
                  action={async () => {
                    "use server";
                    await toggleConnector(c.type);
                  }}
                >
                  <Button type="submit" variant={state?.connected ? "secondary" : "primary"}>
                    {state?.connected ? "Disconnect" : "Connect"}
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      </Card>

      <form action={saveProfile}>
        <Card className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Current role</h2>
            <p className="text-sm text-neutral-400">Your baseline — every opportunity gets compared against this.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Employer">
              <Input name="currentEmployer" defaultValue={profile?.currentEmployer ?? ""} />
            </Field>
            <Field label="Title">
              <Input name="currentTitle" defaultValue={profile?.currentTitle ?? ""} />
            </Field>
            <Field label="Industry">
              <Input name="industry" defaultValue={profile?.industry ?? ""} placeholder="Software Engineering" />
            </Field>
            <Field label="Location">
              <Input name="location" defaultValue={profile?.location ?? ""} placeholder="Copenhagen" />
            </Field>
            <Field label="Current salary (annual)">
              <Input type="number" name="currentSalary" defaultValue={profile?.currentSalary ?? ""} />
            </Field>
            <Field label="Currency">
              <Input name="currency" defaultValue={profile?.currency ?? "DKK"} />
            </Field>
            <Field label="Commute (minutes/day)">
              <Input type="number" name="commuteMinutes" defaultValue={profile?.commuteMinutes ?? ""} />
            </Field>
            <Field label="Years of experience">
              <Input type="number" name="yearsExperience" defaultValue={profile?.yearsExperience ?? ""} />
            </Field>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">How your current job feels</h2>
            <p className="text-sm text-neutral-400">1 (poor) – 5 (excellent). Used to judge whether a new opportunity is actually better.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Promotion outlook">
              <Select name="currentPromotionOutlook" defaultValue={profile?.currentPromotionOutlook ?? 3}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>
            </Field>
            <Field label="Learning & development">
              <Select name="currentLearningRating" defaultValue={profile?.currentLearningRating ?? 3}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">You</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Skills" hint="Comma-separated.">
              <Input name="skills" defaultValue={profile?.skills?.join(", ") ?? ""} placeholder="TypeScript, Product Strategy, Leadership" />
            </Field>
            <Field label="Risk tolerance">
              <Select name="riskTolerance" defaultValue={profile?.riskTolerance ?? "MEDIUM"}>
                <option value="LOW">Low — I value stability</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High — I&apos;ll bet on upside</option>
              </Select>
            </Field>
          </div>
          <Field label="Family situation" hint="Optional — helps tailor recommendations around commute and flexibility.">
            <Textarea name="familySituation" rows={2} defaultValue={profile?.familySituation ?? ""} />
          </Field>
          <Field label="Career goals">
            <Textarea name="careerGoals" rows={2} defaultValue={profile?.careerGoals ?? ""} />
          </Field>
          <Field label="CV (paste as text)" hint="Connect LinkedIn above, or paste your CV once here.">
            <Textarea name="cvText" rows={6} defaultValue={profile?.cvText ?? ""} />
          </Field>

          <Button type="submit">Save profile</Button>
        </Card>
      </form>
    </div>
  );
}
