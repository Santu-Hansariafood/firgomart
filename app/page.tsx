"use client";

import { useState, Suspense } from "react";
import { useCart } from "@/context/CartContext/CartContext";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Loading from "./loading";
const AdCarousel = dynamic(() => import("@/components/common/AdCarousel/AdCarousel"));
const ProductGrid = dynamic(() => import("@/components/ui/ProductGrid/ProductGrid"));
const ProductModal = dynamic(() => import("@/components/ui/ProductModal/ProductModal"));
const Cart = dynamic(() => import("@/components/ui/Cart/Cart"));
const NewArrivals = dynamic(() => import("@/components/ui/NewArrivals/NewArrivals"));
const TrendingProducts = dynamic(() => import("@/components/ui/TrendingProducts/TrendingProducts"));

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { cartItems, addToCart, updateQuantity, removeFromCart, showCart, setShowCart } =
    useCart();
  const searchParams = useSearchParams();
  const search = searchParams.get('search');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setShowCart(true);
  };

  return (
    <>
      {!search && <AdCarousel />}
      {!search && (
        <>
          <NewArrivals />
          <TrendingProducts />
        </>
      )}
      <ProductGrid
        onProductClick={setSelectedProduct}
        onAddToCart={handleAddToCart}
        hideFilters={!search}
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
