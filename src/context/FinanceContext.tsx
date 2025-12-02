import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import financialDataRaw from "../assets/financial_data.csv?raw";
import { sumByType } from "../wasm/financeWasm";

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

const STORAGE_KEY = "financial-tracker-transactions";

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [transactions, setTransactions] = useState<MVPTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load transactions from localStorage:", error);
      return [];
    }
  });
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyBills, setMonthlyBills] = useState(0);

  useEffect(() => {
    const lines = financialDataRaw.trim().split("\n");
    if (lines.length > 1) {
      const values = lines[1].split(",");
      setCurrentBalance(parseFloat(values[0]));
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error("Failed to save transactions to localStorage:", error);
    }
  }, [transactions]);

  useEffect(() => {
    if (transactions.length === 0) {
      setMonthlyIncome(0);
      setMonthlyBills(0);
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
        setMonthlyIncome(income);
        setMonthlyBills(bills);
      })
      .catch((error) => {
        console.error("WASM calculation error:", error);
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
      });
  }, [transactions]);

  const financialData = useMemo(
    () => ({
      currentBalance,
      monthlyBills,
      monthlyIncome,
    }),
    [currentBalance, monthlyBills, monthlyIncome],
  );

  const addTransaction = (transaction: Omit<MVPTransaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearTransactions = () => {
    setTransactions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear transactions from localStorage:", error);
    }
  };

  return (
    <FinanceContext.Provider
      value={{ financialData, transactions, addTransaction, removeTransaction, clearTransactions }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
