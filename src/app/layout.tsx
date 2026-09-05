import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";

export const metadata: Metadata = {
  title: "1Fi Marketplace",
  description: "Shop today, pay later using mutual funds.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
