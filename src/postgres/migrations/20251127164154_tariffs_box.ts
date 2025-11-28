import type { Knex } from "knex";

export const up = async function (knex: Knex) {
    await knex.schema.createTable("tariffs_box", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("warehouse_name", 255).notNullable().index();
        table.string("geo_name", 255).nullable();
        table.date("date").notNullable().index();
        table.decimal("box_delivery_base", 12, 3).nullable();
        table.integer("box_delivery_coef_expr").nullable();
        table.decimal("box_delivery_liter", 12, 3).nullable();
        table.decimal("box_delivery_marketplace_base", 12, 3).nullable();
        table.integer("box_delivery_marketplace_coef_expr").nullable();
        table.decimal("box_delivery_marketplace_liter", 12, 3).nullable();
        table.decimal("box_storage_base", 12, 3).nullable();
        table.integer("box_storage_coef_expr").nullable();
        table.decimal("box_storage_liter", 12, 3).nullable();
        table.timestamps(true, true);
        table.unique(["warehouse_name", "date"]);
    });
};

export const down = async function (knex: Knex) {
    await knex.schema.dropTableIfExists("tariffs_box");
};
