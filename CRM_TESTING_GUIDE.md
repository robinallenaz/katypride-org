# CRM Testing Guide for Vendor Signup

## Pre-Testing Setup

### 1. Environment Variables
Ensure these are set in your `.env.local`:
```bash
GHL_API_KEY=your_go_high_level_api_key
GHL_LOCATION_ID=your_location_id
GHL_VENDOR_PIPELINE_ID=your_vendor_pipeline_id
CRM_ADMIN_SECRET=your_admin_secret
```

### 2. Test CRM Connection
```bash
# Test the CRM health endpoint
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
     http://localhost:3000/api/crm
```

## Testing Scenarios

### ✅ Success Scenario
1. **Fill out vendor form completely**
   - All required fields filled
   - Valid email format
   - Valid phone number
   - Select vendor type
   - Add products/services description

2. **Expected Results:**
   - Success message appears
   - Contact created in GoHighLevel
   - Proper tags applied (`vendor`, `vendor-{type}`)
   - Note with vendor details included
   - No errors in browser console

### 🔍 Data Validation Tests

**Test 1: Required Fields**
- Leave required fields empty → Should show validation errors
- Submit with invalid email → Should be rejected
- Submit with invalid phone → Should be rejected

**Test 2: Data Sanitization**
- Test with HTML/JavaScript in text fields → Should be sanitized
- Test with special characters → Should be handled properly
- Test with very long text → Should be truncated appropriately

**Test 3: Rate Limiting**
- Submit form rapidly 6+ times → Should be rate limited after 5 submissions
- Wait 1 minute → Should allow submissions again

### 📊 CRM Verification Steps

1. **Check GoHighLevel Dashboard:**
   - Login to your GoHighLevel account
   - Navigate to Contacts
   - Search for the test email
   - Verify contact was created

2. **Verify Contact Data:**
   - Name matches submission
   - Email and phone correct
   - Company information present
   - Address properly formatted
   - Tags: `vendor`, `vendor-{type}`, `katy-pride-celebration-2026`

3. **Check Contact Notes:**
   - Note should contain vendor type
   - Products/services description
   - Additional info if provided

### 🚨 Error Testing

**Test 1: CRM API Down**
- Temporarily disable GHL_API_KEY
- Submit form → Should show user-friendly error
- Check browser console for error details

**Test 2: Invalid Data**
- Submit with malformed JSON (via dev tools)
- Test with extremely long fields
- Test with special characters

**Test 3: Network Issues**
- Disconnect network during submission
- Slow network simulation
- Check timeout handling

### 📱 Mobile Testing

1. **Form Usability:**
   - Test on actual mobile devices
   - Verify keyboard doesn't obscure fields
   - Test collapsible requirements section
   - Check button tap targets

2. **Mobile Submission:**
   - Complete form on mobile
   - Verify success/error messages
   - Test orientation changes

### 🔧 Debugging Tools

**Browser Console:**
```javascript
// Monitor form submissions
document.querySelector('form').addEventListener('submit', (e) => {
  console.log('Form submitted:', e);
});

// Check network requests
// Open Network tab in DevTools and filter for /api/crm
```

**Server Logs:**
```bash
# Check Next.js logs
npm run dev

# Monitor for CRM errors
grep -i "crm\|ghl" .next/server.log
```

## Automated Testing Script

Create a test file `test-vendor-signup.js`:
```javascript
const testVendorSignup = async () => {
  const testData = {
    type: 'vendor',
    name: 'Test Business',
    email: 'test@example.com',
    phone: '555-0123',
    company: 'Test Company LLC',
    address: '123 Test St',
    city: 'Katy',
    state: 'TX',
    postalCode: '77494',
    vendorType: 'forprofit',
    productsServices: 'Test products and services'
  };

  try {
    const response = await fetch('/api/crm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testVendorSignup();
```

## Success Criteria

✅ **Form submits successfully**  
✅ **Contact appears in GoHighLevel within 30 seconds**  
✅ **All data fields mapped correctly**  
✅ **Proper tags applied**  
✅ **Error handling works gracefully**  
✅ **Mobile experience is smooth**  
✅ **Rate limiting functions**  

## Troubleshooting

**Common Issues:**
1. **401 Unauthorized** → Check GHL_API_KEY and GHL_LOCATION_ID
2. **429 Too Many Requests** → Wait for rate limit to reset
3. **500 Server Error** → Check server logs for detailed error
4. **Contact not created** → Verify GHL account permissions

**Debug Steps:**
1. Check browser DevTools Network tab
2. Review server console logs
3. Verify environment variables
4. Test GoHighLevel API directly
5. Check CORS settings if needed
