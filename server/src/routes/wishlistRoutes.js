import express from "express";
import {
  addWishlistItem,
  getWishlistItems,
  removeWishlistItem
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getWishlistItems);
router.post("/", protect, addWishlistItem);
router.delete("/:id", protect, removeWishlistItem);

export default router;
