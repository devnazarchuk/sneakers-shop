export const productGridStyles = {
  container: {
    minHeight: '200px',
    boxShadow: '0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1)'
  },
  card: {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 0 15px rgba(59, 130, 246, 0.2)',
    borderRadius: '16px',
    padding: '8px'
  }
} as const;

export const gradientTextStyles = {
  primary: 'bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent',
  secondary: 'bg-gradient-to-r from-primary/80 to-primary/60 bg-clip-text text-transparent'
} as const;

export const buttonStyles = {
  primary: 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70',
  destructive: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
  outline: 'border-white/20 bg-background/50 backdrop-blur-sm hover:bg-background/80'
} as const; 