import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import BudgetsPage from "./pages/BudgetsPage";

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
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-center mb-6 text-3xl font-bold">BudgetWise</h1>

          <nav className="w-full max-w-120 mx-auto">
            <div className="grid grid-cols-3 gap-2 bg-white rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors  ${
                    activeTab === tab.id
                      ? "bg-gray-500 text-gray-200 border-transparent"
                      : "text-gray-900 border-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">{renderActivePage()}</div>
      </main>
    </div>
  );
}

export default App;
