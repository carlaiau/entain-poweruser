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

export async function doServerFetchForTransactionHistory(
  prevState: FetchResult | null,
  formData: FormData
): Promise<any> {
  if (!formData) {
    return { ok: false, status: 400, error: "No form data" };
  }
  console.log({ formData });
  const token = (formData.get("token") || "").toString().trim();
  if (typeof formData.get("service") === null) {
    return { ok: false, status: 400, error: "Missing service" };
  }

  const service = (formData.get("service") || "").toString().trim();
  const bookie = bookieFromId[service as keyof typeof bookieFromId];

  if (!bookie) {
    return { ok: false, status: 400, error: "Invalid service" };
  }

  const pageNumber = (formData.get("pageNumber") || 1).toString().trim();
  const count = (formData.get("count") || 500).toString().trim();

  const url = `https://socket.tab.co.nz/rest/v1/transactions/?method=transactionsbyclientidwithfilters&client_id=${bookie.clientId}&page=${pageNumber}&count=${count}&excluded_transaction_ids=%5B%5D&compact_combo_bets=true&bet_status_ids=%5B%2229d8c93c-3115-41ac-a2a0-ba2167f4b7a5%22%2C%224ee5b54-1b36-4333-bcb7-f5bacd7ac655%22%5D&transaction_type_ids=%5B%2263903548-09a6-405c-9277-aee297cebed2%22%2C%223a71227e-727c-4180-984d-87bf92f0f456%22%5D&transfer_type_ids=%5B%5D`;
  try {
    /*
    const headers: Record<string, string> = {
      authorization: "Bearer temp",
      "device-id": "2f0e1e49-668b-447a-bc19-f7918f2d9aa9",
      "sec-ch-ua":
        '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
    */

    const headers: Record<string, string> = {
      accept: "*/*",
      authorization: `Bearer ${token}`,
      "client-id": bookie.clientId,
      "content-type": "application/json",
      Referer: bookie.referrer,
    };

    const upstream = await fetch(url, {
      method: "GET",
      headers,
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
