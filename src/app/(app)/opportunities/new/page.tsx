import { createOpportunity } from "@/lib/actions/opportunities";
import { Button, Card, Field, Input, PageHeader, Select, Textarea } from "@/components/ui/primitives";

export default function NewOpportunityPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Add an opportunity"
        description="Simulates what Northstar would pick up automatically from an inbound email, a job board, or a referral."
      />

      <form action={createOpportunity}>
        <Card className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company">
              <Input name="company" required />
            </Field>
            <Field label="Role">
              <Input name="role" required />
            </Field>
            <Field label="How did this come in?">
              <Select name="source" defaultValue="INBOUND_EMAIL">
                <option value="INBOUND_EMAIL">Recruiter reached out (email)</option>
                <option value="APPLIED">I applied</option>
                <option value="REFERRAL">Referral</option>
                <option value="RECRUITER">Recruiter / agency</option>
              </Select>
            </Field>
            <Field label="Stage">
              <Select name="stage" defaultValue="INVITED">
                <option value="SAVED">Just saved</option>
                <option value="INVITED">Invited to interview</option>
                <option value="INTERVIEWING">Interviewing</option>
              </Select>
            </Field>
            <Field label="Industry">
              <Input name="industry" placeholder="Software Engineering" />
            </Field>
            <Field label="Hiring manager">
              <Input name="hiringManager" placeholder="Optional" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estimated salary — min">
              <Input type="number" name="salaryEstimateMin" />
            </Field>
            <Field label="Estimated salary — max">
              <Input type="number" name="salaryEstimateMax" />
            </Field>
            <Field label="Currency">
              <Input name="currency" defaultValue="DKK" />
            </Field>
            <Field label="Commute (minutes/day)">
              <Input type="number" name="commuteMinutes" />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" name="remote" className="h-4 w-4 rounded border-neutral-700 bg-neutral-900" />
            Remote role
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company stage">
              <Select name="companyStage" defaultValue="">
                <option value="">Unknown</option>
                <option value="STARTUP">Startup</option>
                <option value="GROWTH">Growth</option>
                <option value="ESTABLISHED">Established</option>
                <option value="ENTERPRISE">Enterprise</option>
              </Select>
            </Field>
            <Field label="Company trajectory">
              <Select name="companyTrajectory" defaultValue="">
                <option value="">Unknown</option>
                <option value="GROWING">Growing</option>
                <option value="STABLE">Stable</option>
                <option value="SLOWING">Slowing</option>
              </Select>
            </Field>
            <Field label="Leadership quality (1-5)">
              <Select name="leadershipRating" defaultValue="">
                <option value="">Unknown</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>
            </Field>
            <Field label="Promotion outlook (1-5)">
              <Select name="promotionOutlook" defaultValue="">
                <option value="">Unknown</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>
            </Field>
            <Field label="Learning & development (1-5)">
              <Select name="learningRating" defaultValue="">
                <option value="">Unknown</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Notes">
            <Textarea name="notes" rows={3} placeholder="Anything else worth remembering about this one." />
          </Field>

          <Button type="submit">Add to workspace</Button>
        </Card>
      </form>
    </div>
  );
}
