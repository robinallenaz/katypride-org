import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, status, transactionId, paymentMethod } = await request.json()

    // Validate required fields
    if (!paymentIntentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentIntentId, status' },
        { status: 400 }
      )
    }

    // Update CRM with payment status
    const crmPayload = {
      type: 'donor',
      paymentIntentId,
      paymentStatus: status,
      transactionId,
      paymentMethod,
      source: 'Payment Status Update',
      _gotcha: '',
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/crm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(crmPayload),
    })

    if (!response.ok) {
      throw new Error('Failed to update CRM with payment status')
    }

    return NextResponse.json({
      success: true,
      message: 'Payment status tracked successfully'
    })
  } catch (error) {
    console.error('Payment tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track payment status' },
      { status: 500 }
    )
  }
}
