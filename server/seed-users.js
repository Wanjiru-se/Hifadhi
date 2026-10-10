const pool = require("./db");
const { randomUUID } = require("crypto");

async function seedUsers() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

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

    const kilimaniId = await getBranchId("Kilimani");

    // Business Admin
    const adminId = randomUUID();

    await client.query(
      `INSERT INTO users
        (user_id, business_id, name, email, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminId,
        businessId,
        "Ann Wanjiru",
        "owner@greenmart.co.ke",
        "Business Admin",
        "Active",
      ]
    );

    // Branch Manager
    const managerId = randomUUID();

    await client.query(
      `INSERT INTO users
        (user_id, business_id, name, email, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        managerId,
        businessId,
        "Peter Kamau",
        "peter@greenmart.co.ke",
        "Branch Manager",
        "Active",
      ]
    );

    // Peter is assigned specifically to Kilimani
    await client.query(
      `INSERT INTO user_branches
        (user_id, branch_id)
       VALUES ($1, $2)`,
      [managerId, kilimaniId]
    );

    await client.query("COMMIT");

    console.log("Users and branch access seeded successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("User seed failed:");
    console.error(error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedUsers();