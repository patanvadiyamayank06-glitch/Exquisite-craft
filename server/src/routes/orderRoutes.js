import express from "express";
import { checkoutOrder, getAllOrders, getIncomeStats } from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, checkoutOrder);
router.get("/", protect, getAllOrders);
router.get("/income-stats", protect, adminOnly, getIncomeStats);

export default router;
