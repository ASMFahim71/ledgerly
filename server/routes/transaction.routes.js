const express = require("express");
const { protect } = require("../middlewares/protect");
const {
  getAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
} = require("../controllers/transaction.controller");

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/transactions - Get all transactions for the authenticated user
router.get('/', getAllTransactions);

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', getTransactionStats);

// POST /api/transactions - Create a new transaction
router.post('/', createTransaction);

// GET /api/transactions/:id - Get a specific transaction
router.get('/:id', getTransaction);

// PATCH /api/transactions/:id - Update a transaction
router.patch('/:id', updateTransaction);

// DELETE /api/transactions/:id - Delete a transaction
router.delete('/:id', deleteTransaction);

module.exports = router;
