"use client";

import { useState, useEffect } from "react";
import Setup from "@/components/poker/Setup";
import Actions from "@/components/poker/Actions";
import PlayLog from "@/components/poker/PlayLog";
import HandHistory from "@/components/poker/HandHistory";
import {
  createInitialGameState,
  dealCards,
  performAction,
  isValidAction,
} from "@/lib/gameLogic";
import { fetchHands, saveHand } from "@/lib/api";
import type { GameState, HandPayload, HandRecord } from "@/lib/types";

const BIG_BLIND = 40;
const NUM_PLAYERS = 6;

export default function PokerPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [started, setStarted] = useState(false);
  const [playLog, setPlayLog] = useState<string[]>([]);
  const [betAmount, setBetAmount] = useState(BIG_BLIND);
  const [handHistory, setHandHistory] = useState<HandRecord[]>([]);

  useEffect(() => {
    fetchHands().then(setHandHistory);
  }, []);

  const handleApply = (stackSize: number) => {
    const stacks = Array(NUM_PLAYERS).fill(stackSize);
    const state = createInitialGameState(stacks, NUM_PLAYERS);
    setGameState(state);
    setStarted(false);
    setPlayLog([]);
    setBetAmount(BIG_BLIND);
  };

  const handleStart = () => {
    const stacks = gameState?.players.map(p => p.stack) || Array(NUM_PLAYERS).fill(10000);
    const state = createInitialGameState(stacks, NUM_PLAYERS);
    const dealtState = dealCards(state);
    setGameState(dealtState);
    
    const logs = [
      ...dealtState.players.map(
        (p) => `${p.name} is dealt ${p.cards.join("")}`
      ),
      "---",
      `${dealtState.players[dealtState.dealerIndex].name} is the dealer`,
      `${dealtState.players[dealtState.smallBlindIndex].name} posts small blind - 20 chips`,
      `${dealtState.players[dealtState.bigBlindIndex].name} posts big blind - 40 chips`,
      "",
    ];
    setPlayLog(logs);
    setStarted(true);
  };

  const handleReset = () => {
    const stacks = Array(NUM_PLAYERS).fill(10000);
    const state = createInitialGameState(stacks, NUM_PLAYERS);
    setGameState(state);
    setStarted(false);
    setPlayLog([]);
    setBetAmount(BIG_BLIND);
  };

  const handleAction = async (action: string, amount?: number) => {
    if (!gameState || !started) return;

    const result = performAction(gameState, gameState.currentPlayerIndex, action, amount);
    
    if (!result.log) return;

    setGameState(result.state);
    setPlayLog((prev) => [...prev, result.log]);

    if (result.completed) {
      setStarted(false);
      
      const handUuid = crypto.randomUUID();
      const completedLogs = [
        ...playLog,
        result.log,
        `Hand #${handUuid} ended`,
        `Final pot was ${result.state.pot}`,
      ];
      setPlayLog(completedLogs);
      
      // Prepare payload for backend
      const initialStacks = gameState.players.map((p) => p.stack);
      
      const payload: HandPayload = {
        stack_settings: initialStacks,
        dealer_index: gameState.dealerIndex,
        small_blind_index: gameState.smallBlindIndex,
        big_blind_index: gameState.bigBlindIndex,
        player_cards: Object.fromEntries(
          gameState.players.map((p, i) => [`Player ${i + 1}`, p.cards])
        ),
        actions_short: result.state.actionsShort,
      };

      try {
        await saveHand(payload);
        const updatedHands = await fetchHands();
        setHandHistory(updatedHands);
      } catch (error) {
        console.error("Failed to save hand:", error);
      }
    }
  };

  const increaseBet = () => setBetAmount((prev) => prev + BIG_BLIND);
  const decreaseBet = () => setBetAmount((prev) => Math.max(BIG_BLIND, prev - BIG_BLIND));

  const canCheck = gameState ? gameState.currentBet === 0 : false;
  const canCall = gameState ? gameState.currentBet > 0 : false;
  const canBetRaise = gameState
    ? isValidAction(gameState, gameState.currentPlayerIndex, "b", betAmount)
    : false;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Playing Field Log */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Playing field log</h2>
            
            <Setup
              onStart={handleStart}
              onReset={handleReset}
              onApply={handleApply}
              started={started}
            />
            
            <PlayLog logs={playLog} />
            
            {started && gameState && (
              <div className="mt-4">
                <Actions
                  onAction={handleAction}
                  betAmount={betAmount}
                  onIncreaseBet={increaseBet}
                  onDecreaseBet={decreaseBet}
                  canCheck={canCheck}
                  canCall={canCall}
                  canBetRaise={canBetRaise}
                  currentBet={gameState.currentBet}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Hand History */}
        <div className="bg-white p-4 rounded shadow">
          <HandHistory hands={handHistory} />
        </div>
      </div>
    </div>
  );
}