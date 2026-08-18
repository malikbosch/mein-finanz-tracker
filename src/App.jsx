import React, { useState } from 'react';
import { PiggyBank, Calculator, Receipt, Plus, Trash2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('Sparen');

  // --- SPAREN STATE ---
  const [savingsData, setSavingsData] = useState({
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
  });

  // --- BUDGET STATE ---
  const [budget, setBudget] = useState({
    lohn: 840,
    foodDrinks: 140,
    einkaeufe: 200,
    seite: 100
  });

  // --- AUSGABEN STATE ---
  const [expenses, setExpenses] = useState([
    { id: 1, month: 1, week: 1, day: 'Montag', amount: 15, category: 'Food/Drinks' },
    { id: 2, month: 1, week: 1, day: 'Dienstag', amount: 30, category: 'Einkäufe' }
  ]);
  const [newExpense, setNewExpense] = useState({ month: 1, week: 1, day: 'Montag', amount: '', category: 'Food/Drinks' });

  // Berechnung Sparen-Akkumulation
  const calculateAccumulatedSavings = (yearEntries) => {
    let runningTotal = 0;
    return yearEntries.map(entry => {
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
    setExpenses([...expenses, { ...newExpense, id: Date.now(), amount: Number(newExpense.amount) }]);
    setNewExpense({ ...newExpense, amount: '' });
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalAusgabenPlan = Number(budget.foodDrinks) + Number(budget.einkaeufe) + Number(budget.seite);
  const reinesSparen = Number(budget.lohn) - totalAusgabenPlan;

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#1e1e1e', color: '#f1f1f1', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER / NAVIGATION tabs (oben zum Switchen) */}
      <header style={{ backgroundColor: '#2d2d2d', borderBottom: '1px solid #3c3c3c', padding: '10px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={() => setActiveTab('Sparen')} 
          style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'Sparen' ? '#107c41' : '#3c3c3c', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PiggyBank size={18} /> Sparen
        </button>
        <button 
          onClick={() => setActiveTab('Budget')} 
          style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'Budget' ? '#107c41' : '#3c3c3c', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Calculator size={18} /> Budget
        </button>
        <button 
          onClick={() => setActiveTab('Ausgaben')} 
          style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'Ausgaben' ? '#107c41' : '#3c3c3c', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Receipt size={18} /> Ausgaben
        </button>
      </header>

      {/* CONTENT AREA */}
      <main style={{ padding: '20px', flex: 1, overflowX: 'auto' }}>
        
        {/* REITER: SPAREN */}
        {activeTab === 'Sparen' && (
          <div>
            <h2>Gespartes Guthaben Übersicht</h2>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              {Object.keys(savingsData).map(year => {
                const yearDataWithTotals = calculateAccumulatedSavings(savingsData[year]);
                return (
                  <div key={year} style={{ backgroundColor: '#252526', padding: '15px', borderRadius: '8px', minWidth: '280px' }}>
                    <h3 style={{ textAlign: 'center', color: '#107c41', borderBottom: '1px solid #3c3c3c', paddingBottom: '8px' }}>{year}</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #3c3c3c', fontSize: '12px', color: '#aaa' }}>
                          <th style={{ padding: '6px' }}>Monat</th>
                          <th style={{ padding: '6px' }}>Sparrate (€)</th>
                          <th style={{ padding: '6px' }}>End of Month (€)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearDataWithTotals.map((row, idx) => (
                          <tr key={row.month} style={{ borderBottom: '1px solid #2d2d2d' }}>
                            <td style={{ padding: '6px' }}>{row.month}</td>
                            <td style={{ padding: '6px' }}>
                              <input 
                                type="number" 
                                value={row.savings} 
                                onChange={(e) => handleSavingChange(year, idx, e.target.value)}
                                style={{ width: '70px', backgroundColor: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '2px 5px' }}
                              />
                            </td>
                            <td style={{ padding: '6px', fontWeight: 'bold', color: '#4ec9b0' }}>{row.endOfMonth} €</td>
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
            <h2>Monatliche Budgetplanung</h2>
            <div style={{ backgroundColor: '#252526', padding: '20px', borderRadius: '8px', maxWidth: '600px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Einkommen (Lohn)</label>
                  <input 
                    type="number" 
                    value={budget.lohn} 
                    onChange={(e) => setBudget({ ...budget, lohn: Number(e.target.value) })}
                    style={{ width: '100%', backgroundColor: '#333', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Food / Drinks</label>
                  <input 
                    type="number" 
                    value={budget.foodDrinks} 
                    onChange={(e) => setBudget({ ...budget, foodDrinks: Number(e.target.value) })}
                    style={{ width: '100%', backgroundColor: '#333', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Einkäufe</label>
                  <input 
                    type="number" 
                    value={budget.einkaeufe} 
                    onChange={(e) => setBudget({ ...budget, einkaeufe: Number(e.target.value) })}
                    style={{ width: '100%', backgroundColor: '#333', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Auf die Seite legen</label>
                  <input 
                    type="number" 
                    value={budget.seite} 
                    onChange={(e) => setBudget({ ...budget, seite: Number(e.target.value) })}
                    style={{ width: '100%', backgroundColor: '#333', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #3c3c3c', paddingTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>Insgesamt eingeplante Ausgaben:</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ce9178' }}>{totalAusgabenPlan} €</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>Restliches Sparen:</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ec9b0' }}>{reinesSparen} €</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REITER: AUSGABEN */}
        {activeTab === 'Ausgaben' && (
          <div>
            <h2>Ausgaben nach Wochen & Monaten</h2>
            
            {/* Neue Ausgabe hinzufügen */}
            <div style={{ backgroundColor: '#252526', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select 
                value={newExpense.month} 
                onChange={(e) => setNewExpense({ ...newExpense, month: Number(e.target.value) })}
                style={{ backgroundColor: '#333', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px' }}
              >
                {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Monat {i+1}</option>)}
              </select>

              <select 
                value={newExpense.week} 
                onChange={(e) => setNewExpense({ ...newExpense, week: Number(e.target.value) })}
                style={{ backgroundColor: '#333', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px' }}
              >
                <option value={1}>Woche 1</option>
                <option value={2}>Woche 2</option>
                <option value={3}>Woche 3</option>
                <option value={4}>Woche 4</option>
              </select>

              <select 
                value={newExpense.day} 
                onChange={(e) => setNewExpense({ ...newExpense, day: e.target.value })}
                style={{ backgroundColor: '#333', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px' }}
              >
                {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <input 
                type="number" 
                placeholder="Betrag €" 
                value={newExpense.amount} 
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                style={{ backgroundColor: '#333', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px', width: '100px' }}
              />

              <button 
                onClick={addExpense}
                style={{ backgroundColor: '#107c41', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Plus size={16} /> Hinzufügen
              </button>
            </div>

            {/* Ausgaben Liste */}
            <div style={{ backgroundColor: '#252526', padding: '15px', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #3c3c3c', color: '#aaa', fontSize: '13px' }}>
                    <th style={{ padding: '8px' }}>Monat</th>
                    <th style={{ padding: '8px' }}>Woche</th>
                    <th style={{ padding: '8px' }}>Tag</th>
                    <th style={{ padding: '8px' }}>Kategorie</th>
                    <th style={{ padding: '8px' }}>Betrag</th>
                    <th style={{ padding: '8px' }}>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid #2d2d2d' }}>
                      <td style={{ padding: '8px' }}>Monat {exp.month}</td>
                      <td style={{ padding: '8px' }}>Woche {exp.week}</td>
                      <td style={{ padding: '8px' }}>{exp.day}</td>
                      <td style={{ padding: '8px' }}>{exp.category}</td>
                      <td style={{ padding: '8px', color: '#f44336', fontWeight: 'bold' }}>-{exp.amount} €</td>
                      <td style={{ padding: '8px' }}>
                        <button onClick={() => deleteExpense(exp.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER TAB-BAR (Exakt wie Excel unten) */}
      <footer style={{ backgroundColor: '#252526', borderTop: '1px solid #3c3c3c', display: 'flex', padding: '0 10px' }}>
        <button 
          onClick={() => setActiveTab('Sparen')} 
          style={{ padding: '8px 16px', border: 'none', borderTop: activeTab === 'Sparen' ? '3px solid #107c41' : 'none', backgroundColor: activeTab === 'Sparen' ? '#1e1e1e' : 'transparent', color: activeTab === 'Sparen' ? '#fff' : '#aaa', cursor: 'pointer' }}
        >
          Sparen
        </button>
        <button 
          onClick={() => setActiveTab('Budget')} 
          style={{ padding: '8px 16px', border: 'none', borderTop: activeTab === 'Budget' ? '3px solid #107c41' : 'none', backgroundColor: activeTab === 'Budget' ? '#1e1e1e' : 'transparent', color: activeTab === 'Budget' ? '#fff' : '#aaa', cursor: 'pointer' }}
        >
          Budget
        </button>
        <button 
          onClick={() => setActiveTab('Ausgaben')} 
          style={{ padding: '8px 16px', border: 'none', borderTop: activeTab === 'Ausgaben' ? '3px solid #107c41' : 'none', backgroundColor: activeTab === 'Ausgaben' ? '#1e1e1e' : 'transparent', color: activeTab === 'Ausgaben' ? '#fff' : '#aaa', cursor: 'pointer' }}
        >
          Ausgaben
        </button>
      </footer>
    </div>
  );
}
