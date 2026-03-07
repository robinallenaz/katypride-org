# Payment Integration Guide for Katy Pride Donations

## Overview
This document outlines how payment processing works for Katy Pride donations and how payments are tracked in the CRM.

## Payment Flow

### 1. User Selection (Step 2)
- User selects donation amount and frequency
- User chooses payment method: Credit Card, Google Pay, or Amazon Pay
- Form validates and captures all required information

### 2. Payment Intent Creation
- Frontend calls `/api/create-payment-intent` with donation details
- Backend creates Stripe Payment Intent with metadata
- CRM contact is created with `payment_status: 'pending'`
- Payment Intent ID is returned to frontend

### 3. Payment Processing
- **Credit Card**: Stripe Elements collect card details
- **Google Pay**: Google Pay API processes payment
- **Amazon Pay**: Amazon Pay API processes payment
- All payments are processed through Stripe for security

### 4. Payment Confirmation
- Payment is confirmed with Stripe
- User is redirected to success or cancel page
- `/api/track-payment` updates CRM with final status
- Receipt is sent to donor's email

## CRM Integration

### Contact Fields Captured
- Basic info: name, email, phone, address
- Donation details: amount, frequency, payment method
- Payment tracking: payment_intent_id, payment_status, transaction_id
- Source tracking: form origin and user journey

### Payment Status Updates
- `pending` - Payment intent created, waiting for completion
- `completed` - Payment successful, receipt sent
- `failed` - Payment declined or error occurred
- `cancelled` - User cancelled the payment

### CRM Custom Fields
```json
{
  "payment_method": "card|google-pay|amazon-pay",
  "payment_intent_id": "pi_1234567890",
  "payment_status": "completed",
  "transaction_id": "txn_1234567890",
  "last_donation_amount": 25.00,
  "donation_frequency": "one-time|monthly"
}
```

## Security Features

### PCI Compliance
- All card data is handled by Stripe (PCI DSS compliant)
- No card details are stored on our servers
- Stripe Elements for secure card collection

### Fraud Prevention
- Stripe Radar for fraud detection
- Address verification (AVS) for card payments
- 3D Secure 2.0 for European cards
- Honeypot fields to prevent bot submissions

### Data Protection
- All payment data encrypted in transit
- GDPR compliant data handling
- Secure API endpoints with validation

## Payment Methods

### Credit/Debit Cards
- Supported: Visa, Mastercard, American Express, Discover
- Processing: Stripe Elements
- Fees: ~2.9% + $0.30 per transaction

### Google Pay
- Setup: Google Pay API integration
- Processing: Google Pay → Stripe
- Fees: Same as card payments
- User Experience: One-tap payment

### Amazon Pay
- Setup: Amazon Pay API integration  
- Processing: Amazon Pay → Stripe
- Fees: Same as card payments
- User Experience: Amazon account login

## Tracking and Reporting

### Real-Time Tracking
- Payment status updates in CRM
- Transaction ID tracking
- Failed payment notifications

### Monthly Recurring Payments
- Stripe Subscriptions for monthly donations
- Automatic renewal processing
- Cancellation management
- Failed payment retry logic

### Email Notifications
- Payment confirmation receipts
- Monthly donation reminders
- Failed payment notifications
- Cancellation confirmations

## Error Handling

### Payment Failures
- User-friendly error messages
- Retry options for declined cards
- Fallback payment methods
- Support contact information

### CRM Sync Errors
- Payment processing continues even if CRM fails
- Manual reconciliation tools available
- Error logging for debugging
- Backup data capture

### Payment Processor Setup

### Current Configuration:
- Processor: Stripe (Account ID: acct_1Ob8PkJalYEnAxna)
- Account Manager: Travis at CRF (built CRM integration)
- Account Owner: Katy Pride Treasurer (treasurer@katypride.org)
- Payment Flow: Stripe → Square (for final payouts)
- Status: Both live and test modes enabled
- Account Email: treasurer@katypride.org

### Account Access:
- Primary Contact: Travis at CRF (manages Stripe integration)
- Account Owner: Katy Pride Treasurer
- CRM Integration: GrowthSphere360 connected to Stripe
- Payment Methods: Cards, Google Pay, Apple Pay, Amazon Pay, etc.

### Required API Keys:
- Publishable Key: `pk_live_...` (frontend use)
- Secret Key: `sk_live_...` (backend use)
- Test Keys: `pk_test_...` and `sk_test_...` (for development)

### Environment Variables:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## Environment Variables Required

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# For testing (use test keys in development)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_1234567890
# STRIPE_SECRET_KEY=sk_test_1234567890

# CRM Configuration
GHL_API_KEY=your_ghl_api_key
GHL_LOCATION_ID=your_ghl_location_id
```

## Testing

### Test Mode
- Use Stripe test keys for development
- Test card numbers for different scenarios
- Simulate payment failures
- Test all payment methods

### Test Cards
- Successful: 4242424242424242
- Declined: 4000000000000002
- Insufficient Funds: 4000000000009995
- Expired: 4000000000000069

## Monitoring

### Key Metrics
- Conversion rate by payment method
- Average donation amount
- Monthly vs one-time ratio
- Payment failure rates

### Alerts
- High failure rate alerts
- Large donation notifications
- Failed CRM sync alerts
- Payment method issues

## Compliance

### Financial Regulations
- PCI DSS compliance
- Anti-money laundering (AML) checks
- Know Your Customer (KYC) requirements
- Tax-deductible donation receipts

### Data Privacy
- GDPR compliance
- CCPA compliance
- Data retention policies
- User consent management

## Support

### Common Issues
- Card declined: Check card details or try different card
- Google Pay: Ensure browser supports Google Pay
- Amazon Pay: Check Amazon account status
- CRM sync: Contact technical support

### Contact Information
- Technical support: tech@katypride.org
- Payment issues: billing@katypride.org
- General inquiries: info@katypride.org

## Future Enhancements

### Planned Features
- Apple Pay integration
- Cryptocurrency donations
- Bank transfer (ACH) payments
- Corporate matching programs
- Donation impact reporting

### Automation
- Automated receipt generation
- Monthly donor stewardship
- Failed payment recovery
- Donor anniversary communications
