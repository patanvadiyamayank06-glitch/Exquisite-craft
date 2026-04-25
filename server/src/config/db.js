import pg from "pg";
const { Pool } = pg;

let pool;

export const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in .env file");
    }

    // Strip unsupported params that pg driver doesn't handle
    const connectionString = process.env.DATABASE_URL
      .replace(/[&?]channel_binding=[^&]*/g, "")
      .replace(/\?&/, "?");

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
        require: true
      },
      application_name: "handmade-cases"
    });

    const result = await pool.query("SELECT NOW()");
    console.log("✓ PostgreSQL connected successfully");
    console.log("✓ Server time:", result.rows[0].now);

    // Create tables
    await createTables();
  } catch (error) {
    console.error("✗ PostgreSQL connection failed:", error.message);
    console.error("Please check your DATABASE_URL in .env file");
    process.exit(1);
  }
};

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        model VARCHAR(50) NOT NULL CHECK (model IN ('iPhone', 'Samsung', 'OnePlus')),
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        image TEXT NOT NULL,
        description TEXT NOT NULL,
        featured BOOLEAN DEFAULT false,
        rating DECIMAL(3, 2) DEFAULT 0,
        num_reviews INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, user_id)
      )
    `);

    // Cart items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        model VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        product_image TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        custom_design_url TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(50) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        model VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        custom_design_url TEXT DEFAULT ''
      )
    `);

    // Wishlist items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    await client.query("COMMIT");
    console.log("Database tables created successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating tables:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

export const getPool = () => {
  if (!pool) {
    throw new Error("Database pool not initialized. Call connectDB first.");
  }
  return pool;
};
