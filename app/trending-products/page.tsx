 "use client";

 import { useState, Suspense, useEffect } from "react";
 import dynamic from "next/dynamic";
 import Loading from "@/app/loading";
 import { useCart } from "@/context/CartContext/CartContext";
 import { useProductFilters } from "@/hooks/product-grid/useProductFilters";

 import { useRouter } from "next/navigation";
 import { getProductPath } from "@/utils/productUtils";

 const TrendingProducts = dynamic(() => import("@/components/ui/TrendingProducts/TrendingProducts"));
 const ProductGrid = dynamic(() => import("@/components/ui/ProductGrid/ProductGrid"));
 const Cart = dynamic(() => import("@/components/ui/Cart/Cart"));

 export default function TrendingProductsPage() {
   return (
     <Suspense fallback={<Loading />}>
       <TrendingProductsContent />
     </Suspense>
   );
 }

 function TrendingProductsContent() {
   const { cartItems, addToCart, updateQuantity, removeFromCart, showCart, setShowCart } =
     useCart();
   const router = useRouter();
   const [page, setPage] = useState<number>(1);
   const filters = useProductFilters(setPage);

   useEffect(() => {
     filters.setSortBy("rating");
   }, [filters]);

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
         <TrendingProducts onProductClick={handleProductClick} />
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
