import { CartItem } from "../models/CartItem.js";

export const getCartItems = async (_req, res) => {
  try {
    const items = await CartItem.find();
    return res.status(200).json(items);
  } catch (err) {
    console.error("getCartItems error:", err.message);
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
};

export const addCartItem = async (req, res) => {
  try {
    const { productId, name, model, price, productImage, quantity = 1, customDesignUrl = "" } = req.body;

    if (!productId || !name || !model || !price || !productImage)
      return res.status(400).json({ message: "Missing required cart fields" });

    const existing = await CartItem.findOne({ productId, customDesignUrl: customDesignUrl || "" });

    if (existing) {
      existing.quantity += quantity;
      const updated = await CartItem.save(existing);
      return res.status(200).json(updated);
    }

    const cartItem = await CartItem.create({ productId, name, model, price, productImage, quantity, customDesignUrl });
    return res.status(201).json(cartItem);
  } catch (err) {
    console.error("addCartItem error:", err.message);
    return res.status(500).json({ message: "Failed to add to cart" });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    const item = await CartItem.updateById(id, { quantity });
    if (!item)
      return res.status(404).json({ message: "Cart item not found" });

    return res.status(200).json(item);
  } catch (err) {
    console.error("updateCartItemQuantity error:", err.message);
    return res.status(500).json({ message: "Failed to update cart" });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CartItem.deleteById(id);
    if (!deleted)
      return res.status(404).json({ message: "Cart item not found" });

    return res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("removeCartItem error:", err.message);
    return res.status(500).json({ message: "Failed to remove from cart" });
  }
};
