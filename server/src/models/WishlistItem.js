import { getPool } from "../config/db.js";

export const WishlistItem = {
  async find(criteria) {
    const pool = getPool();
    const userId = criteria.user;
    
    const result = await pool.query(
      `SELECT w.id, w.created_at, 
              p.id as product_id, p.name, p.model, p.price, p.image, 
              p.description, p.featured, p.rating, p.num_reviews,
              p.created_at as product_created_at, p.updated_at as product_updated_at
       FROM wishlist_items w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      user: userId,
      product: {
        id: row.product_id,
        name: row.name,
        model: row.model,
        price: row.price,
        image: row.image,
        description: row.description,
        featured: row.featured,
        rating: row.rating,
        numReviews: row.num_reviews,
        createdAt: row.product_created_at,
        updatedAt: row.product_updated_at
      },
      createdAt: row.created_at
    }));
  },

  async findOne(criteria) {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM wishlist_items WHERE user_id = $1 AND product_id = $2 LIMIT 1",
      [criteria.user, criteria.product]
    );
    return result.rows[0] || null;
  },

  async create({ user, product }) {
    const pool = getPool();
    try {
      const result = await pool.query(
        "INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2) RETURNING *",
        [user, product]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error("Already in wishlist");
      }
      throw error;
    }
  },

  async findOneAndDelete(criteria) {
    const pool = getPool();
    const result = await pool.query(
      "DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2 RETURNING *",
      [criteria.id, criteria.user]
    );
    return result.rows[0] || null;
  }
};
