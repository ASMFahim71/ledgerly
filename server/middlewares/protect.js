const jwt = require('jsonwebtoken');

const ErrorStack = require('../helpers/appError');
const sql = require('../helpers/db');
const tryCatch = require('../helpers/tryCatch');

exports.protect = tryCatch(async (req, res, next) => {
  let token;

  if (req.cookies?.__acc_token_mr) {
    token = req.cookies.__acc_token_mr;

    console.log('Pookie', req.cookies.__acc_token_mr);
  }
  else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new ErrorStack('You are not logged in! Please log in to get access.', 401))
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  console.log(decoded.id)

  const [[currentUser]] = await sql.query(
    'SELECT * FROM users WHERE user_id = ?', [decoded.id]
  )

  if (!currentUser) {
    return next(new ErrorStack('The user belonging to this token does no longer exist.', 401))
  }

  req.user = currentUser;
  next()
});