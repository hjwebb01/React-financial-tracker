import type { Transaction, Category } from "./types/finance";

export const sampleCategories: Category[] = [
  { id: "income", name: "Income" },
  { id: "food", name: "Food" },
  { id: "rent", name: "Rent" },
  { id: "transport", name: "Transport" },
  { id: "entertainment", name: "Entertainment" },
  { id: "utilities", name: "Utilities" },
  { id: "health", name: "Health" },
  { id: "savings", name: "Savings" },
  { id: "other", name: "Other" },
];

export const sampleTransactions: Transaction[] = [
  {
    id: "tx-001",
    date: "2025-11-01",
    description: "November Rent",
    categoryId: "rent",
    amountCents: -135000,
  },
  {
    id: "tx-002",
    date: "2025-11-02",
    description: "Salary Deposit",
    categoryId: "income",
    amountCents: 320000,
  },
  {
    id: "tx-003",
    date: "2025-11-05",
    description: "Grocery Run",
    categoryId: "food",
    amountCents: -18500,
  },
  {
    id: "tx-004",
    date: "2025-11-07",
    description: "Coffee with friend",
    categoryId: "food",
    amountCents: -850,
  },
  {
    id: "tx-005",
    date: "2025-11-12",
    description: "Concert Tickets",
    categoryId: "entertainment",
    amountCents: -7600,
  },
  {
    id: "tx-006",
    date: "2025-11-15",
    description: "City Metro Pass",
    categoryId: "transport",
    amountCents: -11500,
  },
];
