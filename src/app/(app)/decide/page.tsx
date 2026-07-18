import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { DecideForm } from "@/components/decide-form";
import { Card, PageHeader } from "@/components/ui/primitives";

export default async function DecidePage() {
  const session = await requireSession();
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Should I stay, or should I go?"
        description="Paste the job posting, fill in what we can't read automatically, and get a straight answer."
      />

      {!profile && (
        <Card className="border-violet-800 bg-violet-500/5">
          <p className="text-sm text-violet-200">
            Your profile is empty, so this can only judge the opportunity in isolation — it won&apos;t know your
            salary, commute, or risk tolerance. <Link href="/onboarding" className="underline">Complete your profile</Link> for
            a real answer.
          </p>
        </Card>
      )}

      <DecideForm defaultCurrency={profile?.currency ?? "DKK"} />
    </div>
  );
}
