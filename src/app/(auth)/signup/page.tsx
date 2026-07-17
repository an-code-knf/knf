"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Field, Input } from "@/components/ui/primitives";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    };

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      setError("Account created — please sign in.");
      router.push("/login");
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <Card>
      <h1 className="mb-1 text-xl font-semibold text-white">Create your workspace</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Start building your career memory — free, no card required.
      </p>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Full name">
          <Input type="text" name="name" required autoComplete="name" />
        </Field>
        <Field label="Email">
          <Input type="email" name="email" required autoComplete="email" />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <Input type="password" name="password" required minLength={8} autoComplete="new-password" />
        </Field>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-400">
        Already have an account?{" "}
        <Link href="/login" className="text-violet-400 hover:text-violet-300">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
