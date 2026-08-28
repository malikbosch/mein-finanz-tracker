import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { PiggyBank, Calculator, Receipt, Plus, Trash2, Download, Save } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('Sparen');
  const [isSaved, setIsSaved] = useState(false);

  // MONATSNAMEN
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  // Aktueller Monat als Standard
  const currentMonthName = monthNames[new Date().getMonth()];

  // --- SPAREN STATE WITH LOCALSTORAGE ---
  const [savingsData, setSavingsData] = useState(() => {
    const saved = localStorage.getItem('finanz_savings');
    return saved
      ? JSON.parse(saved)
      : {
          2026: [
            { month: 'Juni', savings: 450 },
            { month: 'Juli', savings: 0 },
            { month: 'August', savings: 0 },
            { month: 'September', savings: 0 },
            { month: 'Oktober', savings: 0 },
            { month: 'November', savings: 0 },
            { month: 'Dezember', savings: 0 }
          ],
          2027: [
            { month: 'Januar', savings: 0 },
            { month: 'Februar', savings: 0 },
            { month: 'März', savings: 0 },
            { month: 'April', savings: 0 },
            { month: 'Mai', savings: 0 },
            { month: 'Juni', savings: 0 },
            { month: 'Juli', savings: 0 },
            { month: 'August', savings: 0 },
            { month: 'September', savings: 0 },
            { month: 'Oktober', savings: 0 },
            { month: 'November', savings: 0 },
            { month: 'Dezember', savings: 0 }
          ],
          2028: [
            { month: 'Januar', savings: 0 },
            { month: 'Februar', savings: 0 },
            { month: 'März', savings: 0 },
            { month: 'April', savings: 0 },
            { month: 'Mai', savings: 0 },
            { month: 'Juni', savings: 0 },
            { month: 'Juli', savings: 0 },
            { month: 'August', savings: 0 }
          ]
        };
  });

  // --- BUDGET STATE WITH LOCALSTORAGE ---
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('finanz_budget');
    return saved
      ? JSON.parse(saved)
      : { lohn: 828, foodDrinks: 140, einkaeufe: 200, seite: 100 };
  });

  // --- AUSGABEN STATE WITH LOCALSTORAGE ---
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('finanz_expenses');
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, month: 'August', day: 25, amount: 139, category: 'Einkäufe', description: 'Migros Einkäufe' }
        ];
  });

  const [selectedMonthView, setSelectedMonthView] = useState('August');

  const [newExpense, setNewExpense] = useState({
    month: 'August',
    day: 25,
    amount: '',
    category: 'Einkäufe',
    description: ''
  });

  // BERECHNET DIE ANZAHL TAGE DES MONATS AUTOMATISCH
  const getDaysInMonth = (monthName) => {
    const monthIndex = monthNames.indexOf(monthName);
    if (monthIndex === -1) return 31;
    const year = new Date().getFullYear();
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  // MONATSWECHSEL
  const handleMonthChange = (selectedMonth) => {
    const maxDays = getDaysInMonth(selectedMonth);
    setSelectedMonthView(selectedMonth);
    setNewExpense({
      ...newExpense,
      month: selectedMonth,
      day: Math.min(newExpense.day, maxDays)
    });
  };

  // AUTOMATISCHES SPEICHERN IM HINTERGRUND
  useEffect(() => {
    localStorage.setItem('finanz_savings', JSON.stringify(savingsData));
    localStorage.setItem('finanz_budget', JSON.stringify(budget));
    localStorage.setItem('finanz_expenses', JSON.stringify(expenses));
  }, [savingsData, budget, expenses]);

  // MANUELLES SPEICHERN FUNKTION
  const handleManualSave = () => {
    localStorage.setItem('finanz_savings', JSON.stringify(savingsData));
    localStorage.setItem('finanz_budget', JSON.stringify(budget));
    localStorage.setItem('finanz_expenses', JSON.stringify(expenses));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Berechnungen für Sparraten
  const calculateAccumulatedSavings = (yearEntries) => {
    let runningTotal = 0;
    return yearEntries.map((entry) => {
      runningTotal += Number(entry.savings) || 0;
      return { ...entry, endOfMonth: runningTotal };
    });
  };

  const handleSavingChange = (year, index, value) => {
    const updatedYear = [...savingsData[year]];
    updatedYear[index].savings = Number(value) || 0;
    setSavingsData({ ...savingsData, [year]: updatedYear });
  };

  const addExpense = () => {
    if (!newExpense.amount) return;
    setExpenses([
      ...expenses,
      { ...newExpense, id: Date.now(), amount: Number(newExpense.amount) }
    ]);
    setNewExpense({ ...newExpense, amount: '', description: '' });
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  // LOGIK FÜR BUDGET-PERIODEN (AB DEM 25. DES MONATS RESETET SICH DAS BUDGET)
  // Das Budget eines Monats beinhaltet:
  // - Ausgaben vom 25. des Vormonats bis Ende des Vormonats
  // - Ausgaben vom 1. bis 24. des ausgewählten Monats
  const getPrevMonth = (currMonth) => {
    const idx = monthNames.indexOf(currMonth);
    return idx === 0 ? monthNames[11] : monthNames[idx - 1];
  };

  const prevMonth = getPrevMonth(selectedMonthView);

  const budgetExpenses = expenses.filter((exp) => {
    if (exp.month === prevMonth && exp.day >= 25) return true;
    if (exp.month === selectedMonthView && exp.day < 25) return true;
    return false;
  });

  // BERECHNUNG DER TATSÄCHLICHEN AUSGABEN FÜR DIE DIESE BUDGETPERIODE
  const actualSpent = budgetExpenses.reduce(
    (acc, exp) => {
      const amt = Number(exp.amount) || 0;
      if (exp.category === 'Food/Drinks') acc.foodDrinks += amt;
      else if (exp.category === 'Einkäufe') acc.einkaeufe += amt;
      else if (exp.category === 'Seite legen') acc.seite += amt;
      acc.total += amt;
      return acc;
    },
    { foodDrinks: 0, einkaeufe: 0, seite: 0, total: 0 }
  );

  // Verbleibendes Budget pro Kategorie
  const remainingFoodDrinks = Number(budget.foodDrinks) - actualSpent.foodDrinks;
  const remainingEinkaeufe = Number(budget.einkaeufe) - actualSpent.einkaeufe;
  const remainingSeite = Number(budget.seite) - actualSpent.seite;

  const totalAusgabenPlan =
    Number(budget.foodDrinks) + Number(budget.einkaeufe) + Number(budget.seite);
  const reinesSparen = Number(budget.lohn) - totalAusgabenPlan;

  // AUSGABEN NURFÜR DEN AKTUELL AUSGEWÄHLTEN MONAT ANZEIGEN
  const filteredExpensesForMonth = expenses.filter(
    (exp) => exp.month === selectedMonthView
  );

  // EXPORT FUNKTION
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Sparen Tab
    const flattenSavings = [];
    Object.keys(savingsData).forEach((year) => {
      const yearWithTotals = calculateAccumulatedSavings(savingsData[year]);
      yearWithTotals.forEach((item) => {
        flattenSavings.push({
          Jahr: year,
          Monat: item.month,
          'Sparrate (Fr.)': item.savings,
          'End of Month (Fr.)': item.endOfMonth
        });
      });
    });
    const wsSparen = XLSX.utils.json_to_sheet(flattenSavings);
    XLSX.utils.book_append_sheet(wb, wsSparen, 'Sparen');

    // 2. Budget Tab
    const budgetArray = [
      { Kategorie: 'Lohn / Einkommen', Betrag: budget.lohn },
      { Kategorie: 'Food / Drinks (Geplant)', Betrag: budget.foodDrinks },
      { Kategorie: 'Food / Drinks (Verbleibend)', Betrag: remainingFoodDrinks },
      { Kategorie: 'Einkäufe (Geplant)', Betrag: budget.einkaeufe },
      { Kategorie: 'Einkäufe (Verbleibend)', Betrag: remainingEinkaeufe },
      { Kategorie: 'Seite legen (Geplant)', Betrag: budget.seite },
      { Kategorie: 'Seite legen (Verbleibend)', Betrag: remainingSeite },
      { Kategorie: 'Gesamte Ausgaben Geplant', Betrag: totalAusgabenPlan },
      { Kategorie: 'Restliches Sparen', Betrag: reinesSparen }
    ];
    const wsBudget = XLSX.utils.json_to_sheet(budgetArray);
    XLSX.utils.book_append_sheet(wb, wsBudget, 'Budget');

    // 3. Ausgaben Tab
    const formattedExpenses = expenses.map((exp) => ({
      Monat: exp.month,
      Tag: `Tag ${exp.day}`,
      Kategorie: exp.category,
      Beschreibung: exp.description || '-',
      'Betrag (Fr.)': exp.amount
    }));
    const wsAusgaben = XLSX.utils.json_to_sheet(formattedExpenses);
    XLSX.utils.book_append_sheet(wb, wsAusgaben, 'Ausgaben');

    const fileName = `Finanzen-${selectedMonthView}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const daysInCurrentMonth = Array.from(
    { length: getDaysInMonth(newExpense.month) },
    (_, i) => i + 1
  );

  return (
    <div
      style={{
        fontFamily: 'Segoe UI, sans-serif',
        backgroundColor: '#1e1e1e',
        color: '#f1f1f1',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* HEADER */}
      <header
        style={{
          backgroundColor: '#2d2d2d',
          borderBottom: '1px solid #3c3c3c',
          padding: '12px 20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('Sparen')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'Sparen' ? '#107c41' : '#3c3c3c',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <PiggyBank size={18} /> Sparen
          </button>
          <button
            onClick={() => setActiveTab('Budget')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'Budget' ? '#107c41' : '#3c3c3c',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Calculator size={18} /> Budget
          </button>
          <button
            onClick={() => setActiveTab('Ausgaben')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'Ausgaben' ? '#107c41' : '#3c3c3c',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Receipt size={18} /> Ausgaben
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleManualSave}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isSaved ? '#28a745' : '#2563eb',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            <Save size={18} /> {isSaved ? 'Gespeichert! ✓' : 'Speichern'}
          </button>

          <button
            onClick={exportToExcel}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#0e639c',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={18} /> Excel Exportieren
          </button>
        </div>
      </header>

      {/* CONTENT AREA */}
      <main style={{ padding: '20px', flex: 1, overflowX: 'auto' }}>
        {/* REITER: SPAREN */}
        {activeTab === 'Sparen' && (
          <div>
            <h2>Gespartes Guthaben Übersicht</h2>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              {Object.keys(savingsData).map((year) => {
                const yearDataWithTotals = calculateAccumulatedSavings(
                  savingsData[year]
                );
                return (
                  <div
                    key={year}
                    style={{
                      backgroundColor: '#252526',
                      padding: '15px',
                      borderRadius: '8px',
                      minWidth: '280px'
                    }}
                  >
                    <h3
                      style={{
                        textAlign: 'center',
                        color: '#107c41',
                        borderBottom: '1px solid #3c3c3c',
                        paddingBottom: '8px'
                      }}
                    >
                      {year}
                    </h3>
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
                            fontSize: '12px',
                            color: '#aaa'
                          }}
                        >
                          <th style={{ padding: '6px' }}>Monat</th>
                          <th style={{ padding: '6px' }}>Sparrate (Fr.)</th>
                          <th style={{ padding: '6px' }}>End of Month</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearDataWithTotals.map((row, idx) => (
                          <tr
                            key={row.month}
                            style={{ borderBottom: '1px solid #2d2d2d' }}
                          >
                            <td style={{ padding: '6px' }}>{row.month}</td>
                            <td style={{ padding: '6px' }}>
                              <input
                                type="number"
                                value={row.savings}
                                onChange={(e) =>
                                  handleSavingChange(year, idx, e.target.value)
                                }
                                style={{
                                  width: '70px',
                                  backgroundColor: '#333',
                                  color: '#fff',
                                  border: '1px solid #444',
                                  borderRadius: '4px',
                                  padding: '2px 5px'
                                }}
                              />
                            </td>
                            <td
                              style={{
                                padding: '6px',
                                fontWeight: 'bold',
                                color: '#4ec9b0'
                              }}
                            >
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
              * Budget-Periode berechnet Ausgaben vom 25. {prevMonth} bis zum 24. {selectedMonthView}.
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