import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('budget');
  
  // Grundbudget (z. B. monatliches Ziel/Limit)
  const [baseBudget, setBaseBudget] = useState(() => {
    const saved = localStorage.getItem('finanz_baseBudget');
    return saved ? parseFloat(saved) : 1000;
  });

  // Ausgaben-Array
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('finanz_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // Einnahmen-Array
  const [incomes, setIncomes] = useState(() => {
    const saved = localStorage.getItem('finanz_incomes');
    return saved ? JSON.parse(saved) : [];
  });

  // Formular-States
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Essen');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const [incomeTitle, setIncomeTitle] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);

  // Speichern in LocalStorage
  useEffect(() => {
    localStorage.setItem('finanz_baseBudget', baseBudget.toString());
  }, [baseBudget]);

  useEffect(() => {
    localStorage.setItem('finanz_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('finanz_incomes', JSON.stringify(incomes));
  }, [incomes]);

  // Funktion zur Ermittlung der Budget-Periode (25. bis 24.)
  const getPeriodKey = (dateString) => {
    const d = new Date(dateString);
    const day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();

    if (day >= 25) {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    return `${year}-${month < 10 ? '0' + month : month}`;
  };

  // Aktuelle Periode bestimmen (heute)
  const currentPeriod = getPeriodKey(new Date().toISOString().split('T')[0]);

  // Filter für die aktuelle Periode
  const currentExpenses = expenses.filter(e => getPeriodKey(e.date) === currentPeriod);
  const currentIncomes = incomes.filter(i => getPeriodKey(i.date) === currentPeriod);

  // Summen berechnen
  const totalExpenses = currentExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalIncomes = currentIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  
  // Verfügbares Restbudget = Basisbudget + Einnahmen - Ausgaben
  const remainingBudget = baseBudget + totalIncomes - totalExpenses;

  // Handler für Ausgaben
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;

    const newExpense = {
      id: Date.now(),
      title: expenseTitle,
      amount: parseFloat(expenseAmount),
      category: expenseCategory,
      date: expenseDate,
    };

    setExpenses([newExpense, ...expenses]);
    setExpenseTitle('');
    setExpenseAmount('');
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Handler für Einnahmen
  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!incomeTitle || !incomeAmount) return;

    const newIncome = {
      id: Date.now(),
      title: incomeTitle,
      amount: parseFloat(incomeAmount),
      date: incomeDate,
    };

    setIncomes([newIncome, ...incomes]);
    setIncomeTitle('');
    setIncomeAmount('');
  };

  const handleDeleteIncome = (id) => {
    setIncomes(incomes.filter(i => i.id !== id));
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Finanz-Tracker</h1>
        <p className="period-badge">Periode: {currentPeriod}</p>
      </header>

      {/* Navigation / Reiter */}
      <nav className="tab-navigation">
        <button 
          className={activeTab === 'budget' ? 'active' : ''} 
          onClick={() => setActiveTab('budget')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'expenses' ? 'active' : ''} 
          onClick={() => setActiveTab('expenses')}
        >
          💸 Ausgaben
        </button>
        <button 
          className={activeTab === 'incomes' ? 'active' : ''} 
          onClick={() => setActiveTab('incomes')}
        >
          💰 Einnahmen
        </button>
      </nav>

      {/* REITER 1: DASHBOARD / BUDGET */}
      {activeTab === 'budget' && (
        <div className="tab-content">
          <div className="card budget-summary">
            <h3>Verfügbares Restbudget</h3>
            <div className={`large-amount ${remainingBudget < 0 ? 'negative' : 'positive'}`}>
              CHF {remainingBudget.toFixed(2)}
            </div>
          </div>

          <div className="stats-grid">
            <div className="card stat-card">
              <span>Basis-Budget:</span>
              <input 
                type="number" 
                value={baseBudget} 
                onChange={(e) => setBaseBudget(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="card stat-card positive-text">
              <span>Einnahmen (Periode):</span>
              <strong>+ CHF {totalIncomes.toFixed(2)}</strong>
            </div>
            <div className="card stat-card negative-text">
              <span>Ausgaben (Periode):</span>
              <strong>- CHF {totalExpenses.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* REITER 2: AUSGABEN */}
      {activeTab === 'expenses' && (
        <div className="tab-content">
          <div className="card">
            <h3>Neue Ausgabe eintragen</h3>
            <form onSubmit={handleAddExpense} className="form">
              <input 
                type="text" 
                placeholder="Titel (z. B. Einkauf)" 
                value={expenseTitle} 
                onChange={(e) => setExpenseTitle(e.target.value)} 
                required
              />
              <input 
                type="number" 
                step="0.01" 
                placeholder="Betrag in CHF" 
                value={expenseAmount} 
                onChange={(e) => setExpenseAmount(e.target.value)} 
                required
              />
              <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
                <option value="Essen">Essen / Haushalt</option>
                <option value="Freizeit">Freizeit / Ausgang</option>
                <option value="Transport">Transport / OV</option>
                <option value="Abo">Abos / Rechnungen</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
              <input 
                type="date" 
                value={expenseDate} 
                onChange={(e) => setExpenseDate(e.target.value)} 
              />
              <button type="submit" className="btn-danger">Ausgabe hinzufügen</button>
            </form>
          </div>

          <div className="card">
            <h3>Ausgaben in dieser Periode</h3>
            <ul className="item-list">
              {currentExpenses.length === 0 ? (
                <p className="empty-hint">Keine Ausgaben in dieser Periode.</p>
              ) : (
                currentExpenses.map((exp) => (
                  <li key={exp.id} className="item-row">
                    <div>
                      <strong>{exp.title}</strong>
                      <span className="sub-text">{exp.category} | {exp.date}</span>
                    </div>
                    <div className="amount-action">
                      <span className="negative-text">- CHF {exp.amount.toFixed(2)}</span>
                      <button onClick={() => handleDeleteExpense(exp.id)} className="btn-icon">🗑️</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* REITER 3: EINNAHMEN */}
      {activeTab === 'incomes' && (
        <div className="tab-content">
          <div className="card">
            <h3>Neue Einnahme eintragen (z. B. Lohn)</h3>
            <form onSubmit={handleAddIncome} className="form">
              <input 
                type="text" 
                placeholder="Titel (z. B. Lohn, Geschenk)" 
                value={incomeTitle} 
                onChange={(e) => setIncomeTitle(e.target.value)} 
                required
              />
              <input 
                type="number" 
                step="0.01" 
                placeholder="Betrag in CHF" 
                value={incomeAmount} 
                onChange={(e) => setIncomeAmount(e.target.value)} 
                required
              />
              <input 
                type="date" 
                value={incomeDate} 
                onChange={(e) => setIncomeDate(e.target.value)} 
              />
              <button type="submit" className="btn-success">Einnahme hinzufügen</button>
            </form>
          </div>

          <div className="card">
            <h3>Einnahmen in dieser Periode</h3>
            <ul className="item-list">
              {currentIncomes.length === 0 ? (
                <p className="empty-hint">Keine Einnahmen in dieser Periode.</p>
              ) : (
                currentIncomes.map((inc) => (
                  <li key={inc.id} className="item-row">
                    <div>
                      <strong>{inc.title}</strong>
                      <span className="sub-text">{inc.date}</span>
                    </div>
                    <div className="amount-action">
                      <span className="positive-text">+ CHF {inc.amount.toFixed(2)}</span>
                      <button onClick={() => handleDeleteIncome(inc.id)} className="btn-icon">🗑️</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;