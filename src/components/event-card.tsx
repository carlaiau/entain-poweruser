"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { getEventCard } from "@/app/actions/get-event-card";
import { Table, TableBody, TableCell, TableRow } from "@/catalyst/table";
import type { EventCardResponse } from "@/types";

type Props = { id: string };

export default function EventCard({ id }: Props) {
  const [data, setData] = useState<EventCardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Right side of "sport:xxxxxxxx"
  const eventRightId = useMemo(() => {
    const parts = id.split(":");
    return parts.length === 2 ? parts[1] : null;
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      setData(null);
      if (!eventRightId) return;

      try {
        const json = await getEventCard(eventRightId);
        if (!cancelled) setData(json);
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [eventRightId]);

  const basicNames = useMemo(
    () =>
      new Set([
        "Match Betting",
        "Match Result",
        "Fight Betting",
        "Match Winner",
      ]),
    []
  );

  const markets = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.markets)
      .filter(
        ([, m]) =>
          (m.entrant_ids.length <= 2 && basicNames.has(m.name)) ||
          m.handicap !== undefined
      )
      .sort((a, b) => {
        const nameCompare = a[1].name.localeCompare(b[1].name);
        if (nameCompare !== 0) return nameCompare;
        const ah = a[1].handicap ?? 0;
        const bh = b[1].handicap ?? 0;
        return bh - ah; // desc by handicap when names tie
      });
  }, [data, basicNames]);

  if (!eventRightId) return null;

  return (
    <div className="rounded-md border border-slate-200 bg-white mt-2">
      {error && (
        <p className="text-xs text-red-600">Error loading event: {error}</p>
      )}

      {!data && !error && (
        <div className="animate-pulse text-xs text-slate-500">Loading…</div>
      )}

      {data && (
        <Table className="w-full table-auto border-collapse" dense striped>
          <TableBody>
            {markets.map(([marketId, market]) => (
              <TableRow key={marketId}>
                <TableCell className="font-medium">
                  <p className="text-xs">
                    {market.name}{" "}
                    {market.handicap ? `(${market.handicap})` : ""}
                  </p>
                </TableCell>

                {market.entrant_ids.map((entrantId) => {
                  const entrant = data.entrants[entrantId];
                  if (!entrant) return null;

                  const priceKey = Object.keys(data.prices).find((p) =>
                    p.startsWith(entrantId)
                  );

                  return (
                    <Fragment key={entrantId}>
                      <TableCell>
                        <p className="text-xs">{entrant.name}</p>
                      </TableCell>
                      {priceKey ? (
                        <TableCell key={priceKey}>
                          <p className="text-xs">
                            {fractionToDecimal(
                              data.prices[priceKey].odds.numerator,
                              data.prices[priceKey].odds.denominator
                            )}
                          </p>
                        </TableCell>
                      ) : (
                        <TableCell key={entrantId + "-no-price"}>N/A</TableCell>
                      )}
                    </Fragment>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function fractionToDecimal(num: number, den: number) {
  // fractional (a/b) + 1 => decimal odds
  return (num / den + 1).toFixed(2);
}
