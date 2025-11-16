import { useMemo } from "react";
import { useMonthlyAggregates } from "../hooks/useAggregates";
import { sampleCategories, formatMoney } from "../utils/finance";

function DashboardPage() {
  const { totalSpent, totalIncome, netBalance, categorySpendMap, topCategory, budgetStats } = useMonthlyAggregates();

  const sortedCategories = useMemo(() => {
    return Array.from(categorySpendMap.entries())
      .map(([categoryId, spent]) => ({
        categoryId,
        spent,
        name: sampleCategories.find(c => c.id === categoryId)?.name ?? categoryId,
      }))
      .sort((a, b) => b.spent - a.spent);
  }, [categorySpendMap]);

  const maxSpent = sortedCategories.length > 0 ? sortedCategories[0].spent : 1;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Current month overview of your finances.</p>
      </header>

      <section className="dashboard-kpis">
        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <h3>Total Spent</h3>
            <p className="kpi-value negative">{formatMoney(totalSpent)}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">💸</div>
          <div className="kpi-content">
            <h3>Total Income</h3>
            <p className="kpi-value positive">{formatMoney(totalIncome)}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">⚖️</div>
          <div className="kpi-content">
            <h3>Net Balance</h3>
            <p className={`kpi-value ${netBalance >= 0 ? 'positive' : 'negative'}`}>{formatMoney(netBalance)}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">📈</div>
          <div className="kpi-content">
            <h3>Top Category</h3>
            <p className="kpi-value">
              {topCategory.categoryId ? sampleCategories.find(c => c.id === topCategory.categoryId)?.name : 'None'}
            </p>
            <p className="kpi-sub">{formatMoney(topCategory.spent)}</p>
          </div>
        </div>
      </section>

      <section className="dashboard-chart">
        <h3>Spending by Category</h3>
        {sortedCategories.length === 0 ? (
          <p className="empty-state">No spending this month yet.</p>
        ) : (
          <div className="category-chart">
            {sortedCategories.map(({ categoryId, spent, name }) => (
              <div key={categoryId} className="chart-bar">
                <div className="chart-label">
                  <span className="category-name">{name}</span>
                  <span className="category-amount">{formatMoney(spent)}</span>
                </div>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar-fill"
                    style={{ width: `${(spent / maxSpent) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {budgetStats.length > 0 && (
        <section className="dashboard-budgets">
          <h3>Budget Status</h3>
          <div className="budget-status-list">
            {budgetStats.map((stat) => (
              <div key={stat.id} className="budget-status">
                <div className="budget-status-header">
                  <span className="budget-category">{sampleCategories.find(c => c.id === stat.categoryId)?.name}</span>
                  <span className={`budget-remaining ${stat.isOver ? 'over' : ''}`}>
                    {formatMoney(stat.remaining)} left
                  </span>
                </div>
                <div className="budget-progress">
                  <div
                    className={`progress-bar ${stat.isOver ? 'over' : ''}`}
                    style={{ width: `${Math.min(stat.percentUsed, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default DashboardPage;
