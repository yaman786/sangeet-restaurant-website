# Deployment Update Guide - Minimal Changes

This guide explains the minimal changes needed to use the unified repository while keeping both deployments working.

## 🎯 What We've Done

✅ Created `frontend/netlify.toml` - Tells Netlify to build from frontend directory  
✅ Created `backend/render.yaml` - Tells Render to deploy from backend directory  
✅ Updated `package.json` - Added helpful development scripts  

## 🔄 What You Need to Do

### Step 1: Update Netlify Settings

1. Go to your Netlify dashboard
2. Find your frontend site
3. Go to **Site settings** → **Build & deploy** → **Build settings**
4. Update these settings:
   - **Repository**: Change to this monorepo URL
   - **Base directory**: `frontend` (leave blank if not available)
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
5. **Keep all existing environment variables unchanged**

### Step 2: Update Backend Deployment Settings

1. Go to your backend hosting platform (Render/Railway/etc.)
2. Find your backend service
3. Update these settings:
   - **Repository**: Change to this monorepo URL
   - **Root directory**: `backend`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
4. **Keep all existing environment variables unchanged**

### Step 3: Test Everything

1. Push your code to this repository
2. Check that Netlify builds successfully
3. Check that backend deploys successfully
4. Test that frontend can still communicate with backend

## 🚀 Development Commands

Now you can use these commands for local development:

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend locally
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Clean and reinstall everything
npm run clean:install
```

## ✅ Expected Result

- Both deployments continue working exactly as before
- All code is now in one repository
- Local development is easier with `npm run dev`
- Zero risk of breaking existing deployments

## 🚨 If Something Goes Wrong

1. **Netlify build fails**: Check that `frontend/netlify.toml` exists
2. **Backend deployment fails**: Check that `backend/render.yaml` exists
3. **Environment variables**: Make sure you didn't accidentally change any
4. **Revert**: You can always change the repository URL back to the original repos

## 📞 Support

- **Netlify Issues**: Check Netlify build logs
- **Backend Issues**: Check your backend platform logs
- **Local Development**: Use `npm run dev` to test everything locally

That's it! Minimal changes, maximum safety. 🎉
