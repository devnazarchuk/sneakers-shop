# Sneakers Shop - Modern E-commerce Platform

A modern, production-ready sneakers e-commerce platform built with Next.js 14, TypeScript, and Stripe payments. Features a complete shopping experience with advanced filtering, cart management, order tracking, and beautiful UI. All data is stored locally with static product images served from the public directory.

## 🚀 Features

### 🛍️ **E-commerce Core**
- **Product Catalog**: 1000+ Nike sneakers with high-quality images
- **Advanced Filtering**: Brand, category, size, color, price range with URL persistence
- **Search Functionality**: Real-time product search with debounced input
- **Product Details**: Multi-image galleries, size/color selection, detailed descriptions

### 🛒 **Shopping Experience**
- **Smart Cart System**: Add/remove items, quantity controls, localStorage persistence
- **Favorites System**: Save products for later with instant persistence
- **Order Summary**: Real-time calculation with tax (19% VAT) and shipping
- **Free Shipping**: Automatic free shipping for orders over €100

### 💳 **Payment & Checkout**
- **Stripe Integration**: Secure payment processing with test mode support
- **Checkout Flow**: Complete Stripe Checkout with customer information collection
- **Order Management**: Order history, status tracking, and customer details
- **Payment Methods**: Support for cards, digital wallets, and promotion codes

### 🎨 **UI/UX Features**
- **Responsive Design**: Mobile-first design optimized for all devices
- **Dark/Light Mode**: Theme switching with system preference detection
- **Animations**: Smooth Framer Motion animations throughout the app
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Loading States**: Skeleton loaders and smooth transitions

### 💾 **Data & Storage**
- **Static Data**: Product information stored in JSON files
- **Image Storage**: High-quality product images served from public directory
- **Local Storage**: Cart, favorites, and order data persistence in browser
- **URL Persistence**: Filter states maintained in URL for sharing and bookmarking

### 🔧 **Technical Features**
- **Next.js 14**: App Router, Server Components, and API routes
- **TypeScript**: Full type safety throughout the application
- **Performance**: Optimized images, lazy loading, and Core Web Vitals
- **SEO**: Meta tags, structured data, and search engine optimization
- **Error Handling**: Comprehensive error boundaries and user feedback

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### **Backend & Services**
- **Stripe** - Payment processing
- **Next.js API Routes** - Server-side functionality
- **Static File Serving** - Product images and data

### **Development Tools**
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **next-themes** - Theme management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/sneakers-shop.git
cd sneakers-shop
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env.local` file in the root directory:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Configuration

### Stripe Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test API keys from the Stripe Dashboard
3. Configure your Payment Method Configuration (PMC) in Stripe
4. Update the PMC ID in `app/api/create-checkout-session/route.ts`

### Product Data
- Product information is stored in `public/data/sneakers.json`
- Product images are stored in `public/sneakers_dataset/`
- Images are served statically through Next.js for optimal performance

## 📁 Project Structure

```
sneakers-shop/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (Stripe, webhooks)
│   ├── catalog/           # Product catalog page
│   ├── profile/           # User profile and orders
│   ├── success/           # Payment success page
│   ├── cancel/            # Payment cancellation page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── profile/          # Profile-related components
│   ├── Cart.tsx          # Shopping cart
│   ├── ProductCard.tsx   # Product display
│   └── ProductDialog.tsx # Product details modal
├── context/              # React contexts
│   ├── cart-context.tsx  # Cart state management
│   └── favorites-context.tsx # Favorites state
├── lib/                  # Utility functions and helpers
│   ├── actions/          # Server actions
│   ├── components/       # Shared components
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
└── public/              # Static assets
    ├── data/            # Product data (sneakers.json)
    └── sneakers_dataset/ # Product images
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel project settings
4. Deploy automatically on push

### Environment Variables for Production
```env
# Stripe (use live keys for production)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key

# Application
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Product browsing and filtering
- [ ] Cart functionality (add, remove, update quantities)
- [ ] Favorites system
- [ ] Stripe checkout flow
- [ ] Order history and tracking
- [ ] Responsive design on mobile
- [ ] Dark/light mode toggle
- [ ] Search functionality
- [ ] URL-based filtering persistence

### Test Cards (Stripe Test Mode)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 🔒 Security Features

- **Stripe Security**: PCI-compliant payment processing
- **Environment Variables**: Secure API key management
- **Input Validation**: Form validation with Zod schemas
- **Error Handling**: Graceful error handling throughout
- **HTTPS**: Secure connections in production

## 📱 Mobile Optimization

- **Touch-friendly**: Optimized for mobile devices
- **Responsive design**: Adapts to all screen sizes
- **Performance**: Optimized loading and interactions
- **PWA ready**: Can be installed as a web app
- **Offline support**: Basic offline functionality

## 🔄 Future Enhancements

- **User Authentication**: Add user accounts and profiles
- **Database Integration**: Move to a proper database for scalability
- **Inventory Management**: Real-time stock tracking
- **Email Notifications**: Order confirmation and status updates
- **Analytics Dashboard**: Sales and user behavior tracking
- **Multi-language Support**: Internationalization (i18n)
- **Advanced Search**: Elasticsearch integration
- **Recommendation Engine**: AI-powered product recommendations
- **Social Features**: Reviews, ratings, and social sharing
- **Subscription Model**: Recurring payments and memberships

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [SETUP.md](SETUP.md) file for detailed setup instructions
- Review the troubleshooting section in the documentation

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Stripe](https://stripe.com/) for payment processing
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Framer Motion](https://www.framer.com/motion/) for animations
