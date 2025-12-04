require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
  let connection;
  
  try {
    console.log('Starting database initialization...\n');
    
    // Display configuration (without password)
    console.log('Configuration:');
    console.log(`- Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`- Port: ${process.env.DB_PORT || 3306}`);
    console.log(`- User: ${process.env.DB_USER || 'root'}`);
    console.log(`- Database: ${process.env.DB_NAME || 'campuscook'}\n`);

    // Connect to MySQL server (without specifying database)
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT) || 3306,
      multipleStatements: true
    });

    console.log('✓ Connected to MySQL server\n');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'campuscook';
    console.log(`Creating database '${dbName}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✓ Database '${dbName}' ready\n`);

    // Use the database
    await connection.query(`USE \`${dbName}\``);

    // Read and execute schema.sql
    console.log('Creating database schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    
    // Split SQL statements and execute them one by one for better error handling
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement) {
        await connection.query(statement);
      }
    }
    console.log('✓ Database schema created successfully\n');

    // Read and execute seed.sql
    console.log('Checking for seed data...');
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSQL = await fs.readFile(seedPath, 'utf8');
    
    // Check if categories already exist
    const [categories] = await connection.query('SELECT COUNT(*) as count FROM Categories');
    
    if (categories[0].count === 0) {
      console.log('Inserting seed data...');
      
      // Split and execute seed statements
      const seedStatements = seedSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of seedStatements) {
        if (statement && statement.toLowerCase().includes('insert')) {
          try {
            await connection.query(statement);
          } catch (err) {
            // Skip admin user insert if it fails (password hash issue)
            if (!statement.toLowerCase().includes('admin')) {
              throw err;
            }
            console.log('  (Skipped admin user - create manually via signup endpoint)');
          }
        }
      }
      console.log('✓ Seed data inserted successfully\n');
    } else {
      console.log('✓ Seed data already exists, skipping...\n');
    }

    // Verify tables were created
    const [tables] = await connection.query('SHOW TABLES');
    console.log('✅ Database initialization completed successfully!\n');
    console.log('Created tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  ✓ ${tableName}`);
    });
    
    console.log('\nYou can now start the server with: npm start');

  } catch (error) {
    console.error('\n❌ Database initialization failed!');
    console.error('\nError details:');
    console.error(`  Message: ${error.message}`);
    console.error(`  Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting:');
      console.error('  - Make sure MySQL server is running');
      console.error('  - Check if the port is correct (default: 3306)');
      console.error('  - Verify the host is accessible');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Troubleshooting:');
      console.error('  - Check your database username and password in .env');
      console.error('  - Make sure the user has CREATE DATABASE privileges');
    } else if (error.errno === 1049) {
      console.error('\n💡 Troubleshooting:');
      console.error('  - The database name might be invalid');
      console.error('  - Check DB_NAME in your .env file');
    }
    
    console.error('\n📝 Make sure you have a .env file with:');
    console.error('  DB_HOST=localhost');
    console.error('  DB_USER=root');
    console.error('  DB_PASSWORD=your_password');
    console.error('  DB_NAME=campuscook');
    console.error('  DB_PORT=3306\n');
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization
initializeDatabase();
