// app/tab-tester/page.tsx
"use client";
import { Form } from "./form";

import { doServerFetch } from "./actions";
import { useState } from "react";
import { supportedService } from "@/types";

export default function Page() {
  const [service, setService] = useState<supportedService | "">("");
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* Header / Topbar */}
      <header className="border-b bg-white/70 backdrop-blur dark:bg-slate-900/60">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-300/90 shadow-md" />
            <span className="text-lg font-semibold tracking-tight">
              Entain Statement Fetcher
            </span>
            <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800">
              NZ TAB | Betcha | Neds | Ladbrokes
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm text-slate-500 dark:text-slate-300">
            <a
              href="https://github.com/carlaiau/entain-statement-fetcher"
              className="hover:text-slate-900 dark:hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github Repo
            </a>
            <a
              href="https://shitodds.com"
              className="hover:text-slate-900 dark:hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              Shit Odds Comparison
            </a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 gap-y-6">
          {/* Left: Info panel */}
          <section className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h1 className="text-xl font-semibold">
                TAB / Betcha Statement Fetcher
              </h1>

              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Fetch your betting statements from the sportsbook’s private API
                and export them to CSV.
              </p>

              <p className="mt-3 text-slate-600 dark:text-slate-300">
                The CSV is formatted for direct import into{" "}
                <a
                  className="underline text-emerald-600 font-medium hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  href="https://www.aussportsbetting.com/tools/betting-tracker-excel-worksheet/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  aussportsbetting.com Betting Tracker
                </a>
                .
              </p>

              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700">
                <p>
                  <strong className="font-medium text-slate-900 dark:text-white">
                    How it works:
                  </strong>{" "}
                  Next.js server actions make the request to your sportsbook (no
                  CORS), then we transform the response into CSV.
                </p>
              </div>

              <p className="mt-4 text-xs text-red-600 dark:text-red-400">
                <strong>Disclaimer:</strong> Provided as-is. We take no
                responsibility for the security of your bearer token or
                retrieved data. Use at your own risk.
              </p>
            </div>
          </section>

          {/* Right: Form + Results */}
          <section className="lg:col-span-2 space-y-6 flex-grow">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Fetch Statements
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Paste your bearer token, choose the service, and select a date
                range.
              </p>

              {/* Form area */}
              <div className="mt-4">
                <Form
                  action={doServerFetch}
                  service={service}
                  setService={setService}
                />
              </div>

              {/* Optional: helper tips */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">
                  Server-side request
                </span>
                <span className="rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">
                  CSV export ready
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/70 backdrop-blur dark:bg-slate-900/60">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
