import { useMemo } from "react";
import type { ReactNode } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CardSurface } from "./CardSurface";

interface GraphPoint {
  name: string;
  balance: number;
}

interface BalanceProjectionCardProps {
  currentValue: number;
  projectedValue: number;
  netChange: number;
  graphData?: GraphPoint[];
}

export function BalanceProjectionCard({
  currentValue,
  projectedValue,
  netChange,
  graphData = [],
}: BalanceProjectionCardProps) {
  const green = "#22c55e";
  const red = "#ef4444";

  const gradientStops = useMemo(() => {
    if (!graphData || graphData.length < 2) return null;

    const len = graphData.length;
    const stops: ReactNode[] = [];

    // Ensure there's a defined color at the start (use the first segment's direction)
    const firstIsPositive = graphData[1].balance >= graphData[0].balance;
    stops.push(
      <stop
        key="start"
        offset="0%"
        stopColor={firstIsPositive ? green : red}
        stopOpacity={0.4}
      />,
    );

    // Place color stops at midpoints of each segment to allow smooth blending between segments
    for (let i = 0; i < len - 1; i++) {
      const current = graphData[i];
      const next = graphData[i + 1];
      const color = next.balance >= current.balance ? green : red;
      const offsetPercent = ((i + 0.5) / (len - 1)) * 100;
      stops.push(
        <stop
          key={`mid-${i}`}
          offset={`${offsetPercent}%`}
          stopColor={color}
          stopOpacity={0.4}
        />,
      );
    }

    // Ensure defined color at the end (use the last segment's direction)
    const lastIsPositive =
      graphData[len - 1].balance >= graphData[len - 2].balance;
    stops.push(
      <stop
        key="end"
        offset="100%"
        stopColor={lastIsPositive ? green : red}
        stopOpacity={0.4}
      />,
    );

    return stops;
  }, [graphData]);

  return (
    <CardSurface>
      <div className="mb-4">
        <h3 className="text-white text-lg font-semibold mb-1">
          Balance Projection
        </h3>
        <p className="text-gray-400 text-sm">
          Current balance vs. projected balance at month end
        </p>
      </div>

      {graphData && graphData.length > 0 && (
        <div className="h-[200px] w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData}>
              <defs>
                <linearGradient id="slopeGradient" x1="0" y1="0" x2="1" y2="0">
                  {gradientStops}
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" opacity={0.5} />
              <XAxis dataKey="name" stroke="#888" hide />
              <YAxis stroke="#888" domain={["auto", "auto"]} tick={{ fill: "#888", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f1f1f",
                  border: "1px solid #4a4a4a",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
                itemStyle={{ color: "#fff", fontSize: "14px" }}
                labelStyle={{ color: "#888", fontSize: "12px" }}
                formatter={(value: number) => [
                  `$${value.toFixed(2)}`,
                  "Balance",
                ]}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#888"
                fill="url(#slopeGradient)"
                strokeWidth={2.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <p className="text-gray-400 text-sm mb-2 font-medium">Current Balance</p>
          <p className="text-white text-2xl font-semibold">
            ${currentValue.toFixed(2)}
          </p>
        </div>

        <div className="h-0.5 bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500 rounded-full opacity-60" />

        <div>
          <p className="text-gray-400 text-sm mb-2 font-medium">Projected Balance</p>
          <p className="text-green-400 text-2xl font-semibold">
            ${projectedValue.toFixed(2)}
          </p>
        </div>

        <div className="mt-2 p-3 bg-gradient-to-br from-[#1f1f1f] to-[#252525] rounded-md border border-gray-700/50">
          <p className="text-gray-400 text-sm">
            Difference:{" "}
            <span
              className={`font-semibold ${
                netChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {netChange >= 0 ? "+" : ""}${netChange.toFixed(2)}
            </span>
          </p>
        </div>
      </div>
    </CardSurface>
  );
}
