"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/catalyst/table";
import type { EventCardResponse } from "@/types";

const winNames = [
  "Match Betting",
  "Match Result",
  "Fight Betting",
  "Match Winner",
];

type Props = { id: string; onlyBasic?: boolean };

export default function EventCard({ id, onlyBasic }: Props) {
  const [data, setData] = useState<EventCardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Right side of "sport:xxxxxxxx"
  const eventRightId = useMemo(() => {
    const parts = id.split(":");
    return parts.length === 2 ? parts[1] : null;
  }, [id]);

  useEffect(() => {
    if (!eventRightId) return;
    const ac = new AbortController();
    setError(null);
    setData(null);

    (async () => {
      try {
        const res = await fetch(`/api/event-card/${eventRightId}`, {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        const json: EventCardResponse = await res.json();
        setData(json);
      } catch (e: unknown) {
        if (ac.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();

    return () => ac.abort();
  }, [eventRightId]);

  const markets = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.markets)
      .filter(
        ([, m]) =>
          (m.entrant_ids.length <= 2 && winNames.includes(m.name)) ||
          m.handicap !== undefined
      )
      .sort((a, b) => {
        const nameCompare = a[1].name.localeCompare(b[1].name);
        if (nameCompare !== 0) return nameCompare;
        const ah = a[1].handicap ?? 0;
        const bh = b[1].handicap ?? 0;
        return bh - ah; // desc by handicap when names tie
      });
  }, [data]);

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
