import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { CartProvider } from '@/context/cart-context'
import { FavoritesProvider } from '@/context/favorites-context'
import { Header } from '@/components/header'
import OptimizationScripts from '@/components/OptimizationScripts'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sneakers Shop',
  description: 'Your ultimate destination for premium sneakers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <OptimizationScripts />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <FavoritesProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </FavoritesProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
