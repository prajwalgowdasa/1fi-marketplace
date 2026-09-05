import { AppShell } from "@/shared/components/app-shell";
import { ShopHero } from "@/shared/components/shop-hero";
import { Skeleton } from "@/shared/components/skeleton";

export default function Loading() {
  return (
    <AppShell>
      <ShopHero />
      <div aria-busy="true" className="-mt-7 px-4"><Skeleton className="h-14 w-full rounded-[28px]" label="Loading Shop navigation" /></div>
      <div aria-busy="true" className="space-y-3 px-4 pt-8">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-20 w-full" label="Loading marketplace" />
      </div>
    </AppShell>
  );
}
