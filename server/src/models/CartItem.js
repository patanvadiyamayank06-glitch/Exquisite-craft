import { getPool } from "../config/db.js";

export const CartItem = {
  async find() {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM cart_items ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async findOne(criteria) {
    const pool = getPool();
    const keys = Object.keys(criteria);
    const values = Object.values(criteria);
    const conditions = keys.map((key, i) => {
      const dbKey = key === "productId" ? "product_id" :
                    key === "customDesignUrl" ? "custom_design_url" : key;
      return `${dbKey} = $${i + 1}`;
    }).join(" AND ");

    const result = await pool.query(
      `SELECT * FROM cart_items WHERE ${conditions} LIMIT 1`,
      values
    );
    return result.rows[0] || null;
  },

  async create({ productId, name, model, price, productImage, quantity = 1, customDesignUrl = "" }) {
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO cart_items (product_id, name, model, price, product_image, quantity, custom_design_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [productId, name, model, price, productImage, quantity, customDesignUrl]
    );
    return result.rows[0];
  },

  async updateById(id, updates) {
    const pool = getPool();
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(", ");

    const result = await pool.query(
      `UPDATE cart_items SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  },

  async save(item) {
    return await this.updateById(item.id, { quantity: item.quantity });
  },

  async deleteById(id) {
    const pool = getPool();
    const result = await pool.query(
      "DELETE FROM cart_items WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },

  async deleteMany() {
    const pool = getPool();
    await pool.query("DELETE FROM cart_items");
  }
};
