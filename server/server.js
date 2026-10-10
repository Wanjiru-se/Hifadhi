const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 5000;

// Allow the React frontend to communicate with this server
app.use(cors());

// Allow the server to understand JSON sent by the frontend
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
  res.json({
    message: "Hifadhi API is running",
  });
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.product_id,
        p.name,
        p.sku,
        c.name AS category,
        p.unit_cost,
        p.unit_price,
        p.shelf_life_days
      FROM products p
      JOIN categories c
        ON p.category_id = c.category_id
      ORDER BY p.name
    `);

    const products = result.rows.map((product) => ({
  id: product.product_id,
  name: product.name,
  sku: product.sku,
  category: product.category,
  unitCost: Number(product.unit_cost),
  unitPrice: Number(product.unit_price),
  shelfLifeDays: product.shelf_life_days,
}));

res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.product_id,
        p.name,
        p.sku,
        c.name AS category,
        p.unit_cost,
        p.unit_price,
        p.shelf_life_days
      FROM products p
      JOIN categories c
        ON p.category_id = c.category_id
      ORDER BY p.name
    `);

    const products = result.rows.map((product) => ({
      id: product.product_id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitCost: Number(product.unit_cost),
      unitPrice: Number(product.unit_price),
      shelfLifeDays: product.shelf_life_days,
    }));

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

// Add a new product
app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      unitCost,
      unitPrice,
      shelfLifeDays,
    } = req.body;

    // Find the category and business that the product belongs to
    const categoryResult = await pool.query(
      `
        SELECT
          c.category_id,
          c.business_id
        FROM categories c
        WHERE c.name = $1
        LIMIT 1
      `,
      [category]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({
        message: "Category not found",
      });
    }

    const { category_id, business_id } = categoryResult.rows[0];

    // Create the product in PostgreSQL
    const result = await pool.query(
      `
        INSERT INTO products (
          product_id,
          business_id,
          category_id,
          name,
          sku,
          unit_cost,
          unit_price,
          shelf_life_days
        )
        VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
        RETURNING
          product_id,
          name,
          sku,
          unit_cost,
          unit_price,
          shelf_life_days
      `,
      [
        business_id,
        category_id,
        name,
        sku,
        unitCost,
        unitPrice,
        shelfLifeDays,
      ]
    );

    const savedProduct = result.rows[0];

    res.status(201).json({
      id: savedProduct.product_id,
      name: savedProduct.name,
      sku: savedProduct.sku,
      category,
      unitCost: Number(savedProduct.unit_cost),
      unitPrice: Number(savedProduct.unit_price),
      shelfLifeDays: savedProduct.shelf_life_days,
    });
  } catch (error) {
    console.error("Error adding product:", error);

    res.status(500).json({
      message: "Failed to add product",
    });
  }
});

// Update an existing product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      sku,
      category,
      unitCost,
      unitPrice,
      shelfLifeDays,
    } = req.body;

    // Find the selected category
    const categoryResult = await pool.query(
      `
        SELECT category_id
        FROM categories
        WHERE name = $1
        LIMIT 1
      `,
      [category]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({
        message: "Category not found",
      });
    }

    const categoryId = categoryResult.rows[0].category_id;

    // Update the product in PostgreSQL
    const result = await pool.query(
      `
        UPDATE products
        SET
          name = $1,
          sku = $2,
          category_id = $3,
          unit_cost = $4,
          unit_price = $5,
          shelf_life_days = $6
        WHERE product_id = $7
        RETURNING
          product_id,
          name,
          sku,
          unit_cost,
          unit_price,
          shelf_life_days
      `,
      [
        name,
        sku,
        categoryId,
        unitCost,
        unitPrice,
        shelfLifeDays,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const updatedProduct = result.rows[0];

    res.json({
      id: updatedProduct.product_id,
      name: updatedProduct.name,
      sku: updatedProduct.sku,
      category,
      unitCost: Number(updatedProduct.unit_cost),
      unitPrice: Number(updatedProduct.unit_price),
      shelfLifeDays: updatedProduct.shelf_life_days,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    res.status(500).json({
      message: "Failed to update product",
    });
  }
});

// Delete a product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        DELETE FROM products
        WHERE product_id = $1
        RETURNING product_id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    res.status(500).json({
      message: "Failed to delete product",
    });
  }
});
// Get all inventory batches
app.get("/api/inventory", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ib.batch_id,
        ib.batch_number,
        ib.quantity,
        ib.unit_cost,
        ib.received_date,
        ib.expiry_date,
        p.product_id,
        p.name AS product_name,
        b.branch_id,
        b.name AS branch_name,
        s.supplier_id,
        s.name AS supplier_name
      FROM inventory_batches ib
      JOIN products p
        ON ib.product_id = p.product_id
      JOIN branches b
        ON ib.branch_id = b.branch_id
      JOIN suppliers s
        ON ib.supplier_id = s.supplier_id
      ORDER BY ib.expiry_date
    `);

    const batches = result.rows.map((batch) => ({
  id: batch.batch_number,
  databaseId: batch.batch_id,
  batchNumber: batch.batch_number,
  productId: batch.product_id,
  productName: batch.product_name,
  branchId: batch.branch_id,
  branchName: batch.branch_name,
  supplierId: batch.supplier_id,
  supplier: batch.supplier_name,
  quantity: batch.quantity,
  unitCost: Number(batch.unit_cost),
  receivedDate: batch.received_date.toISOString().split("T")[0],
  expiryDate: batch.expiry_date.toISOString().split("T")[0],
}));
    res.json(batches);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      message: "Failed to fetch inventory",
    });
  }
});

// Add an inventory batch
app.post("/api/inventory", async (req, res) => {
  try {
    const {
      id,
      productId,
      branchId,
      quantity,
      unitCost,
      receivedDate,
      expiryDate,
      supplier,
    } = req.body;

    const supplierResult = await pool.query(
      `
        SELECT supplier_id
        FROM suppliers
        WHERE name = $1
        LIMIT 1
      `,
      [supplier]
    );

    if (supplierResult.rows.length === 0) {
      return res.status(400).json({
        message: "Supplier not found",
      });
    }

    const supplierId = supplierResult.rows[0].supplier_id;

    const result = await pool.query(
      `
        INSERT INTO inventory_batches (
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
        VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8
        )
        RETURNING batch_id
      `,
      [
        id,
        productId,
        branchId,
        supplierId,
        quantity,
        unitCost,
        receivedDate,
        expiryDate,
      ]
    );

    res.status(201).json({
      id,
      databaseId: result.rows[0].batch_id,
      productId,
      branchId,
      supplierId,
      supplier,
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      receivedDate,
      expiryDate,
    });
  } catch (error) {
    console.error("Error adding inventory batch:", error);

    res.status(500).json({
      message: "Failed to add inventory batch",
    });
  }
});

// Get all branches
app.get("/api/branches", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        branch_id,
        name,
        location,
        status
      FROM branches
      ORDER BY name
    `);

    const branches = result.rows.map((branch) => ({
      id: branch.branch_id,
      name: branch.name,
      location: branch.location,
      status: branch.status,
    }));

    res.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);

    res.status(500).json({
      message: "Failed to fetch branches",
    });
  }
});

// Update an inventory batch
app.put("/api/inventory/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      id: batchNumber,
      productId,
      branchId,
      quantity,
      unitCost,
      receivedDate,
      expiryDate,
      supplier,
    } = req.body;

    const supplierResult = await pool.query(
      `
        SELECT supplier_id
        FROM suppliers
        WHERE name = $1
        LIMIT 1
      `,
      [supplier]
    );

    if (supplierResult.rows.length === 0) {
      return res.status(400).json({
        message: "Supplier not found",
      });
    }

    const supplierId = supplierResult.rows[0].supplier_id;

    const result = await pool.query(
      `
        UPDATE inventory_batches
        SET
          batch_number = $1,
          product_id = $2,
          branch_id = $3,
          supplier_id = $4,
          quantity = $5,
          unit_cost = $6,
          received_date = $7,
          expiry_date = $8
        WHERE batch_id = $9
        RETURNING batch_id
      `,
      [
        batchNumber,
        productId,
        branchId,
        supplierId,
        quantity,
        unitCost,
        receivedDate,
        expiryDate,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Inventory batch not found",
      });
    }

    res.json({
      id: batchNumber,
      databaseId: result.rows[0].batch_id,
      productId,
      branchId,
      supplierId,
      supplier,
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      receivedDate,
      expiryDate,
    });
  } catch (error) {
    console.error("Error updating inventory batch:", error);

    res.status(500).json({
      message: "Failed to update inventory batch",
    });
  }
});

// Delete an inventory batch
app.delete("/api/inventory/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        DELETE FROM inventory_batches
        WHERE batch_id = $1
        RETURNING batch_id, batch_number
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Inventory batch not found",
      });
    }

    res.json({
      message: "Inventory batch deleted successfully",
      id: result.rows[0].batch_number,
    });
  } catch (error) {
    console.error("Error deleting inventory batch:", error);

    res.status(500).json({
      message: "Failed to delete inventory batch",
    });
  }
});

// Get all sales
app.get("/api/sales", async (req, res) => {
  try {
    const result = await pool.query(`
  SELECT
    s.sale_id,
    s.product_id,
    p.name AS product_name,
    s.branch_id,
    b.name AS branch_name,
    s.quantity,
    TO_CHAR(s.sale_date, 'YYYY-MM-DD') AS sale_date
  FROM sales s
  JOIN products p
    ON s.product_id = p.product_id
  JOIN branches b
    ON s.branch_id = b.branch_id
  ORDER BY s.sale_date DESC, s.sale_id
`);
    const sales = result.rows.map((sale) => ({
      id: sale.sale_id,
      productId: sale.product_id,
      productName: sale.product_name,
      branchId: sale.branch_id,
      branchName: sale.branch_name,
      quantity: sale.quantity,
      date: sale.sale_date,
    }));

    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);

    res.status(500).json({
      message: "Failed to fetch sales",
    });
  }
});

// Add a new sale
app.post("/api/sales", async (req, res) => {
  const client = await pool.connect();

  try {
    const { productId, branchId, quantity, date } = req.body;
    const units = Number(quantity);

    if (
      !productId ||
      !branchId ||
      !date ||
      !Number.isSafeInteger(units) ||
      units <= 0
    ) {
      return res.status(400).json({
        message: "Valid product, branch, quantity and date are required",
      });
    }

    await client.query("BEGIN");

    // 1. Find stock for this product and branch, earliest expiry first
    const stockResult = await client.query(
      `
        SELECT batch_id, quantity
        FROM inventory_batches
        WHERE product_id = $1
          AND branch_id = $2
          AND quantity > 0
        ORDER BY expiry_date ASC, received_date ASC, batch_id ASC
        FOR UPDATE
      `,
      [productId, branchId]
    );

    const available = stockResult.rows.reduce(
      (total, batch) => total + batch.quantity,
      0
    );

    if (available < units) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: `Insufficient stock. Only ${available} units available.`,
      });
    }

    // 2. Save the sale
    const saleResult = await client.query(
      `
        INSERT INTO sales (
          sale_id, product_id, branch_id, quantity, sale_date
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4)
        RETURNING
          sale_id,
          product_id,
          branch_id,
          quantity,
          TO_CHAR(sale_date, 'YYYY-MM-DD') AS sale_date
      `,
      [productId, branchId, units, date]
    );

    const sale = saleResult.rows[0];

    // 3. Deduct inventory using FEFO
    let remaining = units;
    const allocations = [];

    for (const batch of stockResult.rows) {
      if (remaining === 0) break;

      const taken = Math.min(batch.quantity, remaining);

      await client.query(
        `
          UPDATE inventory_batches
          SET quantity = quantity - $1
          WHERE batch_id = $2
        `,
        [taken, batch.batch_id]
      );

      // 4. Remember which batch supplied the units
      await client.query(
        `
          INSERT INTO sale_allocations (
            sale_id, batch_id, quantity_allocated
          )
          VALUES ($1, $2, $3)
        `,
        [sale.sale_id, batch.batch_id, taken]
      );

      allocations.push({
        batchId: batch.batch_id,
        units: taken,
      });

      remaining -= taken;
    }

    await client.query("COMMIT");

    res.status(201).json({
      id: sale.sale_id,
      productId: sale.product_id,
      branchId: sale.branch_id,
      quantity: sale.quantity,
      date: sale.sale_date,
      allocations,
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error adding sale:", error);

    res.status(500).json({
      message: "Failed to add sale",
    });
  } finally {
    client.release();
  }
});

// Update an existing sale
app.put("/api/sales/:id", async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const { id } = req.params;
    const { productId, branchId, quantity, date } = req.body;
    const units = Number(quantity);

    if (
      !productId ||
      !branchId ||
      !date ||
      !Number.isSafeInteger(units) ||
      units <= 0
    ) {
      return res.status(400).json({
        message: "Valid product, branch, quantity and date are required",
      });
    }

    await client.query("BEGIN");
    transactionStarted = true;

    // 1. Lock the existing sale
    const existingResult = await client.query(
      `
        SELECT sale_id, product_id, branch_id, quantity
        FROM sales
        WHERE sale_id = $1
        FOR UPDATE
      `,
      [id]
    );

    if (existingResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        message: "Sales record not found",
      });
    }

    // 2. Find the original batch allocations
    const allocationResult = await client.query(
      `
        SELECT batch_id, quantity_allocated
        FROM sale_allocations
        WHERE sale_id = $1
      `,
      [id]
    );

    const oldSale = existingResult.rows[0];
    const oldAllocations = allocationResult.rows;

    // Historical sales have no recorded FEFO allocations
    if (oldAllocations.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        message:
          "This historical sale cannot be edited because its original stock allocations are unavailable.",
      });
    }

    // 3. Restore stock from the original allocations
    for (const allocation of oldAllocations) {
      await client.query(
        `
          UPDATE inventory_batches
          SET quantity = quantity + $1
          WHERE batch_id = $2
        `,
        [allocation.quantity_allocated, allocation.batch_id]
      );
    }

    // 4. Remove the previous allocation records
    await client.query(
      `
        DELETE FROM sale_allocations
        WHERE sale_id = $1
      `,
      [id]
    );

    // 5. Find available stock for the updated sale
    const stockResult = await client.query(
      `
        SELECT batch_id, quantity
        FROM inventory_batches
        WHERE product_id = $1
          AND branch_id = $2
          AND quantity > 0
        ORDER BY expiry_date ASC, received_date ASC, batch_id ASC
        FOR UPDATE
      `,
      [productId, branchId]
    );

    const available = stockResult.rows.reduce(
      (total, batch) => total + batch.quantity,
      0
    );

    if (available < units) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        message: `Insufficient stock. Only ${available} units available.`,
      });
    }

    // 6. Update the sale
    const result = await client.query(
      `
        UPDATE sales
        SET
          product_id = $1,
          branch_id = $2,
          quantity = $3,
          sale_date = $4
        WHERE sale_id = $5
        RETURNING
          sale_id,
          product_id,
          branch_id,
          quantity,
          TO_CHAR(sale_date, 'YYYY-MM-DD') AS sale_date
      `,
      [productId, branchId, units, date, id]
    );

    const sale = result.rows[0];

    // 7. Allocate the updated quantity using FEFO
    let remaining = units;
    const allocations = [];

    for (const batch of stockResult.rows) {
      if (remaining === 0) break;

      const taken = Math.min(batch.quantity, remaining);

      await client.query(
        `
          UPDATE inventory_batches
          SET quantity = quantity - $1
          WHERE batch_id = $2
        `,
        [taken, batch.batch_id]
      );

      await client.query(
        `
          INSERT INTO sale_allocations (
            sale_id, batch_id, quantity_allocated
          )
          VALUES ($1, $2, $3)
        `,
        [id, batch.batch_id, taken]
      );

      allocations.push({
        batchId: batch.batch_id,
        units: taken,
      });

      remaining -= taken;
    }

    await client.query("COMMIT");
    transactionStarted = false;

    res.json({
      id: sale.sale_id,
      productId: sale.product_id,
      branchId: sale.branch_id,
      quantity: sale.quantity,
      date: sale.sale_date,
      allocations,
    });

  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    console.error("Error updating sale:", error);

    res.status(500).json({
      message: "Failed to update sales record",
    });
  } finally {
    client.release();
  }
});

app.delete("/api/sales/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // 1. Find and lock the sale
    const saleResult = await client.query(
      `
        SELECT sale_id
        FROM sales
        WHERE sale_id = $1
        FOR UPDATE
      `,
      [id]
    );

    if (saleResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Sales record not found",
      });
    }

    // 2. Find the original batch allocations
    const allocationResult = await client.query(
      `
        SELECT batch_id, quantity_allocated
        FROM sale_allocations
        WHERE sale_id = $1
      `,
      [id]
    );

    const allocations = allocationResult.rows;

    // Protect historical sales without allocation records
    if (allocations.length === 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message:
          "This historical sale cannot be deleted because its original stock allocations are unavailable.",
      });
    }

    // 3. Restore stock to the original batches
    for (const allocation of allocations) {
      await client.query(
        `
          UPDATE inventory_batches
          SET quantity = quantity + $1
          WHERE batch_id = $2
        `,
        [allocation.quantity_allocated, allocation.batch_id]
      );
    }

    // 4. Delete the sale
    // Its allocations are deleted automatically through ON DELETE CASCADE
    await client.query(
      `
        DELETE FROM sales
        WHERE sale_id = $1
      `,
      [id]
    );

    // 5. Save all changes together
    await client.query("COMMIT");

    res.json({
      message: "Sales record deleted successfully",
      id,
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error deleting sale:", error);

    res.status(500).json({
      message: "Failed to delete sales record",
    });
  } finally {
    client.release();
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Hifadhi API running on http://localhost:${PORT}`);
});