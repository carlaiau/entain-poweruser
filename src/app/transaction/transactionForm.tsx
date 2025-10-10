"use client";

import { useActionState, useState } from "react";
import { joinBetLegs } from "./utils";
import CsvViewer from "./csvViewer";
import { FetchResult, supportedService } from "@/types";
import { Heading } from "@/catalyst/heading";

const OutputRender = ({ data }: { data: any }) => {
  console.log({ dataAtOutputRender: data });
  if (!data || !data.bet_legs || !data.bet_leg_selections) {
    return <div>No data to display</div>;
  }
  const joined = joinBetLegs(data, data.bet_legs, data.bet_leg_selections);

  console.log({ joined });

  return <CsvViewer data={joined} />;
};
const TransactionForm = ({
  action,
}: {
  action: (
    state: FetchResult | null,
    formData: FormData
  ) => Promise<FetchResult>;
}) => {
  const [transactionState, formAction, pending] = useActionState<
    FetchResult | null,
    FormData
  >(action, null);

  // controlled values — persist across submissions
  const [clientInputData, setClientInputData] = useState<{
    service: supportedService | "";
    token: string;
    count: number;
    page: number;
  }>({
    service: "tab",
    token: "",
    count: 500,
    page: 1,
  });

  let json = undefined;

  if (transactionState) {
    let data =
      transactionState.ok && transactionState.data
        ? transactionState.data
        : "{}";
    if (typeof data === "string") {
      json = JSON.parse(data);
    }
  }

  return (
    <div>
      <Heading className="text-base font-medium">
        Fetch NFL ATS and Player Props Transaction History
      </Heading>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Fetch your betting transactions from the sportsbooks private API and
        export them to CSV.
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

      <p className="mt-3">
        <strong className="font-medium text-slate-900 dark:text-white">
          How it works:
        </strong>{" "}
        Next.js server actions make the request to your sportsbook (no CORS),
        then we transform the response into CSV.
      </p>

      <p className="mt-4 text-sm text-red-600 dark:text-red-400">
        <strong>Disclaimer:</strong> Provided as-is. We take no responsibility
        for the security of your bearer token or retrieved data. Use at your own
        risk.
      </p>
      <form action={formAction} className="space-y-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center w-64 justify-between">
            <div className="flex flex-col gap-2">
              <label className="text-base font-medium">Service</label>
              <select
                name="service"
                className="rounded border px-3 py-2 text-sm"
                value={clientInputData.service}
                onChange={(e) =>
                  setClientInputData((prev) => ({
                    ...prev,
                    service: e.target.value as supportedService | "",
                  }))
                }
                required
              >
                <option value="">Please Choose</option>
                <option value="tab">NZ TAB</option>
                <option value="betcha">Betcha</option>
              </select>
            </div>
          </div>
          <div className="flex items-center w-64 justify-between">
            <div className="flex flex-col gap-2">
              <label className="text-base font-medium">Number of TX</label>
              <input
                type="number"
                name="count"
                className="rounded border px-3 py-2 text-sm"
                value={clientInputData.count}
                onChange={(e) =>
                  setClientInputData((prev) => ({
                    ...prev,
                    count: e.target.valueAsNumber,
                  }))
                }
                required
              />
            </div>
          </div>
          <div className="flex items-center w-64 justify-between">
            <div className="flex flex-col gap-2">
              <label className="text-base font-medium">Page</label>
              <input
                type="number"
                name="page"
                className="rounded border px-3 py-2 text-sm"
                value={clientInputData.page}
                onChange={(e) =>
                  setClientInputData((prev) => ({
                    ...prev,
                    page: e.target.valueAsNumber,
                  }))
                }
                required
              />
            </div>
          </div>
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
          className="rounded bg-blue-600 px-4 py-2 text-white"
          disabled={pending}
        >
          {pending ? "Fetching..." : "Fetch"}
        </button>
      </form>
      {transactionState?.ok && json && json.data && (
        <OutputRender data={json.data} />
      )}
    </div>
  );
};

export default TransactionForm;
