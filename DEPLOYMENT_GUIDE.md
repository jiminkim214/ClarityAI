# ClarityAI Deployment Guide

## Overview
- **Frontend (React):** Deploy to Vercel
- **Backend (FastAPI):** Deploy to Railway
- **Database:** Use Supabase

## Step 1: Set Up Supabase Database

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for setup to complete

2. **Set Up Database Schema:**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the entire content of `supabase_schema.sql`
   - Click "Run" to create all tables and policies

3. **Get Credentials:**
   - Go to Settings → API
   - Copy your Project URL and anon key

## Step 2: Deploy Backend to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Deploy Backend:**
   ```bash
   cd backend
   railway init
   railway up
   ```

4. **Set Environment Variables in Railway:**
   - Go to your Railway project dashboard
   - Add these environment variables:
   
   ```
   DATABASE_URL=your_supabase_postgres_url
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   CORS_ORIGINS=["https://your-frontend-domain.vercel.app"]
   ```

5. **Get Backend URL:**
   - Railway will provide a URL like: `https://your-app-name.railway.app`
   - Save this URL for the frontend configuration

## Step 3: Deploy Frontend to Vercel

1. **Push Code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset:** Vite
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

3. **Set Environment Variables in Vercel:**
   - In Vercel project settings, add:
   
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your frontend

## Step 4: Test Your Deployment

1. **Test Backend:**
   - Visit: `https://your-backend-url.railway.app/docs`
   - Should show FastAPI documentation

2. **Test Frontend:**
   - Visit your Vercel URL
   - Should load the React app

3. **Test Integration:**
   - Try sending a message in the chat
   - Check if backend responds correctly

## Environment Variables Reference

### Backend (Railway)
```
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
CORS_ORIGINS=["https://your-frontend.vercel.app"]
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.railway.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Troubleshooting

### Backend Issues
- Check Railway logs for errors
- Verify environment variables are set correctly
- Ensure Supabase database is accessible

### Frontend Issues
- Check Vercel build logs
- Verify API URL is correct
- Check browser console for errors

### Database Issues
- Verify Supabase connection
- Check if tables were created correctly
- Test database queries in Supabase dashboard

## URLs After Deployment

- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://your-project.railway.app`
- **Backend Docs:** `https://your-project.railway.app/docs`
- **Supabase Dashboard:** `https://app.supabase.com/project/your-project-id` 