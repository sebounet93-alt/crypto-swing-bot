const axios = require('axios');
const { pool, logBot } = require('./db');
const { analyzeTimeframe } = require('./indicators');

const FEE_RATE = 0.002;
const SYMBOLS = [
    'BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT',
    'ADAUSDT','DOGEUSDT','DOTUSDT','AVAXUSDT','POLUSDT',
    'LINKUSDT','UNIUSDT','LTCUSDT','ATOMUSDT','ETCUSDT',
    'XLMUSDT','ALGOUSDT','VETUSDT','FILUSDT','AAVEUSDT'
];

async function scanCrypto(symbol) {
    const [res4h, res1d] = await Promise.all([
        axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=4h&limit=100`, { timeout: 10000 }),
        axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=100`, { timeout: 10000 })
    ]);

    const tf4h = analyzeTimeframe(res4h.data);
    const tf1d = analyzeTimeframe(res1d.data);

    let buyScore = 0;
    let sellScore = 0;

    if (tf4h.rsi < 40) buyScore++;
    if (tf4h.rsi > 65) sellScore++;
    if (tf4h.macd.histogram > 0 && tf4h.macd.histogram >= tf4h.macd.prevHistogram) buyScore++;
    if (tf4h.macd.histogram < 0 && tf4h.macd.histogram <= tf4h.macd.prevHistogram) sellScore++;
    if (tf4h.currentPrice <= tf4h.bb.lower * 1.03) buyScore++;
    if (tf4h.currentPrice >= tf4h.bb.upper * 0.98) sellScore++;
    if (tf4h.ema20 > tf4h.ema50 && tf1d.ema20 >= tf1d.ema50) buyScore++;
    if (tf4h.ema20 < tf4h.ema50) sellScore++;
    if (tf4h.volumeSpike) {
        if (buyScore >= 2) buyScore++;
        if (sellScore >= 2) sellScore++;
    }

    return { symbol, price: tf4h.currentPrice, rsi: tf4h.rsi, macdHist: tf4h.macd.histogram, buyScore, sellScore };
}

async function runTradingCycle() {
    await logBot('INFO', 'Scan de marché (4H/1D) en cours sur 20 cryptomonnaies...');
    try {
        const results = (await Promise.all(SYMBOLS.map(s => scanCrypto(s).catch(() => null)))).filter(Boolean);
        const { rows: pRows } = await pool.query('SELECT cash_balance FROM portfolio WHERE id = 1');
        let cash = parseFloat(pRows[0].cash_balance);

        const { rows: openPositions } = await pool.query('SELECT * FROM positions');
        const posMap = new Map(openPositions.map(p => [p.symbol, p]));

        for (const item of results) {
            const { symbol, price, rsi, macdHist, buyScore, sellScore } = item;
            await pool.query(
                'INSERT INTO market_snapshots (symbol, price, rsi_4h, macd_hist_4h) VALUES ($1, $2, $3, $4)',
                [symbol, price, rsi, macdHist]
            );

            if (posMap.has(symbol)) {
                const pos = posMap.get(symbol);
                const entry = parseFloat(pos.entry_price);
                const qty = parseFloat(pos.quantity);

                await pool.query('UPDATE positions SET current_price = $1 WHERE symbol = $2', [price, symbol]);
                const pnlPct = (((qty * price * (1 - FEE_RATE)) - (qty * entry)) / (qty * entry)) * 100;

                if (sellScore >= 3 || pnlPct >= 12.0 || pnlPct <= -5.0) {
                    const netSale = qty * price * (1 - FEE_RATE);
                    const netPnlEur = netSale - (qty * entry);
                    cash += netSale;

                    await pool.query('DELETE FROM positions WHERE symbol = $1', [symbol]);
                    await pool.query('UPDATE portfolio SET cash_balance = $1, updated_at = NOW() WHERE id = 1', [cash]);
                    await pool.query(
                        'INSERT INTO trades_history (symbol, side, quantity, price, pnl_eur, pnl_pct) VALUES ($1, $2, $3, $4, $5, $6)',
                        [symbol, 'SELL', qty, price, netPnlEur.toFixed(2), pnlPct.toFixed(2)]
                    );
                    await logBot('TRADE', `VENTE ${symbol} @ ${price}$ | PnL: ${netPnlEur.toFixed(2)}€ (${pnlPct.toFixed(2)}%)`);
                }
            } else if (buyScore >= 3 && cash >= 20) {
                const investAmount = Number((cash * 0.10).toFixed(2));
                if (investAmount >= 10) {
                    const netInvest = investAmount * (1 - FEE_RATE);
                    const qty = netInvest / price;
                    cash -= investAmount;

                    await pool.query(
                        'INSERT INTO positions (symbol, quantity, entry_price, current_price) VALUES ($1, $2, $3, $4)',
                        [symbol, qty, price, price]
                    );
                    await pool.query('UPDATE portfolio SET cash_balance = $1, updated_at = NOW() WHERE id = 1', [cash]);
                    await pool.query(
                        'INSERT INTO trades_history (symbol, side, quantity, price, pnl_eur, pnl_pct) VALUES ($1, $2, $3, $4, 0, 0)',
                        [symbol, 'BUY', qty, price]
                    );
                    await logBot('TRADE', `ACHAT ${symbol} @ ${price}$ | Investi: ${investAmount}€`);
                }
            }
        }

        const { rows: currentPos } = await pool.query('SELECT quantity, current_price FROM positions');
        const posValue = currentPos.reduce((sum, p) => sum + (parseFloat(p.quantity) * parseFloat(p.current_price) * (1 - FEE_RATE)), 0);
        await pool.query('INSERT INTO balance_history (total_value) VALUES ($1)', [(cash + posValue).toFixed(2)]);
    } catch (err) {
        await logBot('ERROR', `Échec cycle: ${err.message}`);
    }
}

async function runDatabasePurge() {
    try {
        await pool.query("DELETE FROM market_snapshots WHERE recorded_at < NOW() - INTERVAL '30 days'");
        await pool.query("DELETE FROM bot_logs WHERE created_at < NOW() - INTERVAL '30 days'");
        await logBot('INFO', 'Purge des tables > 30 jours complétée.');
    } catch (err) {
        await logBot('ERROR', `Échec purge: ${err.message}`);
    }
}

module.exports = { runTradingCycle, runDatabasePurge };
