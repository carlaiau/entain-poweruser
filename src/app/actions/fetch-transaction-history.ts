"use server";
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

export async function doServerFetchForTransactionHistory(): Promise<any> {
  const url =
    "https://socket.tab.co.nz/rest/v1/transactions/?method=transactionsbyclientidwithfilters&client_id=cb35d2ff-a3b9-4d62-bce7-c53a6d932019&page=1&count=20&excluded_transaction_ids=%5B%5D&compact_combo_bets=true&bet_status_ids=%5B%2229d8c93c-3115-41ac-a2a0-ba2167f4b7a5%22%2C%224ee5b54-1b36-4333-bcb7-f5bacd7ac655%22%5D&transaction_type_ids=%5B%2263903548-09a6-405c-9277-aee297cebed2%22%2C%223a71227e-727c-4180-984d-87bf92f0f456%22%5D&transfer_type_ids=%5B%5D";
  try {
    const headers: Record<string, string> = {
      accept: "*/*",
      authorization:
        "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImY5NDAwODFiLTFmZTktNDNjNC1iM2YzLTEzYjA1YWU1MTMyMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOltdLCJhenAiOiI2NTgxM2ExZC1iYmY0LTQzMzctYWE0MS1lNThkMWFlYzA3MjUiLCJjbGllbnRfaWQiOiI2NTgxM2ExZC1iYmY0LTQzMzctYWE0MS1lNThkMWFlYzA3MjUiLCJleHAiOjE3NTg4ODY0MDEsImh0dHBzOi8vZ3ZjYXVzLmNsYWltL3VzZXJfbWV0YWRhdGEiOnsiY2xpZW50X2lkIjoiY2IzNWQyZmYtYTNiOS00ZDYyLWJjZTctYzUzYTZkOTMyMDE5IiwiZmFtaWx5X25hbWUiOiJBaWF1IiwiZ2l2ZW5fbmFtZSI6IkNhcmwiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJjYXJsbnoifSwiaWF0IjoxNzU4ODgyODAwLCJpc3MiOiJodHRwczovL3d3dy50YWIuY28ubnovYXBpL3Byb3ZpZGVycy9hdXRoIiwianRpIjoiMTE1ZjY0MzAtMzZkNC00MjgyLTk3ZjYtODIwMTQwZDMzYjJkIiwibmJmIjoxNzU4ODgyODAwLCJzY3AiOlsib3BlbmlkIiwib2ZmbGluZV9hY2Nlc3MiXSwic3ViIjoiY2IzNWQyZmYtYTNiOS00ZDYyLWJjZTctYzUzYTZkOTMyMDE5In0.kW7DSsNW72L-uWhuXYblScglsCER1EtL5F0e0HQxrX-FQ4nRQ_kWjmaU31RRboY2uKx-tGRvlNpoVjeiv4rFs4E0zg4CnhBY_UX7zPZzajtC82U07BFvspdWL4Ldm9BFo27G0dbArTfi_qmdPVBAGFrwd1eycIwnk_0CVx20WPN6yrZ-YxFUEajfUnxyjirTgzzRNzhwspz-5yBBJoc3bOvg1PfifjXy2acgBejI96cIzY4Vwgu_pbNPw8CzIwRuKjWSazot9-z9xYFS5udCSWryCBGArPH2IAVXIqjrPLkZk5C2Tb3k4PXxIPTw-szjt_HTFNY3HcOcyuuzjph2Q3wwzpNaNksbGYNalCfwjbryvVdhwRSdpFG1SeSG0SLQx0XuoCPcakUpnNod675x3lkFLGJaJkY86XvA3aHocsH0eGHEkUp00HmMb1Bgl9zOAb3E0kNVB_XQ1OpaKFJCJ4d-2CUB4xmLg5NSF4MZJBUI4rTOWSdD0DYKOYfB5Tv23PzS7W4sQCSbLBM9n4sKMh3BCHJw-_0pX-wOre0vdfqczaHAHlAUS1czEKznpYVC9dt0-Soy1YlkNDgysXdLjTpXH0nqkJ1q6RIQjUd2dGunHaSTTjpsFj7_T9TyJzpfFODoDQmASxHjaWQ-ksRy1EiACwHgTGsNQovz4RbcV98",
      "content-type": "application/json",
      "device-id": "2f0e1e49-668b-447a-bc19-f7918f2d9aa9",
      "sec-ch-ua":
        '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      Referer: "https://www.tab.co.nz/",
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
