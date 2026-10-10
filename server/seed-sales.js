const pool = require("./db");
const { randomUUID } = require("crypto");

async function seedSales() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Find GreenMart
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

    // Find Kilimani branch
    const branchResult = await client.query(
      `SELECT branch_id
       FROM branches
       WHERE business_id = $1 AND name = $2`,
      [businessId, "Kilimani"]
    );

    if (branchResult.rows.length === 0) {
      throw new Error("Kilimani branch was not found.");
    }

    const kilimaniId = branchResult.rows[0].branch_id;

    // Helper for finding products by SKU
    async function getProductId(sku) {
      const result = await client.query(
        `SELECT product_id
         FROM products
         WHERE business_id = $1 AND sku = $2`,
        [businessId, sku]
      );

      if (result.rows.length === 0) {
        throw new Error(`Product ${sku} was not found.`);
      }

      return result.rows[0].product_id;
    }

    const yoghurtId = await getProductId("YOG-001");
    const milkId = await getProductId("MLK-001");

    // Exact sales records from the existing Hifadhi demo data
    const sales = [
      {
        productId: yoghurtId,
        quantity: 11,
        saleDate: "2026-09-22",
      },
      {
        productId: milkId,
        quantity: 10,
        saleDate: "2026-09-22",
      },
      {
        productId: yoghurtId,
        quantity: 12,
        saleDate: "2026-09-21",
      },
      {
        productId: milkId,
        quantity: 11,
        saleDate: "2026-09-21",
      },
    ];

    for (const sale of sales) {
      await client.query(
        `INSERT INTO sales (
          sale_id,
          product_id,
          branch_id,
          quantity,
          sale_date
        )
        VALUES ($1, $2, $3, $4, $5)`,
        [
          randomUUID(),
          sale.productId,
          kilimaniId,
          sale.quantity,
          sale.saleDate,
        ]
      );
    }

    await client.query("COMMIT");

    console.log("Sales seeded successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Sales seed failed:");
    console.error(error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedSales();