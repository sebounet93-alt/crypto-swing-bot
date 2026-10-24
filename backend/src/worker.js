const cron = require('node-cron');
const { runTradingCycle, runDatabasePurge } = require('./engine');

(async () => {
    console.log('Démarrage du worker Swing Trading...');
    await runTradingCycle();

    cron.schedule('*/15 * * * *', async () => {
        await runTradingCycle();
    });

    cron.schedule('0 3 * * *', async () => {
        await runDatabasePurge();
    });
})();
