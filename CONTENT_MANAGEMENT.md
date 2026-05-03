# 📝 Content Management Guide

> **Purpose**: Step-by-step instructions for managing all website content  \n> **Time Required**: 10-15 minutes initial setup, 5 minutes daily updates  \n> **Target Audience**: Content managers, social media coordinators, event organizers  \n> **Prerequisites**: Strapi admin access

---

## 🚀 **Daily Content Management (5 Minutes)**

### **Daily Tasks** (15 minutes)
- [ ] **Check new form submissions** → CRM Dashboard
- [ ] **Add new Facebook events** for upcoming week
- [ ] **Update homepage** if needed → Carousel images
- [ ] **Review Facebook events** displaying correctly on website
- [ ] **Check newsletter signups** → Email/CRM

### **Weekly Tasks** (15 minutes)
- [ ] **Add Facebook events** for upcoming 2-3 weeks
- [ ] **Update carousel images** with fresh content
- [ ] **Review newsletter signups** and engagement
- [ ] **Check Facebook events** are displaying properly
- [ ] **Monitor form submissions** and follow up if needed

---

## 🎨 **Homepage Management**

### **Carousel Images**
**Location**: Strapi → Content Manager → Carousel Image

**Adding New Images**:
1. **Click** + Create new entry
2. **Upload Image** (recommended 1200x630px)
3. **Add Title** (appears as overlay text)
4. **Set Alt Text** (for accessibility)
5. **Add Link** (optional - where image should link to)
6. **Toggle Active** to show on homepage
7. **Save and Publish**

**Best Practices**:
- ✅ **High-quality images** - Clear, well-lit photos
- ✅ **Consistent sizing** - 1200x630px for best display
- ✅ **Descriptive alt text** - Helps with accessibility and SEO
- ✅ **Relevant content** - Current events, community photos
- ❌ **Avoid**: Low-resolution, blurry, or unrelated images
- ❌ **Don't forget**: Set "Active" to true

**Content Ideas**:
- Event photos from recent gatherings
- Community member spotlights
- Event flyers and announcements
- Seasonal/holiday themed images
- Sponsor logos (with permission)

---

## 📅 **Events Management**

### **Facebook Events Integration (Primary)**

The website calendar now pulls events directly from our Facebook Page (`KatyPrideLGBTQ`), making event management much simpler.

**Adding New Events**:
1. **Go to Facebook**: [KatyPrideLGBTQ/events](https://www.facebook.com/KatyPrideLGBTQ/events)
2. **Click "Create Event"** → Fill in event details
3. **Add Event Photo** (recommended 1200x630px)
4. **Set Date/Time/Location** → Be as detailed as possible
5. **Publish Event** → Appears on website within 5 minutes

**Event Information to Include**:
- **Full event name** (e.g., "Katy Pride Monthly Social - March 2026")
- **Complete address** with parking information
- **Start and end times** (accurate)
- **Detailed description** with all relevant information
- **Event photo** (high-quality, relevant)
- **Event category** (Community, Social, Fundraising, etc.)

**Benefits of Facebook Events**:
- ✅ **Single source of truth** - No duplicate data entry
- ✅ **Real-time updates** - Changes appear immediately
- ✅ **Full social features** - RSVP, sharing, comments
- ✅ **Mobile app integration** - Users manage via Facebook app
- ✅ **Automatic notifications** - Facebook reminds attendees
- ✅ **No maintenance overhead** - Facebook handles everything

### **Strapi Events (Backup System)**

For events that need special website features or don't fit Facebook Events format:

**Location**: Strapi → Content Manager → Event

**When to Use Strapi Events**:
- Events requiring custom website features
- Events not suitable for Facebook (private/internal)
- Events with complex registration systems
- Backup when Facebook is down

**Adding Strapi Events**:
1. **Click** + Create new entry
2. **Required Fields**:
   - **Event Title** (e.g., "Katy Pride Celebration 2026")
   - **Start Date & Time** (format: YYYY-MM-DD HH:mm)
   - **Location** (full address with venue name)
3. **Optional Enhancements**:
   - **End Date & Time** (for multi-hour events)
   - **Event Description** (rich text formatting)
   - **Event Image/Flyer** (1200x630px recommended)
   - **Registration Link** (external registration page)
   - **Button Text** (custom CTA like "Register Now")
   - **Event Category** (General Event or Coffee Meetup)
   - **Published** (toggle to show on website)

### **Event Management Strategy**

**Primary System**: Facebook Events
- **All community events** should use Facebook Events
- **Social events, meetups, fundraisers** → Facebook Events
- **Public gatherings** → Facebook Events
- **Recurring events** → Facebook Events

**Secondary System**: Strapi Events
- **Website-only events** with special features
- **Private events** not suitable for Facebook
- **Complex registration systems** requiring custom forms
- **Backup events** when Facebook integration is down

### **Event Best Practices**

**Facebook Events**:
- ✅ **Add events 2+ weeks in advance** for better promotion
- ✅ **Use high-quality cover photos** (1200x630px)
- ✅ **Include complete address** with parking details
- ✅ **Write detailed descriptions** with all relevant info
- ✅ **Set accurate dates and times** (include timezone)
- ✅ **Use consistent naming** (e.g., "Pride Night - Month Year")
- ❌ **Don't forget** to publish the event
- ❌ **Don't use** ALL CAPS in event titles

**Strapi Events**:
- ✅ **Test registration links** before publishing
- ✅ **Optimize images** for web (under 5MB)
- ✅ **Set "Published" to true** to display
- ❌ **Don't forget** to set event category
- ❌ **Don't leave** required fields empty**

---

## 🔗 **Resources Management**

### **Adding Community Resources**
**Location**: Strapi → Content Manager → Resource Link

**Resource Categories**:
- **Health** - Medical, mental health, counseling services
- **Advocacy** - Legal aid, rights organizations, hotlines
- **Ally** - Resources for allies and supporters
- **Regional** - Katy/Houston area organizations
- **National** - National LGBTQ+ organizations

**Adding New Resource**:
1. **Name** - Organization name (e.g., "The Montrose Center")
2. **URL** - Website address (https://...)
3. **Category** - Select appropriate category
4. **Description** - Brief description of services
5. **Active** - Toggle to show on website
6. **Save and Publish**

**Quality Guidelines**:
- ✅ **Verify links work** before publishing
- ✅ **Include descriptions** of services offered
- ✅ **Keep information current**
- ✅ **Organize by appropriate category**
- ❌ **Don't include**: Outdated or inactive organizations
- ❌ **Avoid**: Broken links or outdated information

---

## 📧 **Newsletter Management**

### **Managing Subscribers**
**Location**: GrowthSphere360 CRM Dashboard

**View New Subscribers**:
1. **Login to CRM**: [GrowthSphere360 Dashboard](https://app.gohighlevel.com/)
2. **Navigate**: Contacts → Filter by "newsletter" tag
3. **Review**: New subscriber information
4. **Export**: If needed for email campaigns

**Newsletter Content**:
- **Monthly updates** - Events, announcements, community news
- **Event reminders** - Upcoming gatherings and activities
- **Spotlight features** - Community members, sponsors, partners
- **Call to actions** - Volunteer opportunities, donations

**Best Practices**:
- ✅ **Send monthly** - Consistent schedule
- ✅ **Include event updates** - Keep community informed
- ✅ **Add unsubscribe link** - Legal requirement
- ✅ **Proofread before sending** - Check for errors
- ❌ **Don't spam** - Respect subscriber preferences
- ❌ **Avoid**: Too frequent or irrelevant emails

---

## 🏪 **Vendor Management**

### **Processing Vendor Applications**
**Location**: GrowthSphere360 CRM + Manual Review

**Application Workflow**:
1. **Submission** → Vendor form creates CRM contact
2. **Review** → Check application completeness
3. **Approval** → Send payment link via email
4. **Payment** → Process through Stripe or manual
5. **Contract** → Send vendor agreement
6. **Confirmation** → Add to event vendor list

**CRM Tags for Vendors**:
- `vendor` - All vendor applicants
- `vendor-{type}` - nonprofit, forprofit, food, etc.
- `katy-pride-celebration-2026` - Event specific
- `paid` - Payment completed
- `contract-signed` - Agreement completed

**Vendor Communication**:
- **Application received** - Immediate auto-response
- **Payment request** - Manual email with payment link
- **Contract sent** - After payment confirmation
- **Event details** - 2 weeks before event
- **Reminder** - 1 week before event

---

## 📊 **Content Performance**

### **Monitoring Content Effectiveness**

**Key Metrics to Track**:
- **Event attendance** - Compare registration vs actual attendance
- **Form submissions** - Volume and completion rates
- **Resource clicks** - Most accessed community resources
- **Newsletter engagement** - Open rates, click-through rates
- **Vendor applications** - Number and quality of applicants

**Monthly Review** (30 minutes):
1. **Check analytics** - Website traffic and engagement
2. **Review form submissions** - Identify trends or issues
3. **Update outdated content** - Remove or refresh old information
4. **Plan content calendar** - Schedule upcoming posts and updates

---

## 🔧 **Technical Content Tasks**

### **Image Management**
**File Requirements**:
- **Size**: Under 5MB per image
- **Format**: JPG, PNG, or WebP
- **Dimensions**: 
  - Carousel: 1200x630px (recommended)
  - Events: 800x400px (recommended)
  - General: 1200px width (variable height)

**Image Optimization**:
1. **Compress images** before uploading
2. **Use appropriate formats** - JPG for photos, PNG for logos
3. **Include alt text** for accessibility
4. **Test display** on different devices

### **Link Management**
**Regular Tasks**:
- **Check external links** monthly for broken URLs
- **Update event links** after events conclude
- **Verify registration links** work properly
- **Test all navigation** menus and buttons

**Link Best Practices**:
- ✅ **Use descriptive text** - "Register for Pride Celebration" vs "Click here"
- ✅ **Open external links** in new tabs when appropriate
- ✅ **Test all links** before publishing
- ❌ **Don't use**: "click here" or vague link text

---

## 📱 **Mobile Content Considerations**

### **Mobile-First Content**
**Guidelines**:
- **Short paragraphs** - Easier to read on small screens
- **Clear headings** - Help with content scanning
- **Touch-friendly buttons** - Large enough for fingers
- **Fast-loading images** - Optimize for mobile data

**Testing**:
1. **Review on phone** - Check content display
2. **Test navigation** - Ensure menus work properly
3. **Verify forms** - Mobile form submission
4. **Check load times** - Optimize if slow

---

## 🎯 **Content Planning**

### **Monthly Content Calendar**
**Week 1**: Event announcements and registration opens
**Week 2**: Community spotlights and resource highlights
**Week 3**: Event reminders and volunteer opportunities
**Week 4**: Newsletter preparation and monthly updates

### **Seasonal Content**
**Spring (Feb-April)**:
- Pride Month planning
- Volunteer recruitment
- Sponsorship outreach

**Summer (May-July)**:
- Pride Celebration promotion
- Event coverage and photos
- Community engagement

**Fall (Aug-Oct)**:
- Back-to-school events
- Fall fundraising campaigns
- Community education

**Winter (Nov-Jan)**:
- Holiday events
- Year-in-review content
- New year planning

---

## 📋 **Content Quality Checklist**

### **Before Publishing**
- [ ] **Spelling and grammar** - Proofread all content
- [ ] **Links work** - Test all external and internal links
- [ ] **Images load** - Verify all images display properly
- [ ] **Mobile friendly** - Check on phone/tablet
- [ ] **Accurate information** - Verify dates, times, locations
- [ ] **Appropriate tone** - Professional yet welcoming
- [ ] **Accessible** - Alt text, clear formatting

### **After Publishing**
- [ ] **Test live page** - Check how content appears
- [ ] **Share on social media** - Promote new content
- [ ] **Monitor engagement** - Track views and interactions
- [ ] **Gather feedback** - Note any issues or suggestions

---

## 🆘 **Common Content Issues**

### **Image Not Displaying**
**Solutions**:
1. **Check file size** - Under 5MB
2. **Verify format** - JPG, PNG, or WebP
3. **Check internet connection**
4. **Clear browser cache**
5. **Try different browser**

### **Event Not Showing**
**Check These**:
1. **Published toggle** - Must be set to "true"
2. **Start date** - Future dates only display
3. **Event category** - Correct category selected
4. **Cache cleared** - Try hard refresh (Ctrl+Shift+R)

### **Form Not Working**
**Troubleshooting**:
1. **Check required fields** - All marked fields must be filled
2. **Verify email format** - Must be valid email address
3. **Test with different browser** - Rules out browser issues
4. **Wait 1 minute** - Rate limiting may be active

---

## 📞 **Getting Help**

### **Content Support**
- **Technical issues**: info@katypride.org
- **Content questions**: Contact content manager
- **Training requests**: Schedule training session
- **Urgent issues**: Mark email "Urgent - Content Issue"

### **Resources**
- **Admin Guide**: [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **FAQ**: [FAQ.md](./FAQ.md)
- **CRM Integration**: [CRM_INTEGRATION_STATUS.md](./CRM_INTEGRATION_STATUS.md)

---

*This guide is updated regularly. Last reviewed: March 2026*

**Need help with specific content?** Email info@katypride.org with "Content Help" in the subject line.
