/* eslint-disable camelcase */
const sql = require('../helpers/db');
const tryCatch = require('../helpers/tryCatch');
const prepare = require('../helpers/prepare');
const ErrorStack = require('../helpers/appError');
const APIFeatures = require('../helpers/apiFeatures');
const { createCategorySchema, updateCategorySchema } = require('../helpers/schemas/category.schema');

exports.getAllCategories = tryCatch(async (req, res, next) => {
  let q = `SELECT * FROM categories WHERE user_id = ?`;

  // Add type filter if provided
  if (req.query.type) {
    q += ` AND type = ?`;
  }

  const apiFeatures = new APIFeatures(q, req.query);
  const { query, values, pagination } = await apiFeatures.paginate('categories');

  // Build parameters array
  const params = [req.user.user_id];
  if (req.query.type) params.push(req.query.type);
  params.push(...values);

  const [categories] = await sql.query(query, params);

  res.status(200).json({
    status: true,
    results: categories.length,
    data: { categories },
    pagination
  });
});

exports.getCategory = tryCatch(async (req, res, next) => {
  const [[category]] = await sql.query(
    'SELECT * FROM categories WHERE category_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id]
  );

  if (!category) {
    return next(new ErrorStack('Category not found!', 404));
  }

  res.status(200).json({
    status: true,
    data: { category }
  });
});

exports.createCategory = tryCatch(async (req, res, next) => {
  const result = createCategorySchema.safeParse(req.body);

  if (!result.success) {
    const errors = {}
    result.error.issues.forEach(issue => { errors[issue.path[0]] = issue.message })

    return next(new ErrorStack(JSON.stringify(errors), 422))
  }

  // Check if category name already exists for this user and type
  const [[existingCategory]] = await sql.query(
    'SELECT * FROM categories WHERE name = ? AND type = ? AND user_id = ?',
    [result.data.name, result.data.type, req.user.user_id]
  );

  if (existingCategory) {
    return next(new ErrorStack('Category with this name already exists for this type!', 400));
  }

  // Add user_id to the request body
  const categoryData = {
    ...result.data,
    user_id: req.user.user_id
  };

  const { keys, values } = prepare(categoryData);

  const [data] = await sql.query(
    `INSERT INTO categories (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
    [...values]
  );

  if (!data.insertId) {
    return next(new ErrorStack("Couldn't create category!", 500));
  }

  // Get the created category
  const [[category]] = await sql.query(
    'SELECT * FROM categories WHERE category_id = ?',
    [data.insertId]
  );

  res.status(201).json({
    status: true,
    message: "Category created successfully!",
    data: { category }
  });
});

exports.updateCategory = tryCatch(async (req, res, next) => {
  const result = updateCategorySchema.safeParse(req.body);

  if (!result.success) {
    const errors = {}
    result.error.issues.forEach(issue => { errors[issue.path[0]] = issue.message })

    return next(new ErrorStack(JSON.stringify(errors), 422))
  }

  // First check if category exists and belongs to user
  const [[existingCategory]] = await sql.query(
    'SELECT * FROM categories WHERE category_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id]
  );

  if (!existingCategory) {
    return next(new ErrorStack('Category not found!', 404));
  }

  // If name is being updated, check for duplicates
  if (result.data.name) {
    const [[duplicateCategory]] = await sql.query(
      'SELECT * FROM categories WHERE name = ? AND type = ? AND user_id = ? AND category_id != ?',
      [result.data.name, result.data.type || existingCategory.type, req.user.user_id, req.params.id]
    );

    if (duplicateCategory) {
      return next(new ErrorStack('Category with this name already exists for this type!', 400));
    }
  }

  const { keys, values } = prepare(result.data);

  const [updateResult] = await sql.query(
    `UPDATE categories SET ${keys.map(key => `${key} = ?`).join(', ')} WHERE category_id = ? AND user_id = ?`,
    [...values, req.params.id, req.user.user_id]
  );

  if (updateResult.affectedRows !== 1) {
    return next(new ErrorStack('Couldn\'t update this category!', 500));
  }

  // Get the updated category
  const [[category]] = await sql.query(
    'SELECT * FROM categories WHERE category_id = ?',
    [req.params.id]
  );

  res.status(200).json({
    status: true,
    message: "Category updated successfully!",
    data: { category }
  });
});

exports.deleteCategory = tryCatch(async (req, res, next) => {
  // First check if category exists and belongs to user
  const [[existingCategory]] = await sql.query(
    'SELECT * FROM categories WHERE category_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id]
  );

  if (!existingCategory) {
    return next(new ErrorStack('Category not found!', 404));
  }

  // Check if category is being used in any transactions
  const [[transactionCount]] = await sql.query(
    'SELECT COUNT(*) as count FROM transaction_categories WHERE category_id = ?',
    [req.params.id]
  );

  if (transactionCount.count > 0) {
    return next(new ErrorStack('Cannot delete category that is being used in transactions!', 400));
  }

  const [result] = await sql.query(
    'DELETE FROM categories WHERE category_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id]
  );

  if (result.affectedRows !== 1) {
    return next(new ErrorStack("Couldn't delete this category!", 500));
  }

  res.status(200).json({
    status: true,
    message: "Category deleted successfully!"
  });
});

exports.getCategoryStats = tryCatch(async (req, res, next) => {
  const cashbookId = req.query.cashbook_id;
  let whereClause = 'WHERE c.user_id = ?';
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

    whereClause += ' AND tc.cashbook_id = ?';
    params.push(cashbookId);
  }

  const [categoryStats] = await sql.query(
    `SELECT 
      c.category_id,
      c.name,
      c.type,
      COUNT(tc.transaction_id) as transaction_count,
      COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense
    FROM categories c
    LEFT JOIN transaction_categories tc ON c.category_id = tc.category_id
    LEFT JOIN transactions t ON tc.transaction_id = t.transaction_id ${cashbookId ? 'AND t.cashbook_id = ?' : ''}
    ${whereClause}
    GROUP BY c.category_id, c.name, c.type
    ORDER BY transaction_count DESC`,
    params
  );

  res.status(200).json({
    status: true,
    data: { categoryStats }
  });
});

exports.assignCategoryToTransaction = tryCatch(async (req, res, next) => {
  const { transaction_id, category_id } = req.body;

  if (!transaction_id || !category_id) {
    return next(new ErrorStack('Transaction ID and Category ID are required!', 400));
  }

  // Verify transaction belongs to user
  const [[transaction]] = await sql.query(
    'SELECT * FROM transactions WHERE transaction_id = ? AND user_id = ?',
    [transaction_id, req.user.user_id]
  );

  if (!transaction) {
    return next(new ErrorStack('Transaction not found or access denied!', 404));
  }

  // Verify category belongs to user
  const [[category]] = await sql.query(
    'SELECT * FROM categories WHERE category_id = ? AND user_id = ?',
    [category_id, req.user.user_id]
  );

  if (!category) {
    return next(new ErrorStack('Category not found or access denied!', 404));
  }

  // Check if assignment already exists
  const [[existingAssignment]] = await sql.query(
    'SELECT * FROM transaction_categories WHERE transaction_id = ? AND category_id = ?',
    [transaction_id, category_id]
  );

  if (existingAssignment) {
    return next(new ErrorStack('Category is already assigned to this transaction!', 400));
  }

  // Create the assignment
  const [data] = await sql.query(
    'INSERT INTO transaction_categories (transaction_id, category_id) VALUES (?, ?)',
    [transaction_id, category_id]
  );

  if (!data.insertId) {
    return next(new ErrorStack("Couldn't assign category to transaction!", 500));
  }

  res.status(201).json({
    status: true,
    message: "Category assigned to transaction successfully!"
  });
});

exports.removeCategoryFromTransaction = tryCatch(async (req, res, next) => {
  const { transaction_id, category_id } = req.params;

  // Verify transaction belongs to user
  const [[transaction]] = await sql.query(
    'SELECT * FROM transactions WHERE transaction_id = ? AND user_id = ?',
    [transaction_id, req.user.user_id]
  );

  if (!transaction) {
    return next(new ErrorStack('Transaction not found or access denied!', 404));
  }

  // Verify category belongs to user
  const [[category]] = await sql.query(
    'SELECT * FROM categories WHERE category_id = ? AND user_id = ?',
    [category_id, req.user.user_id]
  );

  if (!category) {
    return next(new ErrorStack('Category not found or access denied!', 404));
  }

  const [result] = await sql.query(
    'DELETE FROM transaction_categories WHERE transaction_id = ? AND category_id = ?',
    [transaction_id, category_id]
  );

  if (result.affectedRows !== 1) {
    return next(new ErrorStack("Couldn't remove category from transaction!", 500));
  }

  res.status(200).json({
    status: true,
    message: "Category removed from transaction successfully!"
  });
});
