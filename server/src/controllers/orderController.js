import { CartItem } from "../models/CartItem.js";
import { Order } from "../models/Order.js";
import { getPool } from "../config/db.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json(orders);
  } catch (err) {
    console.error("getAllOrders error:", err.message);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getIncomeStats = async (req, res) => {
  try {
    const pool = getPool();

    // Monthly income for current year
    const monthlyResult = await pool.query(`
      SELECT
        EXTRACT(MONTH FROM created_at) AS month,
        TO_CHAR(created_at, 'Mon') AS month_name,
        SUM(total_price) AS income,
        COUNT(*) AS order_count
      FROM orders
      WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY EXTRACT(MONTH FROM created_at), TO_CHAR(created_at, 'Mon')
      ORDER BY month ASC
    `);

    // Yearly income for last 5 years
    const yearlyResult = await pool.query(`
      SELECT
        EXTRACT(YEAR FROM created_at) AS year,
        SUM(total_price) AS income,
        COUNT(*) AS order_count
      FROM orders
      GROUP BY EXTRACT(YEAR FROM created_at)
      ORDER BY year DESC
      LIMIT 5
    `);

    // Current month income
    const currentMonthResult = await pool.query(`
      SELECT COALESCE(SUM(total_price), 0) AS income, COUNT(*) AS order_count
      FROM orders
      WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    // Current year income
    const currentYearResult = await pool.query(`
      SELECT COALESCE(SUM(total_price), 0) AS income, COUNT(*) AS order_count
      FROM orders
      WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    return res.status(200).json({
      monthly: monthlyResult.rows,
      yearly: yearlyResult.rows,
      currentMonth: currentMonthResult.rows[0],
      currentYear: currentYearResult.rows[0]
    });
  } catch (err) {
    console.error("getIncomeStats error:", err.message);
    return res.status(500).json({ message: "Failed to fetch income stats" });
  }
};

export const checkoutOrder = async (req, res) => {
  try {
    const { customerName, address, phone } = req.body;
    if (!customerName || !address || !phone)
      return res.status(400).json({ message: "Name, address and phone are required" });

    const cartItems = await CartItem.find();
    if (cartItems.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity), 0
    );

    const items = cartItems.map((item) => ({
      productId: item.product_id,
      name: item.name,
      model: item.model,
      price: item.price,
      quantity: item.quantity,
      customDesignUrl: item.custom_design_url || ""
    }));

    const order = await Order.create({ customerName, address, phone, items, totalPrice });
    await CartItem.deleteMany();

    return res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("checkoutOrder error:", err.message);
    return res.status(500).json({ message: "Checkout failed" });
  }
};
