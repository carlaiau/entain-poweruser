"use client";

import { useActionState } from "react";

const TransactionForm = ({ action }: { action: any }) => {
  const [transactionState, formAction, pending] = useActionState<any | null>(
    action,
    null
  );

  console.log({ transactionState });

  const data = transactionState?.data || "";
  const json = JSON.parse(data || "{}");
  console.log({ json });
  return (
    <div>
      <form action={formAction} className="space-y-4 ">
        <div className="flex items-center w-64 justify-between">
          <label className="text-base font-medium">
            Fetch Transaction History
          </label>
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white"
            disabled={pending}
          >
            {pending ? "Fetching..." : "Fetch"}
          </button>
        </div>

        {transactionState && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Response:</h2>
            <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
              {JSON.stringify(transactionState, null, 2)}
            </pre>
          </div>
        )}
      </form>
    </div>
  );
};

export default TransactionForm;
