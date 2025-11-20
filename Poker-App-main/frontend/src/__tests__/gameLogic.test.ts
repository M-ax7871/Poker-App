import {
  createInitialGameState,
  dealCards,
  performAction,
  isValidAction,
} from "../lib/gameLogic";

describe("Game Logic", () => {
  test("createInitialGameState creates correct initial state", () => {
    const stacks = [1000, 1000, 1000, 1000, 1000, 1000];
    const state = createInitialGameState(stacks, 6);

    expect(state.players).toHaveLength(6);
    expect(state.bigBlindSize).toBe(40);
    expect(state.currentBet).toBe(40);
    expect(state.pot).toBe(60); // 20 SB + 40 BB
  });

  test("dealCards assigns cards to players", () => {
    const stacks = [1000, 1000, 1000, 1000, 1000, 1000];
    const state = createInitialGameState(stacks, 6);
    const dealtState = dealCards(state);

    dealtState.players.forEach((player) => {
      expect(player.cards).toHaveLength(2);
    });
  });

  test("isValidAction validates fold correctly", () => {
    const stacks = [1000, 1000, 1000, 1000, 1000, 1000];
    const state = createInitialGameState(stacks, 6);

    expect(isValidAction(state, state.currentPlayerIndex, "f")).toBe(true);
  });

  test("performAction handles fold correctly", () => {
    const stacks = [1000, 1000, 1000, 1000, 1000, 1000];
    const state = dealCards(createInitialGameState(stacks, 6));

    const result = performAction(state, state.currentPlayerIndex, "f");

    expect(result.log).toContain("folds");
    expect(result.state.players[state.currentPlayerIndex].status).toBe("folded");
    expect(result.state.actionsShort).toContain("f");
  });

  test("performAction handles bet correctly", () => {
    const stacks = [1000, 1000, 1000, 1000, 1000, 1000];
    const state = dealCards(createInitialGameState(stacks, 6));
    state.currentBet = 0;

    const result = performAction(state, state.currentPlayerIndex, "b", 80);

    expect(result.log).toContain("bets");
    expect(result.state.currentBet).toBe(80);
    expect(result.state.actionsShort).toContain("b80");
  });

  test("performAction handles call correctly", () => {
    const stacks = [1000, 1000, 1000, 1000, 1000, 1000];
    const state = dealCards(createInitialGameState(stacks, 6));

    const result = performAction(state, state.currentPlayerIndex, "c");

    expect(result.log).toContain("calls");
    expect(result.state.actionsShort).toContain("c");
  });

  test("performAction handles allin correctly", () => {
    const stacks = [1000, 1000, 1000, 1000, 1000, 1000];
    const state = dealCards(createInitialGameState(stacks, 6));

    const result = performAction(state, state.currentPlayerIndex, "allin");

    expect(result.log).toContain("all-in");
    expect(result.state.players[state.currentPlayerIndex].status).toBe("allin");
    expect(result.state.actionsShort).toContain("allin");
  });
});