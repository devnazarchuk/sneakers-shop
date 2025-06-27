import { useEffect, useRef } from 'react';

interface DebugOptions {
  enabled?: boolean;
  prefix?: string;
}

export function useDebug(options: DebugOptions = {}) {
  const { enabled = process.env.NODE_ENV === 'development', prefix = 'DEBUG' } = options;
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  });

  const log = (...args: unknown[]) => {
    if (enabled) {
      console.log(`[${prefix}]`, ...args);
    }
  };

  const error = (...args: unknown[]) => {
    if (enabled) {
      console.error(`[${prefix}]`, ...args);
    }
  };

  const warn = (...args: unknown[]) => {
    if (enabled) {
      console.warn(`[${prefix}]`, ...args);
    }
  };

  return { log, error, warn, isFirstRender: isFirstRender.current };
} 