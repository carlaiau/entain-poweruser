// app/tab-tester/page.tsx
"use client";
import { useState } from "react";
import { Form } from "../form";
import { doServerFetchForStatementHistory } from "../actions";
import { supportedService } from "@/types";
import { Button } from "@/catalyst/button";

export default function Page() {
  const [service, setService] = useState<supportedService | "">("");
  return (
    <div>
      <Button to="/">Back</Button>

      {/* Main */}

      <div className="grid grid-cols-1 gap-y-6 mt-6">
        {/* Left: Info panel */}
        <section className="lg:col-span-1">
          <div className="rounded-md border border-slate-200 bg-white p-6">
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
            responsibility for the security of your bearer token or retrieved
            data. Use at your own risk.
          </p>
        </section>

        <div className="rounded-md border border-slate-200 bg-white p-6">
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
              action={doServerFetchForStatementHistory}
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
      </div>
    </div>
  );
}
