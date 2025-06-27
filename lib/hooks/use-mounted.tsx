"use client";

import { useEffect, useState } from 'react'

/**
 * Hook to determine if component has mounted (hydrated)
 * Useful for preventing hydration mismatches
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
