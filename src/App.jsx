import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Wallet, CreditCard, ChevronRight } from 'lucide-react';

export default function FinanceTracker() {
  const [activeTab, setActiveTab] = useState('Sparen');
  const [selectedMonthView, setSelectedMonthView] = useState('Januar');

  // Budget States
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('finance_budget');
    return saved ? JSON.parse(saved) : { lohn: 0, foodDrinks: 0, einkaeufe: 0, seite: 0 };
  });

  // Ausgaben States
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('finance_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [newExpense, setNewExpense] = useState({
    month: 'Januar',
    day: 1,
    category: 'Food/Drinks',
    amount: '',
    description: ''
  });

  // Einnahmen States
  const [incomes, setIncomes] = useState(() => {
    const saved = localStorage.getItem('finance_incomes');
    return saved ? JSON.parse(saved) : [];
  });

  const [newIncome, setNewIncome] = useState({
    month: 'Januar',
    day: 1,
    category: 'Lohn/Bonus',
    amount: '',
    description: ''
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('finance_budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('finance_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('finance_incomes', JSON.stringify(incomes));
  }, [incomes]);

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  // Vorherigen Monat ermitteln
  const currentMonthIndex = monthNames.indexOf(selectedMonthView);
  const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const prevMonth = monthNames[prevMonthIndex];

  // Tage für ausgewählten Monat
  const daysInMonthCount = new Date(2026, currentMonthIndex + 1, 0).getDate();
  const daysInCurrentMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  // Monat wechseln
  const handleMonthChange = (month) => {
    setSelectedMonthView(month);
    setNewExpense((prev) => ({ ...prev, month: month }));
    setNewIncome((prev) => ({ ...prev, month: month }));
  };

  // Ausgaben hinzufügen
  const addExpense = () => {
    if (!newExpense.amount || isNaN(newExpense.amount)) return;
    const expenseToAdd = {
      ...newExpense,
      id: Date.now(),
      amount: Number(newExpense.amount),
      day: Number(newExpense.day)
    };
    setExpenses([...expenses, expenseToAdd]);
    setNewExpense({
      ...newExpense,
      amount: '',
      description: ''
    });
  };

  // Ausgabe löschen
  const deleteExpense = (id) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  // Einnahmen hinzufügen
  const addIncome = () => {
    if (!newIncome.amount || isNaN(newIncome.amount)) return;
    const incomeToAdd = {
      ...newIncome,
      id: Date.now(),
      amount: Number(newIncome.amount),
      day: Number(newIncome.day)
    };
    setIncomes([...incomes, incomeToAdd]);
    setNewIncome({
      ...newIncome,
      amount: '',
      description: ''
    });
  };

  // Einnahme löschen
  const deleteIncome = (id) => {
    setIncomes(incomes.filter((inc) => inc.id !== id));
  };

  // Ausgaben filtern nach Periode (25. des Vormonats bis 24. des aktuellen Monats)
  const filteredExpensesForMonth = expenses.filter((exp) => {
    if (exp.month === prevMonth && exp.day >= 25) return true;
    if (exp.month === selectedMonthView && exp.day <= 24) return true;
    return false;
  });

  // Einnahmen filtern nach Periode (25. des Vormonats bis 24. des aktuellen Monats)
  const filteredIncomesForMonth = incomes.filter((inc) => {
    if (inc.month === prevMonth && inc.day >= 25) return true;
    if (inc.month === selectedMonthView && inc.day <= 24) return true;
    return false;
  });

  // Tatsächliche Ausgaben Berechnen
  const actualSpent = filteredExpensesForMonth.reduce(
    (acc, exp) => {
      if (exp.category === 'Food/Drinks') acc.foodDrinks += exp.amount;
      if (exp.category === 'Einkäufe') acc.einkaeufe += exp.amount;
      if (exp.category === 'Seite legen') acc.seite += exp.amount;
      return acc;
    },
    { foodDrinks: 0, einkaeufe: 0, seite: 0 }
  );

  // Tatsächliche Einnahmen Berechnen
  const actualIncomeTotal = filteredIncomesForMonth.reduce(
    (acc, inc) => acc + inc.amount,
    0
  );

  // Verbleibendes Budget
  const remainingFoodDrinks = budget.foodDrinks - actualSpent.foodDrinks;
  const remainingEinkaeufe = budget.einkaeufe - actualSpent.einkaeufe;
  const remainingSeite = budget.seite - actualSpent.seite;

  // Effetiver Gesamteinkommen-Wert inklusive der eingetragenen Plus-Einnahmen
  const totalIncomeEffective = budget.lohn + actualIncomeTotal;

  // Berechnungen
  const totalAusgabenPlan = budget.foodDrinks + budget.einkaeufe + budget.seite;
  const reinesSparen = totalIncomeEffective - totalAusgabenPlan;

  // Sparen Übersicht Daten Generieren
  const generateSavingsData = () => {
    let cumulativeSavings = 0;
    return monthNames.map((m) => {
      cumulativeSavings += reinesSparen;
      return {
        month: m,
        monthly: reinesSparen,
        endOfMonth: cumulativeSavings
      };
    });
  };

  const savingsData = generateSavingsData();

  return (
    <div
      style={{
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        minHeight: '100vh',
        fontFamily: 'Segoe UI, sans-serif',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* HEADER */}
      <header
        style={{
          backgroundColor: '#2d2d2d',
          padding: '15px 20px',
          borderBottom: '1px solid #3c3c3c',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', color: '#4ec9b0' }}>
          Finanz-Tracker
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('Sparen')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'Sparen' ? '#107c41' : '#3c3c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sparen
          </button>
          <button
            onClick={() => setActiveTab('Budget')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'Budget' ? '#107c41' : '#3c3c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Budget
          </button>
          <button
            onClick={() => setActiveTab('Einnahmen')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'Einnahmen' ? '#107c41' : '#3c3c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Einnahmen
          </button>
          <button
            onClick={() => setActiveTab('Ausgaben')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'Ausgaben' ? '#107c41' : '#3c3c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Ausgaben
          </button>
        </div>
      </header>

      {/* CONTENT AREA */}
      <main style={{ padding: '20px', flex: 1 }}>
        {/* REITER: SPAREN */}
        {activeTab === 'Sparen' && (
          <div>
            <h2>Ersparnisse Übersicht</h2>
            <div
              style={{
                backgroundColor: '#252526',
                padding: '15px',
                borderRadius: '8px',
                overflowX: 'auto'
              }}
            >
              {savingsData.map((row) => {
                return (
                  <div key={row.month}>
                    <table>
                      <tbody>
                        {savingsData.map((row) => (
                          <tr key={row.month}>
                            <td>{row.month}</td>
                            <td>{row.monthly} Fr.</td>
                            <td>
                              {row.endOfMonth} Fr.
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REITER: BUDGET */}
        {activeTab === 'Budget' && (
          <div>
            <h2>Monatliche Budgetplanung ({selectedMonthView})</h2>
            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '-10px', marginBottom: '15px' }}>
              * Budget-Periode berechnet Ausgaben und Einnahmen vom 25. {prevMonth} bis zum 24. {selectedMonthView}.
            </p>
            <div
              style={{
                backgroundColor: '#252526',
                padding: '20px',
                borderRadius: '8px',
                maxWidth: '650px'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '20px'
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      color: '#aaa',
                      marginBottom: '6px'
                    }}
                  >
                    Einkommen (Lohn)
                  </label>
                  <input
                    type="number"
                    value={budget.lohn}
                    onChange={(e) =>
                      setBudget({ ...budget, lohn: Number(e.target.value) })
                    }
                    style={{
                      width: '100%',
                      backgroundColor: '#333',
                      color: '#fff',
                      border: '1px solid #444',
                      padding: '8px',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ fontSize: '11px', marginTop: '4px', color: '#4ec9b0' }}>
                    Gesamt (inkl. Einnahmen): {totalIncomeEffective} Fr. (Zusätzlich: +{actualIncomeTotal} Fr.)
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      color: '#aaa',
                      marginBottom: '6px'
                    }}
                  >
                    Food / Drinks
                  </label>
                  <input
                    type="number"
                    value={budget.foodDrinks}
                    onChange={(e) =>
                      setBudget({
                        ...budget,
                        foodDrinks: Number(e.target.value)
                      })
                    }
                    style={{
                      width: '100%',
                      backgroundColor: '#333',
                      color: '#fff',
                      border: '1px solid #444',
                      padding: '8px',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ fontSize: '11px', marginTop: '4px', color: remainingFoodDrinks < 0 ? '#f44336' : '#4ec9b0' }}>
                    Verbleibend: {remainingFoodDrinks} Fr. (Ausgegeben: {actualSpent.foodDrinks} Fr.)
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      color: '#aaa',
                      marginBottom: '6px'
                    }}
                  >
                    Einkäufe
                  </label>
                  <input
                    type="number"
                    value={budget.einkaeufe}
                    onChange={(e) =>
                      setBudget({
                        ...budget,
                        einkaeufe: Number(e.target.value)
                      })
                    }
                    style={{
                      width: '100%',
                      backgroundColor: '#333',
                      color: '#fff',
                      border: '1px solid #444',
                      padding: '8px',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ fontSize: '11px', marginTop: '4px', color: remainingEinkaeufe < 0 ? '#f44336' : '#4ec9b0' }}>
                    Verbleibend: {remainingEinkaeufe} Fr. (Ausgegeben: {actualSpent.einkaeufe} Fr.)
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      color: '#aaa',
                      marginBottom: '6px'
                    }}
                  >
                    Auf die Seite legen
                  </label>
                  <input
                    type="number"
                    value={budget.seite}
                    onChange={(e) =>
                      setBudget({ ...budget, seite: Number(e.target.value) })
                    }
                    style={{
                      width: '100%',
                      backgroundColor: '#333',
                      color: '#fff',
                      border: '1px solid #444',
                      padding: '8px',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ fontSize: '11px', marginTop: '4px', color: remainingSeite < 0 ? '#f44336' : '#4ec9b0' }}>
                    Verbleibend: {remainingSeite} Fr. (Ausgegeben: {actualSpent.seite} Fr.)
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid #3c3c3c',
                  paddingTop: '15px',
                  display: 'flex',
                  justify: 'space-between',
                  gap: '20px'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>
                    Insgesamt eingeplante Ausgaben:
                  </div>
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: '#ce9178'
                    }}
                  >
                    {totalAusgabenPlan} Fr.
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>
                    Restliches Sparen:
                  </div>
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: '#4ec9b0'
                    }}
                  >
                    {reinesSparen} Fr.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REITER: EINNAHMEN */}
        {activeTab === 'Einnahmen' && (
          <div>
            <h2>Einnahmen Eintragen & Verwalten</h2>

            {/* Formular zum Hinzufügen */}
            <div
              style={{
                backgroundColor: '#252526',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}
            >
              {/* Monat auswählen */}
              <select
                value={selectedMonthView}
                onChange={(e) => handleMonthChange(e.target.value)}
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #444',
                  padding: '8px',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                {monthNames.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Tag auswählen */}
              <select
                value={newIncome.day}
                onChange={(e) =>
                  setNewIncome({
                    ...newIncome,
                    day: Number(e.target.value)
                  })
                }
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #444',
                  padding: '8px',
                  borderRadius: '4px'
                }}
              >
                {daysInCurrentMonth.map((d) => (
                  <option key={d} value={d}>
                    {d}. Tag
                  </option>
                ))}
              </select>

              {/* Kategorie auswählen */}
              <select
                value={newIncome.category}
                onChange={(e) =>
                  setNewIncome({ ...newIncome, category: e.target.value })
                }
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #444',
                  padding: '8px',
                  borderRadius: '4px'
                }}
              >
                <option value="Lohn/Bonus">Lohn/Bonus</option>
                <option value="Geschenk">Geschenk</option>
                <option value="Rückerstattung">Rückerstattung</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>

              {/* Betrag */}
              <input
                type="number"
                placeholder="Betrag (Fr.)"
                value={newIncome.amount}
                onChange={(e) =>
                  setNewIncome({ ...newIncome, amount: e.target.value })
                }
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #444',
                  padding: '8px',
                  borderRadius: '4px',
                  width: '110px'
                }}
              />

              {/* Beschreibung */}
              <input
                type="text"
                placeholder="Beschreibung (z.B. Verkauf)"
                value={newIncome.description}
                onChange={(e) =>
                  setNewIncome({ ...newIncome, description: e.target.value })
                }
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #444',
                  padding: '8px',
                  borderRadius: '4px',
                  width: '200px'
                }}
              />

              <button
                onClick={addIncome}
                style={{
                  backgroundColor: '#107c41',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Plus size={16} /> Hinzufügen
              </button>
            </div>

            {/* Einnahmen Liste gefiltert nach Monat */}
            <div
              style={{
                backgroundColor: '#252526',
                padding: '15px',
                borderRadius: '8px'
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px', color: '#107c41' }}>
                Einnahmen im Monat: {selectedMonthView}
              </h3>
              {filteredIncomesForMonth.length === 0 ? (
                <div style={{ color: '#aaa', fontStyle: 'italic', padding: '10px 0' }}>
                  Keine Einnahmen für {selectedMonthView} eingetragen.
                </div>
              ) : (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left'
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid #3c3c3c',
                        color: '#aaa',
                        fontSize: '13px'
                      }}
                    >
                      <th style={{ padding: '8px' }}>Monat</th>
                      <th style={{ padding: '8px' }}>Tag</th>
                      <th style={{ padding: '8px' }}>Kategorie</th>
                      <th style={{ padding: '8px' }}>Beschreibung</th>
                      <th style={{ padding: '8px' }}>Betrag</th>
                      <th style={{ padding: '8px' }}>Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncomesForMonth.map((inc) => (
                      <tr
                        key={inc.id}
                        style={{ borderBottom: '1px solid #2d2d2d' }}
                      >
                        <td style={{ padding: '8px' }}>{inc.month}</td>
                        <td style={{ padding: '8px' }}>{inc.day}.</td>
                        <td style={{ padding: '8px' }}>{inc.category}</td>
                        <td style={{ padding: '8px', color: '#ccc' }}>
                          {inc.description || '-'}
                        </td>
                        <td
                          style={{
                            padding: '8px',
                            color: '#4ec9b0',
                            fontWeight: 'bold'
                          }}
                        >
                          +{inc.amount} Fr.
                        </td>
                        <td style={{ padding: '8px' }}>
                          <button
                            onClick={() => deleteIncome(inc.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#aaa',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* REITER: AUSGABEN */}
        {activeTab === 'Ausgaben' && (
          <div>
            <h2>Ausgaben Eintragen & Verwalten</h2>

            {/* Formular zum Hinzufügen */}
            <div
              style={{
                backgroundColor: '#252526',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}
            >
              {/* Monat auswählen */}
              <select
                value={selectedMonthView}
                onChange={(e) => handleMonthChange(e.target.value)}
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #444',
                  padding: '8px',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                {monthNames.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Tag auswählen */}
              <select
                value={newExpense.day}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    day: Number(e.target.value)
                  })
                }
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #444',
                  padding: '8px',
                  borderRadius: '4px'
                }}
              >
                {daysInCurrentMonth.map((d) => (
                  <option key={d} value={d}>
                    {d}. Tag
                  </option>
                ))}
              </select>

              {/* Kategorie auswählen */}
              <select
                value={newExpense.category}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, category: e.target.value })
                }
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #444',
                  padding: '8px',
                  borderRadius: '4px'
                }}
              >
                <option value="Food/Drinks">Food/Drinks</option>
                <option value="Einkäufe">Einkäufe</option>
                <option value="Seite legen">Seite legen</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>

              {/* Betrag */}
              <input
                type="number"
                placeholder="Betrag (Fr.)"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: e.target.value })
                }
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #444',
                  padding: '8px',
                  borderRadius: '4px',
                  width: '110px'
                }}
              />

              {/* Beschreibung */}
              <input
                type="text"
                placeholder="Beschreibung (z.B. Kopfhörer)"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, description: e.target.value })
                }
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: '1px solid #444',
                  padding: '8px',
                  borderRadius: '4px',
                  width: '200px'
                }}
              />

              <button
                onClick={addExpense}
                style={{
                  backgroundColor: '#107c41',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Plus size={16} /> Hinzufügen
              </button>
            </div>

            {/* Ausgaben Liste gefiltert nach Monat */}
            <div
              style={{
                backgroundColor: '#252526',
                padding: '15px',
                borderRadius: '8px'
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px', color: '#107c41' }}>
                Ausgaben im Monat: {selectedMonthView}
              </h3>
              {filteredExpensesForMonth.length === 0 ? (
                <div style={{ color: '#aaa', fontStyle: 'italic', padding: '10px 0' }}>
                  Keine Ausgaben für {selectedMonthView} eingetragen.
                </div>
              ) : (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left'
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid #3c3c3c',
                        color: '#aaa',
                        fontSize: '13px'
                      }}
                    >
                      <th style={{ padding: '8px' }}>Monat</th>
                      <th style={{ padding: '8px' }}>Tag</th>
                      <th style={{ padding: '8px' }}>Kategorie</th>
                      <th style={{ padding: '8px' }}>Beschreibung</th>
                      <th style={{ padding: '8px' }}>Betrag</th>
                      <th style={{ padding: '8px' }}>Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpensesForMonth.map((exp) => (
                      <tr
                        key={exp.id}
                        style={{ borderBottom: '1px solid #2d2d2d' }}
                      >
                        <td style={{ padding: '8px' }}>{exp.month}</td>
                        <td style={{ padding: '8px' }}>{exp.day}.</td>
                        <td style={{ padding: '8px' }}>{exp.category}</td>
                        <td style={{ padding: '8px', color: '#ccc' }}>
                          {exp.description || '-'}
                        </td>
                        <td
                          style={{
                            padding: '8px',
                            color: '#f44336',
                            fontWeight: 'bold'
                          }}
                        >
                          -{exp.amount} Fr.
                        </td>
                        <td style={{ padding: '8px' }}>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#aaa',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          backgroundColor: '#252526',
          borderTop: '1px solid #3c3c3c',
          display: 'flex',
          padding: '0 10px'
        }}
      >
        <button
          onClick={() => setActiveTab('Sparen')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderTop:
              activeTab === 'Sparen' ? '3px solid #107c41' : 'none',
            backgroundColor:
              activeTab === 'Sparen' ? '#1e1e1e' : 'transparent',
            color: activeTab === 'Sparen' ? '#fff' : '#aaa',
            cursor: 'pointer'
          }}
        >
          Sparen
        </button>
        <button
          onClick={() => setActiveTab('Budget')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderTop:
              activeTab === 'Budget' ? '3px solid #107c41' : 'none',
            backgroundColor:
              activeTab === 'Budget' ? '#1e1e1e' : 'transparent',
            color: activeTab === 'Budget' ? '#fff' : '#aaa',
            cursor: 'pointer'
          }}
        >
          Budget
        </button>
        <button
          onClick={() => setActiveTab('Einnahmen')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderTop:
              activeTab === 'Einnahmen' ? '3px solid #107c41' : 'none',
            backgroundColor:
              activeTab === 'Einnahmen' ? '#1e1e1e' : 'transparent',
            color: activeTab === 'Einnahmen' ? '#fff' : '#aaa',
            cursor: 'pointer'
          }}
        >
          Einnahmen
        </button>
        <button
          onClick={() => setActiveTab('Ausgaben')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderTop:
              activeTab === 'Ausgaben' ? '3px solid #107c41' : 'none',
            backgroundColor:
              activeTab === 'Ausgaben' ? '#1e1e1e' : 'transparent',
            color: activeTab === 'Ausgaben' ? '#fff' : '#aaa',
            cursor: 'pointer'
          }}
        >
          Ausgaben
        </button>
      </footer>
    </div>
  );
}