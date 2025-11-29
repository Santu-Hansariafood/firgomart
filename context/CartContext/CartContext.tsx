"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  quantity?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  showCart: boolean;
  setShowCart: (v: boolean) => void;
  addToCart: (product: CartItem) => Promise<void> | void;
  updateQuantity: (id: string | number, quantity: number) => Promise<void> | void;
  removeFromCart: (id: string | number) => Promise<void> | void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const syncFromServer = async () => {
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok && data?.cart?.items) {
        const mapped: CartItem[] = data.cart.items.map((i: any) => ({
          id: i.productId,
          name: i.name,
          price: i.price,
          originalPrice: i.originalPrice,
          image: i.image,
          quantity: i.quantity,
        }))
        setCartItems(mapped)
      }
    } catch {}
  }

  useEffect(() => { void syncFromServer() }, [])

  const addToCart = async (product: CartItem) => {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: String(product.id), quantity: 1 }),
      })
      if (res.ok) await syncFromServer()
      else {
        setCartItems((prev) => {
          const exists = prev.find((item) => item.id === product.id);
          if (exists) {
            return prev.map((item) =>
              item.id === product.id
                ? { ...item, quantity: (item.quantity || 1) + 1 }
                : item
            );
          }
          return [...prev, { ...product, quantity: 1 }];
        });
      }
    } catch {
      setCartItems((prev) => {
        const exists = prev.find((item) => item.id === product.id);
        if (exists) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
    }
  };

  const updateQuantity = async (id: string | number, quantity: number) => {
    try {
      const res = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: String(id), quantity }),
      })
      if (res.ok) await syncFromServer()
      else {
        setCartItems((prev) =>
          quantity === 0
            ? prev.filter((item) => item.id !== id)
            : prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
      }
    } catch {
      setCartItems((prev) =>
        quantity === 0
          ? prev.filter((item) => item.id !== id)
          : prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const removeFromCart = async (id: string | number) => {
    try {
      const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: String(id) }),
      })
      if (res.ok) await syncFromServer()
      else setCartItems((prev) => prev.filter((item) => item.id !== id))
    } catch {
      setCartItems((prev) => prev.filter((item) => item.id !== id))
    }
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
