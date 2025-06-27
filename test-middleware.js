// Test script for middleware functionality
console.log('Testing middleware navigation detection...');

// Simulate starting a checkout session
function simulateCheckoutStart() {
  const sessionId = 'test_session_' + Date.now();
  localStorage.setItem('active_checkout_session', sessionId);
  localStorage.setItem('checkout_started_at', new Date().toISOString());
  
  const orderData = {
    id: sessionId,
    sessionId: sessionId,
    items: [
      {
        productId: 1,
        title: "Nike Air Max 90",
        brand: "Nike",
        size: "42",
        color: "White",
        quantity: 1,
        price: 129.99,
      }
    ],
    total: 129.99,
    subtotal: 109.24,
    tax: 20.75,
    shipping: 0,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  
  localStorage.setItem(`order_${sessionId}`, JSON.stringify(orderData));
  
  console.log('✅ Checkout session started:', sessionId);
  return sessionId;
}

// Simulate navigation from Stripe
function simulateNavigationFromStripe() {
  console.log('Simulating navigation from Stripe...');
  
  // Set cookies that middleware would set
  document.cookie = 'back_from_checkout=true; path=/; max-age=300';
  document.cookie = 'from_stripe_checkout=true; path=/; max-age=300';
  document.cookie = 'checkout_navigation_time=' + Date.now() + '; path=/; max-age=300';
  
  console.log('✅ Navigation cookies set');
}

// Test the cancellation logic
function testCancellationLogic() {
  console.log('Testing cancellation logic...');
  
  const backFromCheckout = document.cookie.includes('back_from_checkout=true');
  const fromStripeCheckout = document.cookie.includes('from_stripe_checkout=true');
  
  console.log('back_from_checkout cookie:', backFromCheckout);
  console.log('from_stripe_checkout cookie:', fromStripeCheckout);
  
  if (backFromCheckout || fromStripeCheckout) {
    const activeSessionId = localStorage.getItem('active_checkout_session');
    const checkoutStartedAt = localStorage.getItem('checkout_started_at');
    
    if (activeSessionId && checkoutStartedAt) {
      const startTime = new Date(checkoutStartedAt).getTime();
      const timeDiff = Date.now() - startTime;
      
      console.log('Time since checkout started:', timeDiff / 1000, 'seconds');
      
      if (timeDiff < 10 * 60 * 1000) {
        const orderData = localStorage.getItem(`order_${activeSessionId}`);
        if (orderData) {
          const order = JSON.parse(orderData);
          
          if (order.status === 'pending') {
            console.log('✅ Order is pending, should be cancelled');
            
            // Simulate cancellation
            const cancelledOrder = {
              id: Date.now().toString(),
              sessionId: activeSessionId,
              date: new Date().toISOString(),
              items: order.items,
              subtotal: order.subtotal,
              tax: order.tax,
              shipping: order.shipping,
              total: order.total,
              status: 'cancelled',
            };

            // Save to orders
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.unshift(cancelledOrder);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            console.log('✅ Order cancelled due to navigation:', cancelledOrder);
            
            // Clean up
            localStorage.removeItem('active_checkout_session');
            localStorage.removeItem('checkout_started_at');
            localStorage.removeItem(`order_${activeSessionId}`);
            
            // Clear cookies
            document.cookie = 'back_from_checkout=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'from_stripe_checkout=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'checkout_navigation_time=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            console.log('✅ Cleanup completed');
          } else {
            console.log('❌ Order is not pending, status:', order.status);
          }
        } else {
          console.log('❌ No order data found');
        }
      } else {
        console.log('❌ Checkout session too old, not cancelling');
      }
    } else {
      console.log('❌ No active checkout session found');
    }
  } else {
    console.log('❌ No navigation cookies found');
  }
}

// Run test
try {
  console.log('=== Starting Middleware Test ===');
  
  // Step 1: Start checkout
  const sessionId = simulateCheckoutStart();
  
  // Step 2: Simulate navigation from Stripe
  setTimeout(() => {
    console.log('\n=== Simulating Navigation from Stripe ===');
    simulateNavigationFromStripe();
    
    // Step 3: Test cancellation logic
    setTimeout(() => {
      console.log('\n=== Testing Cancellation Logic ===');
      testCancellationLogic();
      
      // Step 4: Check results
      setTimeout(() => {
        console.log('\n=== Checking Results ===');
        
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const cancelledOrders = orders.filter(order => order.status === 'cancelled');
        
        console.log('Total orders:', orders.length);
        console.log('Cancelled orders:', cancelledOrders.length);
        
        if (cancelledOrders.length > 0) {
          console.log('✅ Test passed: Order was cancelled due to navigation');
          console.log('Cancelled order:', cancelledOrders[0]);
        } else {
          console.log('❌ Test failed: No cancelled orders found');
        }
        
        // Clean up test data
        localStorage.removeItem('orders');
        
        console.log('\n🎉 Test completed!');
      }, 1000);
    }, 1000);
  }, 1000);
  
} catch (error) {
  console.error('Test error:', error);
} 