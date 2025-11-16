import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import type { Budget } from "../types/finance";

const STORAGE_KEY = "budgetwise-budgets";

type BudgetDraft = {
  categoryId: string;
  monthlyLimit: number;
  notes?: string;
};

type BudgetsContextValue = {
  budgets: Budget[];
  addBudget: (draft: BudgetDraft) => void;
  updateBudget: (id: string, updates: Partial<BudgetDraft>) => void;
  deleteBudget: (id: string) => void;
  resetBudgets: () => void;
};

type Action =
  | { type: "ADD"; payload: BudgetDraft }
  | {
      type: "UPDATE";
      payload: { id: string; updates: Partial<BudgetDraft> };
    }
  | { type: "DELETE"; payload: { id: string } }
  | { type: "RESET"; payload: Budget[] };

const isBudgetLike = (value: unknown): value is Budget => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.categoryId === "string" &&
    typeof candidate.monthlyLimit === "number" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
};

const sanitizeBudgets = (entries: Budget[]): Budget[] => entries;

const persistBudgets = (budgets: Budget[]) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.warn("Failed to persist budgets", error);
  }
};

const loadInitialBudgets = (): Budget[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const validEntries = parsed.filter(isBudgetLike);
        if (validEntries.length) {
          return sanitizeBudgets(validEntries as Budget[]);
        }
      }
    }
  } catch (error) {
    console.warn("Failed to load persisted budgets, starting empty", error);
  }

  return [];
};

const generateId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `budget-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const budgetsReducer = (
  state: Budget[],
  action: Action
): Budget[] => {
  switch (action.type) {
    case "ADD": {
      const newBudget: Budget = {
        id: generateId(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return [newBudget, ...state];
    }
    case "UPDATE": {
      return state.map((budget) =>
        budget.id === action.payload.id
          ? {
              ...budget,
              ...action.payload.updates,
              updatedAt: new Date().toISOString(),
            }
          : budget
      );
    }
    case "DELETE": {
      return state.filter((budget) => budget.id !== action.payload.id);
    }
    case "RESET": {
      return sanitizeBudgets(action.payload);
    }
    default:
      return state;
  }
};

const BudgetsContext = createContext<BudgetsContextValue | undefined>(
  undefined
);

export const BudgetsProvider = ({ children }: { children: ReactNode }) => {
  const [budgets, dispatch] = useReducer(
    budgetsReducer,
    [],
    loadInitialBudgets
  );
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    persistBudgets(budgets);
  }, [budgets]);

  const addBudget = useCallback((draft: BudgetDraft) => {
    dispatch({ type: "ADD", payload: draft });
  }, []);

  const updateBudget = useCallback(
    (id: string, updates: Partial<BudgetDraft>) => {
      dispatch({ type: "UPDATE", payload: { id, updates } });
    },
    []
  );

  const deleteBudget = useCallback((id: string) => {
    dispatch({ type: "DELETE", payload: { id } });
  }, []);

  const resetBudgets = useCallback(() => {
    dispatch({ type: "RESET", payload: [] });
  }, []);

  return (
    <BudgetsContext.Provider
      value={{
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        resetBudgets,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBudgets = () => {
  const context = useContext(BudgetsContext);
  if (!context) {
    throw new Error("useBudgets must be used within a BudgetsProvider");
  }
  return context;
};