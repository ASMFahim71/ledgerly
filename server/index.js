const dotenv = require('dotenv')

process.on('uncaughtException', error => {
  console.log('🛑 Uncaught Exception Shutting Down!')
  console.log(error.name, error.message)

  process.exit(1)
})

dotenv.config()
const app = require('./app')

const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => {
  console.log(`Server running and listening on port ${PORT}!`)
})

process.on('unhandledRejection', error => {
  console.log('🛑 Unhandled Rejection Shutting Down!')
  console.log(error.name, error.message)

  server.close(() => process.exit(1))
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting Down!')

  server.close(() => console.log('🛑 Process Terminated cause SIGTERM received!'))
})