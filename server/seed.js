const pool = require("./db");
const { randomUUID } = require("crypto");

async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Business
    const businessId = randomUUID();

    await client.query(
      `INSERT INTO businesses
        (business_id, name, business_type, email, phone, currency, timezone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        businessId,
        "GreenMart Groceries",
        "Grocery Retailer",
        "owner@greenmart.co.ke",
        "+254 712 345 678",
        "KSh",
        "Africa/Nairobi",
      ]
    );

    // Branches
    const branches = [
      ["Kilimani", "Kilimani, Nairobi", "Active"],
      ["Karen", "Karen, Nairobi", "Active"],
      ["Westlands", "Westlands, Nairobi", "Active"],
    ];

    for (const [name, location, status] of branches) {
      await client.query(
        `INSERT INTO branches
          (branch_id, business_id, name, location, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [randomUUID(), businessId, name, location, status]
      );
    }

    // Categories
    const categories = [
      "Dairy",
      "Meat & Poultry",
      "Vegetables",
      "Fruit",
      "Bakery",
      "Beverages",
    ];

    for (const name of categories) {
      await client.query(
        `INSERT INTO categories
          (category_id, business_id, name)
         VALUES ($1, $2, $3)`,
        [randomUUID(), businessId, name]
      );
    }

    // Suppliers
    const suppliers = [
      "Brookside Dairy",
      "Fresh Farms Kenya",
    ];

    for (const name of suppliers) {
      await client.query(
        `INSERT INTO suppliers
          (supplier_id, business_id, name)
         VALUES ($1, $2, $3)`,
        [randomUUID(), businessId, name]
      );
    }

    await client.query("COMMIT");

    console.log("Seed successful.");
    console.log("Business, branches, categories and suppliers added.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed failed:");
    console.error(error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();