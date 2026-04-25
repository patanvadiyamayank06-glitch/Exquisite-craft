import { Product } from "../models/Product.js";

export const getProducts = async (_req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (err) {
    console.error("getProducts error:", err.message);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, model, price, image, description, featured = false } = req.body;
    if (!name || !model || !price || !image || !description)
      return res.status(400).json({ message: "Missing required product fields" });

    const product = await Product.create({ name, model, price: Number(price), image, description, featured });
    return res.status(201).json(product);
  } catch (err) {
    console.error("createProduct error:", err.message);
    return res.status(500).json({ message: "Failed to create product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.update(id, req.body);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    return res.status(200).json(product);
  } catch (err) {
    console.error("updateProduct error:", err.message);
    return res.status(500).json({ message: "Failed to update product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.delete(id);
    if (!deleted)
      return res.status(404).json({ message: "Product not found" });

    return res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    console.error("deleteProduct error:", err.message);
    return res.status(500).json({ message: "Failed to delete product" });
  }
};

export const addProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment)
      return res.status(400).json({ message: "Rating and comment are required" });

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const updatedProduct = await Product.addReview(id, {
      userId: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment
    });

    return res.status(201).json(updatedProduct);
  } catch (err) {
    if (err.message === "Already reviewed")
      return res.status(400).json({ message: "You already reviewed this product" });

    console.error("addProductReview error:", err.message);
    return res.status(500).json({ message: "Failed to add review" });
  }
};
