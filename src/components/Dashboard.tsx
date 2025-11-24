import { useMemo, useState } from "react";
import { Wallet, TrendingUp, Calendar, DollarSign } from "lucide-react";

import financialDataRaw from "../assets/financial_data.csv?raw";

export function Dashboard() {
  // Parse CSV data
  const data = useMemo(() => {
    const lines = financialDataRaw.trim().split('\n');
    const values = lines[1].split(',');
    return {
      currentBalance: parseFloat(values[0]),
      monthlyBills: parseFloat(values[1]),
      monthlyIncome: parseFloat(values[2])
    };
  }, []);

  const [currentBalance] = useState(data.currentBalance);
  const [monthlyBills] = useState(data.monthlyBills); 
  const [monthlyIncome] = useState(data.monthlyIncome);

  const currentDate = useMemo(() => new Date(), []);
  const currentMonth = useMemo(() => {
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [currentDate]);

  const nextMonth = useMemo(() => {
    const next = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    return next.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [currentDate]);

  // Calculate projected balance at end of current month / start of next month
  const projectedBalance = useMemo(() => {
    return currentBalance + monthlyIncome - monthlyBills;
  }, [currentBalance, monthlyIncome, monthlyBills]);

  const netChange = useMemo(() => {
    return monthlyIncome - monthlyBills;
  }, [monthlyIncome, monthlyBills]);

  return (
    <div className="flex flex-col gap-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-gray-400 text-sm">Current Balance</p>
              <div className="flex flex-col gap-1">
                <p className="text-white text-xl font-semibold">
                  ${currentBalance.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-gray-400 text-sm">
                Projected Balance ({nextMonth})
              </p>
              <div className="flex flex-col gap-1">
                <p className="text-white text-xl font-semibold">
                  ${projectedBalance.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-gray-400 text-sm">Monthly Income</p>
              <div className="flex flex-col gap-1">
                <p className="text-white text-xl font-semibold">
                  ${monthlyIncome.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-gray-400 text-sm">Monthly Bills</p>
              <div className="flex flex-col gap-1">
                <p className="text-white text-xl font-semibold">
                  ${monthlyBills.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/10">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Projected Change Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold mb-1">
              Projected Change for {currentMonth}
            </h3>
            <p className="text-gray-400 text-sm">
              Expected net change by the end of the month
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
              <p className="text-gray-400 text-sm mb-2">
                Projected Balance ({nextMonth})
              </p>
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
