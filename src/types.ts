export type StatementResponse = {
  data: {
    accountTransactions: {
      nodes: AccountTransactions[];
    };
  };
};

export interface DateTimeSeconds {
  nanos: number;
  seconds: number;
  __typename: "DateTimeSeconds";
}

export interface AccountTransaction {
  acceptAmount: string; // e.g. "$100.00"
  accountBalance: string; // e.g. "$135.43"
  balanceEffect: string; // e.g. "-$100.00"
  created: DateTimeSeconds;
  currencyCode: string; // e.g. "NZD"
  deviceId: string; // UUID
  id: string; // UUID
  requestAmount: number; // e.g. 100
  transactionTypeId: string; // UUID
  __typename: "AccountTransaction";
}

export interface AccountBetTransactions {
  betOdds: string; // e.g. " @ 1.88"
  betStatus: string; // e.g. "Win"
  betType: string; // e.g. "single"
  entrantName: string | null; // e.g. "Under 251.5"
  entrantNumber: string | null;
  eventName: string | null; // e.g. "Las Vegas Raiders vs Los Angeles Chargers"
  eventNumber: string | null;
  marketName: string | null;
  productName: string | null; // e.g. "QB Passing Yards O/U - Geno Smith"
  productType: string; // e.g. "WIN"
  __typename: "AccountBetTransactions";
}

export interface AccountTransactions {
  groupBet: unknown | null;
  id: string; // e.g. "0879a"
  returns: unknown | null;
  stake: unknown | null;
  transaction: AccountTransaction;
  transfers: unknown | null;
  transferGroup: unknown | null;
  transferPayment: unknown | null;
  type: string; // e.g. "BET"
  __typename: "AccountTransactions";
  betTransactions: AccountBetTransactions;
}
export type FetchResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; error: string };

export type supportedService = "tab" | "betcha";

export type ClientInputData = {
  token: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
};
