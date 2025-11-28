import _knex from "knex";
import knexConfig from "#config/knex/knexfile.js";

const knex = _knex(knexConfig);
export default knex;

function logMigrationResults(action: string, result: [number, string[]]) {
    if (result[1].length === 0) {
        console.log(["latest", "up"].includes(action) ? "All migrations are up to date" : "All migrations have been rolled back");
        return;
    }
    console.log(`Batch ${result[0]} ${["latest", "up"].includes(action) ? "ran" : "rolled back"} the following migrations:`);
    for (const migration of result[1]) {
        console.log("- " + migration);
    }
}
function logMigrationList(list: [{ name: string }[], { file: string }[]]) {
    console.log(`Found ${list[0].length} Completed Migration file/files.`);
    for (const migration of list[0]) {
        console.log("- " + migration.name);
    }
    console.log(`Found ${list[1].length} Pending Migration file/files.`);
    for (const migration of list[1]) {
        console.log("- " + migration.file);
    }
}

export interface TariffsBoxRow {
    id: string;
    warehouse_name: string;
    geo_name: string | null;
    date: string;
    box_delivery_base: number | null;
    box_delivery_coef_expr: number | null;
    box_delivery_liter: number | null;
    box_delivery_marketplace_base: number | null;
    box_delivery_marketplace_coef_expr: number | null;
    box_delivery_marketplace_liter: number | null;
    box_storage_base: number | null;
    box_storage_coef_expr: number | null;
    box_storage_liter: number | null;
    created_at: Date | null;
    updated_at: Date | null;
}

export type TariffsBoxInsert = Omit<TariffsBoxRow, "id" | "created_at" | "updated_at">;

export const TariffsBox = {
    async deleteByDate(date: string) {
        await knex("tariffs_box").where({ date }).del();
    },

    async insert(record: TariffsBoxInsert) {
        await knex("tariffs_box").insert(record).onConflict(["warehouse_name", "date"]).merge();
    },

    async getCurrentSorted(): Promise<TariffsBoxRow[]> {
        const today = new Date().toISOString().split("T")[0];
        return await knex("tariffs_box").where({ date: today }).orderByRaw("COALESCE(box_delivery_coef_expr, 999999) ASC");
    },

    async getByDate(date?: string): Promise<TariffsBoxRow[]> {
        const d = date || new Date().toISOString().split("T")[0];
        return await knex("tariffs_box").where({ date: d }).orderByRaw("COALESCE(box_delivery_coef_expr, 999999) ASC");
    },
};

function logSeedRun(result: [string[]]) {
    if (result[0].length === 0) {
        console.log("No seeds to run");
    }
    console.log(`Ran ${result[0].length} seed files`);
    for (const seed of result[0]) {
        console.log("- " + seed?.split(/\/|\\/).pop());
    }
    // Ran 5 seed files
}

function logSeedMake(name: string) {
    console.log(`Created seed: ${name.split(/\/|\\/).pop()}`);
}

export const migrate = {
    latest: async () => {
        logMigrationResults("latest", await knex.migrate.latest());
    },
    rollback: async () => {
        logMigrationResults("rollback", await knex.migrate.rollback());
    },
    down: async (name?: string) => {
        logMigrationResults("down", await knex.migrate.down({ name }));
    },
    up: async (name?: string) => {
        logMigrationResults("up", await knex.migrate.up({ name }));
    },
    list: async () => {
        logMigrationList(await knex.migrate.list());
    },
    make: async (name: string) => {
        if (!name) {
            console.error("Please provide a migration name");
            process.exit(1);
        }
        console.log(await knex.migrate.make(name, { extension: "js" }));
    },
};

export const seed = {
    run: async () => {
        logSeedRun(await knex.seed.run());
    },
    make: async (name: string) => {
        if (!name) {
            console.error("Please provide a seed name");
            process.exit(1);
        }
        logSeedMake(await knex.seed.make(name));
    },
};
