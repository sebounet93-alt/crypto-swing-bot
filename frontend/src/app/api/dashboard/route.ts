import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Requêtes SQL sur tes tables (ajuste les noms si ton bot Python les a nommées autrement)
    const portfolioRes = await client.query('SELECT * FROM portfolio LIMIT 1');
    const positionsRes = await client.query('SELECT * FROM positions');
    
    client.release();

    const portfolioData = portfolioRes.rows.length > 0 ? portfolioRes.rows[0] : {};

    return NextResponse.json({
      portfolio: portfolioData,
      cash: portfolioData.cash_balance || portfolioData.cash || 0,
      positions: positionsRes.rows,
      logs: [],
      history: []
    });
  } catch (err) {
    console.error("Erreur de connexion DB:", err);
    return NextResponse.json({ error: "Impossible de lire la base de données" }, { status: 500 });
  }
}
