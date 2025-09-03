const express = require("express");
const { protect } = require("../middlewares/protect");
const {
  getAllCashbooks,
  getCashbook,
  createCashbook,
  updateCashbook,
  deleteCashbook,
  getCashbookBalance
} = require("../controllers/cashbook.controller");

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/cashbooks - Get all cashbooks for the authenticated user
router.get('/', getAllCashbooks);

// POST /api/cashbooks - Create a new cashbook
router.post('/', createCashbook);

// GET /api/cashbooks/:id - Get a specific cashbook
router.get('/:id', getCashbook);

// GET /api/cashbooks/:id/balance - Get cashbook balance with calculations
router.get('/:id/balance', getCashbookBalance);

// PATCH /api/cashbooks/:id - Update a cashbook
router.patch('/:id', updateCashbook);

// DELETE /api/cashbooks/:id - Delete a cashbook
router.delete('/:id', deleteCashbook);

module.exports = router;
