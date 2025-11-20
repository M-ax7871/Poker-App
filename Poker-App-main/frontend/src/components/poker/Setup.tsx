"use client";

import { Button } from "@/components/ui/button";

interface SetupProps {
  onStart: () => void;
  onReset: () => void;
  onApply: (stack: number) => void;
  started: boolean;
}

export default function Setup({ onStart, onReset, onApply, started }: SetupProps) {
  const handleApply = () => {
    const input = document.querySelector<HTMLInputElement>("#stack-input");
    const value = input ? Number(input.value) : 10000;
    onApply(value);
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="font-medium">Stacks</span>
      <input
        id="stack-input"
        type="number"
        defaultValue={10000}
        className="border border-gray-300 rounded px-3 py-1.5 w-28 text-center"
        min={100}
        step={100}
      />
      <Button onClick={handleApply} variant="outline">
        Apply
      </Button>
      <Button
        onClick={started ? onReset : onStart}
        className="bg-red-500 hover:bg-red-600 text-white"
      >
        {started ? "Reset" : "Start"}
      </Button>
    </div>
  );
}