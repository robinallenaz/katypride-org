# Render Deployment Guide for Strapi Backend

## Quick Setup

### 1. Connect Your Repository
1. Go to [render.com](https://render.com)
2. Sign up/login
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Select the `katypride-org` repository

### 2. Configure Web Service
- **Name**: `katypride-strapi`
- **Environment**: `Node`
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`
- **Plan**: Free (or Starter for better performance)

### 3. Add PostgreSQL Database
1. Click "New" → "PostgreSQL"
2. **Name**: `katypride-db`
3. **Plan**: Free
4. **Database Name**: `katypride_strapi`

### 4. Environment Variables
Add these in your Web Service settings:

```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
DATABASE_URL=postgresql://[auto-generated-by-render]
APP_KEYS=[auto-generated-by-render]
API_TOKEN_SALT=[auto-generated-by-render]
ADMIN_JWT_SECRET=[auto-generated-by-render]
TRANSFER_TOKEN_SALT=[auto-generated-by-render]
ENCRYPTION_KEY=[auto-generated-by-render]
```

### 5. Update Frontend Environment
In your GitHub repository settings or Vercel dashboard:

```bash
NEXT_PUBLIC_STRAPI_URL=https://katypride-strapi.onrender.com
```

## Access URLs

**After deployment:**
- **Admin Panel**: `https://katypride-strapi.onrender.com/admin`
- **API Endpoint**: `https://katypride-strapi.onrender.com/api`
- **Frontend**: `https://[username].github.io/katypride-org`

## Admin Setup

1. Visit your admin URL
2. Create the first admin user
3. Set up your content types
4. Start managing content!

## Troubleshooting

**Build fails?**
- Check that all dependencies are in `backend/package.json`
- Verify build command path is correct

**Can't access admin?**
- Wait 2-3 minutes for full deployment
- Check health logs in Render dashboard
- Verify `/admin` health check path

**Database connection issues?**
- Ensure DATABASE_URL is correctly set
- Check database is in same region as web service

## Production Considerations

**Free tier limitations:**
- App sleeps after 15 minutes inactivity
- Cold start takes ~30 seconds
- Limited database connections

**Upgrade recommendations:**
- Starter plan ($7/month) for better performance
- Dedicated database for production use

## Next Steps

1. Deploy to Render using this guide
2. Test admin panel access
3. Create initial admin user
4. Update frontend environment variable
5. Test content management workflow
