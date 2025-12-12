import { Logo } from "./Logo";

type TabId = "dashboard" | "transactions" | "budgets";

interface HeaderProps {
  tabs: { id: TabId; label: string }[];
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export function Header({ tabs, activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="border-b border-gray-700/50 backdrop-blur-sm bg-[#1a1a1a]/80">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Logo />

        <nav className="w-full max-w-md mx-auto">
          <div className="flex bg-gradient-to-br from-[#2a2a2a] via-[#252525] to-[#2a2a2a] rounded-lg p-1 border border-gray-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 motion-safe:transition-all motion-reduce:transition-none ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/30"
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
