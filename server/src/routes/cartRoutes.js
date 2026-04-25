import express from "express";
import {
  addCartItem,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", getCartItems);
router.post("/", addCartItem);
router.patch("/:id", updateCartItemQuantity);
router.delete("/:id", removeCartItem);

export default router;
