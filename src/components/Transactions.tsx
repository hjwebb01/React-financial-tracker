import { useState, useEffect } from "react";
import { useFinance } from "../context/FinanceContext";
import { Plus, Minus, Calendar, Tag, DollarSign, Trash2, X } from "lucide-react";
import { calculateRunningBalances } from "../wasm/financeWasm";

export default function Transactions() {
  const { addTransaction, transactions, removeTransaction, financialData, clearTransactions } = useFinance();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "income" as "income" | "expense",
  });
  const [transactionBalances, setTransactionBalances] = useState<Map<string, { before: number; after: number }>>(new Map());

  useEffect(() => {
    if (transactions.length === 0) {
      setTransactionBalances(new Map());
      return;
    }

    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return transactions.indexOf(a) - transactions.indexOf(b);
    });

    const amountsCents = new Int32Array(
      sortedTransactions.map((t) => Math.round(t.amount * 100))
    );
    const typeFlags = new Int32Array(
      sortedTransactions.map((t) => (t.type === "income" ? 1 : 0))
    );

    calculateRunningBalances(amountsCents, typeFlags, financialData.currentBalance)
      .then((balances) => {
        const balancesMap = new Map<string, { before: number; after: number }>();
        sortedTransactions.forEach((transaction, index) => {
          balancesMap.set(transaction.id, balances[index]);
        });
        setTransactionBalances(balancesMap);
      })
      .catch((error) => {
        console.error("WASM balance calculation error:", error);
        const balances = new Map<string, { before: number; after: number }>();
        let runningBalance = financialData.currentBalance;
        
        sortedTransactions.forEach((transaction) => {
          const balanceBefore = runningBalance;
          const balanceAfter = runningBalance + (transaction.type === "income" ? transaction.amount : -transaction.amount);
          
          balances.set(transaction.id, { before: balanceBefore, after: balanceAfter });
          runningBalance = balanceAfter;
        });
        
        setTransactionBalances(balances);
      });
  }, [transactions, financialData.currentBalance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    addTransaction({
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
    });

    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      type: "expense",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          Add Transaction
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Description</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Groceries, Salary, etc."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Type</label>
            <div className="flex bg-[#1f1f1f] rounded-lg p-1 border border-gray-700">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "income" })}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  formData.type === "income"
                    ? "bg-green-500/20 text-green-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Plus className="w-4 h-4" />
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "expense" })}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  formData.type === "expense"
                    ? "bg-red-500/20 text-red-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Minus className="w-4 h-4" />
                Expense
              </button>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Recent Transactions
          </h3>
          {transactions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all transactions? This action cannot be undone.")) {
                  clearTransactions();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors text-sm"
              title="Clear all transactions"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No transactions yet
            </p>
          ) : (
            transactions
              .slice()
              .reverse()
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 bg-[#1f1f1f] border border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full ${
                        t.type === "income"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {t.type === "income" ? (
                        <Plus className="w-4 h-4" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{t.description}</p>
                      <p className="text-gray-400 text-sm">{t.date}</p>
                      {transactionBalances.has(t.id) && (
                        <p className="text-gray-500 text-xs mt-0.5">
                          ${transactionBalances.get(t.id)!.before.toFixed(2)} =&gt; ${transactionBalances.get(t.id)!.after.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={`font-semibold ${
                        t.type === "income" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeTransaction(t.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
