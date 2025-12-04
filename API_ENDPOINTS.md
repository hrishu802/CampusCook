# CampusCook API Endpoints

Base URL: `https://[your-backend-url]/api`

## Authentication Endpoints

### Signup
- **POST** `/auth/signup`
- **Body:** `{ name, email, password }`
- **Response:** `{ token, user: { id, name, email, role } }`

### Login
- **POST** `/auth/login`
- **Body:** `{ email, password }`
- **Response:** `{ token, user: { id, name, email, role } }`

---

## Recipe Endpoints (CRUD)

### Create Recipe ✅ CREATE #1
- **POST** `/recipes`
- **Auth:** Required
- **Body:**
  ```json
  {
    "title": "Pasta Carbonara",
    "description": "Quick and easy pasta",
    "ingredients": ["pasta", "eggs", "bacon"],
    "steps": ["Boil pasta", "Cook bacon", "Mix"],
    "prep_time": 20,
    "difficulty": "easy",
    "category": "dinner",
    "image_url": "https://..."
  }
  ```
- **Response:** `{ recipe: {...} }`

### Get All Recipes ✅ READ #1
- **GET** `/recipes`
- **Query Params:**
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 12)
  - `search` - Search term
  - `category` - Filter by category
  - `sort` - Sort field (rating, prepTime, popularity)
  - `order` - Sort order (asc, desc)
- **Response:**
  ```json
  {
    "recipes": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecipes": 50,
      "limit": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
  ```

### Get Recipe by ID ✅ READ #2
- **GET** `/recipes/:id`
- **Response:**
  ```json
  {
    "recipe": {
      "id": "...",
      "title": "...",
      "description": "...",
      "ingredients": [...],
      "steps": [...],
      "prep_time": 20,
      "difficulty": "easy",
      "category": "dinner",
      "image_url": "...",
      "author": { "id": "...", "name": "..." },
      "averageRating": 4.5,
      "ratingCount": 10,
      "isFavorited": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
  ```

### Get User's Recipes ✅ READ #3
- **GET** `/recipes/user/:userId`
- **Response:**
  ```json
  {
    "recipes": [
      {
        "id": "...",
        "title": "...",
        "averageRating": 4.5,
        "ratingCount": 10,
        "favoriteCount": 5,
        ...
      }
    ]
  }
  ```

### Update Recipe ✅ UPDATE #1
- **PUT** `/recipes/:id`
- **Auth:** Required (Owner or Admin)
- **Body:** Any recipe fields to update
- **Response:** `{ recipe: {...} }`

### Delete Recipe ✅ DELETE #1
- **DELETE** `/recipes/:id`
- **Auth:** Required (Admin only)
- **Response:** `{ message: "Recipe deleted successfully" }`
- **Note:** Cascades to delete associated favorites and ratings

---

## Category Endpoints

### Get All Categories ✅ READ #4
- **GET** `/categories`
- **Response:**
  ```json
  {
    "categories": [
      { "name": "breakfast", "recipeCount": 15 },
      { "name": "lunch", "recipeCount": 20 },
      { "name": "dinner", "recipeCount": 30 },
      { "name": "snack", "recipeCount": 10 },
      { "name": "dessert", "recipeCount": 12 }
    ]
  }
  ```

---

## Favorites Endpoints (CRUD)

### Add to Favorites ✅ CREATE #2
- **POST** `/favorites/:recipeId`
- **Auth:** Required
- **Response:** `{ message: "Recipe added to favorites", favorite: { id } }`

### Get User's Favorites ✅ READ #5
- **GET** `/favorites`
- **Auth:** Required
- **Response:**
  ```json
  {
    "recipes": [
      {
        "id": "...",
        "title": "...",
        "description": "...",
        "author": {...},
        "favoritedAt": "..."
      }
    ]
  }
  ```

### Remove from Favorites ✅ DELETE #2
- **DELETE** `/favorites/:recipeId`
- **Auth:** Required
- **Response:** `{ message: "Recipe removed from favorites" }`
- **Note:** Does NOT delete the recipe, only the favorite association

---

## Rating Endpoints (CRUD)

### Add/Update Rating ✅ CREATE #3 & UPDATE #2
- **POST** `/ratings/:recipeId`
- **Auth:** Required
- **Body:**
  ```json
  {
    "rating": 5,
    "review": "Amazing recipe!"
  }
  ```
- **Response:** `{ message: "Rating added/updated", rating: {...} }`
- **Note:** Idempotent - updates existing rating if user already rated

### Get Recipe Ratings ✅ READ #6
- **GET** `/ratings/recipe/:recipeId`
- **Response:**
  ```json
  {
    "ratings": [
      {
        "id": "...",
        "rating": 5,
        "review": "Amazing!",
        "user": { "id": "...", "name": "..." },
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "averageRating": 4.5,
    "totalRatings": 10
  }
  ```

---

## Admin Endpoints

### Get Admin Dashboard
- **GET** `/admin/dashboard`
- **Auth:** Required (Admin only)
- **Response:**
  ```json
  {
    "statistics": {
      "totalUsers": 100,
      "totalRecipes": 250,
      "totalRatings": 500,
      "totalFavorites": 300
    },
    "recentRecipes": [...]
  }
  ```

---

## CRUD Operations Summary

### CREATE (3 operations)
1. ✅ Create Recipe - `POST /recipes`
2. ✅ Add to Favorites - `POST /favorites/:recipeId`
3. ✅ Add Rating - `POST /ratings/:recipeId`

### READ (6 operations)
1. ✅ Get All Recipes - `GET /recipes` (with pagination, search, filter, sort)
2. ✅ Get Recipe by ID - `GET /recipes/:id`
3. ✅ Get User Recipes - `GET /recipes/user/:userId`
4. ✅ Get Categories - `GET /categories`
5. ✅ Get Favorites - `GET /favorites`
6. ✅ Get Ratings - `GET /ratings/recipe/:recipeId`

### UPDATE (2 operations)
1. ✅ Update Recipe - `PUT /recipes/:id`
2. ✅ Update Rating - `POST /ratings/:recipeId` (idempotent)

### DELETE (2 operations)
1. ✅ Delete Recipe - `DELETE /recipes/:id` (cascades)
2. ✅ Remove Favorite - `DELETE /favorites/:recipeId`

---

## Advanced Features

### Pagination Example
```
GET /recipes?page=2&limit=12
```

### Search Example
```
GET /recipes?search=pasta
```
Searches in: title, description, ingredients

### Filter Example
```
GET /recipes?category=dinner&difficulty=easy
```

### Sort Example
```
GET /recipes?sort=rating&order=desc
GET /recipes?sort=prepTime&order=asc
```

### Combined Example
```
GET /recipes?search=chicken&category=dinner&sort=rating&order=desc&page=1&limit=12
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Validation Error
- `401` - Authentication Error
- `403` - Authorization Error
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

---

## Authentication

Protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

Get token from:
- `POST /auth/signup`
- `POST /auth/login`
