"use client";

import type { HandRecord } from "@/lib/types";

interface HandHistoryProps {
  hands: HandRecord[];
}

export default function HandHistory({ hands }: HandHistoryProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Hand history</h2>
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {hands.length === 0 ? (
          <p className="text-sm text-gray-500">No hands played yet</p>
        ) : (
          hands.map((hand, idx) => (
            <div key={idx} className="p-3 rounded bg-blue-100 border border-blue-200">
              <div className="text-xs font-mono space-y-1 text-gray-800">
                <div className="font-semibold break-all">{hand.uuid}</div>
                <div>{hand.setup}</div>
                <div className="break-words">{hand.cards}</div>
                <div className="break-words">{hand.actions}</div>
                <div className="break-words">{hand.results}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}