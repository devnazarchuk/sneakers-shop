'use client'

import { motion } from 'framer-motion'
import { Code, Database, LayoutGrid, Paintbrush, Server, ShieldCheck, Terminal } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/lib/components/ui/button'
import { cn } from '@/lib/utils'

interface FeatureProps {
  title: string
  description: string
  icon: React.ElementType
}

const features: FeatureProps[] = [
  {
    title: 'AI-First Development',
    description:
      'Optimized for AI pair programming with Cursor, including built-in guidelines for AI tools to understand the codebase.',
    icon: Terminal,
  },
  {
    title: 'Production Ready',
    description:
      'Enterprise-grade architecture with scalable patterns, built for deployment on Vercel with full environment setup.',
    icon: Server,
  },
  {
    title: 'Secure Authentication',
    description:
      'Complete multi-tenant user management with Clerk, protected routes, and role-based access control.',
    icon: ShieldCheck,
  },
  {
    title: 'Type-Safe Database',
    description:
      'Strongly typed database operations with Drizzle ORM and PostgreSQL on Supabase for reliable data handling.',
    icon: Database,
  },
  {
    title: 'Modern UI Components',
    description:
      'Beautiful, responsive interfaces with Tailwind, Shadcn/ui, and Framer Motion animations.',
    icon: Paintbrush,
  },
  {
    title: 'Server Components',
    description:
      'Next.js App Router with React Server Components for optimal performance and data loading patterns.',
    icon: LayoutGrid,
  },
]

const FeatureCard = ({ title, description, icon: Icon }: FeatureProps) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="bg-card flex flex-col items-center rounded-lg border p-6 text-center shadow-xs transition-all hover:shadow-md"
  >
    <div className="bg-primary/10 mb-4 rounded-full p-3">
      <Icon className="text-primary size-6" />
    </div>
    <h3 className="mb-2 text-xl font-medium">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </motion.div>
)

export const FeaturesSection = () => {
  return (
    <div className="container mx-auto px-4 pt-0 pb-8">
      {
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-center"
          >
            <h2
              className={cn(
                'mb-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl',
              )}
            >
              Enterprise-Grade Features
            </h2>
            <p className="text-muted-foreground mx-auto max-w-[800px] text-balance md:text-xl">
              A comprehensive stack designed for rapid development with AI tools. Includes
              authentication, database integration, and beautiful UI components.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-16 flex flex-col items-center"
          >
            <Button asChild size="lg">
              <Link
                href="https://github.com/materialize-labs/ai-optimized-starter-app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Code className="mr-2 size-4" />
                View on GitHub
              </Link>
            </Button>
          </motion.div>
        </>
      }
    </div>
  )
}
