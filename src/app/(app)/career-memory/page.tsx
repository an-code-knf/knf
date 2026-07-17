import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { addCareerEvent, deleteCareerEvent } from "@/lib/actions/career-events";
import { Badge, Button, Card, Field, Input, PageHeader, Select, Textarea } from "@/components/ui/primitives";

const TYPE_LABEL: Record<string, string> = {
  INTERVIEW: "Interview",
  REJECTION: "Rejection",
  OFFER: "Offer",
  NEGOTIATION: "Negotiation",
  MANAGER_CHANGE: "Manager change",
  PROMOTION: "Promotion",
  ACHIEVEMENT: "Achievement",
  CV_VERSION: "CV version",
  PERFORMANCE_REVIEW: "Performance review",
  SALARY_CHANGE: "Salary change",
  STAGE_CHANGE: "Stage change",
  NOTE: "Note",
};

const TYPE_TONE: Record<string, "positive" | "negative" | "brand" | "neutral"> = {
  OFFER: "positive",
  PROMOTION: "positive",
  ACHIEVEMENT: "positive",
  REJECTION: "negative",
  NEGOTIATION: "brand",
};

export default async function CareerMemoryPage() {
  const session = await requireSession();
  const events = await prisma.careerEvent.findMany({
    where: { userId: session.user.id },
    orderBy: { eventDate: "desc" },
    include: { opportunity: { select: { company: true, role: true, id: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Career memory"
        description="Every interview, rejection, offer, negotiation, and win — permanently remembered, so nobody has to start from zero."
      />

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-white">Add a memory</h2>
        <form action={addCareerEvent} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <Select name="type" defaultValue="ACHIEVEMENT">
                {Object.entries(TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" name="eventDate" defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
          </div>
          <Field label="Title">
            <Input name="title" required placeholder="e.g. Promoted to Senior Engineer" />
          </Field>
          <Field label="Details">
            <Textarea name="description" rows={2} />
          </Field>
          <Button type="submit">Save to career memory</Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-white">Timeline</h2>
        {events.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing recorded yet.</p>
        ) : (
          <ol className="space-y-4">
            {events.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4 last:border-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone={TYPE_TONE[e.type] ?? "neutral"}>{TYPE_LABEL[e.type]}</Badge>
                    <span className="text-xs text-neutral-500">{new Date(e.eventDate).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1.5 font-medium text-neutral-100">{e.title}</p>
                  {e.description && <p className="mt-0.5 text-sm text-neutral-400">{e.description}</p>}
                  {e.opportunity && (
                    <Link
                      href={`/opportunities/${e.opportunity.id}`}
                      className="mt-1 inline-block text-xs text-violet-400 hover:text-violet-300"
                    >
                      {e.opportunity.role} @ {e.opportunity.company}
                    </Link>
                  )}
                </div>
                <form action={deleteCareerEvent.bind(null, e.id)}>
                  <Button type="submit" variant="ghost" className="text-xs">
                    Delete
                  </Button>
                </form>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
