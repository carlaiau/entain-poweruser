import { Fragment } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/catalyst/table";
import { EventCardResponse } from "@/types";

const EventCard = async ({ id }: { id: string }) => {
  const splitId = id.split(":");
  if (splitId.length !== 2) {
    return null;
  }

  const res = await fetch(
    `https://api.tab.co.nz/v2/sport/event-card?id=${splitId[1]}`,
    {
      headers: {
        "content-type": "application/json",
        "device-id": "a363eaf2-dd20-40fd-9d78-38fba5fdd6e4",
        "sec-ch-ua":
          '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
      },
      referrer: "https://www.tab.co.nz/",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "omit",
    }
  );

  const json: EventCardResponse = await res.json();

  const basicNames = [
    "Match Betting",
    "Match Result",
    "Fight Betting",
    "Match Winner",
  ];
  return (
    <div className="rounded-md border border-slate-200 bg-white p-2 mt-2">
      <Table className="w-full table-auto border-collapse" dense striped>
        <TableBody>
          {Object.entries(json.markets)
            .filter(
              ([_, m]) =>
                //true ||
                basicNames.includes(m.name) || m.handicap
            )
            .sort((a, b) => {
              const nameCompare = a[1].name.localeCompare(b[1].name);
              if (nameCompare !== 0) {
                return nameCompare;
              }

              // Names are the same → compare handicaps
              const aHandicap = a[1].handicap ?? 0;
              const bHandicap = b[1].handicap ?? 0;
              return bHandicap - aHandicap;
            })
            .map(([marketId, market]) => (
              <TableRow key={marketId}>
                <TableCell className="font-medium">
                  <p className="text-xs">
                    {market.name}{" "}
                    {market.handicap ? "(" + market.handicap + ")" : ""}
                  </p>
                </TableCell>
                {market.entrant_ids.map((entrantId) => {
                  const entrant = json.entrants[entrantId];
                  if (!entrant) return null;
                  const price = Object.keys(json.prices).find((p) =>
                    p.startsWith(entrantId)
                  );
                  return (
                    <Fragment key={entrantId}>
                      <TableCell key={entrantId}>
                        <p className="text-xs">{entrant.name}</p>
                      </TableCell>
                      {price ? (
                        <TableCell key={price}>
                          <p className="text-xs">
                            {(
                              json.prices[price].odds.numerator /
                                json.prices[price].odds.denominator +
                              1
                            ).toFixed(2)}
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
    </div>
  );
};

export default EventCard;
