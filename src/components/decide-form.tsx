"use client";

import { useActionState } from "react";
import { fetchJobMetaAction, decideAction } from "@/lib/actions/decide";
import { initialFetchJobMetaState, initialDecideState } from "@/lib/actions/decide-types";
import { Badge, Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";

export function DecideForm({ defaultCurrency }: { defaultCurrency: string }) {
  const [urlState, urlFormAction, urlPending] = useActionState(fetchJobMetaAction, initialFetchJobMetaState);
  const [decideState, decideFormAction, decidePending] = useActionState(decideAction, initialDecideState);
  const prefill = urlState.status === "ok" ? urlState.meta : undefined;

  return (
    <form className="space-y-8">
      <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
        <Field label="Job posting URL" hint="Optional — we'll try to read the title and company from the page. Works best on postings that embed structured data.">
          <div className="flex gap-2">
            <Input type="url" name="url" placeholder="https://..." className="flex-1" />
            <Button type="submit" formAction={urlFormAction} formNoValidate variant="secondary" disabled={urlPending}>
              {urlPending ? "Reading…" : "Autofill from URL"}
            </Button>
          </div>
        </Field>
        {urlState.status === "error" && (
          <p className="text-sm text-amber-400">{urlState.error} — fill in the details below instead.</p>
        )}
        {urlState.status === "ok" && (
          <p className="text-sm text-emerald-400">
            Pulled what we could from the page — check the fields below before deciding.
          </p>
        )}
      </div>

      <div key={prefill ? JSON.stringify(prefill) : "initial"} className="grid gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 sm:grid-cols-2">
        <Field label="Company">
          <Input name="company" required defaultValue={prefill?.company ?? ""} />
        </Field>
        <Field label="Role">
          <Input name="role" required defaultValue={prefill?.role ?? ""} />
        </Field>
        <Field label="Industry">
          <Input name="industry" placeholder="Software Engineering" />
        </Field>
        <Field label="Commute (minutes/day)">
          <Input type="number" name="commuteMinutes" />
        </Field>
        <Field label="Estimated salary — min">
          <Input type="number" name="salaryEstimateMin" defaultValue={prefill?.salaryMin ?? ""} />
        </Field>
        <Field label="Estimated salary — max">
          <Input type="number" name="salaryEstimateMax" defaultValue={prefill?.salaryMax ?? ""} />
        </Field>
        <Field label="Currency">
          <Input name="currency" defaultValue={prefill?.currency ?? defaultCurrency} />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            name="remote"
            defaultChecked={prefill?.remote ?? false}
            className="h-4 w-4 rounded border-neutral-700 bg-neutral-900"
          />
          Remote role
        </label>
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
        {prefill?.descriptionSnippet && (
          <div className="sm:col-span-2">
            <Field label="Detected from the posting">
              <Textarea readOnly rows={3} value={prefill.descriptionSnippet} className="text-neutral-400" />
            </Field>
          </div>
        )}
      </div>

      <Button
        type="submit"
        formAction={decideFormAction}
        disabled={decidePending}
        className="w-full py-5 text-lg font-semibold"
      >
        {decidePending ? "Deciding…" : "Should I stay, or should I go?"}
      </Button>

      {decideState.status === "error" && <p className="text-sm text-rose-400">{decideState.error}</p>}

      {decideState.status === "ok" && decideState.score && (
        <Verdict score={decideState.score} company={decideState.company} role={decideState.role} />
      )}
    </form>
  );
}

function Verdict({
  score,
  company,
  role,
}: {
  score: NonNullable<import("@/lib/actions/decide-types").DecideState["score"]>;
  company?: string;
  role?: string;
}) {
  const go = score.recommendation === "INTERVIEW";
  return (
    <div
      className={`space-y-5 rounded-2xl border p-8 text-center ${
        go ? "border-emerald-700 bg-emerald-500/10" : "border-neutral-700 bg-neutral-800/40"
      }`}
    >
      <div>
        <div className={`text-6xl font-bold tracking-tight ${go ? "text-emerald-400" : "text-neutral-200"}`}>
          {go ? "GO" : "STAY"}
        </div>
        <p className="mt-2 text-sm text-neutral-400">
          {role} @ {company} · Confidence {score.confidence}%
        </p>
      </div>

      <p className="mx-auto max-w-xl text-sm text-neutral-300">{score.rationale}</p>

      <div className="mx-auto grid max-w-xl gap-4 text-left sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">Pros</h3>
          <ul className="space-y-1 text-sm text-neutral-300">
            {score.pros.length === 0 && <li className="text-neutral-600">None found</li>}
            {score.pros.map((p) => (
              <li key={p}>+ {p}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-400">Cons</h3>
          <ul className="space-y-1 text-sm text-neutral-300">
            {score.cons.length === 0 && <li className="text-neutral-600">None found</li>}
            {score.cons.map((c) => (
              <li key={c}>− {c}</li>
            ))}
          </ul>
        </div>
      </div>

      <Badge tone={go ? "positive" : "neutral"}>{go ? "Take the interview" : "Not worth it right now"}</Badge>
    </div>
  );
}
