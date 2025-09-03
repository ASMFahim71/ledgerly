const sql = require('../helpers/db');
const tryCatch = require('../helpers/tryCatch');
const prepare = require('../helpers/prepare');
const ErrorStack = require('../helpers/appError');
const APIFeatures = require('../helpers/apiFeatures');
const { createCashbookSchema, updateCashbookSchema } = require('../helpers/schemas/cashbook.schema');

exports.getAllCashbooks = tryCatch(async (req, res, next) => {
  const q = `SELECT * FROM cashbooks WHERE user_id = ?`;

  const apiFeatures = new APIFeatures(q, req.query);
  const { query, values, pagination } = await apiFeatures.paginate('cashbooks');

  // Add user_id as the first parameter
  const [cashbooks] = await sql.query(query, [req.user.user_id, ...values]);

  res.status(200).json({
    status: true,
    results: cashbooks.length,
    data: { cashbooks },
    pagination
  });
});

exports.getCashbook = tryCatch(async (req, res, next) => {
  const [[cashbook]] = await sql.query(
    'SELECT * FROM cashbooks WHERE cashbook_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id]
  );

  if (!cashbook) {
    return next(new ErrorStack('Cashbook not found!', 404));
  }

  res.status(200).json({
    status: true,
    data: { cashbook }
  });
});

exports.createCashbook = tryCatch(async (req, res, next) => {
  const result = createCashbookSchema.safeParse(req.body);

  if (!result.success) {
    const errors = {}
    result.error.issues.forEach(issue => { errors[issue.path[0]] = issue.message })

    return next(new ErrorStack(JSON.stringify(errors), 422))
  }

  // Add user_id to the request body
  const cashbookData = {
    ...result.data,
    user_id: req.user.user_id
  };

  const { keys, values } = prepare(cashbookData);

  const [data] = await sql.query(
    `INSERT INTO cashbooks (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
    [...values]
  );

  if (!data.insertId) {
    return next(new ErrorStack("Couldn't create cashbook!", 500));
  }

  // Get the created cashbook
  const [[cashbook]] = await sql.query(
    'SELECT * FROM cashbooks WHERE cashbook_id = ?',
    [data.insertId]
  );

  res.status(201).json({
    status: true,
    message: "Cashbook created successfully!",
    data: { cashbook }
  });
});

exports.updateCashbook = tryCatch(async (req, res, next) => {
  const result = updateCashbookSchema.safeParse(req.body);

  if (!result.success) {
    const errors = {}
    result.error.issues.forEach(issue => { errors[issue.path[0]] = issue.message })

    return next(new ErrorStack(JSON.stringify(errors), 422))
  }

  // First check if cashbook exists and belongs to user
  const [[existingCashbook]] = await sql.query(
    'SELECT * FROM cashbooks WHERE cashbook_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id]
  );

  if (!existingCashbook) {
    return next(new ErrorStack('Cashbook not found!', 404));
  }

  const { keys, values } = prepare(result.data);

  const [updateResult] = await sql.query(
    `UPDATE cashbooks SET ${keys.map(key => `${key} = ?`).join(', ')} WHERE cashbook_id = ? AND user_id = ?`,
    [...values, req.params.id, req.user.user_id]
  );

  if (updateResult.affectedRows !== 1) {
    return next(new ErrorStack('Couldn\'t update this cashbook!', 500));
  }

  // Get the updated cashbook
  const [[cashbook]] = await sql.query(
    'SELECT * FROM cashbooks WHERE cashbook_id = ?',
    [req.params.id]
  );

  res.status(200).json({
    status: true,
    message: "Cashbook updated successfully!",
    data: { cashbook }
  });
});

exports.deleteCashbook = tryCatch(async (req, res, next) => {
  // First check if cashbook exists and belongs to user
  const [[existingCashbook]] = await sql.query(
    'SELECT * FROM cashbooks WHERE cashbook_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id]
  );

  if (!existingCashbook) {
    return next(new ErrorStack('Cashbook not found!', 404));
  }

  const [result] = await sql.query(
    'DELETE FROM cashbooks WHERE cashbook_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id]
  );

  if (result.affectedRows !== 1) {
    return next(new ErrorStack("Couldn't delete this cashbook!", 500));
  }

  res.status(200).json({
    status: true,
    message: "Cashbook deleted successfully!"
  });
});

exports.getCashbookBalance = tryCatch(async (req, res, next) => {
  const [[cashbook]] = await sql.query(
    'SELECT * FROM cashbooks WHERE cashbook_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id]
  );

  if (!cashbook) {
    return next(new ErrorStack('Cashbook not found!', 404));
  }

  // Calculate current balance from transactions
  const [[balanceResult]] = await sql.query(
    `SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
      (COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) - 
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)) as calculated_balance
    FROM transactions 
    WHERE cashbook_id = ?`,
    [req.params.id]
  );

  const balance = {
    cashbook_id: cashbook.cashbook_id,
    name: cashbook.name,
    initial_balance: parseFloat(cashbook.initial_balance),
    stored_balance: parseFloat(cashbook.current_balance),
    calculated_balance: parseFloat(balanceResult.calculated_balance),
    total_income: parseFloat(balanceResult.total_income),
    total_expense: parseFloat(balanceResult.total_expense),
    net_balance: parseFloat(cashbook.initial_balance) + parseFloat(balanceResult.calculated_balance)
  };

  res.status(200).json({
    status: true,
    data: { balance }
  });
});
