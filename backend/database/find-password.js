const mysql = require('mysql2/promise');

async function tryConnection(password) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: password,
      port: 3306
    });
    await connection.end();
    return true;
  } catch (error) {
    return false;
  }
}

async function findPassword() {
  console.log('Trying to find MySQL root password...\n');
  
  const passwordsToTry = [
    { value: '', label: 'Empty password' },
    { value: 'root', label: 'root' },
    { value: 'password', label: 'password' },
    { value: 'asdf1234', label: 'asdf1234 (from .env)' }
  ];

  for (const pwd of passwordsToTry) {
    process.stdout.write(`Trying ${pwd.label}... `);
    const success = await tryConnection(pwd.value);
    if (success) {
      console.log('✓ SUCCESS!\n');
      console.log('✅ Found working password!');
      console.log(`\nUpdate your .env file with:`);
      console.log(`DB_PASSWORD=${pwd.value || '(leave empty)'}`);
      return;
    } else {
      console.log('✗ Failed');
    }
  }

  console.log('\n❌ None of the common passwords worked.');
  console.log('\nOptions:');
  console.log('1. Try connecting manually: mysql -u root -p');
  console.log('2. Reset your MySQL password (see instructions below)');
  console.log('3. Create a new MySQL user for this project\n');
}

findPassword();
