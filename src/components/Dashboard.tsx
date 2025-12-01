import { useMemo } from "react";
import { Wallet, TrendingUp, Calendar, DollarSign } from "lucide-react";
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

  // gradientStops removed from Dashboard — coloring and gradient rendering will be handled inside BalanceProjectionCard.

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

        <BalanceProjectionCard
          currentValue={currentBalance}
          projectedValue={projectedBalance}
          netChange={netChange}
          graphData={graphData}
        />
      </div>
    </div>
  );
}
