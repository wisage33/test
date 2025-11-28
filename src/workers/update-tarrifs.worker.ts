import { WbTarrifsParser } from "#parser/parser.js";
import { TariffsBox, TariffsBoxRow } from "#postgres/knex.js";
import { WbWarehouseTariff } from "#types/wb-tariffs.js";

export class TariffsWorker {
    constructor(
        private readonly wbTarrifsParser: WbTarrifsParser,
        private readonly tarrifsBox: typeof TariffsBox,
    ) {}
    async updateTarrifs() {
        const tariffsData = await this.wbTarrifsParser.parse();
        const today = new Date().toISOString().split("T")[0];
        const rows = tariffsData.warehouseList.map((w: WbWarehouseTariff) => {
            const toNumber = (val: string): number | null => {
                if (!val || val === "-" || val === "") return null;
                return Number(val.replace(",", "."));
            };

            return {
                warehouse_name: w.warehouseName.trim(),
                geo_name: w.geoName?.trim() || null,
                date: today,

                box_delivery_base: toNumber(w.boxDeliveryBase),
                box_delivery_coef_expr: toNumber(w.boxDeliveryCoefExpr),
                box_delivery_liter: toNumber(w.boxDeliveryLiter),

                box_delivery_marketplace_base: toNumber(w.boxDeliveryMarketplaceBase),
                box_delivery_marketplace_coef_expr: toNumber(w.boxDeliveryMarketplaceCoefExpr),
                box_delivery_marketplace_liter: toNumber(w.boxDeliveryMarketplaceLiter),

                box_storage_base: toNumber(w.boxStorageBase),
                box_storage_coef_expr: toNumber(w.boxStorageCoefExpr),
                box_storage_liter: toNumber(w.boxStorageLiter),
            };
        });

        await Promise.all(
            rows.map((row: TariffsBoxRow) => {
                this.tarrifsBox.insert(row);
            }),
        ).finally(() => {
            console.log("All tariffs have been processed.");
        });
    }
}
