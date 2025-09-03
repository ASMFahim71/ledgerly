# Database Seeding

This project includes an automated database seeding system that sets up your database schema and populates it with sample data.

## Features

- ✅ Automatically reads and executes SQL schema from `helpers/queries.sqL`
- ✅ Creates database tables with proper relationships
- ✅ Inserts sample data for testing
- ✅ Supports database reset functionality
- ✅ Detailed logging with emojis for better visibility

## Usage

### Basic Seeding
```bash
npm run seed
```
This will:
1. Create the database and tables from `helpers/queries.sqL`
2. Insert sample data including:
   - 1 sample user (John Doe)
   - 3 sample cashbooks (Mother, Personal, Business)
   - 9 sample transactions (3 per cashbook)
   - 6 sample categories

### Reset and Reseed
```bash
npm run seed:reset
```
This will:
1. Drop all existing tables
2. Recreate the database schema
3. Insert fresh sample data

## Sample Data Created

### User
- **Name**: John Doe
- **Email**: john@example.com
- **Password**: $2b$10$hashedpassword123

### Cashbooks
1. **Mother** - Personal cashbook for mother (Initial: $1000)
2. **Personal** - My personal expenses (Initial: $500)
3. **Business** - Business transactions (Initial: $2000)

### Sample Transactions
Each cashbook gets 3 sample transactions:
- Income: Salary payment ($1500)
- Expense: Grocery shopping ($200)
- Income: Freelance work ($300)

### Categories
- **Income**: Salary, Freelance
- **Expense**: Groceries, Transportation, Entertainment, Utilities

## Database Schema

The seeding script creates the following tables:
- `users` - User accounts
- `cashbooks` - User's cashbooks (one-to-many with users)
- `transactions` - Income/expense records (one-to-many with cashbooks)
- `categories` - Transaction categories
- `transaction_categories` - Many-to-many relationship between transactions and categories

## Environment Setup

Make sure your `.env` file contains the correct database credentials:
```
MYSQL_DATABASE=ledgerly
MYSQL_ROOT_PASSWORD=your_password
MYSQL_PORT=3306
```

## Troubleshooting

If you encounter errors:
1. Check that MySQL is running
2. Verify your database credentials in `.env`
3. Ensure the database server is accessible
4. Check the console output for specific error messages

The script will continue executing even if individual statements fail, so you can see which specific operations succeeded or failed.
