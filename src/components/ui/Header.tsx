import { Logo } from "./Logo";

type TabId = "dashboard" | "transactions" | "budgets";

interface HeaderProps {
  tabs: { id: TabId; label: string }[];
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export function Header({ tabs, activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Logo />

        <nav className="w-full max-w-md mx-auto">
          <div className="flex bg-[#2a2a2a] rounded-lg p-1 border border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

