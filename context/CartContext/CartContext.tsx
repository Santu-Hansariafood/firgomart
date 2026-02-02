"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
}

interface CartContextType {
  cartItems: CartItem[];
  showCart: boolean;
  setShowCart: (v: boolean) => void;
  addToCart: (product: CartItem) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  removeFromCart: (id: number | string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const MAX_QTY = 3;

  const clearCart = () => setCartItems([]);

  const addToCart = (product: CartItem) => {
    setCartItems((prev) => {
      const uniqueId = product._uniqueId || `${product.id}-${product.selectedSize || ''}-${product.selectedColor || ''}`;
      const productWithId = { ...product, _uniqueId: uniqueId };
      
      const exists = prev.find((item) => (item._uniqueId || `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`) === uniqueId);
      
      if (exists) {
        const inc = product.quantity && product.quantity > 0 ? product.quantity : 1
        return prev.map((item) => {
          const itemId = item._uniqueId || `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
          if (itemId !== uniqueId) return item
          const current = item.quantity || 1
          const stock = item.stock ?? MAX_QTY
          const next = Math.min(stock, Math.min(MAX_QTY, current + inc))
          return { ...item, quantity: next, _uniqueId: itemId } // Ensure _uniqueId is set
        });
      }
      const startQty = product.quantity && product.quantity > 0 ? product.quantity : 1
      const stock = product.stock ?? MAX_QTY
      if (stock <= 0) return prev
      return [...prev, { ...productWithId, quantity: Math.min(stock, Math.min(MAX_QTY, startQty)) }];
    });
  };

  const updateQuantity = (id: number | string, quantity: number) => {
    setCartItems((prev) => {
       const item = prev.find(i => (i._uniqueId || i.id) === id)
       if (!item) return prev
       const stock = item.stock ?? MAX_QTY
       if (quantity <= 0) return prev.filter((item) => (item._uniqueId || item.id) !== id)
       return prev.map((item) => ((item._uniqueId || item.id) === id ? { ...item, quantity: Math.min(stock, Math.min(MAX_QTY, Math.max(1, quantity))) } : item))
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
