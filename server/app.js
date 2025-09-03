const path = require('path');
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

const userRouter = require('./routes/user.routes')
const cashbookRouter = require('./routes/cashbook.routes')
const transactionRouter = require('./routes/transaction.routes')
const categoryRouter = require('./routes/category.routes')
const globalErrorHandler = require('./controllers/error.controller');
const getUrl = require('./helpers/getUrl');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(cors({ origin: [getUrl()], methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], credentials: true, }))

app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: '200kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

/* app.get('/', (req, res) => {
  console.log(req.cookies);
  res.status(200).json({ cookies: JSON.stringify(req.cookies) });
}); */

app.get("/", (req, res) => {
  res.status(200).json({ status: true, message: "Server running successfully!" })
})

app.use('/api/users', userRouter)
app.use('/api/cashbooks', cashbookRouter)
app.use('/api/transactions', transactionRouter)
app.use('/api/categories', categoryRouter)

app.all('*', (req, res, next) => {
  res.status(404).json({ status: false, message: 'Route doesn\'t exist on this server!' })
})

app.use(globalErrorHandler)

module.exports = app;