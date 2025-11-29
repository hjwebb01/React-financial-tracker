import { useMemo } from "react";
import { Wallet, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { SumCard } from "./ui/SumCard";

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
        <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold mb-1">
              Projected Change
            </h3>
            <p className="text-gray-400 text-sm">
              Expected net change after all transactions are completed
            </p>
          </div>
          <div className="mt-4">
            <div
              className={`bg-[#2a2a2a] border rounded-lg p-6 ${netChange >= 0 ? "bg-green-500/10 border-green-500" : "bg-red-500/10 border-red-500"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <p className="text-gray-400 text-sm">
                    {netChange >= 0 ? "Projected Gain" : "Projected Loss"}
                  </p>
                  <div className="flex flex-col gap-1">
                    <p
                      className={`text-3xl font-bold ${netChange >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {netChange >= 0 ? "+" : ""}${netChange.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}
