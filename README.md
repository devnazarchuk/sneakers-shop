# 👟 Sneakers Shop - Premium E-commerce Platform

A state-of-the-art sneakers e-commerce platform built with **Next.js 14**, **TypeScript**, and **Stripe**. This project features a high-end "Glassmorphism" aesthetic, providing a premium shopping experience with advanced filtering, real-time search, and intelligent order management.

## ✨ Key Features

### 🛍️ **Unmatched Shopping Experience**
- **Dynamic Catalog**: Browse a curated collection of sneakers with high-quality imagery and detailed specifications powered by a high-performance JSON data store.
- **Glassmorphism UI**: A premium, modern interface with vibrant gradients, blurred backgrounds, and smooth **Framer Motion** micro-animations.
- **Advanced Filtering**: Precision filtering by Brand, Category, Size, Color, and Price range with URL state persistence for easy sharing.
- **Multi-View Modes**: Switch between **Compact** and **Cozy** view modes to customize your browsing experience.
- **Interactive Style Quiz**: Help users find their perfect match with a personalized sneaker discovery questionnaire.

### 🛒 **Advanced Commerce Core**
- **Feature-Rich Cart**: Comprehensive cart management with quantity controls and multi-layer persistence.
- **Intelligent Order Lifecycle**: Automated order status transitions (Paid → Processing → Shipped → Delivered) with simulated tracking events.
- **Stripe Integration**: Secure, world-class payment processing via Stripe Checkout with robust webhook support for real-time fulfillment.
- **Smart Checkout Recovery**: Automated handling of abandoned checkouts and navigation-based order cancellation.

### 🔐 **User & Data Management**
- **Clerk Authentication**: Enterprise-grade user authentication and secure profile management.
- **Hybrid Data Architecture**: 
  - **Static High-Speed Data**: Swift product discovery via optimized JSON storage.
  - **Relational Integrity**: Supabase (Postgres) with Drizzle ORM for user profiles and contact interactions.
- **Mobile-First Design**: Optimized architecture ensures a flawless experience from the latest smartphones to ultra-wide displays.

## 🛠️ Technology Stack

| Layer | Technologies |
|--- |--- |
| **Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion, Radix UI, Shadcn/ui |
| **Auth** | Clerk (Middleware-based security) |
| **Database** | Supabase, Drizzle ORM (Type-safe schemas) |
| **Payments** | Stripe (API, Webhooks, Checkout) |
| **Validation** | Zod, React Hook Form |
| **Icons** | Lucide React |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/devnazarchuk/sneakers-shop.git
   cd sneakers-shop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following keys:
   ```env
   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...

   # Stripe
   STRIPE_SECRET_KEY=...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
   STRIPE_WEBHOOK_SECRET=...

   # Database (Supabase)
   DATABASE_URL=...

   # App configuration
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

- `app/`: Next.js App Router (Routes & API Endpoints)
- `components/`: Advanced UI components (Cart, ProductGrid, Optimization scripts)
- `db/`: Database schema definitions and Drizzle configuration
- `lib/`: Core logic, custom hooks, and data orchestration
- `public/`: Static assets (High-res images, Sneakers data)
- `supabase/`: SQL migrations and local project configuration

## 🔒 License
This project is licensed under the MIT License.
