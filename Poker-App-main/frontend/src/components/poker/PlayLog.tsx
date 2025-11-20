"use client";

interface PlayLogProps {
  logs: string[];
}

export default function PlayLog({ logs }: PlayLogProps) {
  return (
    <div className="mb-4">
      <div className="bg-gray-50 p-3 rounded border min-h-[400px] max-h-[500px] overflow-y-auto">
        <div className="text-sm font-mono space-y-0.5">
          {logs.length === 0 ? (
            <div className="text-gray-500">No game started. Click Start to begin.</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-gray-800">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}