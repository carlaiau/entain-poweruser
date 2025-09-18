import { Subheading } from "@/catalyst/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/catalyst/table";
import {
  AccountTransactions,
  DateTimeSeconds,
  StatementResponse,
  supportedService,
} from "@/types";

const CsvViewer = ({
  data,
  service,
  start_date,
  end_date,
}: {
  data: StatementResponse;
  service: supportedService | "";
  start_date: string;
  end_date: string;
}) => {
  const transactions = data.data.accountTransactions?.nodes ?? [];

  const bets = transactions.filter(
    (t) =>
      t.type == "BET" &&
      t.betTransactions &&
      t.betTransactions.betStatus != "Cash Out" &&
      !t?.betTransactions?.entrantName?.includes("Multi")
  );

  bets.sort((a, b) => {
    const sa = a?.transaction?.created?.seconds ?? 0;
    const sb = b?.transaction?.created?.seconds ?? 0;
    return sa - sb; // ascending
  });

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
          download={`${start_date}-${end_date}_${service}-statement.csv`}
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

function formatNZT(created: DateTimeSeconds) {
  if (!created || typeof created.seconds !== "number") return "";
  const ms =
    created.seconds * 1000 +
    Math.round((created.nanos ? created.nanos : 0) / 1e6);
  const dt = new Date(ms);

  const tz = "Pacific/Auckland";
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return fmt.format(dt);
}

function csvEscape(v: string | number | null) {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
// status → Y/N/P
function toWinFlag(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "win" || s === "won") return "Y";
  if (s === "no return" || s === "lost") return "N";
  return "P"; // pending / open / placed / void / unknown
}

function toRow(obj: AccountTransactions) {
  const date = formatNZT(obj?.transaction?.created);
  const stake = obj?.transaction?.requestAmount ?? "";
  const eventName = obj?.betTransactions?.eventName ?? "";
  const selection = obj?.betTransactions?.entrantName ?? "";
  const betType = obj?.betTransactions?.productName ?? "";
  const betOdds = (obj?.betTransactions?.betOdds ?? "").replace(/[^0-9.]/g, "");
  const win = toWinFlag(obj?.betTransactions?.betStatus);

  return [
    date, // Date
    "", // Bookmaker
    "", // Sport / League
    selection + ", " + betType, // Selection
    "", // Bet Type
    "", // Tipper
    "", // My Variable
    eventName, // Fixture / Event
    "", // Live Bet
    "", // Score / Result
    stake, // Stake
    betOdds, // Odds
    "", // BB
    win, // Win (Y/P/N)
  ];
}

export default CsvViewer;
