"use client";

import { useState, Suspense } from "react";
import { useCart } from "@/context/CartContext/CartContext";
import dynamic from "next/dynamic";
import Loading from "./loading";
const AdCarousel = dynamic(() => import("@/components/common/AdCarousel/AdCarousel"));
const ProductGrid = dynamic(() => import("@/components/ui/ProductGrid/ProductGrid"));
const ProductModal = dynamic(() => import("@/components/ui/ProductModal/ProductModal"));
const Cart = dynamic(() => import("@/components/ui/Cart/Cart"));

export default function Page() {
  const { cartItems, addToCart, updateQuantity, removeFromCart, showCart, setShowCart } =
    useCart();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setShowCart(true);
  };

  return (
    <Suspense fallback={<Loading/>}>
      <AdCarousel />
      <ProductGrid
        onProductClick={setSelectedProduct}
        onAddToCart={handleAddToCart}
      />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {showCart && (
        <Cart
          items={cartItems}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
        />
      )}
    </Suspense>
  );
}
