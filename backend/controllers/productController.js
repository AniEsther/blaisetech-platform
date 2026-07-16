// controllers/productController.js — inventory items customers can order online.
const { Product } = require('../models');

// GET /api/products  (public)
async function getAllProducts(req, res, next) {
  try {
    const products = await Product.findAll({ order: [['category', 'ASC'], ['name', 'ASC']] });
    res.json(products);
  } catch (err) { next(err); }
}

// POST /api/products  (admin)
async function createProduct(req, res, next) {
  try {
    const { name, description, price, stockQuantity, category } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Product name and price are required.' });
    if (stockQuantity !== undefined && Number(stockQuantity) < 0) {
      return res.status(400).json({ message: 'Stock quantity cannot be negative.' });
    }
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const product = await Product.create({ name, description, price, stockQuantity, category, imageUrl });
    res.status(201).json(product);
  } catch (err) { next(err); }
}

// PUT /api/products/:id  (admin — e.g. update price or stock)
async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (req.body.stockQuantity !== undefined && Number(req.body.stockQuantity) < 0) {
      return res.status(400).json({ message: 'Stock quantity cannot be negative.' });
    }
    const updates = { ...req.body };
    if (req.file) updates.imageUrl = `/uploads/${req.file.filename}`;
    await product.update(updates);
    res.json(product);
  } catch (err) { next(err); }
}

// DELETE /api/products/:id  (admin)
async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    await product.destroy();
    res.json({ message: 'Product deleted.' });
  } catch (err) { next(err); }
}

module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct };
