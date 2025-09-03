const { z } = require('zod');

const createCashbookSchema = z.object({
  name: z.string()
    .min(1, 'Cashbook name is required')
    .max(100, 'Cashbook name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  initial_balance: z.number()
    .min(0, 'Initial balance cannot be negative')
    .default(0),
  is_active: z.boolean()
    .default(true)
});

const updateCashbookSchema = z.object({
  name: z.string()
    .min(1, 'Cashbook name is required')
    .max(100, 'Cashbook name must be less than 100 characters')
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  initial_balance: z.number()
    .min(0, 'Initial balance cannot be negative')
    .optional(),
  is_active: z.boolean()
    .optional()
});

module.exports = { createCashbookSchema, updateCashbookSchema };
