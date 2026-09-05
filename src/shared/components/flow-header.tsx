"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type FlowHeaderProps = {
  backLabel: string;
} & (
  | { href: string; onBack?: never }
  | { href?: never; onBack: () => void }
);

const backControlClassName =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--ink-900)] transition-colors hover:bg-gray-200 active:bg-gray-200";

export function FlowHeader(props: FlowHeaderProps) {
  const backControl = props.href ? (
    <Link
      aria-label={props.backLabel}
      className={backControlClassName}
      href={props.href}
    >
      <ChevronLeft aria-hidden="true" size={24} strokeWidth={2.4} />
    </Link>
  ) : (
    <button
      aria-label={props.backLabel}
      className={backControlClassName}
      onClick={props.onBack}
      type="button"
    >
      <ChevronLeft aria-hidden="true" size={24} strokeWidth={2.4} />
    </button>
  );

  return (
    <header className="flex items-center gap-2 px-4 py-4">
      {backControl}
      <p className="text-[16px] font-bold tracking-tight text-[var(--ink-900)]">
        Pay using 1Fi
      </p>
    </header>
  );
}
