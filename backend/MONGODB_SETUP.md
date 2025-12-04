# MongoDB Setup Guide

## Option 1: Local MongoDB (Recommended for Development)

### Install MongoDB on macOS

```bash
# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify MongoDB is running
brew services list | grep mongodb
```

### Verify Installation

```bash
# Connect to MongoDB shell
mongosh

# You should see MongoDB shell prompt
# Type 'exit' to quit
```

## Option 2: MongoDB Atlas (Cloud - No Installation Required)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a free cluster (M0)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string

Update `.env` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campuscook
```

## Initialize Database

Once MongoDB is running (locally or Atlas):

```bash
cd backend

# Install dependencies
npm install

# Initialize database with seed data
npm run db:init
```

This will:
- Connect to MongoDB
- Create the `campuscook` database
- Insert 10 recipe categories

## Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## Verify Everything Works

Visit `http://localhost:3000/health` - you should see:
```json
{
  "status": "ok",
  "message": "CampusCook API is running"
}
```

## MongoDB GUI Tools (Optional)

For easier database management, install:
- **MongoDB Compass** (Official GUI): https://www.mongodb.com/products/compass
- **Studio 3T**: https://studio3t.com/
- **Robo 3T**: https://robomongo.org/

## Common Commands

```bash
# Start MongoDB
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community

# Restart MongoDB
brew services restart mongodb-community

# Check MongoDB status
brew services list | grep mongodb

# Connect to MongoDB shell
mongosh

# In mongosh, useful commands:
show dbs                    # List all databases
use campuscook             # Switch to campuscook database
show collections           # List all collections
db.users.find()            # View all users
db.recipes.countDocuments() # Count recipes
```

## Troubleshooting

### MongoDB not starting?

```bash
# Check if port 27017 is in use
lsof -i :27017

# If another process is using it, kill it
kill -9 <PID>

# Restart MongoDB
brew services restart mongodb-community
```

### Connection refused?

Make sure MongoDB is running:
```bash
brew services list | grep mongodb
```

Should show "started" status.

### Can't connect to Atlas?

1. Check your IP is whitelisted in Atlas
2. Verify username/password in connection string
3. Make sure you're using the correct database name

## Next Steps

Once MongoDB is running and initialized:
1. The server should start without errors
2. You can proceed with implementing authentication (Task 3)
3. All data will be stored in MongoDB collections

## Why MongoDB?

MongoDB advantages for this project:
- ✅ No password/permission issues
- ✅ Easier to install and run
- ✅ JSON-like documents (perfect for recipes with arrays)
- ✅ Flexible schema
- ✅ Great for rapid development
- ✅ Free cloud option (Atlas)
