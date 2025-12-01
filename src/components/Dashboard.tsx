import { useMemo } from "react";
import { Wallet, TrendingUp, Calendar, DollarSign } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useFinance } from "../context/FinanceContext";
import { SumCard } from "./ui/SumCard";
import { ProjectedChangeCard } from "./ui/ProjectedChangeCard";
import { BalanceProjectionCard } from "./ui/BalanceProjectionCard";

export default function Dashboard() {
  const { financialData, transactions } = useFinance();
  const { currentBalance } = financialData;

  // Calculate total value of manual transactions
  const transactionsTotal = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      return acc + (curr.type === "income" ? curr.amount : -curr.amount);
    }, 0);
  }, [transactions]);
  const incomeTotal = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      return acc + (curr.type === "income" ? curr.amount : 0);
    }, 0);
  }, [transactions]);
  const billsTotal = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      return acc + (curr.type === "expense" ? curr.amount : 0);
    }, 0);
  }, [transactions]);

  // Calculate projected balance at end of current month / start of next month
  const projectedBalance = useMemo(() => {
    return currentBalance + transactionsTotal;
  }, [currentBalance, transactionsTotal]);

  const netChange = useMemo(() => {
    return transactionsTotal;
  }, [transactionsTotal]);

  const graphData = useMemo(() => {
    let runningBalance = currentBalance;
    const data = [{ name: "Start", balance: runningBalance }];

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    sortedTransactions.forEach((t, index) => {
      runningBalance += t.type === "income" ? t.amount : -t.amount;
      data.push({
        name: t.description || `Tx ${index + 1}`,
        balance: runningBalance,
      });
    });

    return data;
  }, [currentBalance, transactions]);

  const gradientStops = useMemo(() => {
    if (graphData.length < 2) return null;

    const stops = [];
    const len = graphData.length;

    for (let i = 0; i < len - 1; i++) {
      const current = graphData[i];
      const next = graphData[i + 1];
      const isPositive = next.balance >= current.balance;
      const color = isPositive ? "#22c55e" : "#ef4444"; // green-500 : red-500

      // Place the color stop at the midpoint of the segment to allow smooth blending
      const offset = (i + 0.5) / (len - 1);

      stops.push(
        <stop
          key={`stop-${i}`}
          offset={offset}
          stopColor={color}
          stopOpacity={0.3}
        />,
      );
    }
    return stops;
  }, [graphData]);

  return (
    <div className="flex flex-col gap-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SumCard
          title="Current Balance"
          value={currentBalance}
          icon={Wallet}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-500"
        />

        <SumCard
          title="Projected Balance"
          value={projectedBalance}
          icon={TrendingUp}
          iconBgColor="bg-green-500/10"
          iconColor="text-green-500"
        />

        <SumCard
          title="Income"
          value={incomeTotal}
          icon={DollarSign}
          iconBgColor="bg-green-500/10"
          iconColor="text-green-500"
        />

        <SumCard
          title="Bills"
          value={billsTotal}
          icon={Calendar}
          iconBgColor="bg-orange-500/10"
          iconColor="text-orange-500"
        />
      </div>

      {/* Projected Change Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectedChangeCard
          value={netChange}
          positiveLabel="Projected Gain"
          negativeLabel="Projected Loss"
        />

<<<<<<< HEAD
        <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold mb-1">
              Balance Projection
            </h3>
            <p className="text-gray-400 text-sm">
              Current balance vs. projected balance at month end
            </p>
          </div>

          <div className="h-[200px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient
                    id="slopeGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    {gradientStops}
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#888" hide />
                <YAxis stroke="#888" domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f1f1f",
                    border: "1px solid #374151",
                  }}
                  itemStyle={{ color: "#fff" }}
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
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">Current Balance</p>
              <p className="text-white text-2xl font-semibold">
                ${currentBalance.toFixed(2)}
              </p>
            </div>
            <div className="h-0.5 bg-linear-to-r from-blue-500 to-green-500 rounded" />
            <div>
              <p className="text-gray-400 text-sm mb-2">Projected Balance</p>
              <p className="text-green-500 text-2xl font-semibold">
                ${projectedBalance.toFixed(2)}
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
=======
        <BalanceProjectionCard
          currentValue={currentBalance}
          projectedValue={projectedBalance}
          netChange={netChange}
        />
>>>>>>> 7ecd6714da791d2f3cfb69e515e2caf2a0e6eaa1
      </div>
    </div>
  );
}
