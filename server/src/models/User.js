import { getPool } from "../config/db.js";

export const User = {
  async create({ name, email, password, role = "user" }) {
    const pool = getPool();
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, password, role]
    );
    return result.rows[0];
  },

  async findOne(criteria) {
    const pool = getPool();
    const keys = Object.keys(criteria);
    const values = Object.values(criteria);
    const conditions = keys.map((key, i) => `${key} = $${i + 1}`).join(" AND ");
    
    const result = await pool.query(
      `SELECT * FROM users WHERE ${conditions} LIMIT 1`,
      values
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }
};
