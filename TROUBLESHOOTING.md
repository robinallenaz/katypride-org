# 🆘 Emergency Troubleshooting Guide

> **Purpose**: Step-by-step solutions for urgent website and system issues  \n> **Time Required**: 5-15 minutes for most critical issues  \n> **Target Audience**: Admins and emergency responders  \n> **Severity Levels**: 🟢 Low | 🟡 Medium | 🔴 Critical

---

## 🔴 **CRITICAL ISSUES (Fix Immediately)**

### **Website Completely Down**
**Severity**: 🔴 Critical | **Time**: 5-10 minutes

**Immediate Checklist**:
1. **Check if it's really down**
   - Try multiple devices/computers
   - Try different internet connections
   - Check [Down For Everyone](https://downforeveryoneorjustme.com/)

2. **Check service status**
   - [Vercel Status](https://www.vercel-status.com/)
   - [Render Status](https://status.render.com/)
   - [Cloudflare Status](https://www.cloudflarestatus.com/)

3. **Quick fixes to try**
   - **Clear DNS**: Flush local DNS cache
     - Windows: `ipconfig /flushdns`
     - Mac: `sudo dscacheutil -flushcache`
   - **Restart router/modem**
   - **Try different browser**

4. **If still down after 5 minutes**
   - **Contact technical support immediately**
   - **Post on social media** about the issue
   - **Enable maintenance mode** if available

**📞 Emergency Contacts**:
- **Technical**: [Contact info from EMAIL_TRAVIS_API_KEYS.md](./EMAIL_TRAVIS_API_KEYS.md)
- **Content updates**: Backup admin contact

---

### **Payment Processing Failed**
**Severity**: 🔴 Critical | **Time**: 5-15 minutes

**Immediate Actions**:
1. **Check Stripe Dashboard**
   - Login to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Check for any outages or alerts
   - Review recent failed payments

2. **Verify API Keys**
   - Check environment variables
   - Ensure keys are valid and active
   - Test with Stripe CLI if needed

3. **Check Recent Changes**
   - Any recent code deployments?
   - Environment variable changes?
   - Stripe account changes?

4. **Temporary Solutions**
   - **Switch to manual payments** (PayPal links)
   - **Post payment instructions** on site
   - **Collect payment info** for manual processing

**📧 Communications**:
- **Notify users** about payment issues
- **Provide alternative payment methods**
- **Estimate resolution time**

---

### **Database/CRM Connection Lost**
**Severity**: 🔴 Critical | **Time**: 10-20 minutes

**Diagnosis Steps**:
1. **Test API endpoints**
   ```bash
   # Test CRM health
   curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \\
        http://localhost:3000/api/crm
   ```

2. **Check database status**
   - **Neon Dashboard**: [https://neon.tech/](https://neon.tech/)
   - **Strapi Admin**: Try accessing admin panel
   - **GrowthSphere360**: Check CRM dashboard

3. **Verify connections**
   - **Database URL** in environment variables
   - **API keys** validity
   - **Network connectivity**

4. **Common fixes**
   - **Restart services**: `npm run dev`
   - **Update API keys** if expired
   - **Check database quotas** (free tier limits)

**🔄 Recovery Steps**:
1. **Backup current data** if possible
2. **Restore from backup** if needed
3. **Update connection strings**
4. **Test all integrations**

---

## 🟡 **MEDIUM PRIORITY ISSUES**

### **Forms Not Submitting**
**Severity**: 🟡 Medium | **Time**: 5-10 minutes

**Quick Diagnosis**:
1. **Check browser console** (F12) for JavaScript errors
2. **Test with different browsers**
3. **Check rate limiting** - Wait 1 minute between attempts
4. **Verify API endpoints** are responding

**Common Fixes**:
```javascript
// Test API endpoint manually
fetch('/api/crm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'test',
    name: 'Test User',
    email: 'test@example.com'
  })
})
```

**Debugging Steps**:
1. **Check network tab** in browser dev tools
2. **Review server logs** for errors
3. **Test with minimal data**
4. **Verify CORS settings**

---

### **Images Not Loading/Uploading**
**Severity**: 🟡 Medium | **Time**: 5-15 minutes

**Check List**:
1. **File size limits** - Under 5MB
2. **File formats** - JPG, PNG, WebP only
3. **Storage quotas** - Check Strapi/Render limits
4. **CDN status** - Check image delivery service

**Solutions**:
1. **Compress images** before uploading
2. **Try different file format**
3. **Clear browser cache**
4. **Check internet connection**

**Testing**:
- **Test upload** with small image (under 1MB)
- **Try different browser**
- **Check image URLs** manually

---

### **Admin Panel Access Issues**
**Severity**: 🟡 Medium | **Time**: 5-10 minutes

**Troubleshooting Steps**:
1. **Verify correct URL**: `https://katypride-strapi.onrender.com/admin`
2. **Reset password** - Click "Forgot password"
3. **Check browser compatibility** - Use Chrome/Firefox
4. **Clear browser cache and cookies**

**Common Issues**:
- **Expired session** - Log out and back in
- **Wrong credentials** - Check case sensitivity
- **Account locked** - Contact technical support
- **Browser extensions** - Disable ad blockers

**Alternative Access**:
- **Incognito mode** - Rules out extension issues
- **Different device** - Test on phone/tablet
- **Direct API access** - For technical users

---

## 🟢 **LOW PRIORITY ISSUES**

### **Content Not Updating**
**Severity**: 🟢 Low | **Time**: 5-10 minutes

**Check List**:
1. **Published status** - Ensure content is published
2. **Cache clearing** - Clear website cache
3. **Browser cache** - Hard refresh (Ctrl+Shift+R)
4. **Build status** - Check if deployment completed

**Solutions**:
1. **Republish content** in Strapi
2. **Clear cache** in hosting platform
3. **Trigger new deployment** if needed
4. **Check content permissions**

---

### **Performance Issues**
**Severity**: 🟢 Low | **Time**: 10-20 minutes

**Symptoms**:
- **Slow page loads**
- **Images loading slowly**
- **Forms responding slowly**

**Quick Fixes**:
1. **Clear browser cache**
2. **Close unused browser tabs**
3. **Check internet speed**
4. **Try different time** (server might be busy)

**Long-term Solutions**:
- **Optimize images**
- **Enable caching**
- **Monitor performance**
- **Upgrade hosting if needed**

---

## 🔧 **Diagnostic Tools**

### **Browser Developer Tools**
**How to Open**:
- **Chrome**: F12 or Ctrl+Shift+I
- **Firefox**: F12 or Ctrl+Shift+I
- **Safari**: Develop → Web Inspector

**Key Tabs**:
- **Console**: JavaScript errors
- **Network**: API requests and responses
- **Elements**: HTML structure
- **Sources**: Debugging code

### **API Testing**
**Test endpoints manually**:
```bash
# Test website health
curl https://katypride.org

# Test API health
curl https://katypride-strapi.onrender.com/api/health

# Test CRM endpoint (with auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \\
     https://katypride.org/api/crm
```

### **Log Monitoring**
**Check application logs**:
```bash
# Check Next.js logs
npm run dev

# Monitor for errors
grep -i "error\|failed" .next/server.log

# Check CRM logs
grep -i "crm\|ghl" logs/
```

---

## 📋 **Prevention & Monitoring**

### **Daily Health Checks** (5 minutes)
- [ ] **Website loads** properly
- [ ] **Forms submit** successfully
- [ ] **Admin panel** accessible
- [ ] **No error emails** received

### **Weekly Maintenance** (15 minutes)
- [ ] **Review error logs**
- [ ] **Check performance metrics**
- [ ] **Update documentation**
- [ ] **Test backup systems**

### **Monthly Reviews** (30 minutes)
- [ ] **Security audit**
- [ ] **Performance optimization**
- [ ] **User feedback review**
- [ ] **Update dependencies**

---

## 🚨 **Emergency Response Plan**

### **Level 1: Quick Response** (First 5 minutes)
1. **Assess the issue** - Determine severity
2. **Communicate status** - Post updates if needed
3. **Try quick fixes** - Restart, cache clear, etc.
4. **Escalate if critical** - Contact support

### **Level 2: Investigation** (5-30 minutes)
1. **Gather information** - Error logs, user reports
2. **Test solutions** - Try different approaches
3. **Document progress** - Note what works/doesn't
4. **Update timeline** - Estimate fix time

### **Level 3: Resolution** (30+ minutes)
1. **Implement fix** - Apply solution
2. **Test thoroughly** - Ensure issue resolved
3. **Monitor closely** - Watch for recurrence
4. **Document learnings** - Update procedures

---

## 📞 **Contact Information**

### **Technical Support**
- **Primary**: [Contact from EMAIL_TRAVIS_API_KEYS.md](./EMAIL_TRAVIS_API_KEYS.md)
- **Response time**: 2-4 hours for critical issues
- **Information needed**: Description, screenshots, error messages

### **Service Providers**
- **Vercel (Frontend)**: [Vercel Support](https://vercel.com/support)
- **Render (Backend)**: [Render Support](https://render.com/support)
- **Neon (Database)**: [Neon Support](https://neon.tech/support)
- **Stripe (Payments)**: [Stripe Support](https://stripe.com/support)

### **Community Updates**
- **Social Media**: @KatyPrideLGBTQ
- **Newsletter**: Send status update
- **Website Banner**: Post maintenance notice

---

## 📊 **Issue Tracking**

### **What to Document**
- **Time issue occurred**
- **Symptoms observed**
- **Steps taken**
- **Resolution applied**
- **Users affected**
- **Prevention measures**

### **Post-Incident Review**
- **Root cause analysis**
- **Improvement opportunities**
- **Process updates needed**
- **Training requirements**

---

*This guide is updated regularly. Last reviewed: March 2026*

**Remember**: Stay calm, work methodically, and communicate clearly with users during issues.
