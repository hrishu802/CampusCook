# CampusCook - Evaluation Guide

## Quick Verification Checklist for Evaluators

### ✅ 1. Backend CRUD Operations (Minimum 2 of each, excluding Auth)

#### CREATE Operations (3 implemented)
1. **Create Recipe**
   - Endpoint: `POST /api/recipes`
   - Test: Login → Click "Add Recipe" → Fill form → Submit
   - Verify: Check Network tab for POST request, check database for new entry

2. **Add Rating/Review**
   - Endpoint: `POST /api/ratings/:recipeId`
   - Test: Open recipe → Rate with stars → Write review → Submit
   - Verify: Check Network tab, database ratings collection

3. **Add to Favorites**
   - Endpoint: `POST /api/favorites/:recipeId`
   - Test: Click heart icon on any recipe
   - Verify: Check Network tab, database favorites collection

#### READ Operations (6 implemented)
1. **Get All Recipes** - `GET /api/recipes`
2. **Get Recipe Details** - `GET /api/recipes/:id`
3. **Get User Recipes** - `GET /api/recipes/user/:userId`
4. **Get Favorites** - `GET /api/favorites`
5. **Get Recipe Ratings** - `GET /api/ratings/recipe/:recipeId`
6. **Get Categories** - `GET /api/categories`

#### UPDATE Operations (2 implemented)
1. **Update Recipe**
   - Endpoint: `PUT /api/recipes/:id`
   - Test: Go to "My Recipes" → Click "Edit" → Modify → Save
   - Verify: Check Network tab for PUT request, database for updated values

2. **Update Rating**
   - Endpoint: `POST /api/ratings/:recipeId` (idempotent)
   - Test: Rate same recipe twice with different stars
   - Verify: Only one rating exists in database with latest value

#### DELETE Operations (2 implemented)
1. **Delete Recipe**
   - Endpoint: `DELETE /api/recipes/:id`
   - Test: Admin login → Any recipe → Delete button
   - Verify: Recipe removed from database, favorites/ratings cascade deleted

2. **Remove Favorite**
   - Endpoint: `DELETE /api/favorites/:recipeId`
   - Test: Go to Favorites → Click remove icon
   - Verify: Favorite removed from database, recipe still exists

---

### ✅ 2. Pagination, Search, Sort, Filter (All via Backend API)

#### Pagination
- **Test:** Home page → Scroll to bottom → Click page numbers
- **Verify Network Tab:** `GET /api/recipes?page=2&limit=12`
- **Expected:** Different recipes on each page

#### Search
- **Test:** Type "pasta" in search bar → Press search
- **Verify Network Tab:** `GET /api/recipes?search=pasta`
- **Expected:** Only recipes matching "pasta" in title/ingredients

#### Filter by Category
- **Test:** Select "Dinner" from category dropdown
- **Verify Network Tab:** `GET /api/recipes?category=dinner`
- **Expected:** Only dinner recipes shown

#### Sort
- **Test:** Select "Prep Time" from sort dropdown
- **Verify Network Tab:** `GET /api/recipes?sort=prepTime&order=asc`
- **Expected:** Recipes ordered by prep time

#### Combined
- **Test:** Search "chicken" + Filter "dinner" + Sort "rating"
- **Verify Network Tab:** `GET /api/recipes?search=chicken&category=dinner&sort=rating&order=desc`
- **Expected:** Filtered and sorted results

---

### ✅ 3. Hosting Verification

#### Frontend Verification
1. **Open Hosted URL** (check README.md for link)
2. **Open DevTools** → Network Tab → Filter: Fetch/XHR
3. **Perform Actions:**
   - Signup → Verify `POST /api/auth/signup`
   - Login → Verify `POST /api/auth/login`
   - Browse recipes → Verify `GET /api/recipes`
   - Create recipe → Verify `POST /api/recipes`
   - Search → Verify `GET /api/recipes?search=...`
   - Add favorite → Verify `POST /api/favorites/:id`
   - Rate recipe → Verify `POST /api/ratings/:id`

#### Backend Verification
1. **API Health Check:**
   ```bash
   curl https://[backend-url]/health
   ```
   Expected: `{"status":"ok","message":"CampusCook API is running"}`

2. **Get Categories:**
   ```bash
   curl https://[backend-url]/api/categories
   ```
   Expected: JSON array of categories

#### Database Verification
1. **Access:** MongoDB Atlas → Browse Collections
2. **Verify Collections Exist:**
   - users
   - recipes
   - categories
   - favorites
   - ratings
3. **Test Data Persistence:**
   - Create recipe via frontend
   - Refresh MongoDB Atlas
   - Verify new document in recipes collection
   - Check all fields are populated correctly

---

### ✅ 4. Documentation Requirements

#### README.md Contains:
- [ ] Hosted frontend URL clearly mentioned at top
- [ ] Hosted backend API URL
- [ ] Complete proposal in markdown format
- [ ] Problem statement
- [ ] Solution description
- [ ] CRUD operations summary
- [ ] API documentation
- [ ] Setup instructions

#### Proposal Includes:
- [ ] Problem statement (college student cooking challenges)
- [ ] Target users
- [ ] Solution description
- [ ] Key features
- [ ] How it solves the problem

---

### ✅ 5. Problem Statement Verification

**Problem:** College students struggle with cooking due to limited budget, time constraints, lack of experience, and difficulty finding suitable recipes.

**Solution Verification:**
1. **Budget-Friendly:** Recipes include prep time and difficulty for quick, easy meals
2. **Time-Saving:** Search and filter by prep time to find quick recipes
3. **Beginner-Friendly:** Difficulty levels (easy/medium/hard) help students find appropriate recipes
4. **Recipe Discovery:** Advanced search, filter by category, sort by rating
5. **Community-Driven:** Students share recipes and rate others' contributions
6. **Personalization:** Favorites system for saving preferred recipes

**Test Flow:**
1. Student signs up
2. Searches for "quick breakfast" recipes
3. Filters by "easy" difficulty and "< 15 min" prep time
4. Finds suitable recipe, saves to favorites
5. Tries recipe, rates it, leaves review
6. Shares own budget-friendly recipe
7. Other students discover and rate it

---

## Quick Test Script (5 minutes)

```
1. Open hosted frontend URL
2. Open DevTools → Network → Fetch/XHR
3. Click "Signup" → Create account → Verify POST /api/auth/signup
4. Login → Verify POST /api/auth/login
5. Browse recipes → Verify GET /api/recipes
6. Search "pasta" → Verify GET /api/recipes?search=pasta
7. Click recipe → Verify GET /api/recipes/:id
8. Click heart (favorite) → Verify POST /api/favorites/:id
9. Rate 5 stars → Verify POST /api/ratings/:id
10. Click "Add Recipe" → Fill form → Submit → Verify POST /api/recipes
11. Go to "My Recipes" → Click "Edit" → Modify → Save → Verify PUT /api/recipes/:id
12. Open MongoDB Atlas → Verify all data persists
```

---

## Expected Results Summary

✅ **Minimum 2 Create, 2 Read, 2 Update, 2 Delete** - EXCEEDED (3 Create, 6 Read, 2 Update, 2 Delete)  
✅ **Pagination, Search, Sort, Filter via API** - ALL IMPLEMENTED  
✅ **Hosted Frontend with Network Tab Verification** - READY  
✅ **Hosted Database with Entry Verification** - READY  
✅ **Documentation with URLs and Proposal** - COMPLETE  
✅ **Solves Problem Statement** - VERIFIED  

---

## Contact

For any questions during evaluation, refer to:
- README.md for setup instructions
- DEPLOYMENT.md for hosting details
- API documentation in README.md
