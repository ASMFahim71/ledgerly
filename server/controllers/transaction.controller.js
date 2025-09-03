const sql = require('../helpers/db');
const tryCatch = require('../helpers/tryCatch');
const prepare = require('../helpers/prepare');
const ErrorStack = require('../helpers/appError');
const APIFeatures = require('../helpers/apiFeatures');
const { createTransactionSchema, updateTransactionSchema } = require('../helpers/schemas/transaction.schema');

// Helper function to update cashbook balance
async function updateCashbookBalance(connection, cashbookId) {
  const [[balanceResult]] = await connection.query(
    `SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net_balance
    FROM transactions 
    WHERE cashbook_id = ?`,
    [cashbookId]
  );

  await connection.query(
    'UPDATE cashbooks SET current_balance = ? WHERE cashbook_id = ?',
    [balanceResult.net_balance, cashbookId]
  );
}

exports.getAllTransactions = tryCatch(async (req, res, next) => {
  let q = `SELECT t.*, c.name as cashbook_name,
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'category_id', cat.category_id,
               'name', cat.name,
               'type', cat.type
             )
           ) as categories
           FROM transactions t 
           JOIN cashbooks c ON t.cashbook_id = c.cashbook_id 
           LEFT JOIN transaction_categories tc ON t.transaction_id = tc.transaction_id
           LEFT JOIN categories cat ON tc.category_id = cat.category_id
           WHERE t.user_id = ?
           GROUP BY t.transaction_id`;

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

  // Add user_id to the request body and remove category_ids
  const { category_ids, ...transactionFields } = result.data;
  const transactionData = {
    ...transactionFields,
    user_id: req.user.user_id
  };

  const { keys, values } = prepare(transactionData);

  // Start a transaction
  const connection = await sql.getConnection();
  await connection.beginTransaction();

  try {
    // Create the transaction
    const [data] = await connection.query(
      `INSERT INTO transactions (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
      [...values]
    );

    if (!data.insertId) {
      await connection.rollback();
      return next(new ErrorStack("Couldn't create transaction!", 500));
    }

    // If category_ids are provided, create category assignments
    if (category_ids && category_ids.length > 0) {
      const categoryValues = category_ids.map(categoryId => [data.insertId, categoryId]);
      await connection.query(
        'INSERT INTO transaction_categories (transaction_id, category_id) VALUES ?',
        [categoryValues]
      );
    }

    // Get the created transaction with cashbook name
    const [[transaction]] = await connection.query(
      `SELECT t.*, c.name as cashbook_name
       FROM transactions t 
       JOIN cashbooks c ON t.cashbook_id = c.cashbook_id 
       WHERE t.transaction_id = ?`,
      [data.insertId]
    );

    // Get categories if any were assigned
    let categories = [];
    if (category_ids && category_ids.length > 0) {
      const [categoryResults] = await connection.query(
        `SELECT cat.category_id, cat.name, cat.type
         FROM categories cat
         WHERE cat.category_id IN (?)`,
        [category_ids]
      );
      categories = categoryResults;
    }

    // Add categories to transaction object
    transaction.categories = categories;

    // Update cashbook current balance
    await updateCashbookBalance(connection, result.data.cashbook_id);

    // Commit the transaction
    await connection.commit();

    res.status(201).json({
      status: true,
      message: "Transaction created successfully!",
      data: { transaction }
    });
  } catch (error) {
    await connection.rollback();
    return next(new ErrorStack(error.message || "Couldn't create transaction!", 500));
  } finally {
    connection.release();
  }
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

  // Start a transaction
  const connection = await sql.getConnection();
  await connection.beginTransaction();

  try {
    // Remove category_ids from transaction update
    const { category_ids, ...transactionFields } = result.data;
    const { keys, values } = prepare(transactionFields);

    const [updateResult] = await connection.query(
      `UPDATE transactions SET ${keys.map(key => `${key} = ?`).join(', ')} WHERE transaction_id = ? AND user_id = ?`,
      [...values, req.params.id, req.user.user_id]
    );

    if (updateResult.affectedRows !== 1) {
      await connection.rollback();
      return next(new ErrorStack('Couldn\'t update this transaction!', 500));
    }

    // Update categories if provided
    if (category_ids !== undefined) {
      // First delete existing category assignments
      await connection.query(
        'DELETE FROM transaction_categories WHERE transaction_id = ?',
        [req.params.id]
      );

      // Then insert new ones if any
      if (category_ids && category_ids.length > 0) {
        const categoryValues = category_ids.map(categoryId => [req.params.id, categoryId]);
        await connection.query(
          'INSERT INTO transaction_categories (transaction_id, category_id) VALUES ?',
          [categoryValues]
        );
      }
    }

    // Get the updated transaction
    const [[transaction]] = await connection.query(
      `SELECT t.*, c.name as cashbook_name 
       FROM transactions t 
       JOIN cashbooks c ON t.cashbook_id = c.cashbook_id 
       WHERE t.transaction_id = ?`,
      [req.params.id]
    );

    // Get categories if any were assigned
    let categories = [];
    if (category_ids && category_ids.length > 0) {
      const [categoryResults] = await connection.query(
        `SELECT cat.category_id, cat.name, cat.type
         FROM categories cat
         WHERE cat.category_id IN (?)`,
        [category_ids]
      );
      categories = categoryResults;
    }

    // Add categories to transaction object
    transaction.categories = categories;

    // Update cashbook balances for both old and new cashbook if cashbook_id changed
    if (result.data.cashbook_id && result.data.cashbook_id !== existingTransaction.cashbook_id) {
      await updateCashbookBalance(connection, existingTransaction.cashbook_id);
      await updateCashbookBalance(connection, result.data.cashbook_id);
    } else {
      await updateCashbookBalance(connection, transaction.cashbook_id);
    }

    // Commit the transaction
    await connection.commit();

    res.status(200).json({
      status: true,
      message: "Transaction updated successfully!",
      data: { transaction }
    });
  } catch (error) {
    await connection.rollback();
    return next(new ErrorStack(error.message || "Couldn't update transaction!", 500));
  } finally {
    connection.release();
  }
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
      COUNT(*) as transaction_count,
      COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
      COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
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