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

export interface SportCategoryResponse {
  data: SportData;
}

export interface SportLeague {
  events: {
    nodes: SportingEvent[];
  };
  name: string;
  url: string;
  id: string;
}

export interface SportData {
  category: SportCategory;
  upcomingEvents: {
    leagues: {
      nodes: SportLeague[];
    };
  };
}

export interface SportCategory {
  id: string;
  name: string;
  category: string;
  icon: string;
  slug: string;
  url: string;
  hasRegions: boolean;
  eventCount: number;
}

export interface SportingEvent {
  id: string;
  name: string;
  url: string;
  advertisedStart: string; // ISO date string
  eventType: string;
  eventTypeId: string;
  bettingStatus: string;
  status: string;
  phase: string | null;
  hasLiveVision: boolean;
  inPlay: boolean;
  sportCategory: SportCategory;
  competition: Competition;
  teams: SportingTeam[];
  matchClock: string | null;
  marketCount: number;
  markets: {
    nodes: SportingMarket[];
  };
}

export interface Competition {
  id: string;
  name: string;
  url: string;
  hasInPlayEvents: boolean;
  region: string | null;
}

export interface SportingTeam {
  id: string;
  name: string;
  colour: string | null;
  locale: "HOME" | "AWAY";
  scores: number[];
  icon: {
    web: string | null;
  };
}

export interface SportingMarket {
  id: string;
  name: string;
  marketTypeId: string;
  handicap: number | null;
  isPrimary: boolean;
  isSuspended: boolean;
  status: string;
  liveBettingAvailable: boolean;
  allowsCashOut: boolean;
  sameGameMultiAvailable: boolean;
  allowOddsBoostExtra: boolean;
  additionalProductTypeIds: string[];
  entrantCount: number;
  entrants: {
    nodes: SportingEntrant[];
  };
}

export interface SportingEntrant {
  id: string;
  name: string;
  handicap: number | null;
  isSuspended: boolean;
  role: "HOME" | "AWAY";
  icon: {
    web: string | null;
  };
  price: Price;
}

export interface Price {
  id: string;
  odds: Odds;
}

export interface Odds {
  numerator: number;
  denominator: number;
}

// EventCard
// Basic ID + time helpers
export type UUID = string;

export interface EpochSeconds {
  seconds: number;
  // some payloads include nanos; keep it optional for forward-compat
  nanos?: number;
}

// A single market record
export interface Market {
  id: UUID;
  event_id: UUID;
  market_type_id: UUID;
  market_status_id: UUID;
  name: string;

  advertised_start: EpochSeconds;
  actual_start: EpochSeconds;

  live_betting_available: boolean;
  same_game_multi_available: boolean;

  // present on some markets only
  handicap?: number | null;

  comments?: string | null;
  visible: boolean;

  entrant_ids: UUID[];
  num_winners: number;
}

// Top-level object keyed by market id
export type MarketsById = Record<UUID, Market>;

// A single entrant record
export interface Entrant {
  id: UUID;
  name: string;
  home_away?: "HOME" | "AWAY"; // not present on "Draw" etc.
  visible: boolean;
  sort_order: number;
  market_id: UUID;
}

// Top-level object keyed by entrant id
export type EntrantsById = Record<UUID, Entrant>;
// Key shape is usually "<entrant_id>:<market_instance_id>:"
export type PriceId = string;

export interface Odds {
  numerator: number;
  denominator: number;
}

export interface Price {
  odds: Odds;
}

// Top-level object keyed by composite price id
type PricesById = Record<PriceId, Price>;

export interface EventTeam {
  id: UUID;
  event_id: UUID;
  name: string;
  home_away: "HOME" | "AWAY";
}

// Top-level object keyed by team id
export type EventTeamsById = Record<UUID, EventTeam>;

export type EventCardResponse = {
  markets: MarketsById;
  entrants: EntrantsById;
  prices: PricesById;
  event_participants: EventTeamsById;
};
