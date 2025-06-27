export interface Product {
  id: number;
  title: string;
  price: number;
  images: string[]; // array of images
  description: string;
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  styleCode: string;
  // imageUrl?: string; // deprecated, use images[0]
}

export interface CartItem extends Product {
  quantity: number;
}

export const getCartItems = (): CartItem[] => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

export const getFavorites = (): number[] => {
  const favorites = localStorage.getItem('favorites');
  return favorites ? JSON.parse(favorites) : [];
};

export const saveCartItems = (items: CartItem[]) => {
  localStorage.setItem('cart', JSON.stringify(items));
};

export const saveFavorites = (favorites: number[]) => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

// Utility to generate random price, sizes, colors, and description
// function randomPrice() {
//   return Math.floor(Math.random() * 100) + 80; // 80-179 EUR
// }
const SIZES = ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"];
const COLORS = ["Black", "White", "Red", "Blue", "Green", "Grey", "Yellow"];
function randomSizes() {
  return SIZES.slice(0, Math.floor(Math.random() * SIZES.length) + 3);
}
function randomColors() {
  return COLORS.slice(0, Math.floor(Math.random() * COLORS.length) + 2);
}
function defaultDescription(brand: string, name: string) {
  return `The ${brand} ${name} is a stylish and comfortable sneaker, perfect for everyday wear.`;
}

// Fetch and map sneakers.json to Product[]
export async function fetchSneakerProducts(): Promise<Product[]> {
  const res = await fetch("/data/sneakers.json");
  const sneakers = await res.json();
  return sneakers.map((s: {
    name: string;
    price: number;
    images: string[];
    brand: string;
    styleCode: string;
  }, idx: number) => ({
    id: idx + 1, // or s.styleCode if you want string ids
    title: s.name,
    price: s.price, // use price from JSON
    images: s.images,
    description: defaultDescription(s.brand, s.name),
    category: "Casual", // or try to infer from name
    brand: s.brand,
    sizes: randomSizes(),
    colors: randomColors(),
    styleCode: s.styleCode,
  }));
} 