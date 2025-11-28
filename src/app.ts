import env from "#config/env/env.js";
import { WbTarrifsParser } from "#parser/parser.js";
import { migrate, seed, TariffsBox } from "#postgres/knex.js";
import { GoogleSheetsWorker } from "#workers/google-sheets.worker.js";
import { TariffsWorker } from "#workers/update-tarrifs.worker.js";

console.clear();

const GOOGLE_SHEETS_IDS = env.GOOGLE_SHEETS?.split(",");

try {
    await migrate.latest();
    await seed.run();
    const parser = new WbTarrifsParser();
    const wbTariffsWorker = new TariffsWorker(parser, TariffsBox);
    const googleSheetsWorker = new GoogleSheetsWorker(GOOGLE_SHEETS_IDS || [], TariffsBox);

    wbTariffsWorker.updateTarrifs();
    googleSheetsWorker.sync();

    setInterval(
        async () => {
            await wbTariffsWorker.updateTarrifs();
            await googleSheetsWorker.sync();
        },
        60 * 60 * 1000,
    );
} catch (error) {
    console.error("Error during startup:", error);
}
