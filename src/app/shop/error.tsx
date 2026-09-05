"use client";

import { AppShell } from "@/shared/components/app-shell";
import { ErrorState } from "@/shared/components/error-state";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AppShell><div className="pt-8"><ErrorState onRetry={reset} /></div></AppShell>;
}
