import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log('Webhook event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: unknown) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', {
    sessionId: session.id,
    customerId: session.customer,
    amount: session.amount_total,
    currency: session.currency,
    metadata: session.metadata
  });

  // Save order to your database or order management system
  try {
    const { saveOrder, calculateOrderTotals } = await import("@/lib/orders");
    
    // Parse items from metadata (without images due to Stripe's 500 character limit)
    const itemsWithoutImages = session.metadata?.items ? JSON.parse(session.metadata.items) : [];
    
    // Note: Images are stored in localStorage on the client side
    // The webhook can't access localStorage, so we'll save the order without images
    // Images will be available when the user returns to the success page
    const { subtotal, tax, shipping, total } = calculateOrderTotals(itemsWithoutImages);

    // Create order from session data
    const order = {
      id: session.id,
      sessionId: session.id,
      date: new Date().toISOString(),
      items: itemsWithoutImages, // Items without images from metadata
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      total: total,
      status: 'paid' as const,
      customerInfo: session.customer_details ? {
        name: session.customer_details.name || '',
        email: session.customer_details.email || '',
        phone: session.customer_details.phone || '',
        address: session.customer_details.address ? [
          session.customer_details.address.line1,
          session.customer_details.address.line2,
          session.customer_details.address.city,
          session.customer_details.address.country,
          session.customer_details.address.postal_code,
        ].filter(Boolean).join(', ') : '',
      } : undefined,
    };

    saveOrder(order);
    console.log('Order saved successfully (without images - will be merged with localStorage data)');

    // Check and update expired orders
    try {
      const { checkAndUpdateExpiredOrders } = await import("@/lib/orders");
      checkAndUpdateExpiredOrders();
    } catch (error) {
      console.error('Error checking expired orders in webhook:', error);
    }

    // Create a client-side accessible order data for immediate display
    const clientOrderData = {
      id: session.id,
      sessionId: session.id,
      items: itemsWithoutImages, // Items without images
      total: total,
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      createdAt: new Date().toISOString(),
      status: 'paid',
      paymentMethod: 'card',
      currency: session.currency,
      amount: session.amount_total,
    };

    // Note: Images will be merged from localStorage when user returns to success page
    console.log('Client order data prepared (images will be merged from localStorage):', clientOrderData);

  } catch (error) {
    console.error('Failed to save order:', error);
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('Checkout session expired:', {
    sessionId: session.id,
    customerId: session.customer,
    amount: session.amount_total,
    currency: session.currency,
    metadata: session.metadata
  });

  // Save order to your database or order management system
  try {
    const { saveOrder, calculateOrderTotals } = await import("@/lib/orders");
    
    // Parse items from metadata (without images due to Stripe's 500 character limit)
    const itemsWithoutImages = session.metadata?.items ? JSON.parse(session.metadata.items) : [];
    const { subtotal, tax, shipping, total } = calculateOrderTotals(itemsWithoutImages);

    // Create order from session data
    const order = {
      id: session.id,
      sessionId: session.id,
      date: new Date().toISOString(),
      items: itemsWithoutImages, // Items without images from metadata
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      total: total,
      status: 'failed' as const,
      customerInfo: session.customer_details ? {
        name: session.customer_details.name || '',
        email: session.customer_details.email || '',
        phone: session.customer_details.phone || '',
        address: session.customer_details.address ? [
          session.customer_details.address.line1,
          session.customer_details.address.line2,
          session.customer_details.address.city,
          session.customer_details.address.country,
          session.customer_details.address.postal_code,
        ].filter(Boolean).join(', ') : '',
      } : undefined,
    };

    saveOrder(order);
    console.log('Failed order saved successfully (without images - will be merged with localStorage data)');

    // Check and update expired orders
    try {
      const { checkAndUpdateExpiredOrders } = await import("@/lib/orders");
      checkAndUpdateExpiredOrders();
    } catch (error) {
      console.error('Error checking expired orders in webhook:', error);
    }

    // Create a client-side accessible order data for immediate display
    const clientOrderData = {
      id: session.id,
      sessionId: session.id,
      items: itemsWithoutImages, // Items without images
      total: total,
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      createdAt: new Date().toISOString(),
      status: 'failed',
      paymentMethod: 'card',
      currency: session.currency,
      amount: session.amount_total,
    };

    // Note: Images will be merged from localStorage when user returns to success page
    console.log('Client order data prepared (images will be merged from localStorage):', clientOrderData);

  } catch (error) {
    console.error('Failed to save failed order:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    customerId: paymentIntent.customer
  });

  // Optional: Send confirmation email
  // await sendOrderConfirmationEmail(paymentIntent.customer);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent failed:', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    lastPaymentError: paymentIntent.last_payment_error
  });

  // Save failed order if we have session data
  try {
    const { saveOrder, calculateOrderTotals } = await import("@/lib/orders");
    
    // Try to get session data from payment intent metadata
    const sessionId = paymentIntent.metadata?.session_id;
    if (sessionId) {
      // Parse items from metadata if available
      const items = paymentIntent.metadata?.items ? JSON.parse(paymentIntent.metadata.items) : [];
      const { subtotal, tax, shipping, total } = calculateOrderTotals(items);

      const order = {
        id: paymentIntent.id,
        sessionId: sessionId,
        date: new Date().toISOString(),
        items: items,
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        status: 'failed' as const,
        customerInfo: paymentIntent.metadata?.customer_info ? 
          JSON.parse(paymentIntent.metadata.customer_info) : undefined,
      };

      saveOrder(order);
      console.log('Failed order saved successfully');
      
      // Check and update expired orders
      try {
        const { checkAndUpdateExpiredOrders } = await import("@/lib/orders");
        checkAndUpdateExpiredOrders();
      } catch (error) {
        console.error('Error checking expired orders in webhook:', error);
      }
    }
  } catch (error) {
    console.error('Failed to save failed order:', error);
  }

  // Optional: Send failure notification
  // await sendPaymentFailureNotification(paymentIntent.customer);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_paid,
    currency: invoice.currency
  });
}

// Optional: Auto-refund function for live mode
// export async function createRefund(paymentIntentId: string, amount?: number) {
//   try {
//     const refundParams: Stripe.RefundCreateParams = {
//       payment_intent: paymentIntentId,
//     };

//     if (amount) {
//       refundParams.amount = Math.round(amount * 100); // Convert to cents
//     }

//     const refund = await stripe.refunds.create(refundParams);
//     
//     console.log('Refund created:', {
//       refundId: refund.id,
//       amount: refund.amount,
//       status: refund.status
//     });

//     return refund;
//   } catch (error) {
//     console.error('Failed to create refund:', error);
//     throw error;
//   }
// } 