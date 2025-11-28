import env from "#config/env/env.js";
import { TariffsBox } from "#postgres/knex.js";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const GOOGLE_EMAIL = env.GOOGLE_EMAIL || "";
const GOOGLE_PRIVATE_KEY = (env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

export class GoogleSheetsWorker {
    private isSyncing: boolean = false;

    constructor(
        private readonly sheetsIds: string[],
        private readonly tariffsBox: typeof TariffsBox,
    ) {}

    async sync() {
        if (this.isSyncing) {
            return;
        }

        this.isSyncing = true;
        const rows = await this.tariffsBox.getCurrentSorted();

        const prettyRows = rows.map((r) => ({
            "Склад": r.warehouse_name,
            "Регион": r.geo_name || "",
            "Дата": r.date.toString(),
            "Базовая доставка": r.box_delivery_base ?? "",
            "Коэф. доставки": r.box_delivery_coef_expr ?? "",
            "Литр доставки": r.box_delivery_liter ?? "",
            "MP Базовая": r.box_delivery_marketplace_base ?? "",
            "MP Коэф.": r.box_delivery_marketplace_coef_expr ?? "",
            "MP Литр": r.box_delivery_marketplace_liter ?? "",
            "Хранение база": r.box_storage_base ?? "",
            "Хранение коэф.": r.box_storage_coef_expr ?? "",
            "Хранение литр": r.box_storage_liter ?? "",
        }));

        for (const sheetId of this.sheetsIds) {
            await this.updateSheet(sheetId, prettyRows);
        }

        this.isSyncing = false;
    }

    private async updateSheet(sheetId: string, rows: any[]) {
        const auth = new JWT({
            email: GOOGLE_EMAIL,
            key: GOOGLE_PRIVATE_KEY,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const doc = new GoogleSpreadsheet(sheetId, auth);
        await doc.loadInfo();

        var sheet = doc.sheetsByTitle["stocks_coefs"];

        if (sheet === undefined) {
            sheet = await doc.addSheet({ title: "stocks_coefs" });
        }

        await sheet.clear();

        await sheet.setHeaderRow(Object.keys(rows[0]));

        const result = await sheet.addRows(rows);

        const gRows = await sheet.getRows();
    }
}
