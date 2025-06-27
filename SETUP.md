# Sneakers Shop - Quick Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### 1. Clone & Install
```bash
git clone https://github.com/devnazarchuk/sneakers-shop.git
cd sneakers-shop
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Get Stripe Keys

1. **Sign up** at [stripe.com](https://stripe.com)
2. **Go to Dashboard** → Developers → API keys
3. **Copy your keys**:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)
4. **Replace** the placeholder keys in your `.env.local` file

### 4. Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🧪 Test Cards

Use these Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 🚀 Deploy to Vercel

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add environment variables** in Vercel settings:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. **Deploy** ✨

## 🔧 Troubleshooting

### Stripe Issues
- Check your environment variables are set correctly
- Use test keys for development
- Make sure keys start with `pk_test_` and `sk_test_`

### Build Issues
```bash
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## 📁 Project Structure

```
sneakers-shop/
├── app/                    # Next.js pages
├── components/            # React components
├── context/              # State management
├── lib/                  # Utilities
└── public/              # Static files & images
```

That's it! 🎯 