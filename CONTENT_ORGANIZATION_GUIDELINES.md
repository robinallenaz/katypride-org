# 📋 Katy Pride Website Content Organization Guidelines

## 🎯 **Content Purpose & User Intent**

### **Resources Page** (`/resources`)
**Primary Purpose**: External help and support links
**User Intent**: "I need help/find resources"

**What Belongs Here**:
- ✅ Health services (AHF, Legacy Community Health)
- ✅ Advocacy organizations (ACLU, Equality Texas)
- ✅ Ally organizations (PFLAG, Montrose Center)
- ✅ Regional Pride organizations
- ✅ National LGBTQ+ resources
- ✅ Support hotlines and crisis lines

**What Doesn't Belong Here**:
- ❌ Donation appeals (wrong user intent)
- ❌ Vendor recruitment (different purpose)
- ❌ Internal Katy Pride programs
- ❌ Event promotion
- ❌ Membership drives

---

## 🔄 **Better Content Organization**

### **Current Structure Issues**
1. **Resources page** has fundraising content (user confusion)
2. **Donate page** exists but not prominently linked
3. **Vendor page** buried in resources section
4. **Mixed user intents** on single pages

### **Recommended Structure**

#### **🏠 Homepage**
- **Purpose**: Organization overview and navigation
- **Content**: Mission, upcoming events, quick actions
- **CTAs**: Donate, Volunteer, Get Involved

#### **📚 Resources Page** (`/resources`)
- **Purpose**: External help directory
- **Content**: Health, advocacy, ally, regional, national resources
- **User Flow**: "I need help" → find relevant services

#### **💝 Donate Page** (`/donate`)
- **Purpose**: Fundraising and donation processing
- **Content**: Donation tiers, impact stories, payment forms
- **User Flow**: "I want to give" → donation options

#### **🏪 Vendor Page** (`/vendor-signup`)
- **Purpose**: Vendor recruitment and applications
- **Content**: Vendor types, fees, benefits, application form
- **User Flow**: "I want to participate" → vendor options

#### **🤝 Volunteer Page** (`/volunteer`)
- **Purpose**: Volunteer recruitment and engagement
- **Content**: Volunteer opportunities, sign-up forms, impact
- **User Flow**: "I want to help" → volunteer options

---

## 🎯 **Page-Specific Content Guidelines**

### **Resources Page - Focused Content**

#### **What to Add** (to improve the page):
```html
<!-- Resource Categories -->
<nav>
  <a href="#health">Health & Wellness</a>
  <a href="#advocacy">LGBTQ Advocacy</a>
  <a href="#ally">LGBTQ & Ally</a>
  <a href="#regional">Regional Pride</a>
  <a href="#national">National Resources</a>
</nav>

<!-- Resource Cards -->
<section id="health">
  <h2>Health and Wellness Resources</h2>
  <!-- Health resource links -->
</section>

<!-- Emergency Resources Section -->
<section class="emergency-resources">
  <h2>Crisis & Support Hotlines</h2>
  <!-- 24/7 hotlines, crisis lines -->
</section>

<!-- Resource Submission -->
<section class="suggest-resource">
  <h2>Know a Resource We Should Include?</h2>
  <!-- Form to suggest new resources -->
</section>
```

#### **What to Remove** (already done):
- ❌ "Support Katy Pride" fundraising section
- ❌ Donation and vendor CTAs
- ❌ Internal program promotion

---

## 🧭 **User Journey Mapping**

### **Help-Seeking User**
1. **Landing**: Homepage or direct to /resources
2. **Need**: "I need health services/advocacy/support"
3. **Action**: Browse resource categories
4. **Outcome**: Find relevant external help

### **Supporting User**
1. **Landing**: Homepage or /donate
2. **Need**: "I want to support the organization"
3. **Action**: Choose donation level/volunteer option
4. **Outcome**: Complete donation/volunteer signup

### **Business User**
1. **Landing**: Homepage or /vendor-signup
2. **Need**: "I want to participate as a vendor"
3. **Action**: Review vendor options and apply
4. **Outcome**: Complete vendor application

---

## 📊 **Content Hierarchy & Information Architecture**

### **Primary Navigation**
- **Home** - Organization overview
- **Events** - What's happening
- **Resources** - Get help (external)
- **Get Involved** - Support us (internal)
  - Donate
  - Volunteer
  - Become a Vendor
- **About** - Who we are

### **Secondary Navigation**
- **Resources Categories** (within resources page)
- **Donation Tiers** (within donate page)
- **Volunteer Opportunities** (within volunteer page)

---

## 🎨 **Content Design Principles**

### **Each Page Should Have**
1. **Clear Purpose** - Single primary user intent
2. **Focused Content** - No mixed messages
3. **Obvious CTA** - What should user do next?
4. **Logical Flow** - Information hierarchy makes sense
5. **Easy Navigation** - Clear path to next steps

### **Avoid**
1. **Mixed Intents** - Don't fundraise on resource pages
2. **Content Overload** - Too many options per page
3. **Unclear Purpose** - User doesn't know what to do
4. **Dead Ends** - No clear next action
5. **Competing CTAs** - Multiple primary actions

---

## 🔧 **Implementation Recommendations**

### **Immediate Changes**
1. ✅ **Remove fundraising from resources page** (done)
2. **Add "Get Involved" dropdown** in main navigation
3. **Improve resources page** with better organization
4. **Enhance donate page** with moved content

### **Short Term**
1. **Create "Get Involved" hub page**
2. **Improve cross-page navigation**
3. **Add resource suggestion form**
4. **Enhance emergency resources section**

### **Long Term**
1. **User testing** for content organization
2. **Analytics review** of user flows
3. **A/B testing** of CTA placement
4. **Content audit** for outdated information

---

## 📱 **Mobile Considerations**

### **Mobile Navigation**
- **Simplified menu** for smaller screens
- **Quick access** to most important actions
- **Clear hierarchy** with proper headings
- **Easy thumb reach** for primary CTAs

### **Content Prioritization**
- **Above fold**: Most important content
- **Scroll depth**: Progressive disclosure
- **Touch targets**: Minimum 44px
- **Readable text**: Sufficient contrast and size

---

## 🎯 **Success Metrics**

### **Resources Page Success**
- **Bounce rate reduction** (users find what they need)
- **Time on page** (engagement with resources)
- **Click-through rate** to external resources
- **User feedback** on resource usefulness

### **Donate Page Success**
- **Conversion rate** (donations completed)
- **Average donation amount**
- **Return donor rate**
- **Funnel completion rate**

### **Vendor Page Success**
- **Application completion rate**
- **Quality of applicants**
- **Vendor satisfaction**
- **Revenue generated**

---

## 🔄 **Content Maintenance**

### **Regular Reviews**
- **Monthly**: Check external resource links
- **Quarterly**: Review content accuracy
- **Semi-annually**: User feedback analysis
- **Annually**: Full content audit and reorganization

### **Content Governance**
- **Owner**: Each page has content owner
- **Review process**: Regular content reviews
- **Update schedule**: Planned content updates
- **Quality standards**: Content guidelines and checklists

---

**Result**: Clear, purpose-driven content organization that serves user needs effectively and supports organizational goals.

---

*Last Updated: March 2026 | Content Strategy Guidelines*
