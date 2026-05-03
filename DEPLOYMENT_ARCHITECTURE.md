# 🏗️ Katy Pride Deployment Architecture

## **Current Setup: Separate Services**

### **Frontend (Next.js) → Vercel**
- **URL**: `https://katypride.org`
- **Purpose**: Public website, user interface
- **Deployment**: Vercel (free tier)
- **Build**: `next build` + static optimization

### **Backend (Strapi CMS) → Render**
- **URL**: `https://katypride-strapi.onrender.com`
- **Purpose**: Content management, API, database
- **Deployment**: Render (free tier)
- **Database**: PostgreSQL (Neon via Render)

---

## **Why This Architecture?**

### ✅ **Advantages**
- **Cost Effective**: Both services on free tiers
- **Performance**: Separate scaling for frontend/backend
- **Security**: Backend not exposed to public directly
- **Maintenance**: Clear separation of concerns
- **Reliability**: Independent deployment cycles

### 🎯 **Service Responsibilities**

#### **Vercel (Frontend)**
- Next.js application
- Static assets and images
- User-facing pages
- SEO optimization
- CDN distribution

#### **Render (Backend)**
- Strapi CMS admin panel
- Content management API
- Database operations
- Form submissions (CRM integration)
- Admin authentication

---

## **Configuration Files**

### **Frontend Deployment**
- `vercel.json` - Vercel configuration
- `.vercelignore` - Excludes backend from Vercel build
- `next.config.ts` - Next.js with Render backend rewrites

### **Backend Deployment**
- `render.yaml` - Render service configuration
- `backend/package.json` - Strapi dependencies
- Environment variables managed by Render

---

## **Environment Variables**

### **Vercel Environment**
```bash
NEXT_PUBLIC_STRAPI_URL=https://katypride-strapi.onrender.com
NODE_ENV=production
```

### **Render Environment** (Auto-generated)
```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
DATABASE_URL=postgresql://[render-generated]
APP_KEYS=[render-generated]
ADMIN_JWT_SECRET=[render-generated]
API_TOKEN_SALT=[render-generated]
TRANSFER_TOKEN_SALT=[render-generated]
ENCRYPTION_KEY=[render-generated]
```

---

## **API Communication**

### **Frontend → Backend Routes**
- `/admin/*` → Strapi admin panel
- `/api/strapi/*` → Strapi API endpoints

### **Rewrite Rules** (next.config.ts)
```javascript
// Admin panel access
'/admin/:path*' → 'https://katypride-strapi.onrender.com/admin/:path*'

// API calls
'/api/strapi/:path*' → 'https://katypride-strapi.onrender.com/api/:path*'
```

---

## **Deployment Workflow**

### **Initial Setup**
1. **Deploy Backend** to Render first
2. **Get Render URL** (`katypride-strapi.onrender.com`)
3. **Update Frontend** environment variables
4. **Deploy Frontend** to Vercel

### **Ongoing Updates**
- **Backend changes**: Auto-deploy on push to `main` branch
- **Frontend changes**: Auto-deploy on push to `main` branch
- **Independent**: Each service can be updated separately

---

## **Cost Breakdown**

### **Current (Free Tiers)**
- **Vercel**: $0/month (Frontend)
- **Render**: $0/month (Backend + Database)
- **Total**: $0/month

### **Future Scaling**
- **Vercel Pro**: $20/month (advanced features)
- **Render Starter**: $7/month (better performance)
- **Database Upgrade**: $10/month (more connections)

---

## **Troubleshooting**

### **Common Issues**
- **CORS errors**: Check backend CORS settings
- **API timeouts**: Render free tier cold starts
- **Build failures**: Verify environment variables
- **Database issues**: Check Render database status

### **Health Checks**
- **Frontend**: `https://katypride.org`
- **Backend API**: `https://katypride-strapi.onrender.com/api/health`
- **Backend Admin**: `https://katypride-strapi.onrender.com/admin`

---

## **Migration History**

### **Previous Architecture**
- **Monolithic**: Frontend + Backend on Vercel
- **Issues**: Build complexity, resource constraints

### **Current Architecture**
- **Separated**: Vercel (frontend) + Render (backend)
- **Benefits**: Better performance, cost optimization

---

## **Next Steps**

### **Improvements Planned**
- [ ] Add custom domain to Render backend
- [ ] Implement caching strategies
- [ ] Add monitoring and alerts
- [ ] Optimize database queries
- [ ] Add backup strategies

### **Scaling Considerations**
- **Traffic spikes**: Upgrade Render plan during events
- **Content growth**: Optimize image delivery
- **User growth**: Consider CDN for API responses

---

## **Support Contacts**

### **Hosting Providers**
- **Vercel Support**: [vercel.com/help](https://vercel.com/help)
- **Render Support**: [render.com/docs](https://render.com/docs)

### **Documentation**
- **Vercel Deployment**: `./VERCEL_DEPLOYMENT.md`
- **Render Deployment**: `./RENDER_DEPLOYMENT.md`
- **Admin Guide**: `./ADMIN_GUIDE.md`
