'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

import { TooltipProvider } from '@/lib/components/ui/tooltip'

//  NextThemesProvider
type ProvidersProps = React.ComponentProps<typeof NextThemesProvider> & {
  children: ReactNode
}

export const Providers = ({ children, ...props }: ProvidersProps) => {
  return (
    <NextThemesProvider {...props}>
      <TooltipProvider>{children}</TooltipProvider>
    </NextThemesProvider>
  )
}
