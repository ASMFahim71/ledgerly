const { z } = require("zod");

const registerSchema = z.object({
  name: z.string({ message: 'Name is required!' }),
  email: z.string({ message: 'Email is required!' }).email('Please enter a valid email address!'),
  password: z.string({
    message: 'Password is required!'
  }).min(8, 'Password must contain at least 8 characters!'),
});

const loginSchema = z.object({
  email: z.string({
    message: 'Email is required!'
  }).email('Please enter a valid email address!'),
  password: z.string({
    message: 'Password is required!'
  }).min(8, 'Password must contain at least 8 characters!'),
});

module.exports = { registerSchema, loginSchema };