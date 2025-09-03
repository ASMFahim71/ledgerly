const express = require("express");
const { protect } = require("../middlewares/protect");
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  assignCategoryToTransaction,
  removeCategoryFromTransaction
} = require("../controllers/category.controller");

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/categories - Get all categories for the authenticated user
router.get('/', getAllCategories);

// GET /api/categories/stats - Get category statistics
router.get('/stats', getCategoryStats);

// POST /api/categories - Create a new category
router.post('/', createCategory);

// GET /api/categories/:id - Get a specific category
router.get('/:id', getCategory);

// PATCH /api/categories/:id - Update a category
router.patch('/:id', updateCategory);

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', deleteCategory);

// POST /api/categories/assign - Assign category to transaction
router.post('/assign', assignCategoryToTransaction);

// DELETE /api/categories/:transaction_id/:category_id - Remove category from transaction
router.delete('/:transaction_id/:category_id', removeCategoryFromTransaction);

module.exports = router;
