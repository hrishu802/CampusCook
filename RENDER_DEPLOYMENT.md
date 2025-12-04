# Deploy CampusCook to Render

## Step 1: Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Log in
3. Create a **FREE** cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/campuscook`)
6. Replace `<password>` with your actual password
7. Keep this connection string handy

## Step 2: Deploy Backend to Render

### Option A: Using Render Dashboard (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `https://github.com/hrishu802/CampusCook`
4. Configure the service:
   - **Name**: `campuscook-api`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campuscook
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
   CORS_ORIGIN=*
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://campuscook-api.onrender.com`)

### Option B: Using render.yaml

1. Push the `render.yaml` file to your repository
2. Go to Render Dashboard → "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect the `render.yaml` file
5. Add the environment variables manually in the dashboard

## Step 3: Seed Categories in Production

After backend is deployed, seed the categories:

```bash
# SSH into Render or use Render Shell
node backend/database/seed-categories.js
```

Or create a one-time job in Render:
1. Go to your service → "Shell"
2. Run: `node database/seed-categories.js`

## Step 4: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://campuscook-api.onrender.com/api
   ```
   (Replace with your actual Render backend URL)

6. Click **"Deploy"**
7. Copy your frontend URL (e.g., `https://campuscook.vercel.app`)

## Step 5: Update CORS

1. Go back to Render Dashboard → Your backend service
2. Update the `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://campuscook.vercel.app
   ```
3. Save and redeploy

## Step 6: Test Your Deployment

1. Open your frontend URL
2. Sign up for an account
3. Create a recipe
4. Test all features:
   - Search
   - Filter by category
   - Pagination
   - Favorites
   - Ratings
   - My Recipes

## Step 7: Update README

Update your README.md with the live URLs:

```markdown
## 🌐 Hosted Application

**Frontend URL:** https://campuscook.vercel.app
**Backend API:** https://campuscook-api.onrender.com
```

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend can't connect to backend
- Check CORS_ORIGIN is set correctly
- Verify REACT_APP_API_URL includes `/api` at the end
- Check browser console for errors

### Database connection failed
- Verify MongoDB Atlas IP whitelist (set to 0.0.0.0/0 for all IPs)
- Check username and password in connection string
- Ensure database user has read/write permissions

### Categories not showing
- Run the seed script: `node database/seed-categories.js`
- Check MongoDB Atlas → Browse Collections → categories

## Free Tier Limitations

**Render Free Tier:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS

**MongoDB Atlas Free Tier:**
- 512MB storage
- Shared cluster
- No credit card required

## Cost Optimization

To keep everything free:
1. Use Render free tier for backend
2. Use Vercel free tier for frontend
3. Use MongoDB Atlas free tier for database
4. Accept the cold start delay on Render

## Production Checklist

- [ ] MongoDB Atlas database created
- [ ] Backend deployed to Render
- [ ] Categories seeded in production database
- [ ] Frontend deployed to Vercel
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] All features tested
- [ ] README updated with live URLs
- [ ] Repository pushed to GitHub

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Logs
3. Check MongoDB Atlas: Clusters → Browse Collections
4. Check browser console for frontend errors
