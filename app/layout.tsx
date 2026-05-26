import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/app/_components/theme-toggle";
import CurrencySelector from "@/app/_components/currency-selector";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your personal expenses — add, view, and delete expenses with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 sm:px-6 py-4 border-b border-border bg-surface/80 dark:bg-zinc-900/80">
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-accent dark:text-zinc-300 dark:hover:text-accent transition-colors whitespace-nowrap">
            Dashboard
          </Link>
          <Link href="/expenses" className="text-sm font-medium text-zinc-600 hover:text-accent dark:text-zinc-300 dark:hover:text-accent transition-colors whitespace-nowrap">
            Expenses
          </Link>
          <Link href="/budgets" className="text-sm font-medium text-zinc-600 hover:text-accent dark:text-zinc-300 dark:hover:text-accent transition-colors whitespace-nowrap">
            Budgets
          </Link>
          <Link href="/persons" className="text-sm font-medium text-zinc-600 hover:text-accent dark:text-zinc-300 dark:hover:text-accent transition-colors whitespace-nowrap">
            Persons
          </Link>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <CurrencySelector />
            <ThemeToggle />
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
