import { Skeleton } from "@/shared/components/skeleton";

export function ProductListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div aria-busy="true" aria-label="Loading product" className="flex gap-4 rounded-3xl border border-[var(--line)] bg-white p-3" key={index} role="status">
          <Skeleton className="h-24 w-24 shrink-0" />
          <div className="flex-1 space-y-3 py-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
