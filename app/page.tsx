"use client";

import { useState, Suspense } from "react";
import { useCart } from "@/context/CartContext/CartContext";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Loading from "./loading";
import { useProductFilters } from "@/hooks/product-grid/useProductFilters";
import { useRouter } from "next/navigation";
import { getProductPath } from "@/utils/productUtils";
import type { Product } from "@/types/product";
import type { CartItem } from "@/types/checkout";

const AdCarousel = dynamic(() => import("@/components/common/AdCarousel/AdCarousel"));
const ProductGrid = dynamic(() => import("@/components/ui/ProductGrid/ProductGrid"));
const Cart = dynamic(() => import("@/components/ui/Cart/Cart"));
const NewArrivals = dynamic(() => import("@/components/ui/NewArrivals/NewArrivals"));
const PendingReviews = dynamic(() => import("@/components/ui/PendingReviews/PendingReviews"));
const TrendingProducts = dynamic(() => import("@/components/ui/TrendingProducts/TrendingProducts"));
const SellerProducts = dynamic(() => import("@/components/ui/SellerProducts/SellerProducts"));
const MarqueeBanner = dynamic(() => import("@/components/ui/MarqueeBanner/MarqueeBanner"));
const PriceCategoryBanner = dynamic(() => import("@/components/ui/PriceCategoryBanner/PriceCategoryBanner"));
const FestiveProducts = dynamic(() => import("@/components/ui/FestiveProducts/FestiveProducts"));
const RecentlyViewed = dynamic(() => import("@/components/ui/RecentlyViewed/RecentlyViewed"));

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
  const router = useRouter();
  const search = searchParams.get('search');
  
  const [page, setPage] = useState<number>(1);
  const filters = useProductFilters(setPage);

  const handleAddToCart = (product: Product) => {
    addToCart(product as CartItem);
    setShowCart(true);
  };

  const handleProductClick = (product: Product) => {
    router.push(getProductPath(product.name, product._id || product.id));
  };

  return (
    <div className="bg-gradient-to-b from-[#7800c8]/5 via-white to-[#f00000]/5 dark:bg-none min-h-screen">
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
            <NewArrivals onProductClick={handleProductClick} />
            <FestiveProducts onProductClick={handleProductClick} />
            <TrendingProducts onProductClick={handleProductClick} />
            <SellerProducts onProductClick={handleProductClick} />
            <RecentlyViewed
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          </Suspense>
        )}
        <ProductGrid
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
          hideFilters={!search}
          filters={filters}
          page={page}
          setPage={setPage}
        />

      </Suspense>
    </div>
  );
}
