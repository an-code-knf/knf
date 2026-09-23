import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { saveProfile } from "@/lib/actions/profile";
import { Button, Card, Field, Input, PageHeader, Select, Textarea } from "@/components/ui/primitives";

export default async function OnboardingPage() {
  const session = await requireSession();
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your profile"
        description="Northstar uses this to judge whether an opportunity is worth your time. Nothing here is shared automatically."
      />

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
            <h2 className="text-lg font-semibold text-white">Decision style</h2>
            <p className="text-sm text-neutral-400">Only risk tolerance is needed for the core comparison.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Risk tolerance">
              <Select name="riskTolerance" defaultValue={profile?.riskTolerance ?? "MEDIUM"}>
                <option value="LOW">Low — I value stability</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High — I&apos;ll bet on upside</option>
              </Select>
            </Field>
          </div>

          <details className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-4">
            <summary className="cursor-pointer font-medium text-neutral-200">
              Optional personalization
            </summary>
            <p className="mt-2 text-sm text-neutral-500">
              Add this only if you want it considered later. It is not required for a first decision.
            </p>
            <div className="mt-4 space-y-4">
              <Field label="Skills" hint="Optional, comma-separated.">
                <Input name="skills" defaultValue={profile?.skills?.join(", ") ?? ""} placeholder="TypeScript, Product Strategy, Leadership" />
              </Field>
              <Field label="Family situation" hint="Optional — used only for commute and flexibility context.">
                <Textarea name="familySituation" rows={2} defaultValue={profile?.familySituation ?? ""} />
              </Field>
              <Field label="Career goals" hint="Optional.">
                <Textarea name="careerGoals" rows={2} defaultValue={profile?.careerGoals ?? ""} />
              </Field>
              <Field label="CV (paste as text)" hint="Optional. Northstar does not need this for the first decision.">
                <Textarea name="cvText" rows={6} defaultValue={profile?.cvText ?? ""} />
              </Field>
            </div>
          </details>

          <Button type="submit">Save profile</Button>
        </Card>
      </form>
    </div>
  );
}
