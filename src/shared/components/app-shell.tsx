import type { PropsWithChildren } from "react";
import { BottomNavigation } from "./bottom-navigation";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-dvh bg-[var(--canvas)]">
      <main className="mx-auto min-h-dvh w-full max-w-[500px] bg-[var(--canvas)] pb-28 shadow-[0_0_0_1px_rgba(20,14,50,0.02)]">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
