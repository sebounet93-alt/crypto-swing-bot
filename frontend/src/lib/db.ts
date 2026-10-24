import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://botuser:botpassword@localhost:5432/trading_bot_db',
  max: 5
});
