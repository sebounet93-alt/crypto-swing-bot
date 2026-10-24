'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState<any>({ portfolio: { cash_balance: 0 }, positions: [] });

  const refreshData = () => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        setData(d);
      })
      .catch(e => console.error("Erreur de chargement", e));
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, []);

  const safePositions = data?.positions || [];
  const safeCash = data?.portfolio?.cash_balance || data?.cash || 0;

  const openPositionsValue = safePositions.reduce((t: number, p: any) => {
    const cur = Number(p.current_price) || Number(p.entry_price) || 0;
    const entry = Number(p.entry_price) || 1;
    const invested = Number(p.invested_amount) || (Number(p.amount || 0) * entry);
    return t + (invested * (cur / entry));
  }, 0);

  const totalValue = Number(safeCash) + openPositionsValue;
  const pnlTotal = totalValue - 1000;
  const positionsValue = openPositionsValue;

  return (
    <main className="p-6 max-w-7xl mx-auto font-mono space-y-6">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">CRYPTO SWING BOT</h1>
          <p className="text-xs text-slate-400 mt-1">Binance REST - Scan 15m - Timeframes 4H/1D - Frais: 0.2%</p>
        </div>
        <div className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-emerald-400">
          Système Actif
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded">
          <p className="text-xs text-slate-400">VALEUR DU PORTEFEUILLE</p>
          <p className="text-2xl font-bold mt-1 text-white">{totalValue.toFixed(2)} €</p>
          <p className={`text-xs mt-1 ` + (pnlTotal >= 0 ? 'text-emerald-400' : 'text-rose-500')}>
            {pnlTotal >= 0 ? '+' : ''}{pnlTotal.toFixed(2)} € ({(pnlTotal / 10).toFixed(2)}%)
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded">
          <p className="text-xs text-slate-400">CASH DISPONIBLE</p>
          <p className="text-2xl font-bold mt-1 text-sky-400">{Number(safeCash).toFixed(2)} €</p>
          <p className="text-xs mt-1 text-slate-500">Investi : {positionsValue.toFixed(2)} €</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded">
          <p className="text-xs text-slate-400">POSITIONS OUVERTES</p>
          <p className="text-2xl font-bold mt-1 text-white">{safePositions.length}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white">POSITIONS ACTUELLES</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-500 border-b border-slate-800">
              <tr>
                <th className="py-2 px-4">ACTIF</th>
                <th className="py-2 px-4">PRIX ENTRÉE</th>
                <th className="py-2 px-4">PRIX ACTUEL</th>
                <th className="py-2 px-4">MONTANT INVESTI</th>
                <th className="py-2 px-4">PNL LATENT</th>
              </tr>
            </thead>
            <tbody>
              {safePositions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">Aucune position ouverte</td>
                </tr>
              ) : (
                safePositions.map((p: any) => {
                  const entry = Number(p.entry_price) || 1;
                  const current = Number(p.current_price) || entry;
                  const invested = Number(p.invested_amount) || (Number(p.amount || 0) * entry);
                  const pnlPct = (((current * 0.998) - entry) / entry) * 100;
                  const pnlEur = invested * (pnlPct / 100);
                  
                  return (
                    <tr key={p.symbol} className="border-b border-slate-800/50">
                      <td className="py-2 px-4 font-bold text-white">{p.symbol.replace('USDT', '')}</td>
                      <td className="py-2 px-4">{entry.toFixed(2)} €</td>
                      <td className="py-2 px-4">{current.toFixed(2)} €</td>
                      <td className="py-2 px-4">{invested.toFixed(2)} €</td>
                      <td className={`py-2 px-4 ` + (pnlEur >= 0 ? 'text-emerald-400' : 'text-rose-500')}>
                        {pnlEur >= 0 ? '+' : ''}{pnlEur.toFixed(2)} € ({pnlPct.toFixed(2)}%)
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
