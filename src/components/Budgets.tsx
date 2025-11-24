import { useCallback, useMemo, useState } from "react";
import {
  Plus,
  DollarSign,
  Trash2,
  CreditCard,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  category: string;
  isPaid: boolean;
  baseDueDay?: number;
  monthlyAnchors: Record<string, number>;
}

interface Paycheck {
  id: string;
  source: string;
  amount: number;
  frequency: "weekly" | "biweekly" | "monthly";
  monthlyAnchors: Record<string, number>;
}

type NewPaycheckForm = {
  source: string;
  amount: string;
  frequency: Paycheck["frequency"];
  firstDay: string;
};

interface TimelineItem {
  type: "bill" | "paycheck";
  date: number;
  name: string;
  amount: number;
  isPaid?: boolean;
}

const getOrdinal = (day: number) => {
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const remainder = day % 100;
  if (remainder >= 11 && remainder <= 13) return `${day}th`;
  return `${day}${suffixes[day % 10] ?? "th"}`;
};

export function Budgets() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [paychecks, setPaychecks] = useState<Paycheck[]>([]);
  const [showBillForm, setShowBillForm] = useState(false);
  const [showPaycheckForm, setShowPaycheckForm] = useState(false);
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    dueDate: "",
    category: "",
  });
  const [newPaycheck, setNewPaycheck] = useState<NewPaycheckForm>({
    source: "",
    amount: "",
    frequency: "monthly",
    firstDay: "",
  });
  const [monthlyDayInputs, setMonthlyDayInputs] = useState<
    Record<string, string>
  >({});
  const [viewDate, setViewDate] = useState(new Date());
  const monthKey = useMemo(() => {
    return `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`;
  }, [viewDate]);

  const monthLabel = useMemo(() => {
    return viewDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [viewDate]);

  const daysInMonth = useMemo(() => {
    return new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + 1,
      0
    ).getDate();
  }, [viewDate]);

  const goPrevMonth = useCallback(() => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  }, []);

  const goNextMonth = useCallback(() => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  }, []);

  const getInterval = (frequency: Paycheck["frequency"]) => {
    switch (frequency) {
      case "weekly":
        return 7;
      case "biweekly":
        return 14;
      default:
        return 31;
    }
  };

  const generateOccurrences = (
    anchor: number,
    interval: number,
    monthLength: number
  ) => {
    const dates: number[] = [];
    for (let day = anchor; day <= monthLength; day += interval) {
      dates.push(day);
    }
    return dates;
  };

  const formatDayLabel = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    return `${dayName}, ${getOrdinal(day)}`;
  };

  const handleAddBill = () => {
    const firstDay = parseInt(newBill.dueDate);
    if (newBill.name && newBill.amount && firstDay && firstDay <= daysInMonth) {
      setBills((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newBill.name,
          amount: parseFloat(newBill.amount),
          dueDate: firstDay,
          category: newBill.category,
          isPaid: false,
          monthlyAnchors: {
            [monthKey]: firstDay,
          },
        },
      ]);
      setNewBill({ name: "", amount: "", dueDate: "", category: "Utilities" });
      setShowBillForm(false);
    }
  };

  const handleAddPaycheck = () => {
    const firstDay = parseInt(newPaycheck.firstDay);
    if (
      newPaycheck.source &&
      newPaycheck.amount &&
      firstDay &&
      firstDay <= daysInMonth
    ) {
      setPaychecks((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          source: newPaycheck.source,
          amount: parseFloat(newPaycheck.amount),
          frequency: newPaycheck.frequency,
          monthlyAnchors: {
            [monthKey]: firstDay,
          },
        },
      ]);
      setNewPaycheck({
        source: "",
        amount: "",
        frequency: "monthly",
        firstDay: "",
      });
      setMonthlyDayInputs((prev) => ({ ...prev, [monthKey]: "" }));
      setShowPaycheckForm(false);
    }
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((bill) => bill.id !== id));
  };

  const deletePaycheck = (id: string) => {
    setPaychecks((prev) => prev.filter((paycheck) => paycheck.id !== id));
  };

  const toggleBillPaid = (id: string) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === id ? { ...bill, isPaid: !bill.isPaid } : bill
      )
    );
  };

  const updatePaycheckFirstDayForView = (id: string, day: number) => {
    setPaychecks((prev) =>
      prev.map((paycheck) => {
        if (paycheck.id !== id) return paycheck;
        return {
          ...paycheck,
          monthlyAnchors: {
            ...paycheck.monthlyAnchors,
            [monthKey]: day,
          },
        };
      })
    );
  };

  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => a.dueDate - b.dueDate);
  }, [bills]);

  const paychecksWithOccurrences = useMemo(() => {
    const items: TimelineItem[] = [];
    paychecks.forEach((paycheck) => {
      const anchor = paycheck.monthlyAnchors[monthKey];
      if (!anchor) return;
      const interval = getInterval(paycheck.frequency);
      const occurrences = generateOccurrences(anchor, interval, daysInMonth);
      occurrences.forEach((day) => {
        items.push({
          type: "paycheck",
          date: day,
          name: paycheck.source,
          amount: paycheck.amount,
        });
      });
    });
    return items;
  }, [paychecks, monthKey, daysInMonth]);

  const timelineItems = useMemo(() => {
    const billItems = sortedBills.map((bill) => ({
      type: "bill" as const,
      date: bill.monthlyAnchors[monthKey] ?? bill.baseDueDay ?? bill.dueDate,
      name: bill.name,
      amount: bill.amount,
      isPaid: bill.isPaid,
    }));
    return [...billItems, ...paychecksWithOccurrences].sort(
      (a, b) => a.date - b.date
    );
  }, [paychecksWithOccurrences, sortedBills, monthKey]);

  const totalIncome = paychecksWithOccurrences.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalBills = sortedBills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={goPrevMonth}
          className="px-6 py-2 rounded-md bg-transparent text-gray-400 hover:text-gray-300 transition-colors"
          title="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="px-6 py-2 rounded-md bg-gray-700 text-white">
          {monthLabel}
        </div>
        <button
          onClick={goNextMonth}
          className="px-6 py-2 rounded-md bg-transparent text-gray-400 hover:text-gray-300 transition-colors"
          title="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-gray-400 text-sm">
                Projected income for {monthLabel}
              </p>
              <div className="flex flex-col gap-1">
                <p className="text-white text-xl font-semibold">
                  ${totalIncome.toFixed(2)}
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
              <p className="text-gray-400 text-sm">Projected spending</p>
              <div className="flex flex-col gap-1">
                <p className="text-white text-xl font-semibold">
                  ${totalBills.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/10">
              <CreditCard className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-gray-400 text-sm">Remaining</p>
              <div className="flex flex-col gap-1">
                <p className="text-white text-xl font-semibold">
                  ${(totalIncome - totalBills).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="mb-4">
              <h3 className="text-white text-lg font-semibold mb-1">
                Monthly Bills
              </h3>
              <p className="text-gray-400 text-sm">
                Track your recurring expenses
              </p>
            </div>
            <button
              onClick={() => setShowBillForm((prev) => !prev)}
              className="flex items-center gap-1 bg-blue-600 text-white border-none px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Bill
            </button>
          </div>

          {showBillForm && (
            <div className="bg-[#1f1f1f] border border-gray-700 rounded-lg p-4 mb-4 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Bill name"
                value={newBill.name}
                onChange={(e) =>
                  setNewBill((prev) => ({ ...prev, name: e.target.value }))
                }
                className="px-3 py-2 bg-[#111315] border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="number"
                placeholder="Amount"
                value={newBill.amount}
                onChange={(e) =>
                  setNewBill((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="px-3 py-2 bg-[#111315] border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="number"
                placeholder="Due date (1-31)"
                min="1"
                max="31"
                value={newBill.dueDate}
                onChange={(e) =>
                  setNewBill((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="px-3 py-2 bg-[#111315] border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="text"
                value={newBill.category}
                onChange={(e) =>
                  setNewBill((prev) => ({ ...prev, category: e.target.value }))
                }
                className="px-3 py-2 bg-[#111315] border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:border-blue-400"
                placeholder="Enter category"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddBill}
                  className="bg-blue-600 text-white border-none px-3 py-1.5 rounded-md text-sm cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowBillForm(false)}
                  className="bg-transparent text-gray-400 border border-gray-700 px-3 py-1.5 rounded-md text-sm cursor-pointer hover:text-white hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {sortedBills.map((bill) => (
              <div
                key={bill.id}
                className={`flex items-center justify-between p-3 bg-[#1f1f1f] border border-gray-700 rounded-lg transition-all ${
                  bill.isPaid ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bill.isPaid}
                    onChange={() => toggleBillPaid(bill.id)}
                    className="w-4.5 h-4.5 cursor-pointer accent-blue-600"
                  />
                  <div className="flex flex-col gap-0.5">
                    <p
                      className={`font-medium text-white ${bill.isPaid ? "line-through text-gray-400" : ""}`}
                    >
                      {bill.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-sm">
                        {bill.category}
                      </span>
                      <span className="text-gray-500 text-sm">
                        Due:{" "}
                        {formatDayLabel(
                          bill.monthlyAnchors[monthKey] ?? bill.dueDate
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-white">
                    ${bill.amount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => deleteBill(bill.id)}
                    className="bg-transparent border-none text-gray-500 cursor-pointer p-1 rounded flex items-center justify-center hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="mb-4">
              <h3 className="text-white text-lg font-semibold mb-1">
                Income Sources
              </h3>
              <p className="text-gray-400 text-sm">
                Manage your recurring paychecks
              </p>
            </div>
            <button
              onClick={() => setShowPaycheckForm((prev) => !prev)}
              className="flex items-center gap-1 bg-blue-600 text-white border-none px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Income
            </button>
          </div>

          {showPaycheckForm && (
            <div className="bg-[#1f1f1f] border border-gray-700 rounded-lg p-4 mb-4 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Income source"
                value={newPaycheck.source}
                onChange={(e) =>
                  setNewPaycheck((prev) => ({
                    ...prev,
                    source: e.target.value,
                  }))
                }
                className="px-3 py-2 bg-[#111315] border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="number"
                placeholder="Amount"
                value={newPaycheck.amount}
                onChange={(e) =>
                  setNewPaycheck((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                className="px-3 py-2 bg-[#111315] border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:border-blue-400"
              />
              <select
                value={newPaycheck.frequency}
                onChange={(e) =>
                  setNewPaycheck((prev) => ({
                    ...prev,
                    frequency: e.target.value as Paycheck["frequency"],
                  }))
                }
                className="px-3 py-2 bg-[#111315] border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <input
                type="number"
                placeholder="First payday of month"
                min="1"
                max={daysInMonth}
                value={newPaycheck.firstDay}
                onChange={(e) =>
                  setNewPaycheck((prev) => ({
                    ...prev,
                    firstDay: e.target.value,
                  }))
                }
                className="px-3 py-2 bg-[#111315] border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:border-blue-400"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddPaycheck}
                  className="bg-blue-600 text-white border-none px-3 py-1.5 rounded-md text-sm cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowPaycheckForm(false)}
                  className="bg-transparent text-gray-400 border border-gray-700 px-3 py-1.5 rounded-md text-sm cursor-pointer hover:text-white hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {paychecks.map((paycheck) => {
              const firstDay = paycheck.monthlyAnchors[monthKey];
              const inputValue =
                monthlyDayInputs[paycheck.id] ??
                (firstDay ? firstDay.toString() : "");

              return (
                <div
                  key={paycheck.id}
                  className="flex items-center justify-between p-3 bg-[#1f1f1f] border border-gray-700 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-md">
                      <DollarSign className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-medium text-white">
                        {paycheck.source}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-sm">
                          {paycheck.frequency}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {firstDay
                            ? `First payday: ${formatDayLabel(firstDay)}`
                            : `Set first payday for ${monthLabel}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="1"
                          max={daysInMonth}
                          value={inputValue}
                          onChange={(e) =>
                            setMonthlyDayInputs((prev) => ({
                              ...prev,
                              [paycheck.id]: e.target.value,
                            }))
                          }
                          className="w-16 px-2 py-1 bg-[#111315] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-400"
                        />
                        <button
                          onClick={() => {
                            const day = parseInt(inputValue);
                            if (day && day >= 1 && day <= daysInMonth) {
                              updatePaycheckFirstDayForView(paycheck.id, day);
                              setMonthlyDayInputs((prev) => ({
                                ...prev,
                                [paycheck.id]: "",
                              }));
                            }
                          }}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Apply for{" "}
                          {viewDate.toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-green-400">
                      ${paycheck.amount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => deletePaycheck(paycheck.id)}
                      className="bg-transparent border-none text-gray-500 cursor-pointer p-1 rounded flex items-center justify-center hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-white text-lg font-semibold mb-1">
            Monthly Timeline
          </h3>
          <p className="text-gray-400 text-sm">
            Projected cash flow for {monthLabel}
          </p>
        </div>
        <div className="flex flex-col relative pl-6 border-l-2 border-gray-700 ml-2 gap-6">
          {timelineItems
            .reduce<
              Array<{ item: TimelineItem; runningTotal: number; index: number }>
            >((acc, item, index) => {
              const previousTotal =
                acc.length > 0 ? acc[acc.length - 1].runningTotal : 0;
              const runningTotal =
                item.type === "paycheck"
                  ? previousTotal + item.amount
                  : previousTotal - item.amount;
              acc.push({ item, runningTotal, index });
              return acc;
            }, [])
            .map(({ item, runningTotal, index }) => (
              <div
                key={`${item.type}-${item.date}-${index}`}
                className="relative"
              >
                <div className="mb-2">
                  <span className="text-sm text-gray-400 font-medium">
                    {formatDayLabel(item.date)}
                  </span>
                </div>
                <div className="relative">
                  <div
                    className={`absolute left-[-1.95rem] top-6 w-3 h-3 rounded-full border-2 border-[#1a1a1a] ${
                      item.type === "paycheck" ? "bg-green-500" : "bg-gray-700"
                    }`}
                  />
                  <div className="bg-[#1f1f1f] border border-gray-700 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <p
                        className={`font-medium text-white ${
                          item.type === "bill" && item.isPaid
                            ? "line-through text-gray-400"
                            : ""
                        }`}
                      >
                        {item.name}
                      </p>
                      <span
                        className={`text-xs ${item.type === "paycheck" ? "text-green-400" : "text-red-400"}`}
                      >
                        {item.type === "paycheck" ? "Income" : "Bill"}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p
                        className={`font-semibold ${item.type === "paycheck" ? "text-green-400" : "text-white"}`}
                      >
                        {item.type === "paycheck" ? "+" : "-"}$
                        {item.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400">
                        ${runningTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
