// Payment integration service for Katy Pride donations

// Global type declarations for payment providers
declare global {
  interface Window {
    google?: {
      payments?: {
        client: {
          isReadyToPay(request: any): Promise<{ result: boolean }>
          loadPaymentData(request: any): Promise<any>
        }
      }
    }
    amazon?: any
  }
}

interface PaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: string
  payment_method: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'google_pay' | 'amazon_pay'
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
}

interface CreatePaymentIntentParams {
  amount: number
  currency?: string
  payment_method_type: 'card' | 'google_pay' | 'amazon_pay'
  donor_email: string
  donor_name: string
  donation_frequency: 'one-time' | 'monthly'
}

class PaymentService {
  private stripe: any
  private isInitialized = false
  private initPromise: Promise<void> | null = null

  constructor() {
    this.initPromise = this.initializeStripe()
  }

  private async initializeStripe(): Promise<void> {
    try {
      // Dynamically import Stripe to avoid SSR issues
      if (typeof window !== 'undefined') {
        // Use dynamic import for client-side Stripe
        const stripeModule = await import('@stripe/stripe-js')
        const loadStripe = stripeModule.loadStripe
        this.stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
        this.isInitialized = true
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
      throw error
    }
  }

  private async waitForInitialization(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise
    }
    if (!this.isInitialized) {
      throw new Error('Payment service failed to initialize')
    }
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent> {
    await this.waitForInitialization()

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency || 'usd',
          payment_method_type: params.payment_method_type,
          donor_email: params.donor_email,
          donor_name: params.donor_name,
          donation_frequency: params.donation_frequency,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const data = await response.json()
      return data.paymentIntent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  }

  async confirmPayment(clientSecret: string, paymentMethod?: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      return { success: false, error: 'Payment service not initialized' }
    }

    try {
      const result = await this.stripe.confirmPayment(clientSecret, {
        payment_method: paymentMethod,
        return_url: `${window.location.origin}/donate/success`,
        cancel_url: `${window.location.origin}/donate/cancel`,
      })

      return { success: !result.error, error: result.error?.message }
    } catch (error) {
      console.error('Error confirming payment:', error)
      return { success: false, error: 'Payment confirmation failed' }
    }
  }

  async setupGooglePay(): Promise<boolean> {
    if (!this.isInitialized) {
      return false
    }

    try {
      // Check if Google Pay is available
      if (!window.google?.payments?.client) {
        return false
      }

      const googlePayClient = window.google.payments.client
      const isReadyToPay = await googlePayClient.isReadyToPay({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: ['CARD', 'TOKENIZED_CARD'],
        existingPaymentMethodRequired: false,
      })

      return isReadyToPay.result
    } catch (error) {
      console.error('Google Pay setup error:', error)
      return false
    }
  }

  async setupAmazonPay(): Promise<boolean> {
    if (!this.isInitialized) {
      return false
    }

    try {
      // Check if Amazon Pay is available
      if (!window.amazon) {
        return false
      }

      // Amazon Pay setup would go here
      return true
    } catch (error) {
      console.error('Amazon Pay setup error:', error)
      return false
    }
  }

  async processGooglePay(paymentRequest: any): Promise<{ success: boolean; paymentIntent?: PaymentIntent; error?: string }> {
    try {
      if (!window.google?.payments?.client) {
        return { success: false, error: 'Google Pay not available' }
      }
      
      const paymentData = await window.google.payments.client.loadPaymentData(paymentRequest)
      const paymentIntent = await this.createPaymentIntent({
        amount: paymentData.amount,
        payment_method_type: 'google_pay',
        donor_email: paymentData.email,
        donor_name: paymentData.name,
        donation_frequency: paymentData.frequency,
      })

      return { success: true, paymentIntent }
    } catch (error) {
      console.error('Google Pay processing error:', error)
      return { success: false, error: 'Google Pay processing failed' }
    }
  }

  async processAmazonPay(amazonPayRequest: any): Promise<{ success: boolean; paymentIntent?: PaymentIntent; error?: string }> {
    try {
      const paymentIntent = await this.createPaymentIntent({
        amount: amazonPayRequest.amount,
        payment_method_type: 'amazon_pay',
        donor_email: amazonPayRequest.email,
        donor_name: amazonPayRequest.name,
        donation_frequency: amazonPayRequest.frequency,
      })

      return { success: true, paymentIntent }
    } catch (error) {
      console.error('Amazon Pay processing error:', error)
      return { success: false, error: 'Amazon Pay processing failed' }
    }
  }

  async trackPaymentInCRM(paymentIntentId: string, status: string, transactionId: string, paymentMethod: string) {
    try {
      const response = await fetch('/api/track-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          status,
          transactionId,
          paymentMethod,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to track payment in CRM')
      }

      return await response.json()
    } catch (error) {
      console.error('Error tracking payment in CRM:', error)
      throw error
    }
  }
}

export const paymentService = new PaymentService()
export default paymentService
