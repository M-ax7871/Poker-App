import type { GameState, PlayerState } from "./types";

const BIG_BLIND = 40;
const SMALL_BLIND = 20;

export function createInitialGameState(
  stackSizes: number[],
  numPlayers: number = 6
): GameState {
  const players: PlayerState[] = Array.from({ length: numPlayers }, (_, i) => ({
    id: i,
    name: `Player ${i + 1}`,
    stack: stackSizes[i] || 1000,
    cards: [],
    status: "active" as const,
  }));

  return {
    players,
    dealerIndex: 0,
    smallBlindIndex: 1,
    bigBlindIndex: 2,
    currentPlayerIndex: 3,
    currentBet: BIG_BLIND,
    pot: SMALL_BLIND + BIG_BLIND,
    round: "preflop",
    board: [],
    actionsShort: [],
    lastAggressorIndex: null,
    bigBlindSize: BIG_BLIND,
  };
}

export function dealCards(state: GameState): GameState {
  const ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
  const suits = ["s", "h", "d", "c"];
  
  const deck: string[] = [];
  for (const rank of ranks) {
    for (const suit of suits) {
      deck.push(rank + suit);
    }
  }
  
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  const players = state.players.map((p, idx) => ({
    ...p,
    cards: [deck[idx * 2], deck[idx * 2 + 1]],
    status: "active" as const,
  }));

  // Deduct blinds
  players[state.smallBlindIndex].stack -= SMALL_BLIND;
  players[state.bigBlindIndex].stack -= BIG_BLIND;

  return { ...state, players };
}

export function isValidAction(
  state: GameState,
  playerIndex: number,
  action: string,
  amount?: number
): boolean {
  const player = state.players[playerIndex];
  
  if (!player || player.status !== "active") return false;
  if (playerIndex !== state.currentPlayerIndex) return false;

  switch (action) {
    case "f":
      return true;
    case "x":
      return state.currentBet === 0;
    case "c":
      return state.currentBet > 0 && player.stack > 0;
    case "b":
    case "r":
      if (!amount) return false;
      return amount >= BIG_BLIND && amount <= player.stack;
    case "allin":
      return player.stack > 0;
    default:
      return false;
  }
}

export function performAction(
  state: GameState,
  playerIndex: number,
  action: string,
  amount?: number
): { state: GameState; log: string; completed: boolean } {
  if (!isValidAction(state, playerIndex, action, amount)) {
    return { state, log: "", completed: false };
  }

  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const player = newState.players[playerIndex];
  let log = "";
  let shortAction = "";

  switch (action) {
    case "f":
      player.status = "folded";
      log = `${player.name} folds`;
      shortAction = "f";
      break;

    case "x":
      log = `${player.name} checks`;
      shortAction = "x";
      break;

    case "c": {
      const toCall = Math.min(newState.currentBet, player.stack);
      player.stack -= toCall;
      newState.pot += toCall;
      if (player.stack === 0) player.status = "allin";
      log = `${player.name} calls ${toCall}`;
      shortAction = "c";
      break;
    }

    case "b": {
      const betAmount = Math.min(amount!, player.stack);
      player.stack -= betAmount;
      newState.currentBet = betAmount;
      newState.pot += betAmount;
      newState.lastAggressorIndex = playerIndex;
      if (player.stack === 0) player.status = "allin";
      log = `${player.name} bets ${betAmount}`;
      shortAction = `b${betAmount}`;
      break;
    }

    case "r": {
      const raiseAmount = Math.min(amount!, player.stack);
      player.stack -= raiseAmount;
      newState.currentBet += raiseAmount;
      newState.pot += raiseAmount;
      newState.lastAggressorIndex = playerIndex;
      if (player.stack === 0) player.status = "allin";
      log = `${player.name} raises to ${newState.currentBet}`;
      shortAction = `r${newState.currentBet}`;
      break;
    }

    case "allin": {
      const allInAmount = player.stack;
      newState.pot += allInAmount;
      if (allInAmount > newState.currentBet) {
        newState.currentBet = allInAmount;
        newState.lastAggressorIndex = playerIndex;
      }
      player.stack = 0;
      player.status = "allin";
      log = `${player.name} goes all-in for ${allInAmount}`;
      shortAction = "allin";
      break;
    }
  }

  if (shortAction) {
    newState.actionsShort.push(shortAction);
  }

  // Find next active player
  let nextPlayer = playerIndex;
  for (let i = 1; i <= newState.players.length; i++) {
    const idx = (playerIndex + i) % newState.players.length;
    if (newState.players[idx].status === "active") {
      nextPlayer = idx;
      break;
    }
  }
  newState.currentPlayerIndex = nextPlayer;

  // Check if hand is complete
  const activePlayers = newState.players.filter(
    (p) => p.status === "active" || p.status === "allin"
  );
  const completed = activePlayers.length <= 1;

  return { state: newState, log, completed };
}