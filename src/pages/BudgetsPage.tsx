import { Budgets } from "../components/Budgets";

function BudgetsPage() {
  return (
    <div className="mb-8">
      <header className="text-center mb-4">
        <div>
          <h2 className="text-gray-300 mb-2 text-2xl font-semibold">Budgets</h2>
          <p className="text-gray-400">
            Plan your bills, income, and monthly cash flow.
          </p>
        </div>
      </header>

      <Budgets />
    </div>
  );
}

export default BudgetsPage;
