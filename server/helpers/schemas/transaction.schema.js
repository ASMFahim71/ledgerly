const { z } = require('zod');

const createTransactionSchema = z.object({
  cashbook_id: z.number()
    .int('Cashbook ID must be an integer')
    .positive('Cashbook ID must be positive'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type must be either income or expense' })
  }),
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount cannot exceed 999,999,999.99'),
  source_person: z.string()
    .min(1, 'Source person is required')
    .max(150, 'Source person must be less than 150 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  transaction_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Transaction date must be in YYYY-MM-DD format')
    .or(z.date()),
  category_ids: z.array(z.number().int('Category ID must be an integer').positive('Category ID must be positive'))
    .optional()
    .default([])
});

const updateTransactionSchema = z.object({
  cashbook_id: z.number()
    .int('Cashbook ID must be an integer')
    .positive('Cashbook ID must be positive')
    .optional(),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type must be either income or expense' })
  }).optional(),
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount cannot exceed 999,999,999.99')
    .optional(),
  source_person: z.string()
    .min(1, 'Source person is required')
    .max(150, 'Source person must be less than 150 characters')
    .optional(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  transaction_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Transaction date must be in YYYY-MM-DD format')
    .or(z.date())
    .optional(),
  category_ids: z.array(z.number().int('Category ID must be an integer').positive('Category ID must be positive'))
    .optional()
    .default([])
});

module.exports = { createTransactionSchema, updateTransactionSchema };
