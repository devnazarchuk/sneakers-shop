import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logger } from '@/lib/utils/logger';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      logger.error('Stripe secret key not configured');
      return NextResponse.json(
        { error: 'Stripe configuration error', details: 'Stripe secret key not found' },
        { status: 500 }
      );
    }

    const { items, successUrl, cancelUrl } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    // Get base URL dynamically
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') ||
      request.headers.get('x-forwarded-protocol') ||
      (request.headers.get('x-forwarded-ssl') === 'on' ? 'https' : 'http');

    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl && host) {
      baseUrl = `${protocol}://${host}`;
    }

    if (!baseUrl) {
      baseUrl = 'http://localhost:3000';
    }

    // Use provided URLs or fallback to defaults
    const finalSuccessUrl = successUrl || `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/cancel?session_id={CHECKOUT_SESSION_ID}`;

    // Validate URLs
    try {
      new URL(finalSuccessUrl);
      new URL(finalCancelUrl);
    } catch (urlError) {
      logger.error('Invalid URL:', { finalSuccessUrl, finalCancelUrl, urlError });
      return NextResponse.json(
        { error: 'Invalid URL configuration', details: 'Success or cancel URL is malformed' },
        { status: 400 }
      );
    }

    logger.log('Creating Checkout Session with:', {
      itemsCount: items.length,
      baseUrl,
      successUrl: finalSuccessUrl,
      cancelUrl: finalCancelUrl
    });

    // Create line items with dynamic product data
    const lineItems = items.map((item: {
      product: {
        id: number;
        title: string;
        brand: string;
        category: string;
        price: number;
        images?: string[];
      };
      selectedSize: string;
      selectedColor: string;
      quantity: number;
    }) => {
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.product.title,
            description: `${item.product.brand} • ${item.product.category} • Size: ${item.selectedSize} • Color: ${item.selectedColor}`,
            metadata: {
              productId: item.product.id.toString(),
              brand: item.product.brand,
              category: item.product.category,
              size: item.selectedSize,
              color: item.selectedColor,
            },
          },
          unit_amount: Math.round(item.product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: {
      product: { price: number };
      quantity: number;
    }) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.19; // 19% VAT
    const shipping = subtotal >= 110 ? 0 : 10; // Free shipping over €110
    const total = subtotal + tax + shipping;

    // Create Stripe Checkout Session with PMC
    const session = await stripe.checkout.sessions.create({
      payment_method_configuration: 'pmc_1Re4yt4blz0mq4tpyR1yK2U4', // Your PMC ID
      line_items: lineItems,
      mode: 'payment',
      currency: 'eur',
      locale: 'en',

      // Success and cancel URLs
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,

      // Customer information collection
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'SI', 'EE', 'LV', 'LT', 'FI', 'SE', 'NO', 'DK', 'IE', 'PT', 'GR', 'CY', 'MT', 'LU'],
      },

      // Payment settings
      allow_promotion_codes: true,

      // Order metadata
      metadata: {
        orderType: 'checkout',
        totalItems: items.length.toString(),
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        items: JSON.stringify(
          items.map((item: {
            product: {
              id: number;
              title: string;
              brand: string;
              category: string;
              price: number;
            };
            selectedSize: string;
            selectedColor: string;
            quantity: number;
          }) => ({
            productId: item.product.id,
            title: item.product.title,
            brand: item.product.brand,
            size: item.selectedSize,
            color: item.selectedColor,
            quantity: item.quantity,
            price: item.product.price,
            // Don't include images in metadata due to Stripe's 500 character limit
            // Images will be stored in the order data on the client side
          }))
        ),
      },

      // Shipping options
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'eur',
            },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1000, // €10.00
              currency: 'eur',
            },
            display_name: 'Express shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 3 },
            },
          },
        },
      ],

      // Automatic tax calculation
      automatic_tax: {
        enabled: true,
      },

      // Invoice creation
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: 'Sneakers Shop Order',
          metadata: { orderType: 'sneakers' },
        },
      },

      // Session expiration (30 minutes)
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
    });

    logger.log('Checkout Session created:', {
      sessionId: session.id,
      url: session.url,
      total: total
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      success: true
    });

  } catch (error: unknown) {
    logger.error('Stripe checkout error:', error);
    logger.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown',
    });

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: error.message,
          type: error.type,
          code: error.code,
          details: error.raw || error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 