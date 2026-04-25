import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB, getPool } from "../config/db.js";
import { User } from "../models/User.js";

dotenv.config();

await connectDB();

const email = "admin@exquisitecraft.com";
const password = "admin123";
const name = "Admin";

const exists = await User.findOne({ email });
if (exists) {
  const pool = getPool();
  await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
  console.log("User updated to admin:", email);
} else {
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed, role: "admin" });
  console.log("Admin created:", email, "/ password:", password);
}

process.exit(0);
