import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="sk-card w-full max-w-sm p-8 text-center">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <Logo size="md" />
          <span className="text-lg font-semibold tracking-tight">Sendkar</span>
        </div>
        <h1 className="mb-1 text-xl font-semibold">Page not found</h1>
        <p className="mb-6 text-sm text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link href="/" className="sk-btn sk-btn-primary block w-full text-center">Back to home</Link>
      </div>
    </div>
  );
}
