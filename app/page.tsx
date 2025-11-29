"use client";

import { useState } from "react";
import AdCarousel from "@/components/common/AdCarousel/AdCarousel";
import ProductGrid from "@/components/ui/ProductGrid/ProductGrid";
import ProductModal from "@/components/ui/ProductModal/ProductModal";
import Cart from "@/components/ui/Cart/Cart";
import { useCart } from "@/context/CartContext/CartContext";

export default function Page() {
  const { cartItems, addToCart, updateQuantity, removeFromCart, showCart, setShowCart } =
    useCart();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setShowCart(true);
  };

  return (
    <>
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
    </>
  );
}
