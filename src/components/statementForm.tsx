"use client";

import {
  ClientInputData,
  FetchResult,
  StatementResponse,
  supportedService,
} from "@/types";
import React, { useState } from "react";
import { useActionState } from "react";
import CsvViewer from "./csv-viewer";

export function Form({
  action,
  service,
  setService,
}: {
  service: supportedService | "";
  setService: React.Dispatch<React.SetStateAction<supportedService | "">>;
  action: (
    state: FetchResult | null,
    formData: FormData
  ) => Promise<FetchResult>;
}) {
  const [state, formAction, pending] = useActionState<
    FetchResult | null,
    FormData
  >(action, null);

  // controlled values — persist across submissions
  const [clientInputData, setClientInputData] = useState<ClientInputData>({
    token: "",
    start_date: "",
    end_date: "",
  });

  return (
    <>
      <form action={formAction} className="space-y-4 ">
        <div className="flex items-center w-64 justify-between">
          <label className="text-base font-medium">Service</label>

          <select
            name="service"
            className="rounded border px-3 py-2 text-sm"
            value={service}
            onChange={(e) =>
              setService(e.target.value as supportedService | "")
            }
            required
          >
            <option value="">Please Choose</option>
            <option value="tab">NZ TAB</option>
            <option value="betcha">Betcha</option>
          </select>
        </div>
        <div className="flex items-center w-64 justify-between">
          <label className="text-base font-medium">Start Date</label>
          <input
            type="date"
            name="start_date"
            className="rounded border px-3 py-2 text-sm"
            value={clientInputData.start_date}
            onChange={(e) =>
              setClientInputData((prev) => ({
                ...prev,
                start_date: e.target.value,
              }))
            }
            required
          />
        </div>
        <div className="flex items-center w-64 justify-between">
          <label className="text-base font-medium">End Date</label>
          <input
            type="date"
            name="end_date"
            className="rounded border px-3 py-2 text-sm"
            value={clientInputData.end_date}
            onChange={(e) =>
              setClientInputData((prev) => ({
                ...prev,
                end_date: e.target.value,
              }))
            }
            required
          />
        </div>
        <span className="text-base font-medium">Bearer Token</span>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Log in to TAB/Betcha. open DevTools (<kbd>F12</kbd>).Network tab. find
          a /client-details request. copy the value after Authorization: Bearer
        </p>
        <textarea
          name="token"
          className="mt-1 block w-full rounded border px-3 py-2 text-sm"
          rows={2}
          placeholder="Paste your Bearer token"
          required
          value={clientInputData.token}
          onChange={(e) =>
            setClientInputData((prev) => ({ ...prev, token: e.target.value }))
          }
        />

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          disabled={pending}
        >
          {pending ? "Scraping..." : "Scrape on your behalf"}
        </button>
      </form>

      {state && (
        <div className="mt-6">
          {state.ok && state.data ? (
            <CsvViewer
              data={state.data as StatementResponse}
              service={service}
              start_date={clientInputData.start_date}
              end_date={clientInputData.end_date}
            />
          ) : (
            <pre className="mt-2 rounded bg-gray-100 p-3 text-sm overflow-x-auto max-h-64">
              {JSON.stringify({ ok: state.ok, status: state.status }, null, 2)}
            </pre>
          )}
        </div>
      )}
    </>
  );
}
