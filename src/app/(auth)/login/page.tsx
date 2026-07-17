"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Field, Input } from "@/components/ui/primitives";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <h1 className="mb-1 text-xl font-semibold text-white">Welcome back</h1>
      <p className="mb-6 text-sm text-neutral-400">Sign in to your career workspace.</p>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Email">
          <Input type="email" name="email" required autoComplete="email" />
        </Field>
        <Field label="Password">
          <Input type="password" name="password" required autoComplete="current-password" />
        </Field>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-400">
        New to Northstar?{" "}
        <Link href="/signup" className="text-violet-400 hover:text-violet-300">
          Create an account
        </Link>
      </p>
    </Card>
  );
}
