import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Upload, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [filterCategory, setFilterCategory] = useState('Alle');

  // Excel / CSV Import verarbeiten
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // Daten formatieren (Erwartet Spalten: Datum, Beschreibung, Betrag, Kategorie)
      const formattedData = data.map((item, index) => ({
        id: index,
        date: item.Datum || item.date || 'Unbekannt',
        description: item.Beschreibung || item.description || item.Text || 'Keine Angabe',
        amount: parseFloat(item.Betrag || item.amount || 0),
        category: item.Kategorie || item.category || 'Sonstiges'
      }));

      setTransactions(formattedData);
    };
    reader.readAsBinaryString(file);
  };

  // Berechnungen
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  // Daten für Kategorien (Ausgaben)
  const categories = [...new Set(transactions.map(t => t.category))];
  const expenseByCategory = categories.map(cat => {
    return transactions
      .filter(t => t.category === cat && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  const pieData = {
    labels: categories,
    datasets: [
      {
        data: expenseByCategory,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
      },
    ],
  };

  const filteredTransactions = filterCategory === 'Alle' 
    ? transactions 
    : transactions.filter(t => t.category === filterCategory);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e9ecef', paddingBottom: '15px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2b2d42' }}>
          <Wallet size={32} color="#4c6ef5" /> Mein Finanz-Tracker
        </h1>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', backgroundColor: '#4c6ef5', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          <Upload size={18} /> Excel / CSV hochladen
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </header>

      {/* Übersichtskarten */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <span style={{ color: '#6c757d', fontSize: '14px' }}>Einnahmen</span>
          <h2 style={{ color: '#2b8a3e', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <TrendingUp size={24} /> +{totalIncome.toFixed(2)} €
          </h2>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <span style={{ color: '#6c757d', fontSize: '14px' }}>Ausgaben</span>
          <h2 style={{ color: '#c92a2a', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <TrendingDown size={24} /> -{totalExpenses.toFixed(2)} €
          </h2>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <span style={{ color: '#6c757d', fontSize: '14px' }}>Gesamtsaldo</span>
          <h2 style={{ color: balance >= 0 ? '#2b8a3e' : '#c92a2a', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <DollarSign size={24} /> {balance.toFixed(2)} €
          </h2>
        </div>
      </div>

      {transactions.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          {/* Diagramm */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3>Ausgaben nach Kategorie</h3>
            <Pie data={pieData} />
          </div>

          {/* Transaktionsliste */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Transaktionen</h3>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '5px 10px', borderRadius: '6px' }}>
                <option value="Alle">Alle Kategorien</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto' }}>
              {filteredTransactions.map(t => (
                <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f3f5' }}>
                  <div>
                    <strong>{t.description}</strong>
                    <div style={{ fontSize: '12px', color: '#868e96' }}>{t.date} • {t.category}</div>
                  </div>
                  <span style={{ fontWeight: 'bold', color: t.amount >= 0 ? '#2b8a3e' : '#c92a2a' }}>
                    {t.amount >= 0 ? `+${t.amount.toFixed(2)}` : `${t.amount.toFixed(2)}`} €
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px' }}>
          <h3>Noch keine Daten geladen</h3>
          <p style={{ color: '#6c757d' }}>Lade eine Excel-Datei (.xlsx) mit den Spalten <strong>Datum, Beschreibung, Betrag, Kategorie</strong> hoch.</p>
        </div>
      )}
    </div>
  );
}
