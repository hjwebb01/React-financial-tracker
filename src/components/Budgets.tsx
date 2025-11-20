import { useCallback, useMemo, useState } from 'react';
import { Plus, DollarSign, Trash2, CreditCard, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  category: string;
  isPaid: boolean;
  baseDueDay?: number;
  monthlyAnchors: Record<string, number>;
}

interface Paycheck {
  id: string;
  source: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  monthlyAnchors: Record<string, number>;
}

type NewPaycheckForm = {
  source: string;
  amount: string;
  frequency: Paycheck['frequency'];
  firstDay: string;
};

interface TimelineItem {
  type: 'bill' | 'paycheck';
  date: number;
  name: string;
  amount: number;
  isPaid?: boolean;
}

const getOrdinal = (day: number) => {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  const remainder = day % 100;
  if (remainder >= 11 && remainder <= 13) return `${day}th`;
  return `${day}${suffixes[day % 10] ?? 'th'}`;
};

export function Budgets() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [paychecks, setPaychecks] = useState<Paycheck[]>([]);
  const [showBillForm, setShowBillForm] = useState(false);
  const [showPaycheckForm, setShowPaycheckForm] = useState(false);
  const [newBill, setNewBill] = useState({ name: '', amount: '', dueDate: '', category: '' });
  const [newPaycheck, setNewPaycheck] = useState<NewPaycheckForm>({
    source: '',
    amount: '',
    frequency: 'monthly',
    firstDay: ''
  });
  const [monthlyDayInputs, setMonthlyDayInputs] = useState<Record<string, string>>({});
  const [viewDate, setViewDate] = useState(new Date());
  const monthKey = useMemo(() => {
    return `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;
  }, [viewDate]);

  const monthLabel = useMemo(() => {
    return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewDate]);

  const daysInMonth = useMemo(() => {
    return new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  }, [viewDate]);

  const goPrevMonth = useCallback(() => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }, []);

  const goNextMonth = useCallback(() => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }, []);

  const getInterval = (frequency: Paycheck['frequency']) => {
    switch (frequency) {
      case 'weekly':
        return 7;
      case 'biweekly':
        return 14;
      default:
        return 31;
    }
  };

  const generateOccurrences = (anchor: number, interval: number, monthLength: number) => {
    const dates: number[] = [];
    for (let day = anchor; day <= monthLength; day += interval) {
      dates.push(day);
    }
    return dates;
  };

  const formatDayLabel = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${dayName}, ${getOrdinal(day)}`;
  };

  const handleAddBill = () => {
    const firstDay = parseInt(newBill.dueDate);
    if (newBill.name && newBill.amount && firstDay && firstDay <= daysInMonth) {
      setBills((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newBill.name,
          amount: parseFloat(newBill.amount),
          dueDate: firstDay,
          category: newBill.category,
          isPaid: false,
          monthlyAnchors: {
            [monthKey]: firstDay
          }
        }
      ]);
      setNewBill({ name: '', amount: '', dueDate: '', category: 'Utilities' });
      setShowBillForm(false);
    }
  };

  const handleAddPaycheck = () => {
    const firstDay = parseInt(newPaycheck.firstDay);
    if (newPaycheck.source && newPaycheck.amount && firstDay && firstDay <= daysInMonth) {
      setPaychecks((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          source: newPaycheck.source,
          amount: parseFloat(newPaycheck.amount),
          frequency: newPaycheck.frequency,
          monthlyAnchors: {
            [monthKey]: firstDay
          }
        }
      ]);
      setNewPaycheck({ source: '', amount: '', frequency: 'monthly', firstDay: '' });
      setMonthlyDayInputs((prev) => ({ ...prev, [monthKey]: '' }));
      setShowPaycheckForm(false);
    }
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((bill) => bill.id !== id));
  };

  const deletePaycheck = (id: string) => {
    setPaychecks((prev) => prev.filter((paycheck) => paycheck.id !== id));
  };

  const toggleBillPaid = (id: string) => {
    setBills((prev) =>
      prev.map((bill) => (bill.id === id ? { ...bill, isPaid: !bill.isPaid } : bill))
    );
  };

  const updatePaycheckFirstDayForView = (id: string, day: number) => {
    setPaychecks((prev) =>
      prev.map((paycheck) => {
        if (paycheck.id !== id) return paycheck;
        return {
          ...paycheck,
          monthlyAnchors: {
            ...paycheck.monthlyAnchors,
            [monthKey]: day
          }
        };
      })
    );
  };

  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => a.dueDate - b.dueDate);
  }, [bills]);

  const paychecksWithOccurrences = useMemo(() => {
    const items: TimelineItem[] = [];
    paychecks.forEach((paycheck) => {
      const anchor = paycheck.monthlyAnchors[monthKey];
      if (!anchor) return;
      const interval = getInterval(paycheck.frequency);
      const occurrences = generateOccurrences(anchor, interval, daysInMonth);
      occurrences.forEach((day) => {
        items.push({
          type: 'paycheck',
          date: day,
          name: paycheck.source,
          amount: paycheck.amount
        });
      });
    });
    return items;
  }, [paychecks, monthKey, daysInMonth]);

  const timelineItems = useMemo(() => {
    const billItems = sortedBills.map((bill) => ({
      type: 'bill' as const,
      date: bill.monthlyAnchors[monthKey] ?? bill.baseDueDay ?? bill.dueDate,
      name: bill.name,
      amount: bill.amount,
      isPaid: bill.isPaid
    }));
    return [...billItems, ...paychecksWithOccurrences].sort((a, b) => a.date - b.date);
  }, [paychecksWithOccurrences, sortedBills]);

  const totalIncome = paychecksWithOccurrences.reduce((sum, item) => sum + item.amount, 0);
  const totalBills = sortedBills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="budgets-container">
      <div className="time-toggle">
        <button onClick={goPrevMonth} className="time-toggle-btn inactive" title="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="time-toggle-btn active">{monthLabel}</div>
        <button onClick={goNextMonth} className="time-toggle-btn inactive" title="Next month">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Summary */}
      <div className="finance-overview-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Projected income for {monthLabel}</p>
              <div className="stat-values">
                <p className="stat-value">${totalIncome.toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-icon-wrapper bg-green">
              <DollarSign className="stat-icon icon-green" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Projected spending</p>
              <div className="stat-values">
                <p className="stat-value">${totalBills.toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-icon-wrapper bg-orange">
              <CreditCard className="stat-icon icon-orange" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-info">
              <p className="stat-label">Remaining</p>
              <div className="stat-values">
                <p className="stat-value">${(totalIncome - totalBills).toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-icon-wrapper bg-blue">
              <Wallet className="stat-icon icon-blue" />
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="budget-header">
            <div className="chart-header">
              <h3 className="chart-title">Monthly Bills</h3>
              <p className="chart-subtitle">Track your recurring expenses</p>
            </div>
            <button onClick={() => setShowBillForm((prev) => !prev)} className="add-button">
              <Plus className="add-icon" />
              Add Bill
            </button>
          </div>

          {showBillForm && (
            <div className="budget-form">
              <input
                type="text"
                placeholder="Bill name"
                value={newBill.name}
                onChange={(e) => setNewBill((prev) => ({ ...prev, name: e.target.value }))}
                className="budget-input"
              />
              <input
                type="number"
                placeholder="Amount"
                value={newBill.amount}
                onChange={(e) => setNewBill((prev) => ({ ...prev, amount: e.target.value }))}
                className="budget-input"
              />
              <input
                type="number"
                placeholder="Due date (1-31)"
                min="1"
                max="31"
                value={newBill.dueDate}
                onChange={(e) => setNewBill((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="budget-input"
              />
              <input
                type="text"
                value={newBill.category}
                onChange={(e) => setNewBill((prev) => ({ ...prev, category: e.target.value }))}
                className="budget-input"
                placeholder="Enter category"
              />
              <div className="form-actions">
                <button onClick={handleAddBill} className="save-button">Save</button>
                <button onClick={() => setShowBillForm(false)} className="cancel-button">Cancel</button>
              </div>
            </div>
          )}

          <div className="budget-list">
            {sortedBills.map((bill) => (
              <div key={bill.id} className={`budget-item ${bill.isPaid ? 'budget-item-paid' : ''}`}>
                <div className="budget-item-left">
                  <input
                    type="checkbox"
                    checked={bill.isPaid}
                    onChange={() => toggleBillPaid(bill.id)}
                    className="budget-checkbox"
                  />
                  <div className="budget-item-info">
                    <p className={`budget-item-name ${bill.isPaid ? 'budget-item-name-paid' : ''}`}>{bill.name}</p>
            <div className="budget-item-meta">
              <span className="transaction-badge">{bill.category}</span>
              <span className="transaction-date">Due: {formatDayLabel(bill.monthlyAnchors[monthKey] ?? bill.dueDate)}</span>
            </div>
                  </div>
                </div>
                <div className="budget-item-right">
                  <p className="budget-item-amount">${bill.amount.toFixed(2)}</p>
                  <button onClick={() => deleteBill(bill.id)} className="delete-button">
                    <Trash2 className="delete-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="budget-header">
            <div className="chart-header">
              <h3 className="chart-title">Income Sources</h3>
              <p className="chart-subtitle">Manage your recurring paychecks</p>
            </div>
            <button onClick={() => setShowPaycheckForm((prev) => !prev)} className="add-button">
              <Plus className="add-icon" />
              Add Income
            </button>
          </div>

          {showPaycheckForm && (
            <div className="budget-form">
              <input
                type="text"
                placeholder="Income source"
                value={newPaycheck.source}
                onChange={(e) => setNewPaycheck((prev) => ({ ...prev, source: e.target.value }))}
                className="budget-input"
              />
              <input
                type="number"
                placeholder="Amount"
                value={newPaycheck.amount}
                onChange={(e) => setNewPaycheck((prev) => ({ ...prev, amount: e.target.value }))}
                className="budget-input"
              />
              <select
                value={newPaycheck.frequency}
                onChange={(e) => setNewPaycheck((prev) => ({ ...prev, frequency: e.target.value as Paycheck['frequency'] }))}
                className="budget-select"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <input
                type="number"
                placeholder="First payday of month"
                min="1"
                max={daysInMonth}
                value={newPaycheck.firstDay}
                onChange={(e) => setNewPaycheck((prev) => ({ ...prev, firstDay: e.target.value }))}
                className="budget-input"
              />
              <div className="form-actions">
                <button onClick={handleAddPaycheck} className="save-button">Save</button>
                <button onClick={() => setShowPaycheckForm(false)} className="cancel-button">Cancel</button>
              </div>
            </div>
          )}

          <div className="budget-list">
            {paychecks.map((paycheck) => {
              const firstDay = paycheck.monthlyAnchors[monthKey];
              const inputValue = monthlyDayInputs[paycheck.id] ?? (firstDay ? firstDay.toString() : '');

              return (
                <div key={paycheck.id} className="budget-item">
                  <div className="budget-item-left">
                    <div className="paycheck-icon-wrapper">
                      <DollarSign className="paycheck-icon" />
                    </div>
                    <div className="budget-item-info">
                      <p className="budget-item-name">{paycheck.source}</p>
                      <div className="budget-item-meta">
                        <span className="transaction-badge paycheck-badge">{paycheck.frequency}</span>
                        <span className="transaction-date">
                          {firstDay ? `First payday: ${formatDayLabel(firstDay)}` : `Set first payday for ${monthLabel}`}
                        </span>
                      </div>
                      <div className="paycheck-month-actions">
                        <input
                          type="number"
                          min="1"
                          max={daysInMonth}
                          value={inputValue}
                          onChange={(e) =>
                            setMonthlyDayInputs((prev) => ({ ...prev, [paycheck.id]: e.target.value }))
                          }
                          className="paycheck-month-input"
                        />
                        <button
                          onClick={() => {
                            const day = parseInt(inputValue);
                            if (day && day >= 1 && day <= daysInMonth) {
                              updatePaycheckFirstDayForView(paycheck.id, day);
                              setMonthlyDayInputs((prev) => ({ ...prev, [paycheck.id]: '' }));
                            }
                          }}
                          className="paycheck-month-button"
                        >
                          Apply for {viewDate.toLocaleDateString('en-US', { month: 'short' })}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="budget-item-right">
                    <p className="budget-item-amount paycheck-amount">${paycheck.amount.toFixed(2)}</p>
                    <button onClick={() => deletePaycheck(paycheck.id)} className="delete-button">
                      <Trash2 className="delete-icon" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Monthly Timeline</h3>
          <p className="chart-subtitle">Projected cash flow for {monthLabel}</p>
        </div>
        <div className="timeline">
          {(() => {
            let runningTotal = 0;
            return timelineItems.map((item, index) => {
              if (item.type === 'paycheck') {
                runningTotal += item.amount;
              } else {
                runningTotal -= item.amount;
              }

              return (
                <div
                  key={`${item.type}-${item.date}-${index}`}
                  className={`timeline-item ${item.type === 'paycheck' ? 'timeline-item-income' : ''}`}
                >
                  <div className="timeline-date">
                    <span className="timeline-day">{formatDayLabel(item.date)}</span>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-dot" />
                    <div className="timeline-card">
                      <div className="timeline-info">
                        <p className={`timeline-name ${item.type === 'bill' && item.isPaid ? 'timeline-name-paid' : ''}`}>
                          {item.name}
                        </p>
                        <span className={`timeline-type ${item.type === 'paycheck' ? 'timeline-type-income' : 'timeline-type-expense'}`}>
                          {item.type === 'paycheck' ? 'Income' : 'Bill'}
                        </span>
                      </div>
                      <div className="timeline-amount-wrapper">
                        <p className={`timeline-amount ${item.type === 'paycheck' ? 'timeline-amount-income' : 'timeline-amount-expense'}`}>
                          {item.type === 'paycheck' ? '+' : '-'}${item.amount.toFixed(2)}
                        </p>
                        <p className="timeline-rolling-total">
                          ${runningTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
