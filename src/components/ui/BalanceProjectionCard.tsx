interface BalanceProjectionCardProps {
  currentValue: number;
  projectedValue: number;
  netChange: number;
}

export function BalanceProjectionCard({ currentValue, projectedValue, netChange }: BalanceProjectionCardProps) {
  return (
    <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-white text-lg font-semibold mb-1">
          Balance Projection
        </h3>
        <p className="text-gray-400 text-sm">
          Current balance vs. projected balance at month end
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        <div>
          <p className="text-gray-400 text-sm mb-2">Current Balance</p>
          <p className="text-white text-2xl font-semibold">
            ${currentValue.toFixed(2)}
          </p>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded" />
        <div>
          <p className="text-gray-400 text-sm mb-2">Projected Balance</p>
          <p className="text-green-500 text-2xl font-semibold">
            ${projectedValue.toFixed(2)}
          </p>
        </div>
        <div className="mt-2 p-3 bg-[#1f1f1f] rounded-md border border-gray-700">
          <p className="text-gray-400 text-sm">
            Difference:{" "}
            <span
              className={`font-semibold ${netChange >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {netChange >= 0 ? "+" : ""}${netChange.toFixed(2)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
