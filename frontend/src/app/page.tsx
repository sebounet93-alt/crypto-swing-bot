'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);

  const refreshData = () => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d); })
      .catch(console.error);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
      const openPositionsValue = (positions || []).reduce((t, p) => t + ((Number(p.invested_amount) || 0) * ((Number(p.current_price) || Number(p.entry_price)) / (Number(p.entry_price) || 1))), 0);
  const liveTotalBalance = Number(portfolio?.cash_balance || 0) + openPositionsValue;
return () => clearInterval(interval);
  }, []);

  if (!data) {
    return <div className="p-8 font-mono text-emerald-400">Initialisation du terminal...</div>;
  }

  const positionsValue = data.positions.reduce((acc: number, p: any) => {
    return acc + (parseFloat(p.quantity) * parseFloat(p.current_price) * 0.998);
  }, 0);
    const openPositionsValue = (positions || []).reduce((t: number, p: any) => {
    const cur = Number(p.current_price) || Number(p.entry_price) || 0;
    const entry = Number(p.entry_price) || 1;
    const invested = Number(p.invested_amount) || (Number(p.amount || 0) * entry);
    return t + (invested * (cur / entry));
  }, 0);
  const totalValue = Number(portfolio?.cash_balance || 0) + openPositionsValue;
  const pnlTotal = totalValue - 1000;

    const openPositionsValue = (positions || []).reduce((t, p) => t + ((Number(p.invested_amount) || 0) * ((Number(p.current_price) || Number(p.entry_price)) / (Number(p.entry_price) || 1))), 0);
  const liveTotalBalance = Number(portfolio?.cash_balance || 0) + openPositionsValue;
return (
    <main className="p-6 max-w-7xl mx-auto font-mono space-y-6">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">SWING TRADING BOT // TERMINAL</h1>
          <p className="text-xs text-slate-400 mt-1">Binance REST - Scan 15m - Timeframes 4H/1D - Frais: 0.2%</p>
        </div>
        <div className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-emerald-400">
          Système Actif
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded">
          <p className="text-xs text-slate-400">VALEUR DU PORTEFEUILLE</p>
          <p className="text-2xl font-bold mt-1 text-white">{totalValue.toFixed(2)} €</p>
          <p className={`text-xs mt-1 ${pnlTotal >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
            {pnlTotal >= 0 ? '+' : ''}{pnlTotal.toFixed(2)} € ({(pnlTotal / 10).toFixed(2)}%)
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded">
          <p className="text-xs text-slate-400">CASH DISPONIBLE</p>
          <p className="text-2xl font-bold mt-1 text-sky-400">{data.cash.toFixed(2)} €</p>
          <p className="text-xs mt-1 text-slate-500">Investi : {positionsValue.toFixed(2)} €</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded">
          <p className="text-xs text-slate-400">POSITIONS OUVERTES</p>
          <p className="text-2xl font-bold mt-1 text-amber-400">{data.positions.length} / 20</p>
          <p className="text-xs mt-1 text-slate-500">Max 10% par trade</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded p-4">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">POSITIONS ACTIVES</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-2">ACTIF</th>
                  <th className="py-2">PRIX ENTRÉE</th>
                  <th className="py-2">PRIX ACTUEL</th>
                  <th className="py-2">PnL LATENT</th>
                </tr>
              </thead>
              <tbody>
                {data.positions.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-center text-slate-500">Aucune position ouverte.</td></tr>
                ) : (
                  data.positions.map((p: any) => {
                    const entry = parseFloat(p.entry_price);
                    const current = parseFloat(p.current_price);
                    const pnlPct = (((current * 0.998) - entry) / entry) * 100;
                      const openPositionsValue = (positions || []).reduce((t, p) => t + ((Number(p.invested_amount) || 0) * ((Number(p.current_price) || Number(p.entry_price)) / (Number(p.entry_price) || 1))), 0);
  const liveTotalBalance = Number(portfolio?.cash_balance || 0) + openPositionsValue;
return (
                      <tr key={p.symbol} className="border-b border-slate-800/50">
                        <td className="py-2 font-bold text-white">{p.symbol}</td>
                        <td className="py-2 text-slate-400">${entry.toFixed(4)}</td>
                        <td className="py-2 text-slate-300">${current.toFixed(4)}</td>
                        <td className={`py-2 font-bold ${pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                          {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-col h-80">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">LOGS D'EXÉCUTION DU BOT</h2>
          <div className="flex-1 overflow-y-auto space-y-1.5 text-xs text-slate-400">
            {data.logs.map((l: any) => (
              <div key={l.id} className="border-b border-slate-800/40 pb-1">
                <span className="text-slate-600">[{new Date(l.created_at).toLocaleTimeString()}]</span>{' '}
                <span className={l.level === 'TRADE' ? 'text-emerald-400 font-bold' : l.level === 'ERROR' ? 'text-rose-500' : 'text-slate-300'}>
                  {l.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}


