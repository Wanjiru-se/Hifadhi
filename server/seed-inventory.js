const pool = require("./db");
const { randomUUID } = require("crypto");

async function seedInventory() {
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

    // Helper functions for retrieving existing IDs
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

    async function getBranchId(name) {
      const result = await client.query(
        `SELECT branch_id
         FROM branches
         WHERE business_id = $1 AND name = $2`,
        [businessId, name]
      );

      if (result.rows.length === 0) {
        throw new Error(`Branch ${name} was not found.`);
      }

      return result.rows[0].branch_id;
    }

    async function getSupplierId(name) {
      const result = await client.query(
        `SELECT supplier_id
         FROM suppliers
         WHERE business_id = $1 AND name = $2`,
        [businessId, name]
      );

      if (result.rows.length === 0) {
        throw new Error(`Supplier ${name} was not found.`);
      }

      return result.rows[0].supplier_id;
    }

    const yoghurtId = await getProductId("YOG-001");
    const milkId = await getProductId("MLK-001");

    const kilimaniId = await getBranchId("Kilimani");
    const karenId = await getBranchId("Karen");

    const brooksideId = await getSupplierId("Brookside Dairy");
    const freshFarmsId = await getSupplierId("Fresh Farms Kenya");

    const batches = [
  {
    batchNumber: "BATCH-001",
    productId: yoghurtId,
    branchId: kilimaniId,
    supplierId: brooksideId,
    quantity: 120,
    unitCost: 120,
    receivedDate: "2026-09-16",
    expiryDate: "2026-09-30",
  },
  {
    batchNumber: "BATCH-002",
    productId: milkId,
    branchId: karenId,
    supplierId: freshFarmsId,
    quantity: 80,
    unitCost: 65,
    receivedDate: "2026-09-22",
    expiryDate: "2026-09-30",
  },
];

    for (const batch of batches) {
  await client.query(
    `INSERT INTO inventory_batches (
        batch_id,
        batch_number,
        product_id,
        branch_id,
        supplier_id,
        quantity,
        unit_cost,
        received_date,
        expiry_date
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      randomUUID(),
      batch.batchNumber,
      batch.productId,
      batch.branchId,
      batch.supplierId,
      batch.quantity,
      batch.unitCost,
      batch.receivedDate,
      batch.expiryDate,
    ]
  );
}

    await client.query("COMMIT");
    console.log("Inventory batches seeded successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Inventory seed failed:");
    console.error(error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedInventory();