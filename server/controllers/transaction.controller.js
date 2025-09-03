const sql = require('../helpers/db');
const tryCatch = require('../helpers/tryCatch');
const prepare = require('../helpers/prepare');
const ErrorStack = require('../helpers/appError');
const APIFeatures = require('../helpers/apiFeatures');
const { createTransactionSchema, updateTransactionSchema } = require('../helpers/schemas/transaction.schema');

// Helper function to update cashbook balance
async function updateCashbookBalance(cashbookId) {
  const [[balanceResult]] = await sql.query(
    `SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
    FROM transactions 
    WHERE cashbook_id = ?`,
    [cashbookId]
  );

  const netBalance = parseFloat(balanceResult.total_income) - parseFloat(balanceResult.total_expense);

  await sql.query(
    'UPDATE cashbooks SET current_balance = ? WHERE cashbook_id = ?',
    [netBalance, cashbookId]
  );
}

exports.getAllTransactions = tryCatch(async (req, res, next) => {
  let q = `SELECT t.*, c.name as cashbook_name 
           FROM transactions t 
           JOIN cashbooks c ON t.cashbook_id = c.cashbook_id 
           WHERE t.user_id = ?`;

  // Add cashbook filter if provided
  if (req.query.cashbook_id) {
    q += ` AND t.cashbook_id = ?`;
  }

  // Add type filter if provided
  if (req.query.type) {
    q += ` AND t.type = ?`;
  }

  const apiFeatures = new APIFeatures(q, req.query);
  const { query, values, pagination } = await apiFeatures.paginate('transactions');

  // Build parameters array
  const params = [req.user.user_id];
  if (req.query.cashbook_id) params.push(req.query.cashbook_id);
  if (req.query.type) params.push(req.query.type);
  params.push(...values);

  const [transactions] = await sql.query(query, params);

  res.status(200).json({
    status: true,
    results: transactions.length,
    data: { transactions },
    pagination
  });
});

exports.getTransaction = tryCatch(async (req, res, next) => {
  const [[transaction]] = await sql.query(
    `SELECT t.*, c.name as cashbook_name 
     FROM transactions t 
     JOIN cashbooks c ON t.cashbook_id = c.cashbook_id 
     WHERE t.transaction_id = ? AND t.user_id = ?`,
    [req.params.id, req.user.user_id]
  );

  if (!transaction) {
    return next(new ErrorStack('Transaction not found!', 404));
  }

  res.status(200).json({
    status: true,
    data: { transaction }
  });
});

exports.createTransaction = tryCatch(async (req, res, next) => {
  const result = createTransactionSchema.safeParse(req.body);

  if (!result.success) {
    const errors = {}
    result.error.issues.forEach(issue => { errors[issue.path[0]] = issue.message })

    return next(new ErrorStack(JSON.stringify(errors), 422))
  }

  // Verify cashbook exists and belongs to user
  const [[cashbook]] = await sql.query(
    'SELECT * FROM cashbooks WHERE cashbook_id = ? AND user_id = ?',
    [result.data.cashbook_id, req.user.user_id]
  );

  if (!cashbook) {
    return next(new ErrorStack('Cashbook not found or access denied!', 404));
  }

  // Add user_id to the request body
  const transactionData = {
    ...result.data,
    user_id: req.user.user_id
  };

  const { keys, values } = prepare(transactionData);

  const [data] = await sql.query(
    `INSERT INTO transactions (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
    [...values]
  );

  if (!data.insertId) {
    return next(new ErrorStack("Couldn't create transaction!", 500));
  }

  // Get the created transaction with cashbook name
  const [[transaction]] = await sql.query(
    `SELECT t.*, c.name as cashbook_name 
     FROM transactions t 
     JOIN cashbooks c ON t.cashbook_id = c.cashbook_id 
     WHERE t.transaction_id = ?`,
    [data.insertId]
  );

  // Update cashbook current balance
  await updateCashbookBalance(result.data.cashbook_id);

  res.status(201).json({
    status: true,
    message: "Transaction created successfully!",
    data: { transaction }
  });
});

exports.updateTransaction = tryCatch(async (req, res, next) => {
  const result = updateTransactionSchema.safeParse(req.body);

  if (!result.success) {
    const errors = {}
    result.error.issues.forEach(issue => { errors[issue.path[0]] = issue.message })

    return next(new ErrorStack(JSON.stringify(errors), 422))
  }

  // First check if transaction exists and belongs to user
  const [[existingTransaction]] = await sql.query(
    'SELECT * FROM transactions WHERE transaction_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id]
  );

  if (!existingTransaction) {
    return next(new ErrorStack('Transaction not found!', 404));
  }

  // If cashbook_id is being updated, verify the new cashbook belongs to user
  if (result.data.cashbook_id) {
    const [[cashbook]] = await sql.query(
      'SELECT * FROM cashbooks WHERE cashbook_id = ? AND user_id = ?',
      [result.data.cashbook_id, req.user.user_id]
    );

    if (!cashbook) {
      return next(new ErrorStack('Cashbook not found or access denied!', 404));
    }
  }

  const { keys, values } = prepare(result.data);

  const [updateResult] = await sql.query(
    `UPDATE transactions SET ${keys.map(key => `${key} = ?`).join(', ')} WHERE transaction_id = ? AND user_id = ?`,
    [...values, req.params.id, req.user.user_id]
  );

  if (updateResult.affectedRows !== 1) {
    return next(new ErrorStack('Couldn\'t update this transaction!', 500));
  }

  // Get the updated transaction
  const [[transaction]] = await sql.query(
    `SELECT t.*, c.name as cashbook_name 
     FROM transactions t 
     JOIN cashbooks c ON t.cashbook_id = c.cashbook_id 
     WHERE t.transaction_id = ?`,
    [req.params.id]
  );

  // Update cashbook balances for both old and new cashbook if cashbook_id changed
  if (result.data.cashbook_id && result.data.cashbook_id !== existingTransaction.cashbook_id) {
    await updateCashbookBalance(existingTransaction.cashbook_id);
    await updateCashbookBalance(result.data.cashbook_id);
  } else {
    await updateCashbookBalance(transaction.cashbook_id);
  }

  res.status(200).json({
    status: true,
    message: "Transaction updated successfully!",
    data: { transaction }
  });
});

exports.deleteTransaction = tryCatch(async (req, res, next) => {
  // First check if transaction exists and belongs to user
  const [[existingTransaction]] = await sql.query(
    'SELECT * FROM transactions WHERE transaction_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id]
  );

  if (!existingTransaction) {
    return next(new ErrorStack('Transaction not found!', 404));
  }

  const [result] = await sql.query(
    'DELETE FROM transactions WHERE transaction_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id]
  );

  if (result.affectedRows !== 1) {
    return next(new ErrorStack("Couldn't delete this transaction!", 500));
  }

  // Update cashbook balance
  await updateCashbookBalance(existingTransaction.cashbook_id);

  res.status(200).json({
    status: true,
    message: "Transaction deleted successfully!"
  });
});

exports.getTransactionStats = tryCatch(async (req, res, next) => {
  const cashbookId = req.query.cashbook_id;
  let whereClause = 'WHERE t.user_id = ?';
  const params = [req.user.user_id];

  if (cashbookId) {
    // Verify cashbook belongs to user
    const [[cashbook]] = await sql.query(
      'SELECT * FROM cashbooks WHERE cashbook_id = ? AND user_id = ?',
      [cashbookId, req.user.user_id]
    );

    if (!cashbook) {
      return next(new ErrorStack('Cashbook not found or access denied!', 404));
    }

    whereClause += ' AND t.cashbook_id = ?';
    params.push(cashbookId);
  }

  const [[stats]] = await sql.query(
    `SELECT 
      COUNT(*) as total_transactions,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net_amount
    FROM transactions t 
    ${whereClause}`,
    params
  );

  res.status(200).json({
    status: true,
    data: { stats }
  });
});