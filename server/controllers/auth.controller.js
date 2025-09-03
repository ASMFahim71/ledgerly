const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sql = require("../helpers/db")
const tryCatch = require("../helpers/tryCatch");
const prepare = require("../helpers/prepare");
const ErrorStack = require("../helpers/appError");
const { registerSchema, loginSchema } = require("../helpers/schemas/auth.schema");

const hashPassword = async (password) => bcrypt.hash(password, 10);

const comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
}

const signToken = (id) => jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
  expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
})

const createSendToken = async (user, statusCode, res) => {
  const token = signToken(user.user_id);

  const cookieOptions = {
    sameSite: 'lax',
    secure: true,
    httpOnly: true
  };

  res.cookie('__acc_token_mr', token, {
    ...cookieOptions,
    expires: new Date(
      Date.now() + parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN, 10) * 60 * 1000
    ),
    secure: process.env.NODE_ENV === 'production'
  });

  user.password = undefined;

  res.status(statusCode).json({ status: true, data: { token, user } });
};

exports.register = tryCatch(async (req, res, next) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    const errors = {}
    result.error.issues.forEach(issue => { errors[issue.path[0]] = issue.message })

    return next(new ErrorStack(JSON.stringify(errors), 422))
  }

  result.data.password = await hashPassword(result.data.password);

  const { keys, values } = prepare(result.data)

  const [data] = await sql.query(
    // eslint-disable-next-line no-unused-vars
    `INSERT INTO users (${keys.join(', ')}) VALUES (${keys.map(_ => '?').join(', ')})`,
    [...values]
  );

  const [[user]] = await sql.query(
    'SELECT * FROM users WHERE user_id = ?', [data.insertId]
  )

  createSendToken(user, 201, res);
});

exports.login = tryCatch(async (req, res, next) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    const errors = {}
    result.error.issues.forEach(issue => { errors[issue.path[0]] = issue.message })

    return next(new ErrorStack(JSON.stringify(errors), 422))
  }

  const { email, password } = result.data;

  if (!email || !password) {
    return next(new ErrorStack('Please provide email and password', 400))
  }

  const [[user]] = await sql.query(
    'SELECT * FROM users WHERE email = ?', [email]
  )

  if (!user || !(await comparePassword(password, user.password))) {
    return next(new ErrorStack('Incorrect email or password', 401))
  }

  createSendToken(user, 200, res);
})

exports.getMe = tryCatch(async (req, res) => {
  res.status(200).json({ status: true, data: { user: req.user } });
})

exports.logout = async (req, res) => {
  res.cookie('__acc_token_mr', '', {
    sameSite: 'none', expires: new Date(Date.now() + 10 * 1000), secure: process.env.NODE_ENV === 'production'
  })

  res.status(200).json({ status: true, data: null, message: "Logout successfull!" })
}
