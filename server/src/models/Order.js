import { getPool } from "../config/db.js";

export const Order = {
  async find() {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    
    // Get items for each order with product images
    const orders = await Promise.all(
      result.rows.map(async (order) => {
        const items = await pool.query(
          `SELECT oi.*, 
                  COALESCE(p.image, '') AS product_image
           FROM order_items oi
           LEFT JOIN products p ON p.id::text = oi.product_id
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return {
          ...order,
          items: items.rows.map(item => ({
            productId: item.product_id,
            name: item.name,
            model: item.model,
            price: item.price,
            quantity: item.quantity,
            customDesignUrl: item.custom_design_url,
            image: item.custom_design_url || item.product_image
          }))
        };
      })
    );
    
    return orders;
  },

  async create({ customerName, address, phone, items, totalPrice }) {
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      await client.query("BEGIN");

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (customer_name, address, phone, total_price) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [customerName, address, phone, totalPrice]
      );
      
      const order = orderResult.rows[0];

      // Create order items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, name, model, price, quantity, custom_design_url) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [order.id, item.productId, item.name, item.model, item.price, item.quantity, item.customDesignUrl || ""]
        );
      }

      await client.query("COMMIT");

      // Return order with items
      return {
        ...order,
        items
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
};
