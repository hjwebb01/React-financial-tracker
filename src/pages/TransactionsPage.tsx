import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useTransactions } from "../context/TransactionsContext";
import {
  sampleCategories,
  formatMoney,
  parseMoneyInput,
} from "../utils/finance";
import type { Transaction } from "../types/finance";

const getCategoryName = (categoryId: string): string => {
  const category = sampleCategories.find((c) => c.id === categoryId);
  return category?.name ?? categoryId;
};

type TransactionFormState = {
  date: string;
  description: string;
  categoryId: string;
  amount: string;
  type: "income" | "expense";
};

const defaultFormState: TransactionFormState = {
  date: "",
  description: "",
  categoryId: sampleCategories[0].id,
  amount: "",
  type: "expense",
};

function TransactionsPage() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetTransactions,
  } = useTransactions();

  const [createForm, setCreateForm] =
    useState<TransactionFormState>(defaultFormState);
  const [createError, setCreateError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] =
    useState<TransactionFormState>(defaultFormState);
  const [editError, setEditError] = useState<string | null>(null);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) {
        return dateDiff;
      }
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    return sortedTransactions.filter((tx) => {
      const matchesSearch = lowerSearch
        ? `${tx.description} ${getCategoryName(tx.categoryId)}`.toLowerCase().includes(lowerSearch)
        : true;
      const matchesCategory =
        categoryFilter === "all" || tx.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [sortedTransactions, searchTerm, categoryFilter]);

  const handleFormChange = (key: keyof TransactionFormState, value: string) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateAndNormalizeAmount = (
    amountInput: string,
    type: "income" | "expense"
  ): number | null => {
    const parsed = parseMoneyInput(amountInput);
    if (parsed === null || parsed === 0) {
      return null;
    }
    return type === "expense" ? -Math.abs(parsed) : Math.abs(parsed);
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);

    if (!createForm.date || !createForm.description.trim()) {
      setCreateError("Please provide a date and description.");
      return;
    }

    const normalizedAmount = validateAndNormalizeAmount(
      createForm.amount,
      createForm.type
    );
    if (normalizedAmount === null) {
      setCreateError("Enter a non-zero amount (e.g., 123.45).");
      return;
    }

    addTransaction({
      date: createForm.date,
      description: createForm.description.trim(),
      categoryId: createForm.categoryId,
      amountCents: normalizedAmount,
    });
    setCreateForm(defaultFormState);
  };

  const openEdit = (transaction: Transaction) => {
    setEditingTx(transaction);
    setEditForm({
      date: transaction.date,
      description: transaction.description,
      categoryId: transaction.categoryId,
      amount: (Math.abs(transaction.amountCents) / 100).toString(),
      type: transaction.amountCents >= 0 ? "income" : "expense",
    });
    setEditError(null);
  };

  const handleEditChange = (key: keyof TransactionFormState, value: string) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingTx) {
      return;
    }
    setEditError(null);

    if (!editForm.date || !editForm.description.trim()) {
      setEditError("Please provide a date and description.");
      return;
    }

    const normalizedAmount = validateAndNormalizeAmount(
      editForm.amount,
      editForm.type
    );
    if (normalizedAmount === null) {
      setEditError("Enter a non-zero amount (e.g., 123.45).");
      return;
    }

    updateTransaction(editingTx.id, {
      date: editForm.date,
      description: editForm.description.trim(),
      categoryId: editForm.categoryId,
      amountCents: normalizedAmount,
    });
    setEditingTx(null);
  };

  const handleDelete = (transaction: Transaction) => {
    const confirmed = window.confirm(
      `Delete ${transaction.description} on ${transaction.date}?`
    );
    if (confirmed) {
      deleteTransaction(transaction.id);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset transactions to the original sample data?"
    );
    if (confirmed) {
      resetTransactions();
    }
  };

  return (
    <div className="transactions-page">
      <header className="transactions-header">
        <div>
          <h2>Transactions</h2>
          <p>Track, edit, and persist your ledger locally.</p>
        </div>
        <button className="secondary" onClick={handleReset}>
          Reset to sample data
        </button>
      </header>

      <section className="transactions-form-card">
        <h3>Add new transaction</h3>
        <form className="transactions-form" onSubmit={handleCreate}>
          <label>
            Date
            <input
              type="date"
              value={createForm.date}
              onChange={(event) => handleFormChange("date", event.target.value)}
              required
            />
          </label>
          <label>
            Description
            <input
              type="text"
              placeholder="e.g., Grocery run"
              value={createForm.description}
              onChange={(event) =>
                handleFormChange("description", event.target.value)
              }
              required
            />
          </label>
           <label>
             Category
             <select
               value={createForm.categoryId}
               onChange={(event) =>
                 handleFormChange("categoryId", event.target.value)
               }
             >
               {sampleCategories.map((category) => (
                 <option key={category.id} value={category.id}>
                   {category.name}
                 </option>
               ))}
             </select>
           </label>
          <label>
            Type
            <div className="transactions-type-group">
              <label>
                <input
                  type="radio"
                  name="create-type"
                  value="income"
                  checked={createForm.type === "income"}
                  onChange={(event) =>
                    handleFormChange("type", event.target.value)
                  }
                />
                Income
              </label>
              <label>
                <input
                  type="radio"
                  name="create-type"
                  value="expense"
                  checked={createForm.type === "expense"}
                  onChange={(event) =>
                    handleFormChange("type", event.target.value)
                  }
                />
                Expense
              </label>
            </div>
          </label>
          <label>
            Amount (USD)
            <input
              type="number"
              step="0.01"
              placeholder="e.g., 42.50"
              value={createForm.amount}
              onChange={(event) =>
                handleFormChange("amount", event.target.value)
              }
              required
            />
          </label>
          {createError && <p className="form-error">{createError}</p>}
          <button type="submit">Add transaction</button>
        </form>
      </section>

      <section className="transactions-filters">
        <input
          type="search"
          placeholder="Search description or category"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="all">All categories</option>
          {sampleCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <p className="transactions-count">
          Showing {filteredTransactions.length} of {transactions.length}
        </p>
      </section>

      <div className="transactions-table-wrapper">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th aria-label="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  No transactions match your filters.
                </td>
              </tr>
            )}
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.date}</td>
                <td>{transaction.description}</td>
                <td>{getCategoryName(transaction.categoryId)}</td>
                <td
                  className={
                    transaction.amountCents >= 0
                      ? "amount-positive"
                      : "amount-negative"
                  }
                >
                  {formatMoney(transaction.amountCents)}
                </td>
                <td>
                  <div className="transactions-actions">
                    <button
                      className="text-button"
                      onClick={() => openEdit(transaction)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-button destructive"
                      onClick={() => handleDelete(transaction)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingTx && (
        <div
          className="transactions-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setEditingTx(null)}
        >
          <div
            className="transactions-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <header>
              <h3>Edit transaction</h3>
              <button
                className="text-button"
                onClick={() => setEditingTx(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </header>
            <form className="transactions-form" onSubmit={handleEditSubmit}>
              <label>
                Date
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(event) =>
                    handleEditChange("date", event.target.value)
                  }
                  required
                />
              </label>
              <label>
                Description
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(event) =>
                    handleEditChange("description", event.target.value)
                  }
                  required
                />
              </label>
               <label>
                 Category
                 <select
                   value={editForm.categoryId}
                   onChange={(event) =>
                     handleEditChange("categoryId", event.target.value)
                   }
                 >
                   {sampleCategories.map((category) => (
                     <option key={category.id} value={category.id}>
                       {category.name}
                     </option>
                   ))}
                 </select>
               </label>
              <label>
                Type
                <div className="transactions-type-group">
                  <label>
                    <input
                      type="radio"
                      name="edit-type"
                      value="income"
                      checked={editForm.type === "income"}
                      onChange={(event) =>
                        handleEditChange("type", event.target.value)
                      }
                    />
                    Income
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="edit-type"
                      value="expense"
                      checked={editForm.type === "expense"}
                      onChange={(event) =>
                        handleEditChange("type", event.target.value)
                      }
                    />
                    Expense
                  </label>
                </div>
              </label>
              <label>
                Amount (USD)
                <input
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(event) =>
                    handleEditChange("amount", event.target.value)
                  }
                  required
                />
              </label>
              {editError && <p className="form-error">{editError}</p>}
              <div className="transactions-modal-actions">
                <button type="button" onClick={() => setEditingTx(null)}>
                  Cancel
                </button>
                <button type="submit">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;
