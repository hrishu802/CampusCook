# CampusCook Deployment Guide

## Pre-Deployment Checklist

### 1. Database Setup (MongoDB Atlas)

- [ ] Create MongoDB Atlas account (free tier)
- [ ] Create new cluster
- [ ] Create database user with password
- [ ] Whitelist IP addresses (0.0.0.0/0 for development)
- [ ] Get connection string
- [ ] Test connection locally

### 2. Backend Deployment

#### Option A: Render.com (Recommended)

1. **Create Account** at render.com
2. **New Web Service**
   - Connect GitHub repository
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
3. **Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campuscook
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
4. **Deploy** and note the URL (e.g., `https://campuscook-api.onrender.com`)

#### Option B: Railway.app

1. **Create Account** at railway.app
2. **New Project** → Deploy from GitHub
3. **Select backend folder**
4. **Add Environment Variables** (same as above)
5. **Deploy** and note the URL

### 3. Frontend Deployment

#### Option A: Vercel (Recommended)

1. **Create Account** at vercel.com
2. **Import Project** from GitHub
3. **Configure:**
   - Root directory: `frontend`
   - Framework: Create React App
   - Build command: `npm run build`
   - Output directory: `build`
4. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://campuscook-api.onrender.com/api
   ```
5. **Deploy** and note the URL

#### Option B: Netlify

1. **Create Account** at netlify.com
2. **New Site** from Git
3. **Build Settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
4. **Environment Variables:** (same as above)
5. **Deploy**

### 4. Update CORS Settings

After frontend deployment, update backend environment:
```
CORS_ORIGIN=https://your-actual-frontend-url.vercel.app
```

Redeploy backend.

### 5. Initialize Database

Run these commands to seed initial data:

```bash
# Connect to your deployed backend
curl -X POST https://your-backend-url.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@campuscook.com",
    "password": "admin123",
    "role": "admin"
  }'
```

Or use the frontend signup page to create users.

### 6. Verification Steps

#### Test Backend API
```bash
# Health check
curl https://your-backend-url.com/health

# Get categories
curl https://your-backend-url.com/api/categories

# Get recipes
curl https://your-backend-url.com/api/recipes
```

#### Test Frontend
1. Open hosted frontend URL
2. Open DevTools → Network → Fetch/XHR
3. Perform actions:
   - Signup/Login
   - Create recipe
   - Search recipes
   - Add to favorites
   - Rate recipe
4. Verify API calls in Network tab
5. Check MongoDB Atlas for data

#### Database Verification
1. Login to MongoDB Atlas
2. Browse Collections → campuscook database
3. Verify collections exist:
   - users
   - recipes
   - categories
   - favorites
   - ratings
4. Check that CRUD operations create/update entries

### 7. Update README.md

Replace placeholder URLs in README.md:
```markdown
**Frontend URL:** https://campuscook.vercel.app
**Backend API:** https://campuscook-api.onrender.com
```

### 8. Final Testing

- [ ] User signup works
- [ ] User login works
- [ ] Create recipe works
- [ ] View recipes works
- [ ] Search/filter/sort works
- [ ] Edit recipe works (owner/admin)
- [ ] Delete recipe works (admin)
- [ ] Add to favorites works
- [ ] Rate recipe works
- [ ] Admin dashboard works
- [ ] All data persists in database
- [ ] Mobile responsive design works

## Common Issues

### Backend Won't Start
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check logs for errors

### Frontend Can't Connect to Backend
- Verify REACT_APP_API_URL is correct
- Check CORS settings on backend
- Ensure backend is running

### Database Connection Failed
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has correct permissions

## Production URLs

After deployment, update these:

- **Frontend:** `___________________________`
- **Backend:** `___________________________`
- **Database:** MongoDB Atlas (private)

## Support

For issues, check:
1. Deployment platform logs
2. MongoDB Atlas logs
3. Browser console errors
4. Network tab for failed requests
