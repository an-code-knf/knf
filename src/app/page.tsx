import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button, Card } from "@/components/ui/primitives";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
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

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center">
        <span className="inline-block rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
          The operating system for your career
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Should you take that interview? Stay? Or negotiate harder?
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-400">
          Northstar helps professionals decide whether to stay, interview, negotiate, or accept — with
          confidence, backed by personalized AI analysis instead of guesswork.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup">
            <Button className="px-6 py-3 text-base">Start building your career memory</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="px-6 py-3 text-base">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold text-white">Changing jobs today is insane</h2>
          <p className="mt-2 text-neutral-400">
            Browse LinkedIn. Read Glassdoor. Update your CV. Ask ChatGPT. Spreadsheet pros and cons. Hope you made
            the right call. Northstar replaces all of it with one decision engine that already knows your
            situation.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Should I even take this interview?"
            body="Northstar scores salary, commute, leadership, growth trajectory, and your risk tolerance — and gives you a confidence-scored recommendation before you spend an hour prepping."
          />
          <FeatureCard
            title="Stay vs. offer, side by side"
            body="The moment an offer lands, Northstar builds the comparison table you'd otherwise spend a weekend on — salary, pension, commute, promotion odds, five-year earnings."
          />
          <FeatureCard
            title="Don't accept yet"
            body="Northstar knows market salary bands for your role and region. It tells you exactly what to ask for, and drafts the negotiation email for you."
          />
          <FeatureCard
            title="Career memory"
            body="Every interview, rejection, offer, and promotion — remembered permanently, so six months before you're even thinking of leaving, Northstar can already tell you it's time."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-8 text-center text-2xl font-semibold text-white">Free to start, Pro when you&apos;re negotiating for real</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <PricingCard
            name="Free"
            price="€0"
            features={["Profile", "Job comparison", "Basic recommendations"]}
          />
          <PricingCard
            name="Pro"
            price="€15–20/mo"
            highlighted
            features={[
              "AI negotiation",
              "Salary intelligence",
              "Decision engine",
              "Career memory",
              "Interview prep",
              "Offer comparison",
              "Weekly opportunities",
            ]}
          />
          <PricingCard
            name="Enterprise"
            price="Talk to us"
            features={["Northstar for your whole team", "Internal mobility & career development", "Company-wide talent insights"]}
          />
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

function PricingCard({
  name,
  price,
  features,
  highlighted,
}: {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <Card className={highlighted ? "border-violet-600 bg-violet-500/5" : ""}>
      <h3 className="text-lg font-semibold text-white">{name}</h3>
      <p className="mt-1 text-2xl font-semibold text-white">{price}</p>
      <ul className="mt-4 space-y-2 text-sm text-neutral-300">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
            {f}
          </li>
        ))}
      </ul>
    </Card>
  );
}
