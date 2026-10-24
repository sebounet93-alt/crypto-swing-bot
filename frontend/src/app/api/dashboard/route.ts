import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    cash: 785.40,
    positions: [
      { symbol: 'BTCUSDT', quantity: 0.0015, entry_price: 64200.00, current_price: 66800.00 },
      { symbol: 'SOLUSDT', quantity: 0.85, entry_price: 135.20, current_price: 142.10 }
    ],
    logs: [
      { id: 1, level: 'TRADE', message: 'ACHAT SOLUSDT @ 135.20$', created_at: new Date().toISOString() },
      { id: 2, level: 'INFO', message: 'Scan 4H/1D terminé sur 20 cryptomonnaies', created_at: new Date().toISOString() }
    ],
    history: []
  });
}
