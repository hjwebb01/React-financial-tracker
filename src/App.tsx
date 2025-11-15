import "./App.css";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import BudgetsPage from "./pages/BudgetsPage";

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>BudgetWise</h1>
        <nav style={{ padding: "1rem", backgroundColor: "#eee" }}>
          <Link className="router-link" to="/dashboard">
            Dashboard
          </Link>
          <Link className="router-link" to="/transactions">
            Transactions
          </Link>
          <Link className="router-link" to="/budgets">
            Budgets
          </Link>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
