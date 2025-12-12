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
      <div className="min-h-screen bg-[#1a1a1a] text-white relative overflow-hidden">
        {/* Backdrop layers: purple/cyan halo + noise texture */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Purple/cyan radial gradient halo */}
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] translate-x-1/2 translate-y-1/2 bg-gradient-to-tl from-cyan-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
          {/* Subtle noise overlay */}
          <div className="absolute inset-0 bg-noise opacity-30" />
        </div>

        <div className="relative z-10">
          <Header
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 py-8">{renderActivePage()}</main>
        </div>
      </div>
    </FinanceProvider>
  );
}

export default App;
