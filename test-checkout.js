// Test script for Stripe Checkout
// Run this to tes t the checkout API

const testCheckout = async () => {
  const testItems = [
    {
      product: {
        id: 1,
        title: "Nike Air Max 97",
        brand: "Nike",
        category: "Running",
        price: 129.99,
        images: ["https://example.com/nike-air-max-97.jpg"]
      },
      selectedSize: "42",
      selectedColor: "White",
      quantity: 1
    },
    {
      product: {
        id: 2,
        title: "Adidas Ultraboost 22",
        brand: "Adidas", 
        category: "Running",
        price: 179.99,
        images: ["https://example.com/adidas-ultraboost.jpg"]
      },
      selectedSize: "41",
      selectedColor: "Black",
      quantity: 2
    }
  ];

  try {
    console.log('Testing checkout with items:', testItems.length);
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: testItems,
        successUrl: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: 'http://localhost:3000/cancel'
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Checkout session created successfully!');
      console.log('Session ID:', data.sessionId);
      console.log('Checkout URL:', data.url);
      console.log('\n🔗 Open this URL to test the checkout:');
      console.log(data.url);
    } else {
      console.log('❌ Checkout failed:', data.error);
      console.log('Details:', data.details);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Test Stripe test cards
console.log('\n🧪 Stripe Test Cards:');
console.log('✅ Success: 4242 4242 4242 4242');
console.log('❌ Decline: 4000 0000 0000 0002');
console.log('💰 Requires auth: 4000 0025 0000 3155');
console.log('💳 3D Secure: 4000 0000 0000 3220');

// Run test if in browser
if (typeof window !== 'undefined') {
  testCheckout();
} else {
  console.log('Run this script in the browser console to test checkout');
} 