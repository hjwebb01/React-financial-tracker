import type { Transaction } from "./types/finance";

export const sampleTransactions: Transaction[] = [
  {
    id: "tx-001",
    date: "2025-10-01",
    description: "October Rent",
    category: "Rent",
    amountCents: -135000,
  },
  {
    id: "tx-002",
    date: "2025-10-02",
    description: "Salary Deposit",
    category: "Income",
    amountCents: 320000,
  },
  {
    id: "tx-003",
    date: "2025-10-05",
    description: "Grocery Run",
    category: "Food",
    amountCents: -18500,
  },
  {
    id: "tx-004",
    date: "2025-10-07",
    description: "Coffee with friend",
    category: "Food",
    amountCents: -850,
  },
  {
    id: "tx-005",
    date: "2025-10-12",
    description: "Concert Tickets",
    category: "Entertainment",
    amountCents: -7600,
  },
  {
    id: "tx-006",
    date: "2025-10-15",
    description: "City Metro Pass",
    category: "Transport",
    amountCents: -11500,
  },
];
