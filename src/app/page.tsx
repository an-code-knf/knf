import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button, Card } from "@/components/ui/primitives";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/decide");
  }

  return (
    <div className="flex-1">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight text-white">Northstar</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white">
            Sign in
          </Link>
          <Link href="/signup">
            <Button>Get started free</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-20 pt-16 text-center">
        <span className="inline-block rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
          One question. One answer.
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Should you stay, or should you go?
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-400">
          Paste the job you&apos;ve been invited to interview for. Northstar weighs it against your salary,
          commute, and risk tolerance, and gives you a straight answer — not another spreadsheet.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup">
            <Button className="px-6 py-3 text-base">Get your answer</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="px-6 py-3 text-base">
              Sign in
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-neutral-500">Have AI decide your career for just $1.99</p>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <Card className="text-center">
          <div className="text-7xl font-bold tracking-tight text-emerald-400">GO</div>
          <p className="mx-auto mt-4 max-w-md text-sm text-neutral-400">
            That&apos;s the kind of answer you get — a bold verdict, backed by the reasons behind it, not a wall
            of dashboards you have to interpret yourself.
          </p>
        </Card>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold text-white">Changing jobs today is insane</h2>
          <p className="mt-2 text-neutral-400">
            Browse LinkedIn. Read Glassdoor. Update your CV. Ask ChatGPT. Spreadsheet pros and cons. Hope you made
            the right call. Northstar replaces all of it with one button.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <FeatureCard title="It knows you" body="Your salary, commute, family situation, and risk tolerance — set once in your profile, weighed every time." />
          <FeatureCard title="It reads the posting" body="Paste a job URL and Northstar pulls the role and company automatically wherever it can." />
          <FeatureCard title="It decides" body="Salary delta, commute, company trajectory, leadership, promotion path — scored into one confidence-rated verdict." />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <h3 className="font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm text-neutral-400">{body}</p>
    </Card>
  );
}
