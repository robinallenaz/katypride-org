# 📘 Facebook Events Integration Setup Guide

> **Purpose**: Complete guide for setting up Facebook Events integration on Katy Pride website  \n> **Time Required**: 15-30 minutes  \n> **Target Audience**: Website administrators, social media managers  \n> **Prerequisites**: Facebook Page admin access

---

## 🎯 **Overview**

The Facebook Events integration pulls events directly from your Facebook Page (`KatyPrideLGBTQ`) and displays them on the website calendar page. This eliminates the need to maintain separate calendars and keeps everything centralized on Facebook.

**Benefits**:
- ✅ **Single source of truth** - Update once on Facebook, appears everywhere
- ✅ **Easy maintenance** - No duplicate calendar management
- ✅ **Real-time updates** - Events appear immediately when posted
- ✅ **Facebook integration** - Users can RSVP and interact directly
- ✅ **Mobile-friendly** - Responsive event display

---

## 🔧 **Setup Requirements**

### **Facebook Page Access**
- **Page**: [KatyPrideLGBTQ](https://www.facebook.com/KatyPrideLGBTQ)
- **Required**: Page admin or editor role
- **Needed**: Facebook Page Access Token

### **Technical Requirements**
- **Environment Variable**: `FACEBOOK_PAGE_ACCESS_TOKEN`
- **API Version**: Facebook Graph API v18.0
- **Permissions**: `pages_read_engagement`, `pages_show_list`

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Create Facebook App**
1. **Go to**: [Facebook Developers](https://developers.facebook.com/)
2. **Create App** → "Business" or "None"
3. **App Name**: "Katy Pride Website Events"
4. **Contact Email**: Your admin email
5. **Create App** and continue

### **Step 2: Configure App Permissions**
1. **Add Product**: "Facebook Login"
2. **Set up Web**: Add your website domain
3. **App Review** → Request permissions:
   - `pages_read_engagement` - Read page content
   - `pages_show_list` - Access page information

### **Step 3: Get Page Access Token**
1. **Go to**: [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. **Select your app** from dropdown
3. **Select permissions**: `pages_read_engagement`, `pages_show_list`
4. **Click "Generate Access Token"**
5. **Get Page Token**:
   ```
   GET /me/accounts
   ```
6. **Copy the `access_token`** for KatyPrideLGBTQ page

### **Step 4: Set Environment Variable**
Add to your environment variables:

```bash
# Production (Render/Vercel)
FACEBOOK_PAGE_ACCESS_TOKEN=your_long_lived_page_access_token

# Local development
FACEBOOK_PAGE_ACCESS_TOKEN=your_long_lived_page_access_token
```

**Important**: Use a **long-lived** token (expires in 60 days) rather than short-lived.

### **Step 5: Test Integration**
1. **Visit**: `/calendar` page on your website
2. **Should see**: Events from Facebook page
3. **Check browser console** for any errors
4. **Verify** events display correctly with images and details

---

## 🛠️ **Technical Implementation**

### **Files Created/Modified**
- `src/lib/facebook-calendar.ts` - Facebook API integration
- `src/components/FacebookEventsList.tsx` - Event display component
- `src/app/calendar/page.tsx` - Updated calendar page

### **API Endpoints Used**
- **Graph API**: `https://graph.facebook.com/v18.0/{pageId}/events`
- **Fields**: id, name, description, start_time, end_time, place, cover, is_online
- **Filtering**: `time_filter=upcoming` for future events only

### **Caching Strategy**
- **Server-side**: 5-minute cache via Next.js revalidate
- **Client-side**: Browser cache headers
- **Fallback**: Shows error state if API fails

---

## 📋 **Strapi Configuration (Optional)**

For advanced configuration, you can create a Facebook Calendar Settings content type in Strapi:

### **Content Type Structure**
```json
{
  "pageId": "string (required)",
  "pageName": "string",
  "calendarTitle": "string", 
  "calendarDescription": "text",
  "showSubscribeButtons": "boolean",
  "maxEvents": "integer"
}
```

### **Default Settings**
If no Strapi settings exist, the system uses these defaults:
- **Page ID**: `KatyPrideLGBTQ`
- **Page Name**: `Katy Pride`
- **Max Events**: 10
- **Show Buttons**: true

---

## 🔍 **Testing & Troubleshooting**

### **Common Issues**

**No Events Showing**:
1. **Check token validity** - Token may have expired
2. **Verify page permissions** - Ensure app has page access
3. **Check Facebook page** - Make sure events are published
4. **Review console errors** - Check browser dev tools

**API Errors**:
```javascript
// Common error responses
{
  "error": {
    "message": "Invalid OAuth access token",
    "type": "OAuthException",
    "code": 190
  }
}
```

**Solutions**:
- **Regenerate token** - Create new page access token
- **Check app permissions** - Ensure proper permissions granted
- **Verify page ID** - Confirm correct Facebook page ID

### **Debug Steps**
1. **Check environment variable**:
   ```bash
   echo $FACEBOOK_PAGE_ACCESS_TOKEN
   ```

2. **Test API directly**:
   ```bash
   curl "https://graph.facebook.com/v18.0/KatyPrideLGBTQ/events?access_token=YOUR_TOKEN"
   ```

3. **Check website logs**:
   ```bash
   # Look for Facebook API errors
   grep -i "facebook" logs/
   ```

---

## 📊 **Event Display Features**

### **What Gets Displayed**
- ✅ **Event name** and description
- ✅ **Date and time** (formatted for local timezone)
- ✅ **Location** with address details
- ✅ **Cover images** (if uploaded)
- ✅ **Online event indicator**
- ✅ **"View on Facebook"** button
- ✅ **Follow page** button

### **Event Formatting**
- **Dates**: Full date with weekday (e.g., "Friday, October 10, 2026")
- **Times**: 12-hour format (e.g., "6:30 PM")
- **Locations**: Venue name + full address
- **Images**: Automatic resizing and responsive display

### **User Interactions**
- **Click event** → Opens Facebook event page
- **RSVP on Facebook** → Full Facebook functionality
- **Share events** → Native Facebook sharing
- **Calendar export** → Through Facebook event page

---

## 🔄 **Maintenance**

### **Monthly Tasks**
- [ ] **Check token expiration** - Tokens expire after 60 days
- [ ] **Verify event display** - Ensure new events appear correctly
- [ ] **Monitor API usage** - Check Facebook API limits
- [ ] **Update page settings** if needed

### **Token Renewal**
**Every 60 days**:
1. **Go to Graph API Explorer**
2. **Generate new page access token**
3. **Update environment variable**
4. **Restart application** (if needed)

### **Content Management**
**Through Facebook Page**:
- **Add events** → Post as Facebook Events
- **Edit events** → Update on Facebook page
- **Delete events** → Remove from Facebook page
- **Event photos** → Upload cover images to Facebook

---

## 🎨 **Customization Options**

### **Display Settings**
In Strapi (or hardcoded defaults):
- **Max events** displayed (default: 10)
- **Calendar title** and description
- **Show/hide follow buttons**
- **Page name** for branding

### **Styling Customization**
**CSS classes available**:
- `.facebook-event-card` - Individual event cards
- `.facebook-event-image` - Event cover images
- `.facebook-event-details` - Event information
- `.facebook-event-actions` - Button container

### **Content Options**
- **Event filtering** - Can filter by event type
- **Date range** - Limit to specific time periods
- **Sorting** - By date or name
- **Featured events** - Highlight specific events

---

## 📞 **Support & Help**

### **If Setup Fails**
1. **Check this guide** for troubleshooting steps
2. **Review Facebook documentation** for API changes
3. **Contact technical support** - info@katypride.org
4. **Check Facebook Developer** forums

### **Useful Links**
- **Facebook Graph API**: [developers.facebook.com/docs/graph-api](https://developers.facebook.com/docs/graph-api)
- **Page Access Tokens**: [developers.facebook.com/docs/pages/access-tokens](https://developers.facebook.com/docs/pages/access-tokens)
- **Graph API Explorer**: [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)

### **Common Questions**
**Q: Do I need to update events in two places?**
A: No! Just update on Facebook and the website automatically syncs.

**Q: Can users RSVP through the website?**
A: Users click "View on Facebook" to RSVP and interact with the full event.

**Q: What if Facebook API changes?**
A: The integration uses stable Graph API endpoints. We monitor for changes and update as needed.

---

## 🚀 **Next Steps**

### **After Setup**
1. **Test thoroughly** - Verify all events display correctly
2. **Train content managers** - Show how to post Facebook events
3. **Monitor performance** - Check page load times
4. **Gather user feedback** - Ask community about the new system

### **Future Enhancements**
- **Event filtering** by category
- **Calendar view** options (month/week/day)
- **Event reminders** and notifications
- **Social sharing** improvements
- **Mobile app** integration

---

*This guide is updated as Facebook API changes occur. Last reviewed: March 2026*

**Need help with setup?** Email info@katypride.org with "Facebook Events Setup" in the subject line.
