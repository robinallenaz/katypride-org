# Vercel Deployment Guide for Strapi Backend

## Quick Setup

### 1. Deploy Backend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Select the `katypride-org` repository
5. **Important**: Set **Root Directory** to `backend`
6. Click "Deploy"

### 2. Connect Neon Database
1. Go to your [Neon dashboard](https://neon.tech)
2. Select your existing Katy Pride database
3. Copy the **Connection string** (DATABASE_URL)
4. In Vercel project → **Settings** → **Environment Variables**
5. Add: `DATABASE_URL` = [paste your Neon connection string]

### 3. Environment Variables
Add these remaining variables to Vercel:

```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-salt-here
ADMIN_JWT_SECRET=your-jwt-secret-here
TRANSFER_TOKEN_SALT=your-transfer-salt-here
ENCRYPTION_KEY=your-encryption-key-here
```

**DATABASE_URL** should already be set from your Neon connection.

**Generate secure values** for the keys/secrets using:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 4. Update Frontend Environment
In your main Vercel project (frontend):

```bash
NEXT_PUBLIC_STRAPI_URL=https://your-backend-name.vercel.app
```

## Access URLs

**After deployment:**
- **Backend Admin**: `https://your-backend-name.vercel.app/admin`
- **Backend API**: `https://your-backend-name.vercel.app/api`
- **Frontend**: `https://your-frontend-name.vercel.app`

## Admin Setup

1. Visit your backend admin URL
2. Click "Create the first administrator"
3. Fill in your details
4. Start managing content!

## Project Structure

```
katypride-org/
├── frontend/          # Next.js app (deployed to Vercel)
├── backend/           # Strapi app (deployed to Vercel)
│   ├── vercel.json    # Vercel configuration
│   └── package.json   # Backend dependencies
└── README.md
```

## Troubleshooting

**Build fails?**
- Check Root Directory is set to `backend`
- Verify all dependencies are in `backend/package.json`

**Database connection issues?**
- Ensure `DATABASE_URL` is correctly set by Vercel Storage
- Check database is in same region as your project

**Can't access admin?**
- Wait 2-3 minutes for deployment
- Check deployment logs in Vercel dashboard
- Verify all environment variables are set

## Advantages of Vercel

✅ **Single platform** for frontend and backend  
✅ **Automatic HTTPS** and custom domains  
✅ **GitHub integration** with auto-deploys  
✅ **Built-in PostgreSQL** database  
✅ **Environment variable management**  
✅ **Performance analytics**  

## Next Steps

1. Deploy backend to Vercel
2. Set up PostgreSQL database
3. Configure environment variables
4. Create admin user
5. Update frontend environment variable
6. Test the complete system
