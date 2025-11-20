"use client";

import { Button } from "@/components/ui/button";

interface ActionsProps {
  onAction: (action: string, amount?: number) => void;
  betAmount: number;
  onIncreaseBet: () => void;
  onDecreaseBet: () => void;
  canCheck: boolean;
  canCall: boolean;
  canBetRaise: boolean;
  currentBet: number;
}

export default function Actions({
  onAction,
  betAmount,
  onIncreaseBet,
  onDecreaseBet,
  canCheck,
  canCall,
  canBetRaise,
  currentBet,
}: ActionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        onClick={() => onAction("f")}
        className="bg-blue-400 hover:bg-blue-500 text-black px-6"
      >
        Fold
      </Button>

      <Button
        onClick={() => onAction("x")}
        disabled={!canCheck}
        className="bg-green-300 hover:bg-green-400 text-black disabled:opacity-40 px-6"
      >
        Check
      </Button>

      <Button
        onClick={() => onAction("c")}
        disabled={!canCall}
        className="bg-green-300 hover:bg-green-400 text-black disabled:opacity-40 px-6"
      >
        Call
      </Button>

      <Button
        onClick={onDecreaseBet}
        variant="outline"
        className="w-8 h-8 p-0"
      >
        -
      </Button>

      <Button
        onClick={() => onAction("b", betAmount)}
        disabled={!canBetRaise}
        className="bg-orange-400 hover:bg-orange-500 text-black disabled:opacity-40"
      >
        Bet {betAmount}
      </Button>

      <Button
        onClick={onIncreaseBet}
        variant="outline"
        className="w-8 h-8 p-0"
      >
        +
      </Button>

      <Button
        onClick={onDecreaseBet}
        variant="outline"
        className="w-8 h-8 p-0"
      >
        -
      </Button>

      <Button
        onClick={() => onAction("r", betAmount)}
        disabled={!canBetRaise}
        className="bg-orange-400 hover:bg-orange-500 text-black disabled:opacity-40"
      >
        Raise {betAmount}
      </Button>

      <Button
        onClick={onIncreaseBet}
        variant="outline"
        className="w-8 h-8 p-0"
      >
        +
      </Button>

      <Button
        onClick={() => onAction("allin")}
        className="bg-red-400 hover:bg-red-500 text-black px-6"
      >
        ALLIN
      </Button>
    </div>
  );
}