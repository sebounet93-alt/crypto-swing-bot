CREATE TABLE IF NOT EXISTS portfolio (
    id INT PRIMARY KEY DEFAULT 1,
    cash_balance NUMERIC(15, 2) NOT NULL DEFAULT 1000.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO portfolio (id, cash_balance) VALUES (1, 1000.00) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS positions (
    symbol VARCHAR(20) PRIMARY KEY,
    quantity NUMERIC(18, 8) NOT NULL,
    entry_price NUMERIC(18, 8) NOT NULL,
    current_price NUMERIC(18, 8) NOT NULL,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trades_history (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    quantity NUMERIC(18, 8) NOT NULL,
    price NUMERIC(18, 8) NOT NULL,
    pnl_eur NUMERIC(15, 2),
    pnl_pct NUMERIC(8, 2),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS balance_history (
    id SERIAL PRIMARY KEY,
    total_value NUMERIC(15, 2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO balance_history (total_value) VALUES (1000.00);

CREATE TABLE IF NOT EXISTS market_snapshots (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    price NUMERIC(18, 8) NOT NULL,
    rsi_4h NUMERIC(6, 2),
    macd_hist_4h NUMERIC(18, 8),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bot_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(10) NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_snapshots_date ON market_snapshots(recorded_at);
CREATE INDEX IF NOT EXISTS idx_logs_date ON bot_logs(created_at DESC);
