// app/api/event-card/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 30; // Next can cache this route’s response

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const upstream = await fetch(
    `https://api.tab.co.nz/v2/sport/event-card?id=${id}`,
    {
      // Server-side: allowed to set whatever upstream expects
      headers: {
        "content-type": "application/json",
        "device-id": process.env.TAB_CLIENT_ID ?? "",
        "sec-ch-ua":
          '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        referer: "https://www.tab.co.nz/",
      },
      // Enable Next caching of the upstream result:
      next: { revalidate: 30 },
    }
  );

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Upstream failed: ${upstream.status}` },
      { status: upstream.status }
    );
  }

  const json = await upstream.json();
  return NextResponse.json(json, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
      "CDN-Cache-Control": "no-store",
    },
  });
}
