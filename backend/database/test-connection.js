require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing MySQL connection...\n');
  
  console.log('Configuration:');
  console.log(`- Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`- Port: ${process.env.DB_PORT || 3306}`);
  console.log(`- User: ${process.env.DB_USER || 'root'}`);
  console.log(`- Database: ${process.env.DB_NAME || 'campuscook'}\n`);

  try {
    // Test connection to MySQL server
    console.log('Step 1: Connecting to MySQL server...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT) || 3306
    });
    console.log('✓ Connected to MySQL server\n');

    // Check MySQL version
    const [rows] = await connection.query('SELECT VERSION() as version');
    console.log(`MySQL Version: ${rows[0].version}\n`);

    // Check if database exists
    console.log('Step 2: Checking if database exists...');
    const dbName = process.env.DB_NAME || 'campuscook';
    const [databases] = await connection.query(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [dbName]
    );

    if (databases.length > 0) {
      console.log(`✓ Database '${dbName}' exists\n`);
      
      // Use the database
      await connection.query(`USE \`${dbName}\``);
      
      // Check tables
      console.log('Step 3: Checking tables...');
      const [tables] = await connection.query('SHOW TABLES');
      
      if (tables.length > 0) {
        console.log('✓ Found tables:');
        tables.forEach(table => {
          const tableName = Object.values(table)[0];
          console.log(`  - ${tableName}`);
        });
        console.log('');
        
        // Check row counts
        console.log('Step 4: Checking data...');
        for (const table of tables) {
          const tableName = Object.values(table)[0];
          const [count] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
          console.log(`  ${tableName}: ${count[0].count} rows`);
        }
      } else {
        console.log('⚠️  No tables found. Run: npm run db:init');
      }
    } else {
      console.log(`⚠️  Database '${dbName}' does not exist. Run: npm run db:init`);
    }

    await connection.end();
    console.log('\n✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error(`\nError: ${error.message}`);
    console.error(`Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 MySQL server is not running or not accessible');
      console.error('   Start MySQL and try again');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied - check your credentials in .env');
    }
    
    process.exit(1);
  }
}

testConnection();
