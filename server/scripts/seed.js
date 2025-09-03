const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection pool without specifying database initially
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  database: 'ledgerly'
});

const sql = pool.promise();


async function resetDatabase() {
  try {
    // First, use the database
    //await sql.execute('USE ledgerly');

    const tables = [
      'transaction_categories',
      'categories',
      'transactions',
      'cashbooks',
      'users'
    ];

    // Drop tables in reverse order to avoid foreign key constraints
    await Promise.all(tables.map(async (table) => {
      try {
        await sql.execute(`DROP TABLE IF EXISTS ${table}`);
        console.log(`🗑️  Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not drop table ${table}:`, error.message);
      }
    }));

    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
  }
}

async function insertSampleData() {
  try {
    console.log('📊 Inserting sample data...');

    // Sample user
    const [userResult] = await sql.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['John Doe', 'john@example.com', '$2b$10$hashedpassword123']
    );
    const userId = userResult.insertId;
    console.log(`✅ Created user with ID: ${userId}`);

    // Sample cashbooks
    const cashbooks = [
      { name: 'Mother', description: 'Personal cashbook for mother', initial_balance: 1000.00 },
      { name: 'Personal', description: 'My personal expenses', initial_balance: 500.00 },
      { name: 'Business', description: 'Business transactions', initial_balance: 2000.00 }
    ];

    await Promise.all(cashbooks.map(async (cashbook) => {
      const [cashbookResult] = await sql.execute(
        'INSERT INTO cashbooks (user_id, name, description, initial_balance, current_balance) VALUES (?, ?, ?, ?, ?)',
        [userId, cashbook.name, cashbook.description, cashbook.initial_balance, cashbook.initial_balance]
      );
      const cashbookId = cashbookResult.insertId;
      console.log(`✅ Created cashbook "${cashbook.name}" with ID: ${cashbookId}`);

      // Sample transactions for each cashbook
      const transactions = [
        {
          type: 'income',
          amount: 1500.00,
          source_person: 'Salary',
          description: 'Monthly salary payment',
          transaction_date: '2024-01-15'
        },
        {
          type: 'expense',
          amount: 200.00,
          source_person: 'Grocery Store',
          description: 'Weekly grocery shopping',
          transaction_date: '2024-01-16'
        },
        {
          type: 'income',
          amount: 300.00,
          source_person: 'Freelance Work',
          description: 'Freelance project payment',
          transaction_date: '2024-01-17'
        }
      ];

      await Promise.all(transactions.map(async (transaction) => {
        await sql.execute(
          'INSERT INTO transactions (user_id, cashbook_id, type, amount, source_person, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            userId,
            cashbookId,
            transaction.type,
            transaction.amount,
            transaction.source_person,
            transaction.description,
            transaction.transaction_date
          ]
        );
      }));
      console.log(`✅ Added ${transactions.length} sample transactions to "${cashbook.name}"`);
    }));

    // Sample categories
    const categories = [
      { name: 'Salary', type: 'income' },
      { name: 'Freelance', type: 'income' },
      { name: 'Groceries', type: 'expense' },
      { name: 'Transportation', type: 'expense' },
      { name: 'Entertainment', type: 'expense' },
      { name: 'Utilities', type: 'expense' }
    ];

    await Promise.all(categories.map(async (category) => {
      await sql.execute(
        'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
        [userId, category.name, category.type]
      );
    }));
    console.log(`✅ Created ${categories.length} sample categories`);

  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if reset flag is provided
    const shouldReset = process.argv.includes('--reset');

    if (shouldReset) {
      console.log('🔄 Reset mode detected - dropping existing tables...');
      await resetDatabase();
    }

    // Create database if it doesn't exist
    await sql.execute('CREATE DATABASE IF NOT EXISTS ledgerly');
    console.log('✅ Database created/verified');

    // Use the database
    //await sql.execute('USE ledgerly');
    console.log('✅ Database selected');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../helpers/queries.sqL');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL statements by semicolon and filter out empty statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.toLowerCase().startsWith('create database') && !stmt.toLowerCase().startsWith('use'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    await Promise.all(statements.map(async (statement, index) => {
      if (statement) {
        try {
          await sql.execute(statement);
          console.log(`✅ Executed statement ${index + 1}/${statements.length}`);
        } catch (error) {
          console.log(statement, error);
          console.error(`❌ Error executing statement ${index + 1}:`, error.message);
          // Continue with other statements even if one fails
        }
      }
    }));

    // Insert sample data
    await insertSampleData();

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
