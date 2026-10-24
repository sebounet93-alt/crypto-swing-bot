function calculateSMA(data, period) {
    if (data.length < period) return null;
    const slice = data.slice(-period);
    return slice.reduce((acc, val) => acc + val, 0) / period;
}

function calculateEMA(data, period) {
    if (data.length < period) return [];
    const k = 2 / (period + 1);
    let ema = [data.slice(0, period).reduce((a, b) => a + b, 0) / period];
    for (let i = period; i < data.length; i++) {
        ema.push(data[i] * k + ema[ema.length - 1] * (1 - k));
    }
    return ema;
}

function calculateRSI(closes, period = 14) {
    if (closes.length <= period) return 50;
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        avgGain = (avgGain * (period - 1) + (diff >= 0 ? diff : 0)) / period;
        avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
    }
    if (avgLoss === 0) return 100;
    return 100 - (100 / (1 + (avgGain / avgLoss)));
}

function calculateMACD(closes) {
    const ema12 = calculateEMA(closes, 12);
    const ema26 = calculateEMA(closes, 26);
    if (!ema26.length) return { histogram: 0, prevHistogram: 0 };

    const offset = ema12.length - ema26.length;
    const macdLine = ema26.map((val, i) => ema12[i + offset] - val);
    const signalLine = calculateEMA(macdLine, 9);
    if (signalLine.length < 2) return { histogram: 0, prevHistogram: 0 };

    const curHist = macdLine[macdLine.length - 1] - signalLine[signalLine.length - 1];
    const prevHist = macdLine[macdLine.length - 2] - signalLine[signalLine.length - 2];
    return { histogram: curHist, prevHistogram: prevHist };
}

function calculateBollinger(closes, period = 20, multiplier = 2) {
    if (closes.length < period) return { upper: Infinity, lower: 0 };
    const slice = closes.slice(-period);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    return { upper: mean + multiplier * stdDev, lower: mean - multiplier * stdDev };
}

function analyzeTimeframe(klines) {
    const closes = klines.map(k => parseFloat(k[4]));
    const volumes = klines.map(k => parseFloat(k[5]));
    const currentPrice = closes[closes.length - 1];

    const ema20 = calculateEMA(closes, 20).slice(-1)[0] || currentPrice;
    const ema50 = calculateEMA(closes, 50).slice(-1)[0] || currentPrice;

    return {
        currentPrice,
        rsi: calculateRSI(closes),
        macd: calculateMACD(closes),
        bb: calculateBollinger(closes),
        ema20,
        ema50,
        volumeSpike: volumes[volumes.length - 1] > (calculateSMA(volumes.slice(0, -1), 20) * 1.15)
    };
}

module.exports = { analyzeTimeframe };
