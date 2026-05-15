import dotenv from "dotenv";
import { connectDB, getPool } from "../config/db.js";

dotenv.config();
await connectDB();

const pool = getPool();
const result = await pool.query(
  "UPDATE products SET image = $1 WHERE image LIKE $2 RETURNING name, image",
  ["/diy-heart-case.jpeg", "%a7d9049c5852d75bb6fdad25e23711c4%"]
);

console.log("Updated:", result.rows);
process.exit(0);
