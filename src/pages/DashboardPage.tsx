import { Dashboard } from "../components/Dashboard";

function DashboardPage() {
  return (
    <div className="mb-8">
      <header className="text-center mb-4">
        <div>
          <h2 className="text-gray-300 mb-2 text-2xl font-semibold">
            Dashboard
          </h2>
          <p className="text-gray-400">
            Overview of your current balance and projected finances.
          </p>
        </div>
      </header>

      <Dashboard />
    </div>
  );
}

export default DashboardPage;
