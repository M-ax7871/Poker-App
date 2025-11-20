export interface PlayerState {
  id: number;
  name: string;
  stack: number;
  cards: string[];
  status: "active" | "folded" | "allin";
}

export interface GameState {
  players: PlayerState[];
  dealerIndex: number;
  smallBlindIndex: number;
  bigBlindIndex: number;
  currentPlayerIndex: number;
  currentBet: number;
  pot: number;
  round: "preflop" | "flop" | "turn" | "river" | "showdown";
  board: string[];
  actionsShort: string[];
  lastAggressorIndex: number | null;
  bigBlindSize: number;
}

export interface HandPayload {
  stack_settings: number[];
  dealer_index: number;
  small_blind_index: number;
  big_blind_index: number;
  player_cards: { [key: string]: string[] };
  actions_short: string[];
}

export interface HandRecord {
  uuid: string;
  setup: string;
  cards: string;
  actions: string;
  results: string;
}