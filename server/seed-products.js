const pool = require("./db");
const { randomUUID } = require("crypto");

async function seedProducts() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Find the existing GreenMart business
    const businessResult = await client.query(
      `SELECT business_id
       FROM businesses
       WHERE email = $1`,
      ["owner@greenmart.co.ke"]
    );

    if (businessResult.rows.length === 0) {
      throw new Error("GreenMart business was not found.");
    }

    const businessId = businessResult.rows[0].business_id;

    // Find the existing Dairy category
    const categoryResult = await client.query(
      `SELECT category_id
       FROM categories
       WHERE business_id = $1
       AND name = $2`,
      [businessId, "Dairy"]
    );

    if (categoryResult.rows.length === 0) {
      throw new Error("Dairy category was not found.");
    }

    const dairyCategoryId = categoryResult.rows[0].category_id;

    const products = [
      {
        name: "Strawberry Yoghurt 500ml",
        sku: "YOG-001",
        unitCost: 120,
        unitPrice: 165,
        shelfLifeDays: 21,
      },
      {
        name: "Fresh Milk 1L",
        sku: "MLK-001",
        unitCost: 65,
        unitPrice: 90,
        shelfLifeDays: 8,
      },
    ];

    for (const product of products) {
      await client.query(
        `INSERT INTO products (
            product_id,
            business_id,
            category_id,
            name,
            sku,
            unit_cost,
            unit_price,
            shelf_life_days
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          randomUUID(),
          businessId,
          dairyCategoryId,
          product.name,
          product.sku,
          product.unitCost,
          product.unitPrice,
          product.shelfLifeDays,
        ]
      );
    }

    await client.query("COMMIT");
    console.log("Products seeded successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Product seed failed:");
    console.error(error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedProducts();