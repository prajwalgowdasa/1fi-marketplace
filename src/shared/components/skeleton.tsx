import { cn } from "@/shared/lib/cn";

type SkeletonProps = {
  className?: string;
  label?: string;
};

export function Skeleton({ className, label = "Loading" }: SkeletonProps) {
  return <div aria-label={label} aria-busy="true" className={cn("animate-pulse rounded-2xl bg-[var(--brand-050)]", className)} role="status" />;
}
