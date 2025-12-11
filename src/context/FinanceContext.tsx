import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import financialDataRaw from "../assets/financial_data.csv?raw";
import { sumByType } from "../utils/financeMath";
import { SEED_TRANSACTIONS } from "../data/seedTransactions";

export type MVPTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
};

interface FinancialData {
  currentBalance: number;
  monthlyBills: number;
  monthlyIncome: number;
}

interface FinanceContextType {
  financialData: FinancialData;
  transactions: MVPTransaction[];
  addTransaction: (transaction: Omit<MVPTransaction, "id">) => void;
  removeTransaction: (id: string) => void;
  clearTransactions: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [currentBalance] = useState(() => {
    const lines = financialDataRaw.trim().split("\n");
    if (lines.length > 1) {
      const values = lines[1].split(",");
      return parseFloat(values[0]);
    }
    return 0;
  });
  const transactions = SEED_TRANSACTIONS;
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyBills, setMonthlyBills] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (transactions.length === 0) {
      queueMicrotask(() => {
        if (!cancelled) {
          setMonthlyIncome(0);
          setMonthlyBills(0);
        }
      });
      return;
    }

    const amountsCents = new Int32Array(
      transactions.map((t) => Math.round(t.amount * 100))
    );
    const typeFlags = new Int32Array(
      transactions.map((t) => (t.type === "income" ? 1 : 0))
    );

    Promise.all([
      sumByType(amountsCents, typeFlags, "income"),
      sumByType(amountsCents, typeFlags, "expense"),
    ])
      .then(([income, bills]) => {
        if (!cancelled) {
          setMonthlyIncome(income);
          setMonthlyBills(bills);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Calculation error:", error);
          setMonthlyIncome(
            transactions
              .filter((t) => t.type === "income")
              .reduce((acc, t) => acc + t.amount, 0)
          );
          setMonthlyBills(
            transactions
              .filter((t) => t.type === "expense")
              .reduce((acc, t) => acc + t.amount, 0)
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [transactions]);

  const financialData = useMemo(
    () => ({
      currentBalance,
      monthlyBills,
      monthlyIncome,
    }),
    [currentBalance, monthlyBills, monthlyIncome]
  );

  const addTransaction = () => {};

  const removeTransaction = () => {};

  const clearTransactions = () => {};

  return (
    <FinanceContext.Provider
      value={{
        financialData,
        transactions,
        addTransaction,
        removeTransaction,
        clearTransactions,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
