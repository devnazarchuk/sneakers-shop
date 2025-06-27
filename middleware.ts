import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if this is a navigation to profile page
  if (request.nextUrl.pathname === '/profile') {
    // Check if user is coming from a checkout flow
    const referer = request.headers.get('referer');

    if (referer && (
      referer.includes('checkout.stripe.com') ||
      referer.includes('/cancel')
    )) {
      // This is a back navigation or cancellation from checkout
      const response = NextResponse.next();

      // Add a flag to indicate this is a back navigation from checkout
      response.cookies.set('back_from_checkout', 'true', {
        maxAge: 1800, // 30 minutes
        path: '/',
        httpOnly: false, // Allow client-side access
      });

      // Also add a timestamp
      response.cookies.set('checkout_navigation_time', Date.now().toString(), {
        maxAge: 1800, // 30 minutes
        path: '/',
        httpOnly: false,
      });

      return response;
    }
  }

  // Check if this is a navigation to any page after checkout
  const referer = request.headers.get('referer');
  if (referer && referer.includes('checkout.stripe.com')) {
    const response = NextResponse.next();

    // Add a flag for any navigation from Stripe
    response.cookies.set('from_stripe_checkout', 'true', {
      maxAge: 1800, // 30 minutes
      path: '/',
      httpOnly: false,
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile',
    '/success',
    '/cancel',
    '/catalog',
    '/',
  ],
}; 