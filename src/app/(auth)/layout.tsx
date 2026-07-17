import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8 text-lg font-semibold tracking-tight text-white">
        Northstar
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
