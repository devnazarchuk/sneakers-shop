'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'

import { AnimatedGradientText } from '@/lib/components/magicui/animated-gradient-text'
import { Button } from '@/lib/components/ui/button'
import { cn } from '@/lib/utils'

export const CTASection = () => {
  return (
    <div className="bg-muted/30 container px-4 py-24">
      {
        // Actual content when mounted
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn(
              'mb-6 text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl',
            )}
          >
            <AnimatedGradientText>Ready for Production</AnimatedGradientText>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground mb-8 max-w-[700px] text-balance md:text-xl"
          >
            Get started with a complete stack including authentication, database, server actions,
            and deployment configuration. Includes a working contacts feature as a template for your
            own functionality.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
          >
            <Button asChild size="lg">
              <Link
                href="https://github.com/materialize-labs/ai-optimized-starter-app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Github className="mr-2 size-4" />
                Clone from GitHub
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link
                href="https://materializelabs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <ExternalLink className="mr-2 size-4" />
                Visit Materialize Labs
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      }
    </div>
  )
}
