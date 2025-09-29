import { Subheading } from "@/catalyst/heading";

import { fromUnixTime, format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/catalyst/table";
import { BetLegJoin, SelectionJoin } from "./utils";

export function toDDMMYYYY(input: number): string {
  return format(fromUnixTime(input), "dd/MM/yyyy");
}

const onlySupportNflProps = (marketName: string) => {
  const props = [
    "Receiving Yards O/U",
    "Passing Yards O/U",
    "Rushing Yards O/U",
    "Anytime Touchdown Scorer",
  ];
  for (const p of props) {
    if (marketName.includes(p)) {
      return true;
    }
  }
  return false;
};

const CsvViewer = ({ data }: { data: Record<string, BetLegJoin> }) => {
  const bets = Object.values(data)
    .filter(
      (b) =>
        b.selections[0]?.market?.name &&
        onlySupportNflProps(b.selections[0].market.name)
    )
    .sort((a, b) => {
      if (!a || !b) return 0;
      if (!a.selections || !b.selections) return 0;
      if (a.selections.length === 0 && b.selections.length === 0) return 0;
      const sa = a.selections[0].market?.actual_start ?? { seconds: 0 };
      const sb = b.selections[0].market?.actual_start ?? { seconds: 0 };
      return sa.seconds - sb.seconds;
    });

  console.log({ bets });

  if (!data) {
    return <div>No data to display</div>;
  }

  const rows = bets.map(toRow);

  const header = [
    "Date",
    "Bookmaker",
    "Sport / League",
    "Selection",
    "Bet Type",
    "Tipper",
    "My Variable",
    "Fixture / Event",
    "Live Bet",
    "Score / Result",
    "Stake",
    "Odds",
    "BB",
    "Win",
    "", // Cash out amount
    "", //% percentage of bet"
    "", // Commission
    "", // Lay bet?
    "", //Closing Odds
    "Wager Line",
    "Closing Line",
  ];

  const csv = [
    header.map(csvEscape).join(","),
    ...rows.map((r) => r.map(csvEscape).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  return (
    <div>
      <div className="my-4 flex items-center justify-between">
        <Subheading>CSV Preview</Subheading>
        <p className="text-base text-gray-600">
          {rows.length} bet{rows.length !== 1 ? "s" : ""}
        </p>
        <a
          href={url}
          download={`nfl-statement.csv`}
          className="mt-2 inline-block rounded bg-green-600 px-4 py-2 text-white"
        >
          Download CSV
        </a>
      </div>
      <div className="h-92 overflow-y-auto">
        <Table grid dense striped>
          <TableHead>
            <TableRow>
              {header.map((col) => (
                <TableHeader key={col}>{col}</TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                {row.map((cell, cidx) => (
                  <TableCell key={cidx}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Subheading>Raw Response</Subheading>
      <pre className="mt-2 rounded bg-gray-100 p-3 text-sm overflow-x-auto max-h-64">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

function csvEscape(v: string | number | undefined) {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toRow(obj: BetLegJoin) {
  if (!obj || !obj.selections) return [];
  const selection = obj.selections[0];
  if (!selection) return [];

  const date = selection.market?.actual_start?.seconds ?? 0;
  const stake = obj.bet.stake || "";
  const eventName = selection.event?.name;
  const selectionName =
    selection.market?.name + " (" + selection.entrant?.name + ")";
  const betOdds = obj.leg.placed.decimal;
  const win =
    obj.bet.won_amount &&
    obj.bet.won_amount.value &&
    obj.bet.won_amount.value > 0
      ? "Y"
      : "N";

  let wagerLine = "";
  if (selection.placedHandicap) {
    wagerLine = (
      (selection.entrant?.name == "Over" ? -1 : 1) * selection.placedHandicap
    ).toString();
  }

  let closeLine = "";
  /*
  // We look at historical sharps anyway
  if (selection.closeHandicap) {
    closeLine = (
      (selection.entrant?.name == "Over" ? -1 : 1) * selection.closeHandicap
    ).toString();
  }
    */

  const { betType = "", sport = "", tipper = "" } = mapHelper(selection) || "";
  return [
    toDDMMYYYY(date), // Date
    "tab", // Bookmaker
    sport, // Sport / League
    selectionName,
    betType, // Bet Type
    tipper, // Tipper
    "", // My Variable
    eventName, // Fixture / Event
    "", // Live Bet
    "", // Score / Result
    stake, // Stake
    betOdds, // Odds
    "", // BB
    win, // Win (Y/P/N)
    "", // Cash out amount
    "", //% percentage of bet"
    "", // Commission
    "", // Lay bet?
    "", //Closing Odds
    wagerLine, // Wager Line
    closeLine, // Closing Line
  ];
}

type mapHelperReturn = {
  betType?: string;
  sport?: string;
  tipper?: string;
};
const helperConstants = {
  nflProps: ["Receiving Yards", "Passing Yards", "Rushing Yards"],
};
const mapHelper = (selection: SelectionJoin): mapHelperReturn => {
  if (!selection.market?.name) return {};
  const s = selection.market.name;
  if (s.includes("Yards O/U -")) {
    for (const mk of helperConstants.nflProps) {
      if (s.includes(mk)) {
        return {
          betType: mk,
          sport: "NFL",
          tipper: "Props",
        };
      }
    }
  }
  if (s.includes("Anytime Touchdown Scorer")) {
    return {
      betType: "ATS",
      sport: "NFL",
      tipper: "ATS",
    };
  }
  return {};
};
export default CsvViewer;
