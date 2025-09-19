// app/actions/get-event-card.ts
"use server";

import type { EventCardResponse } from "@/types";

export async function getEventCard(
  eventRightId: string
): Promise<EventCardResponse> {
  const res = await fetch(
    `https://api.tab.co.nz/v2/sport/event-card?id=${eventRightId}`,
    {
      // adjust caching as you prefer
      next: { revalidate: 30 },
      headers: {
        "content-type": "application/json",
        "device-id": "a363eaf2-dd20-40fd-9d78-38fba5fdd6e4",
        "sec-ch-ua":
          '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        referer: "https://www.tab.co.nz/",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`EventCard fetch failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
