import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/primitives";
import { Link2, Scale, CheckCircle2, Sparkles, UserRound, FileSearch, Target } from "lucide-react";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/decide");
  }

  const steps = [
    {
      icon: Link2,
      title: "Paste the job",
      body: "Drop in the posting you were invited to interview for.",
    },
    {
      icon: Scale,
      title: "We weigh it",
      body: "Salary, commute, and risk tolerance — checked against your profile.",
    },
    {
      icon: CheckCircle2,
      title: "Get your answer",
      body: "A straight verdict. GO, or STAY.",
    },
  ];

  const reasons = [
    { icon: UserRound, title: "It knows you", body: "Salary, commute, family, risk tolerance." },
    { icon: FileSearch, title: "It reads the posting", body: "Paste a URL, we pull the details." },
    { icon: Target, title: "It decides", body: "One confidence-rated verdict." },
  ];

  return (
    <div className="flex h-screen flex-col overflow-y-auto">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold tracking-tight text-white">Northstar</span>
        <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white">
          Sign in
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="inline-block rounded-full bg-violet-500/10 px-5 py-2 text-lg font-medium text-violet-300">
          One question. One answer.
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Should you stay, or should you go?
        </h1>

        <div className="mt-9 flex w-full max-w-3xl flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-center sm:gap-0">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-start sm:contents">
              <div className="flex w-full flex-col items-center text-center sm:w-40">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300">
                  <step.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-xs text-neutral-500">{step.body}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="mt-5 hidden h-px w-10 flex-1 self-start bg-neutral-700 sm:block" />
              )}
            </div>
          ))}
        </div>

        <Link href="/signup" className="mt-8">
          <Button className="px-8 py-3.5 text-base">Get your Answer</Button>
        </Link>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-base font-bold text-emerald-300 sm:text-lg">
          <Sparkles className="h-5 w-5" strokeWidth={2} />
          Have AI decide your career for just $1.99
        </div>
      </main>

      <footer className="border-t border-neutral-900 bg-neutral-950/60 px-6 py-5">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs text-neutral-500">
            Browse LinkedIn. Read Glassdoor. Update your CV. Ask ChatGPT. Spreadsheet pros and cons.{" "}
            <span className="text-neutral-300">Northstar replaces all of it with one button.</span>
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {reasons.map((reason) => (
              <div key={reason.title} className="flex items-center gap-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <reason.icon className="h-4 w-4 shrink-0 text-violet-400" strokeWidth={2} />
                <div>
                  <div className="text-xs font-medium text-white">{reason.title}</div>
                  <div className="text-[11px] text-neutral-500">{reason.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
