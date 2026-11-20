import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { inventoryItems, products, workOrders } from "../src/schema/footwear";

function columnNames(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).columns.map((column) => column.name).sort();
}

function indexConfig(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).indexes.map((entry) => ({
    name: entry.config.name,
    unique: entry.config.unique ?? false,
  }));
}

describe("footwear schema", () => {
  it("scopes products to an organization with a per-tenant style code", () => {
    expect(columnNames(products)).toEqual(
      [
        "construction",
        "created_at",
        "id",
        "name",
        "organization_id",
        "sole_type",
        "standard_cost",
        "style_code",
        "updated_at",
        "upper_material",
      ].sort()
    );

    const indexes = indexConfig(products);
    expect(indexes).toContainEqual({ name: "idx_products_org", unique: false });
    expect(indexes).toContainEqual({
      name: "uq_products_org_style_code",
      unique: true,
    });
  });

  it("tracks work orders through the production stages", () => {
    const config = getTableConfig(workOrders);
    const names = config.columns.map((column) => column.name);

    expect(names).toEqual(
      expect.arrayContaining([
        "organization_id",
        "order_number",
        "product_id",
        "pairs_requested",
        "stage",
        "status",
        "target_completion_date",
      ])
    );

    const stage = config.columns.find((column) => column.name === "stage");
    expect(stage?.default).toBe("Cutting");

    const orderNumber = config.columns.find(
      (column) => column.name === "order_number"
    );
    expect(orderNumber?.notNull).toBe(true);
  });

  it("stores inventory quantities in material-specific units", () => {
    const config = getTableConfig(inventoryItems);
    const unit = config.columns.find(
      (column) => column.name === "unit_of_measure"
    );

    expect(unit?.notNull).toBe(true);
    expect(indexConfig(inventoryItems)).toContainEqual({
      name: "uq_inventory_items_org_sku",
      unique: true,
    });
  });
});
