import { Product } from '@/lib/data';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, selectedSize: string, selectedColor: string, quantity?: number) => void;
  removeFromCart: (productId: number, selectedSize: string, selectedColor: string) => void;
  updateQuantity: (productId: number, selectedSize: string, selectedColor: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number, selectedSize: string, selectedColor: string) => boolean;
  total: number;
  isHydrated: boolean;
}

export interface CartItemIdentifier {
  productId: number;
  selectedSize: string;
  selectedColor: string;
}

export function createCartItemId(item: CartItemIdentifier): string {
  return `${item.productId}-${item.selectedSize}-${item.selectedColor}`;
}

export function parseCartItemId(id: string): CartItemIdentifier {
  const [productId, selectedSize, selectedColor] = id.split('-');
  return {
    productId: parseInt(productId, 10),
    selectedSize,
    selectedColor,
  };
} 