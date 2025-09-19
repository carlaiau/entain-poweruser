"use server";
import { FetchResult } from "@/types";
const bookieFromId = {
  tab: {
    clientId: process.env.TAB_CLIENT_ID ?? "",
    url: "https://api.tab.co.nz/graphql",
    referrer: "https://www.tab.co.nz/",
  },
  betcha: {
    clientId: process.env.BETCHA_CLIENT_ID ?? "",
    url: "https://api.betcha.co.nz/graphql",
    referrer: "https://www.betcha.co.nz/",
  },
};

export async function doServerFetchForStatementHistory(
  prevState: FetchResult | null,
  formData: FormData
): Promise<FetchResult> {
  try {
    if (!formData) {
      return { ok: false, status: 400, error: "No form data" };
    }
    const token = (formData.get("token") || "").toString().trim();
    if (typeof formData.get("service") === null) {
      return { ok: false, status: 400, error: "Missing service" };
    }

    const service = (formData.get("service") || "").toString().trim();
    const bookie = bookieFromId[service as keyof typeof bookieFromId];

    if (!bookie) {
      return { ok: false, status: 400, error: "Invalid service" };
    }

    const start_date = (formData.get("start_date") || "").toString().trim();
    const end_date = (formData.get("end_date") || "").toString().trim();

    console.log({ start_date, end_date });
    if (!start_date || !end_date) {
      return { ok: false, status: 400, error: "Missing date range" };
    }

    if (!token) return { ok: false, status: 400, error: "Missing token" };

    const body = `{"operationName":"ListActivityTransactions","variables":{"shouldFetchCashoutEligibility":false,"count":2000,"page":1,"transactionStartDate":"${start_date}T12:00:00.000Z","transactionEndDate":"${end_date}T23:59:59.000Z","groupId":""},"query":"query ListActivityTransactions($after: String, $first: Int, $compactComboBets: Boolean, $count: Int, $page: Int!, $groupId: ID, $transactionStartDate: DateTime!, $transactionEndDate: DateTime!, $excludedTransactionIds: [String!], $betStatusIds: [String!], $transactionTypeIds: [String!], $transferTypeIds: [String!], $shouldFetchCashoutEligibility: Boolean = false) {\\n  accountTransactions(\\n    after: $after\\n    first: $first\\n    compactComboBets: $compactComboBets\\n    count: $count\\n    groupId: $groupId\\n    page: $page\\n    transactionStartDate: $transactionStartDate\\n    transactionEndDate: $transactionEndDate\\n    excludedTransactionIds: $excludedTransactionIds\\n    betStatusIds: $betStatusIds\\n    transactionTypeIds: $transactionTypeIds\\n    transferTypeIds: $transferTypeIds\\n    shouldFetchCashoutEligibility: $shouldFetchCashoutEligibility\\n  ) {\\n    nodes {\\n      ...Transactions\\n      betTransactions {\\n        betOdds\\n        betStatus\\n        betType\\n        entrantName\\n        entrantNumber\\n        eventName\\n        eventNumber\\n        marketName\\n        productName\\n        productType\\n        __typename\\n      }\\n      __typename\\n    }\\n    pageInfo {\\n      hasNextPage\\n      endCursor\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment Transactions on AccountTransactions {\\n  groupBet {\\n    acceptedStake\\n    id\\n    group {\\n      channel {\\n        coverUrl\\n        id\\n        isActive\\n        name\\n        __typename\\n      }\\n      id\\n      name\\n      __typename\\n    }\\n    user {\\n      avatarColour\\n      nickname\\n      __typename\\n    }\\n    __typename\\n  }\\n  id\\n  returns {\\n    amount\\n    betReturnIds\\n    latestTransaction {\\n      acceptAmount\\n      accountBalance\\n      balanceEffect\\n      created {\\n        nanos\\n        seconds\\n        __typename\\n      }\\n      currencyCode\\n      deviceId\\n      id\\n      requestAmount\\n      transactionTypeId\\n      __typename\\n    }\\n    transactionIds\\n    type\\n    __typename\\n  }\\n  stake\\n  transaction {\\n    acceptAmount\\n    accountBalance\\n    balanceEffect\\n    created {\\n      nanos\\n      seconds\\n      __typename\\n    }\\n    currencyCode\\n    deviceId\\n    id\\n    requestAmount\\n    transactionTypeId\\n    __typename\\n  }\\n  transfers {\\n    method\\n    status\\n    type\\n    __typename\\n  }\\n  transferGroup {\\n    channel {\\n      coverUrl\\n      id\\n      isActive\\n      name\\n      __typename\\n    }\\n    id\\n    name\\n    __typename\\n  }\\n  transferPayment {\\n    payment\\n    __typename\\n  }\\n  type\\n  __typename\\n}"}`;

    const headers: Record<string, string> = {
      accept: "*/*",
      authorization: `Bearer ${token}`,
      "client-id": bookie.clientId,
      "content-type": "application/json",
      Referer: bookie.referrer,
    };

    const upstream = await fetch(bookie.url, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const ct = upstream.headers.get("content-type") || "";
    let data: unknown;
    try {
      data = ct.includes("application/json")
        ? await upstream.json()
        : await upstream.text();
    } catch {
      data = await upstream.text();
    }

    if (!upstream.ok) {
      return {
        ok: false,
        status: upstream.status,
        error: typeof data === "string" ? data : JSON.stringify(data),
      };
    }

    return { ok: true, status: upstream.status, data };
  } catch (e: unknown) {
    return {
      ok: false,
      status: 500,
      error: e instanceof globalThis.Error ? e.message : "Server action failed",
    };
  }
}
