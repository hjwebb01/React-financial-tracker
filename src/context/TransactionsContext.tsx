import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { sampleTransactions, sampleCategories } from "../sampleData";
import type { Transaction } from "../types/finance";

const STORAGE_KEY = "budgetwise-transactions";

type TransactionDraft = {
  date: string;
  description: string;
  categoryId: string;
  amountCents: number;
};

type TransactionsContextValue = {
  transactions: Transaction[];
  addTransaction: (draft: TransactionDraft) => void;
  updateTransaction: (id: string, updates: Partial<TransactionDraft>) => void;
  deleteTransaction: (id: string) => void;
  resetTransactions: () => void;
};

type Action =
  | { type: "ADD"; payload: TransactionDraft }
  | {
      type: "UPDATE";
      payload: { id: string; updates: Partial<TransactionDraft> };
    }
  | { type: "DELETE"; payload: { id: string } }
  | { type: "RESET"; payload: Transaction[] };

const isTransactionLike = (value: unknown): value is Transaction => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.date === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.categoryId === "string" &&
    typeof candidate.amountCents === "number"
  );
};

const ensureField = <K extends keyof Transaction>(
  value: Transaction[K] | undefined,
  name: K
): Transaction[K] => {
  if (value === undefined) {
    throw new Error(`Missing transaction field: ${String(name)}`);
  }
  return value;
};

const withMetadata = (tx: Partial<Transaction>): Transaction => {
  let categoryId = tx.categoryId;
  if (!categoryId) {
    // Migrate old category string to id
    const cat = sampleCategories.find((c) => c.name === tx.categoryId);
    categoryId = cat?.id ?? tx.categoryId!.toLowerCase().replace(/\s+/g, "-");
  }

  const date = ensureField(tx.date, "date");
  const description = ensureField(tx.description, "description");
  const amountCents = ensureField(tx.amountCents, "amountCents");

  return {
    ...tx,
    id: tx.id ?? generateId(),
    date,
    description,
    amountCents,
    categoryId: categoryId!,
    createdAt: tx.createdAt ?? new Date(`${date}T00:00:00Z`).toISOString(),
  };
};

const sanitizeTransactions = (entries: Transaction[]): Transaction[] =>
  entries.map(withMetadata);

const persistTransactions = (transactions: Transaction[]) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.warn("Failed to persist transactions", error);
  }
};

const loadInitialTransactions = (): Transaction[] => {
  if (typeof window === "undefined") {
    return sanitizeTransactions(sampleTransactions);
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const validEntries = parsed.filter(isTransactionLike);
        if (validEntries.length) {
          return sanitizeTransactions(validEntries as Transaction[]);
        }
      }
    }
  } catch (error) {
    console.warn(
      "Failed to load persisted transactions, falling back to sample",
      error
    );
  }

  const seeded = sanitizeTransactions(sampleTransactions);
  persistTransactions(seeded);
  return seeded;
};

const generateId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `tx-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const transactionsReducer = (
  state: Transaction[],
  action: Action
): Transaction[] => {
  switch (action.type) {
    case "ADD": {
      const newTransaction: Transaction = {
        id: generateId(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      };
      return [newTransaction, ...state];
    }
    case "UPDATE": {
      return state.map((transaction) =>
        transaction.id === action.payload.id
          ? {
              ...transaction,
              ...action.payload.updates,
              editedAt: new Date().toISOString(),
            }
          : transaction
      );
    }
    case "DELETE": {
      return state.filter(
        (transaction) => transaction.id !== action.payload.id
      );
    }
    case "RESET": {
      return sanitizeTransactions(action.payload);
    }
    default:
      return state;
  }
};

const TransactionsContext = createContext<TransactionsContextValue | undefined>(
  undefined
);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, dispatch] = useReducer(
    transactionsReducer,
    [],
    loadInitialTransactions
  );
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    persistTransactions(transactions);
  }, [transactions]);

  const addTransaction = useCallback((draft: TransactionDraft) => {
    dispatch({ type: "ADD", payload: draft });
  }, []);

  const updateTransaction = useCallback(
    (id: string, updates: Partial<TransactionDraft>) => {
      dispatch({ type: "UPDATE", payload: { id, updates } });
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    dispatch({ type: "DELETE", payload: { id } });
  }, []);

  const resetTransactions = useCallback(() => {
    dispatch({
      type: "RESET",
      payload: sanitizeTransactions(sampleTransactions),
    });
  }, []);

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        resetTransactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider"
    );
  }
  return context;
};
