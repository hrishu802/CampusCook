# Backend Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
   ```bash
   node --version
   ```

2. **MySQL** (v8 or higher)
   ```bash
   mysql --version
   ```

3. **MySQL Server Running**
   - macOS: `brew services start mysql` or `mysql.server start`
   - Linux: `sudo systemctl start mysql`
   - Windows: Start MySQL service from Services panel

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campuscook
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_random_secret_key_here_change_in_production
JWT_EXPIRES_IN=24h

# Bcrypt Configuration
BCRYPT_ROUNDS=10

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

**Important:** Replace `your_mysql_password` with your actual MySQL root password!

### 3. Initialize Database

```bash
npm run db:init
```

This will:
- Create the `campuscook` database
- Create all tables (Users, Recipes, Categories, Favorites, Ratings)
- Insert seed data (10 recipe categories)

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

### 5. Test the API

Visit `http://localhost:3000/health` - you should see:
```json
{
  "status": "ok",
  "message": "CampusCook API is running"
}
```

## Common Issues & Solutions

### Issue: "ECONNREFUSED" or "Can't connect to MySQL server"

**Solution:**
1. Make sure MySQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status mysql
   ```

2. Check if MySQL is listening on port 3306:
   ```bash
   netstat -an | grep 3306
   ```

3. Try connecting manually:
   ```bash
   mysql -u root -p
   ```

### Issue: "Access denied for user"

**Solution:**
1. Verify your MySQL password is correct in `.env`
2. Make sure the user has proper privileges:
   ```sql
   GRANT ALL PRIVILEGES ON campuscook.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Issue: "Unknown database 'campuscook'"

**Solution:**
Run the database initialization script:
```bash
npm run db:init
```

### Issue: "Table doesn't exist"

**Solution:**
Reset the database:
```bash
npm run db:reset
```

### Issue: Port 3000 already in use

**Solution:**
Change the PORT in `.env`:
```env
PORT=3001
```

## Creating an Admin User

1. Start the server
2. Use the signup endpoint to create a user
3. Manually update the user's role in MySQL:

```sql
mysql -u root -p
USE campuscook;
UPDATE Users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Or use a MySQL client like MySQL Workbench, phpMyAdmin, or TablePlus.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Database Management

### View all tables
```bash
mysql -u root -p campuscook -e "SHOW TABLES;"
```

### View table structure
```bash
mysql -u root -p campuscook -e "DESCRIBE Users;"
```

### Reset database (WARNING: Deletes all data!)
```bash
npm run db:reset
```

## Next Steps

Once the backend is running:
1. Set up the frontend (see `../frontend/README.md`)
2. Test API endpoints with Postman or curl
3. Start implementing features according to the task list

## Need Help?

- Check the main README.md for project overview
- Review `.kiro/specs/campus-cook/` for detailed specifications
- Check database documentation in `database/README.md`
