"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Loading from "@/app/loading";
import { useCart } from "@/context/CartContext/CartContext";
import { useProductFilters } from "@/hooks/product-grid/useProductFilters";
import { useGeolocation } from "@/hooks/product-grid/useGeolocation";
import type { Offer } from "@/components/ui/Filters/OffersFilterChips";

import { useRouter } from "next/navigation";
import { getProductPath } from "@/utils/productUtils";

const FestiveProductsHero = dynamic(() => import("@/components/ui/FestiveProducts/FestiveProducts"));
const ProductGrid = dynamic(() => import("@/components/ui/ProductGrid/ProductGrid"));
const Cart = dynamic(() => import("@/components/ui/Cart/Cart"));

export default function FestiveProductsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <FestiveProductsContent />
    </Suspense>
  );
}

function FestiveProductsContent() {
  const { cartItems, addToCart, updateQuantity, removeFromCart, showCart, setShowCart } =
    useCart();
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const filters = useProductFilters(setPage);
  const { countryCode } = useGeolocation();

  useEffect(() => {
    filters.setSortBy("relevance");
  }, [filters]);

  useEffect(() => {
    let cancelled = false;

    const loadFestiveOffer = async () => {
      try {
        const params = new URLSearchParams();
        if (countryCode) params.set("country", countryCode);

        const res = await fetch(`/api/offers?${params.toString()}`);
        const data = await res.json();
        const list: Offer[] = Array.isArray(data.offers) ? data.offers : [];

        const festive = list.find((o) => o.key.toLowerCase() === "festive");
        if (!festive || cancelled) {
          return;
        }

        filters.setSelectedOffer(festive.key);
        filters.setSelectedOfferDetails(festive);
        setPage(1);
      } catch {
        if (cancelled) return;
      }
    };

    loadFestiveOffer();

    return () => {
      cancelled = true;
    };
  }, [countryCode, filters, setPage]);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setShowCart(true);
  };

  const handleProductClick = (product: any) => {
    router.push(getProductPath(product.name, product._id || product.id));
  };

  return (
    <div className="bg-gradient-to-b from-[#7800c8]/5 via-white to-[#f00000]/5 dark:bg-none min-h-screen">
      <Suspense fallback={<Loading />}>
        <FestiveProductsHero onProductClick={handleProductClick} />
        <ProductGrid
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
          hideFilters={false}
          filters={filters}
          page={page}
          setPage={setPage}
        />

        {showCart && (
          <Cart
            items={cartItems}
            onClose={() => setShowCart(false)}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
          />
        )}
      </Suspense>
    </div>
  );
}
