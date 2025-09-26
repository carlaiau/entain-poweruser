// ---------- Core/shared ------------------------------------------------------

type UUID = string;
type UnixSeconds = { seconds: number };

interface EventType {
  id: UUID;
  name: string;
}

interface SportsEvent {
  id: UUID;
  name: string;
  advertised_start?: UnixSeconds;
  actual_start?: UnixSeconds;
  slug?: string;
  match_status?: string;
  event_type?: EventType;
  category_id?: UUID;
  competition_id?: UUID;
  feed_revision?: string;
  feed_metadata?: Record<string, unknown>;
  finalise_time?: UnixSeconds;
  [k: string]: unknown;
}

interface SportsMarket {
  id: UUID;
  event_id: UUID;
  market_type_id?: UUID;
  market_status_id?: UUID;
  name: string;
  is_suspended?: boolean;
  advertised_start?: UnixSeconds;
  actual_start?: UnixSeconds;
  handicap?: number; // market-wide handicap (e.g., totals)
  feed_source_id?: UUID;
  created?: UnixSeconds;
  updated?: UnixSeconds;
  tier_id?: UUID;
  same_game_multi_available?: boolean;
  num_winners?: number;
  is_multiple_outcome_market?: boolean;
  comments?: string;
  live_betting_available?: boolean;
  feed_metadata?: Record<string, unknown>;
  bir_delay_seconds?: number;
  [k: string]: unknown;
}

interface SportsEntrant {
  id: UUID;
  name: string;
  sort_order?: number;
  home_away?: "HOME" | "AWAY" | string;
  market_id: UUID;
  is_suspended?: boolean;
  feed_metadata?: Record<string, unknown>; // often has handicap_value for side/OU
  [k: string]: unknown;
}

interface SportsResult {
  id: UUID;
  market_id: UUID;
  entrant_id?: UUID;
  result_status_id: UUID;
  [k: string]: unknown;
}

interface ApiData {
  has_next_page: boolean;
  bets: Record<UUID, Bet>;
  sports_events: Record<UUID, SportsEvent>;
  sports_markets: Record<UUID, SportsMarket>;
  sports_entrants: Record<UUID, SportsEntrant>;
  sports_results: Record<UUID, SportsResult>;
}

interface FractionalOdds {
  numerator: number;
  denominator: number;
}
interface PlacedOdds extends FractionalOdds {
  decimal?: number;
}
interface Bet {
  id: UUID;
  transaction_id: UUID;
  bet_status_id: UUID;
  bet_collection_id: UUID;
  stake: number;
  won_amount?: {
    value?: number;
  };
}
interface BetLeg {
  id: UUID;
  bet_id: UUID;
  product_type_id: UUID;
  root_category_id: UUID;
  placed: PlacedOdds; // odds at time of bet
  paid?: FractionalOdds; // settlement odds (if different)
  market_advertised_date?: UnixSeconds;
  handicap?: number; // handicap at time of bet (leg-level)
  finalised?: { seconds: number; nanos?: number };
  bet_leg_status_id: UUID;
  market_id: UUID; // primary market referenced by the leg
  [k: string]: unknown;
}

interface BetLegSelection {
  id: UUID;
  bet_leg_id: UUID;
  position: number; // SGM positions, etc.
  event_id: UUID;
  market_id: UUID;
  entrant_id: UUID;
  [k: string]: unknown;
}

type BetLegMap = Record<UUID, BetLeg>;
type BetLegSelectionMap = Record<UUID, BetLegSelection>;

// ---------- Joined shapes ----------------------------------------------------

export type ResultJoinLoose = {
  result: SportsResult;
  market?: SportsMarket;
  event?: SportsEvent;
  entrant?: SportsEntrant;
};

export type SelectionJoin = {
  selection: BetLegSelection;
  event?: SportsEvent;
  market?: SportsMarket;
  entrant?: SportsEntrant;
  result?: SportsResult; // if present
  placedHandicap?: number; // from BetLeg.handicap (at placement)
  closeHandicap?: number; // derived (entrant.handicap_value || market.handicap)
  handicapDelta?: number; // close - placed
};

export type BetLegJoin = {
  leg: BetLeg;
  bet: Bet;
  selections: SelectionJoin[]; // one leg may have multiple selections (SGM)
};

// ---------- Utilities --------------------------------------------------------

/** Try to read a numeric 'handicap_value' from an entrant's feed_metadata. */
function getEntrantHandicapValue(entrant?: SportsEntrant): number | undefined {
  const hv =
    entrant?.feed_metadata &&
    (entrant.feed_metadata as Record<string, unknown>)["handicap_value"];
  if (hv == null) return undefined;
  if (typeof hv === "number") return hv;
  if (typeof hv === "string") {
    const n = Number(hv);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/** Compute a sensible "closing" handicap for a selection:
 * - Prefer entrant.feed_metadata.handicap_value (side/OU legs like Over/Under, spreads)
 * - Fallback to market.handicap (market-wide totals)
 */
function computeCloseHandicap(
  market?: SportsMarket,
  entrant?: SportsEntrant
): number | undefined {
  const byEntrant = getEntrantHandicapValue(entrant);
  if (byEntrant != null) return byEntrant;
  return market?.handicap;
}

// ---------- Index builders ---------------------------------------------------

/** Optional: build a result index by (market_id, entrant_id) for quick lookups. */
function buildResultByMarketEntrant(
  data: ApiData
): Record<string, SportsResult> {
  const idx: Record<string, SportsResult> = {};
  for (const r of Object.values(data.sports_results)) {
    const key = `${r.market_id}::${r.entrant_id ?? ""}`;
    idx[key] = r;
  }
  return idx;
}

/** Join sports_results to their market/event/entrant (loose join). */
export function buildResultIndexLoose(
  data: ApiData
): Record<UUID, ResultJoinLoose> {
  const out: Record<UUID, ResultJoinLoose> = {};
  for (const [resultId, result] of Object.entries(data.sports_results)) {
    const market = data.sports_markets[result.market_id];
    const event = market ? data.sports_events[market.event_id] : undefined;
    const entrant = result.entrant_id
      ? data.sports_entrants[result.entrant_id]
      : undefined;
    out[resultId] = { result, market, event, entrant };
  }
  return out;
}

/** Primary: join bet legs → selections → event/market/entrant/result, compute handicap deltas. */
export function joinBetLegs(
  data: ApiData,
  betLegs: BetLegMap,
  betLegSelections: BetLegSelectionMap
): Record<UUID, BetLegJoin> {
  const resultsIdx = buildResultByMarketEntrant(data);

  // Group selections by bet_leg_id
  const selByLeg: Record<UUID, BetLegSelection[]> = {};
  for (const sel of Object.values(betLegSelections)) {
    (selByLeg[sel.bet_leg_id] ??= []).push(sel);
  }

  // Build joined structure per leg
  const joined: Record<UUID, BetLegJoin> = {};

  for (const leg of Object.values(betLegs)) {
    const selections = (selByLeg[leg.id] ?? []).map<SelectionJoin>(
      (selection) => {
        const market = data.sports_markets[selection.market_id];
        const event = data.sports_events[selection.event_id];
        const entrant = data.sports_entrants[selection.entrant_id];
        const resultKey = `${selection.market_id}::${selection.entrant_id}`;
        const result = resultsIdx[resultKey];

        const placedHandicap = leg.handicap;
        const closeHandicap = computeCloseHandicap(market, entrant);

        return {
          selection,
          event,
          market,
          entrant,
          result,
          placedHandicap,
          closeHandicap,
        };
      }
    );

    const bet = data.bets[leg.bet_id];

    joined[leg.id] = { leg, bet, selections };
  }

  return joined;
}

// ---------- Example usage ----------------------------------------------------
/*
const payload: ApiEnvelope = ... // your big blob (events/markets/entrants/results)
const { data } = payload.json;

const legs: BetLegMap = {
  "01998e6a-a342-7d46-a1f0-857bc6955fe6": {
    id: "01998e6a-a342-7d46-a1f0-857bc6955fe6",
    bet_id: "01998e6a-a342-7d27-aa87-0896640e29f6",
    product_type_id: "940b8704-e497-4a76-b390-00918ff7d282",
    root_category_id: "4d54ccd1-17b0-40c3-a7e2-be08ced1e7d0",
    placed: { numerator: 22, denominator: 25, decimal: 1.88 },
    paid: { numerator: 22, denominator: 25 },
    market_advertised_date: { seconds: 1759078800 },
    handicap: 13.5,
    finalised: { seconds: 1759089183, nanos: 217346000 },
    bet_leg_status_id: "55d97fca-ad50-4361-aec5-67254b2e721c",
    market_id: "82f8089b-eb1f-418d-8ad4-69d8f6ba748f",
  },
};

const selections: BetLegSelectionMap = {
  "01998e6a-a346-7e02-8003-7d4fbe322ca1": {
    id: "01998e6a-a346-7e02-8003-7d4fbe322ca1",
    bet_leg_id: "01998e6a-a342-7d46-a1f0-857bc6955fe6",
    position: 1,
    event_id: "02a48ea3-1a8d-4672-9fb7-511cd8b3d108",
    market_id: "82f8089b-eb1f-418d-8ad4-69d8f6ba748f",
    entrant_id: "133bfa19-788f-4dd0-bd4a-d4806d542fa5",
  },
};

const joined = joinBetLegs(data, legs, selections);

// e.g. read the delta for this leg's first selection:
const legJoin = joined["01998e6a-a342-7d46-a1f0-857bc6955fe6"];
const first = legJoin.selections[0];
console.log({
  market: first.market?.name,
  entrant: first.entrant?.name,
  placed: first.placedHandicap,   // 13.5 (from bet leg)
  close: first.closeHandicap,     // reads entrant.feed_metadata.handicap_value or market.handicap
  delta: first.handicapDelta,     // close - placed
});
*/
