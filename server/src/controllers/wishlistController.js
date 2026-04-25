import { WishlistItem } from "../models/WishlistItem.js";

export const getWishlistItems = async (req, res) => {
  try {
    const items = await WishlistItem.find({ user: req.user.id });
    return res.status(200).json(
      items.filter((item) => item.product).map((item) => ({
        id: item.id,
        product: item.product
      }))
    );
  } catch (err) {
    console.error("getWishlistItems error:", err.message);
    return res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

export const addWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId || isNaN(parseInt(productId))) {
      return res.status(400).json({ message: "Valid productId is required" });
    }

    const item = await WishlistItem.create({
      user: req.user.id,
      product: parseInt(productId)
    });

    return res.status(201).json(item);
  } catch (err) {
    if (err.message === "Already in wishlist") {
      return res.status(200).json({ message: "Already in wishlist" });
    }
    // Foreign key violation - product doesn't exist
    if (err.code === "23503") {
      return res.status(404).json({ message: "Product not found" });
    }
    console.error("addWishlistItem error:", err.message);
    return res.status(500).json({ message: "Failed to add to wishlist" });
  }
};

export const removeWishlistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await WishlistItem.findOneAndDelete({
      id,
      user: req.user.id
    });

    if (!removed) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    return res.status(200).json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("removeWishlistItem error:", err.message);
    return res.status(500).json({ message: "Failed to remove from wishlist" });
  }
};
