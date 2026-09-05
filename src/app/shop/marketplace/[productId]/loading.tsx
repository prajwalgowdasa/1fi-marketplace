import { AppShell } from "@/shared/components/app-shell";
import { Skeleton } from "@/shared/components/skeleton";

export default function Loading() {
  return (
    <AppShell>
      <div className="border-b border-[var(--line)] px-4 py-4"><Skeleton className="h-5 w-32" label="Loading product header" /></div>
      <div className="space-y-5 px-4 py-6"><Skeleton className="aspect-square w-full" label="Loading product image" /><Skeleton className="h-8 w-44" label="Loading product details" /><Skeleton className="h-28 w-full" label="Loading product options" /></div>
    </AppShell>
  );
}
