"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

import { getMaxQuantity } from "@/utils/productUtils";

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  quantity?: number;
  stock?: number;
  unitsPerPack?: number;
  selectedSize?: string;
  selectedColor?: string;
  _uniqueId?: string;
  appliedOffer?: {
    name: string;
    type: string;
    value?: string | number;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  showCart: boolean;
  setShowCart: (v: boolean) => void;
  addToCart: (product: CartItem) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  removeFromCart: (id: number | string) => void;
  clearCart: () => void;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const MAX_QTY = 3;

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('cartItems') : null;
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load cart from local storage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to save cart to local storage", error);
      }
    }
  }, [cartItems, isLoaded]);

  const clearCart = () => setCartItems([]);

  const addToCart = (product: CartItem) => {
    setCartItems((prev) => {
      // Calculate price if offer is applied and it's a percentage value
      let finalProduct = { ...product };
      if (finalProduct.appliedOffer && finalProduct.appliedOffer.value) {
        const val = Number(finalProduct.appliedOffer.value);
        if (!isNaN(val) && val > 0 && val <= 100) {
           const currentPrice = finalProduct.price;
           if (!finalProduct.originalPrice) {
              finalProduct.originalPrice = currentPrice;
           }
           // Apply discount on the current price (extra discount)
           const discountAmount = Math.round((currentPrice * val) / 100);
           finalProduct.price = currentPrice - discountAmount;
        }
      }

      const offerKey = finalProduct.appliedOffer ? `-${finalProduct.appliedOffer.name}` : '';
      const uniqueId = finalProduct._uniqueId || `${finalProduct.id}-${finalProduct.selectedSize || ''}-${finalProduct.selectedColor || ''}${offerKey}`;
      const productWithId = { ...finalProduct, _uniqueId: uniqueId };
      
      const exists = prev.find((item) => (item._uniqueId || `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}${item.appliedOffer ? `-${item.appliedOffer.name}` : ''}`) === uniqueId);
      
      if (exists) {
        const inc = product.quantity && product.quantity > 0 ? product.quantity : 1
        return prev.map((item) => {
          const itemId = item._uniqueId || `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}${item.appliedOffer ? `-${item.appliedOffer.name}` : ''}`;
          if (itemId !== uniqueId) return item
          const current = item.quantity || 1
          const stock = item.stock ?? 3
          const maxQty = getMaxQuantity(item.price)
          const next = Math.min(stock, Math.min(maxQty, current + inc))
          return { ...item, quantity: next, _uniqueId: itemId }
        });
      }
      const startQty = product.quantity && product.quantity > 0 ? product.quantity : 1
      const stock = product.stock ?? 3
      const maxQty = getMaxQuantity(product.price)
      if (stock <= 0) return prev
      return [...prev, { ...productWithId, quantity: Math.min(stock, Math.min(maxQty, startQty)) }];
    });
  };

  const updateQuantity = (id: number | string, quantity: number) => {
    setCartItems((prev) => {
       const item = prev.find(i => (i._uniqueId || i.id) === id)
       if (!item) return prev
       const stock = item.stock ?? 3
       const maxQty = getMaxQuantity(item.price)
       if (quantity <= 0) return prev.filter((item) => (item._uniqueId || item.id) !== id)
       return prev.map((item) => ((item._uniqueId || item.id) === id ? { ...item, quantity: Math.min(stock, Math.min(maxQty, Math.max(1, quantity))) } : item))
    });
  };

  const removeFromCart = (id: number | string) => {
    setCartItems((prev) => prev.filter((item) => (item._uniqueId || item.id) !== id));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        showCart,
        setShowCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
