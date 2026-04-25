import { getPool } from "../config/db.js";

export const Product = {
  async find() {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async findById(id) {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async create({ name, model, price, image, description, featured = false }) {
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO products (name, model, price, image, description, featured) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, model, price, image, description, featured]
    );
    return result.rows[0];
  },

  async update(id, updates) {
    const pool = getPool();
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(", ");
    
    const result = await pool.query(
      `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const pool = getPool();
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },

  async getReviews(productId) {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC",
      [productId]
    );
    return result.rows;
  },

  async addReview(productId, { userId, name, rating, comment }) {
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      await client.query("BEGIN");

      // Check if user already reviewed
      const existing = await client.query(
        "SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2",
        [productId, userId]
      );

      if (existing.rows.length > 0) {
        throw new Error("Already reviewed");
      }

      // Add review
      await client.query(
        "INSERT INTO reviews (product_id, user_id, name, rating, comment) VALUES ($1, $2, $3, $4, $5)",
        [productId, userId, name, rating, comment]
      );

      // Update product rating
      const stats = await client.query(
        "SELECT COUNT(*) as count, AVG(rating) as avg FROM reviews WHERE product_id = $1",
        [productId]
      );

      await client.query(
        "UPDATE products SET num_reviews = $1, rating = $2 WHERE id = $3",
        [stats.rows[0].count, stats.rows[0].avg, productId]
      );

      await client.query("COMMIT");

      // Get updated product
      const product = await client.query("SELECT * FROM products WHERE id = $1", [productId]);
      return product.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
};
