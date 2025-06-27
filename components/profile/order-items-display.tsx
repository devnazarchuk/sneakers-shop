"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Euro, Award, Ruler, Palette, ShoppingBag } from "lucide-react";
import type { OrderItem } from "@/lib/orders";

interface OrderItemDisplayProps {
  item: {
    productId: number;
    title: string;
    brand: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    images: string[];
    description?: string;
  };
  compact?: boolean;
}

export function OrderItemDisplay({ item, compact }: OrderItemDisplayProps) {
  const imageUrl = item.images && item.images.length > 0 
    ? item.images[0] 
    : '/placeholder.jpg';

  // Mobile adaptive layout if compact
  if (compact) {
    return (
      <div className="flex flex-col min-[500px]:flex-row items-center min-[500px]:items-start gap-2 min-[500px]:gap-4 p-3 bg-background/50 rounded-lg border border-white/10 w-full text-center min-[500px]:text-left">
        {/* Image */}
        <div className="relative w-full min-[500px]:w-32 flex justify-center min-[500px]:justify-start mb-2 min-[500px]:mb-0">
          <div className="relative max-w-xs min-[500px]:max-w-full w-full min-[500px]:w-32 h-24 min-[500px]:h-32 mx-auto rounded-lg overflow-hidden bg-muted/30">
            <Image
              src={imageUrl}
              alt={item.title}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, 128px"
            />
          </div>
        </div>
        {/* Info */}
        <div className="flex-1 w-full min-[500px]:w-auto flex flex-col gap-1 justify-center">
          {/* Title */}
          <div className="font-bold text-base w-full break-words whitespace-normal flex items-center gap-2 justify-center min-[500px]:justify-start max-[324px]:line-clamp-2 max-[324px]:break-words max-[324px]:whitespace-normal">
            <ShoppingBag className="h-4 w-4 text-primary min-[501px]:inline hidden" />
            {item.title}
          </div>
          {/* Brand */}
          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center min-[500px]:justify-start">
            <Award className="h-3 w-3" />
            {item.brand}
          </div>
          {/* Description */}
          {item.description && (
            <div className="text-xs text-muted-foreground mt-1 w-full min-[500px]:w-auto text-center min-[500px]:text-left">{item.description}</div>
          )}
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mt-2 justify-center min-[500px]:justify-start">
            <Badge variant="outline" className="text-xs px-2 py-0.5 flex items-center gap-1">
              <Ruler className="h-3 w-3" /> {item.size}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0.5 flex items-center gap-1">
              <Palette className="h-3 w-3" /> {item.color}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0.5 flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" /> Qty: {item.quantity}
            </Badge>
          </div>
          {/* Price */}
          <div className="flex items-center justify-center min-[500px]:justify-start w-full min-[500px]:w-auto mt-2">
            <div className="font-bold text-lg flex items-center gap-1">
              <Euro className="h-4 w-4" />
              {(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop/old layout (md+ always row)
  return (
    <div className="flex flex-col md:flex-row items-center md:items-center gap-3 p-3 bg-background/50 rounded-lg border border-white/10 w-full">
      {/* Product Image */}
      <div className="relative w-16 h-16 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0 mx-auto md:mx-0">
        <Image
          src={imageUrl}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 64px, 128px"
        />
      </div>
      {/* Product Info */}
      <div className="flex-1 min-w-0 w-full md:w-auto text-center md:text-left">
        <div className="font-medium text-sm w-full break-words whitespace-normal flex items-center gap-2 justify-center md:justify-start max-[324px]:line-clamp-2 max-[324px]:break-words max-[324px]:whitespace-normal">
          <ShoppingBag className="h-4 w-4 text-primary min-[501px]:inline hidden" />
          {item.title}
        </div>
        <div className="text-xs text-muted-foreground flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mt-1 justify-center md:justify-start">
          <Award className="h-3 w-3" />
          <span>{item.brand}</span>
          <span className="hidden md:inline">•</span>
          <Badge variant="outline" className="text-xs px-1 py-0 flex items-center gap-1">
            <Ruler className="h-3 w-3" /> {item.size}
          </Badge>
          <span className="hidden md:inline">•</span>
          <span className="flex items-center gap-1"><Palette className="h-3 w-3" /> {item.color}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-center md:justify-start">
          <ShoppingBag className="h-3 w-3" /> Qty: {item.quantity}
        </div>
      </div>
      {/* Price */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-1 font-semibold text-sm">
          <Euro className="h-3 w-3" />
          {(item.price * item.quantity).toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground">
          €{item.price.toFixed(2)} each
        </div>
      </div>
    </div>
  );
}

export function OrderItemsDisplay({ items }: { items: OrderItem[] }) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueProducts = items.length;
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {uniqueProducts} product{uniqueProducts !== 1 ? 's' : ''} • {totalItems} total items
        </span>
        <span className="font-medium">
          Total: €{totalAmount.toFixed(2)}
        </span>
      </div>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            {/* Product Image */}
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
              {item.images && item.images.length > 0 ? (
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No image</span>
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.brand}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  Size: {item.size}
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  Color: {item.color}
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  Qty: {item.quantity}
                </span>
              </div>
            </div>
            
            {/* Price */}
            <div className="text-right flex-shrink-0">
              <p className="font-medium text-sm">€{(item.price * item.quantity).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">€{item.price.toFixed(2)} each</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 