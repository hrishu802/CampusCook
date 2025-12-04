# Database Documentation

## Overview

CampusCook uses MySQL as its relational database. The schema is designed to support recipe management, user authentication, favorites, and ratings with proper referential integrity.

## Database Schema

### Tables

#### 1. Users
Stores user account information and authentication data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| name | VARCHAR(100) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email (login) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | ENUM('user', 'admin') | DEFAULT 'user' | User role |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update time |

**Indexes:**
- `idx_email` on email (for login queries)
- `idx_role` on role (for admin queries)

#### 2. Categories
Pre-populated recipe categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Category identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Category name |
| description | TEXT | | Category description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Indexes:**
- `idx_name` on name (for category lookups)

**Pre-populated Categories:**
- Vegetarian
- Non-Vegetarian
- Desserts
- Breakfast
- Lunch
- Dinner
- Snacks
- Beverages
- Quick & Easy
- Budget-Friendly

#### 3. Recipes
Stores recipe information with ingredients and steps as JSON.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Recipe identifier |
| title | VARCHAR(200) | NOT NULL | Recipe title |
| description | TEXT | | Recipe description |
| ingredients | JSON | NOT NULL | Array of ingredients |
| steps | JSON | NOT NULL | Array of preparation steps |
| prep_time | INT | | Preparation time (minutes) |
| difficulty | ENUM('easy', 'medium', 'hard') | | Difficulty level |
| category | VARCHAR(50) | NOT NULL | Recipe category |
| image_url | VARCHAR(500) | | Recipe image URL |
| author_id | INT | NOT NULL, FOREIGN KEY | Recipe author |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update time |

**Indexes:**
- `idx_category` on category (for filtering)
- `idx_author` on author_id (for user recipes)
- `idx_title` on title (for sorting)
- `idx_created_at` on created_at (for sorting)
- `idx_search` FULLTEXT on (title, description) (for search)

**Foreign Keys:**
- `author_id` → Users(id) ON DELETE CASCADE

#### 4. Favorites
Junction table for user-recipe favorites.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Favorite identifier |
| user_id | INT | NOT NULL, FOREIGN KEY | User who favorited |
| recipe_id | INT | NOT NULL, FOREIGN KEY | Favorited recipe |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When favorited |

**Indexes:**
- `unique_favorite` UNIQUE on (user_id, recipe_id) (prevent duplicates)
- `idx_user_favorites` on user_id (for user's favorites)
- `idx_recipe_favorites` on recipe_id (for recipe popularity)

**Foreign Keys:**
- `user_id` → Users(id) ON DELETE CASCADE
- `recipe_id` → Recipes(id) ON DELETE CASCADE

#### 5. Ratings
Stores user ratings and reviews for recipes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Rating identifier |
| user_id | INT | NOT NULL, FOREIGN KEY | User who rated |
| recipe_id | INT | NOT NULL, FOREIGN KEY | Rated recipe |
| rating | INT | NOT NULL, CHECK (1-5) | Rating value (1-5) |
| review | TEXT | | Optional review text |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When rated |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update time |

**Indexes:**
- `unique_rating` UNIQUE on (user_id, recipe_id) (one rating per user per recipe)
- `idx_recipe_ratings` on recipe_id (for recipe ratings)
- `idx_user_ratings` on user_id (for user's ratings)

**Foreign Keys:**
- `user_id` → Users(id) ON DELETE CASCADE
- `recipe_id` → Recipes(id) ON DELETE CASCADE

## Entity Relationships

```
Users (1) ──────< (M) Recipes
  │                     │
  │                     │
  │ (M)             (M) │
  │                     │
  └──< Favorites >──────┘
  │                     │
  │ (M)             (M) │
  │                     │
  └────< Ratings >──────┘
```

## Cascade Deletion

All foreign keys use `ON DELETE CASCADE` to maintain referential integrity:

- When a **User** is deleted:
  - All their **Recipes** are deleted
  - All their **Favorites** are deleted
  - All their **Ratings** are deleted

- When a **Recipe** is deleted:
  - All **Favorites** for that recipe are deleted
  - All **Ratings** for that recipe are deleted

## Setup Instructions

### 1. Configure Environment

Create a `.env` file in the backend directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=campuscook
DB_PORT=3306
```

### 2. Initialize Database

Run the initialization script:

```bash
npm run db:init
```

This will:
1. Create the `campuscook` database if it doesn't exist
2. Create all tables with proper indexes and constraints
3. Insert seed data (categories)

### 3. Reset Database (Optional)

To drop and recreate all tables:

```bash
npm run db:reset
```

**Warning:** This will delete all data!

## Common Queries

### Get Recipe with Author and Ratings

```sql
SELECT 
  r.*,
  u.name as author_name,
  u.email as author_email,
  AVG(rt.rating) as average_rating,
  COUNT(rt.id) as rating_count
FROM Recipes r
JOIN Users u ON r.author_id = u.id
LEFT JOIN Ratings rt ON r.id = rt.recipe_id
WHERE r.id = ?
GROUP BY r.id;
```

### Get User's Favorites

```sql
SELECT r.*, u.name as author_name
FROM Recipes r
JOIN Favorites f ON r.id = f.recipe_id
JOIN Users u ON r.author_id = u.id
WHERE f.user_id = ?
ORDER BY f.created_at DESC;
```

### Search Recipes

```sql
SELECT r.*, u.name as author_name
FROM Recipes r
JOIN Users u ON r.author_id = u.id
WHERE MATCH(r.title, r.description) AGAINST(? IN NATURAL LANGUAGE MODE)
   OR r.ingredients LIKE ?
ORDER BY r.created_at DESC;
```

## Performance Considerations

1. **Indexes**: All frequently queried columns have indexes
2. **Connection Pooling**: Using connection pool with 10 connections
3. **JSON Fields**: Ingredients and steps stored as JSON for flexibility
4. **FULLTEXT Search**: Enabled on title and description for fast search
5. **Cascade Deletes**: Handled at database level for consistency

## Backup Recommendations

For production:
1. Enable MySQL binary logging
2. Schedule regular mysqldump backups
3. Consider using MySQL replication for high availability
4. Store backups in secure, off-site location

## Migration Strategy

For future schema changes:
1. Create migration scripts in `database/migrations/`
2. Use version numbering (e.g., `001_add_column.sql`)
3. Track applied migrations in a `migrations` table
4. Never modify existing migration files
