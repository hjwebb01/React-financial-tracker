import { useState } from "react";
import { FinanceProvider } from "./context/FinanceContext";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import BudgetsPage from "./pages/BudgetsPage";
import { Header } from "./components/ui/Header";

function App() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "transactions" | "budgets"
  >("dashboard");

  const tabs = [
    { id: "dashboard" as const, label: "Dashboard" },
    { id: "transactions" as const, label: "Transactions" },
    { id: "budgets" as const, label: "Budgets" },
  ];

  const renderActivePage = () => {
    if (activeTab === "dashboard") {
      return <DashboardPage />;
    }

    if (activeTab === "transactions") {
      return <TransactionsPage />;
    }

    if (activeTab === "budgets") {
      return <BudgetsPage />;
    }

    return null;
  };

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <Header
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">{renderActivePage()}</main>
      </div>
    </FinanceProvider>
  );
}

export default App;
