"use client";

import { useState, Suspense } from "react";
import { useCart } from "@/context/CartContext/CartContext";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Loading from "./loading";
import { useProductFilters } from "@/hooks/product-grid/useProductFilters";

const AdCarousel = dynamic(() => import("@/components/common/AdCarousel/AdCarousel"));
const ProductGrid = dynamic(() => import("@/components/ui/ProductGrid/ProductGrid"));
const ProductModal = dynamic(() => import("@/components/ui/ProductModal/ProductModal"));
const Cart = dynamic(() => import("@/components/ui/Cart/Cart"));
const NewArrivals = dynamic(() => import("@/components/ui/NewArrivals/NewArrivals"));
const PendingReviews = dynamic(() => import("@/components/ui/PendingReviews/PendingReviews"));
const TrendingProducts = dynamic(() => import("@/components/ui/TrendingProducts/TrendingProducts"));
const MarqueeBanner = dynamic(() => import("@/components/ui/MarqueeBanner/MarqueeBanner"));
const PriceCategoryBanner = dynamic(() => import("@/components/ui/PriceCategoryBanner/PriceCategoryBanner"));

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
  
  const [page, setPage] = useState<number>(1);
  const filters = useProductFilters(setPage);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setShowCart(true);
  };

  return (
    <Suspense fallback={<Loading />}>
      {!search && <AdCarousel />}
      {!search && (
        <Suspense fallback={<Loading />}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 transform hover:scale-[1.01] transition-transform duration-500">
            <MarqueeBanner />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <PriceCategoryBanner onSelectCategory={filters.handlePriceCategorySelect} />
          </div>

          <PendingReviews />
          <NewArrivals />
          <TrendingProducts />
        </Suspense>
      )}
      <ProductGrid
        onProductClick={setSelectedProduct}
        onAddToCart={handleAddToCart}
        hideFilters={!search}
        filters={filters}
        page={page}
        setPage={setPage}
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
