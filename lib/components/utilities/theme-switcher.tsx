'use client'

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { useMounted } from '@/lib/hooks/use-mounted'
import { Theme } from '@/lib/types/theme'
import { cn } from '@/lib/utils'

interface ThemeSwitcherProps {
  className?: string
}

const ThemeSwitcher = ({ ...props }: ThemeSwitcherProps) => {
  const { setTheme, theme } = useTheme()
  const mounted = useMounted()

  const handleChange = (theme: Theme) => {
    localStorage.setItem('theme', theme)
    setTheme(theme)
  }

  // useTheme is not available during SSR
  if (!mounted) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.2 }}
      className={cn('p-1 hover:cursor-pointer hover:opacity-50', props.className)}
      onClick={() => handleChange(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'dark' ? <Moon className="size-6" /> : <Sun className="size-6" />}
    </motion.div>
  )
}

export default ThemeSwitcher
