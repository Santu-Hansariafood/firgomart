 "use client";

 import { useState, Suspense, useEffect } from "react";
 import dynamic from "next/dynamic";
 import Loading from "@/app/loading";
 import { useCart } from "@/context/CartContext/CartContext";
 import { useProductFilters } from "@/hooks/product-grid/useProductFilters";

 const TrendingProducts = dynamic(() => import("@/components/ui/TrendingProducts/TrendingProducts"));
 const ProductGrid = dynamic(() => import("@/components/ui/ProductGrid/ProductGrid"));
 const ProductModal = dynamic(() => import("@/components/ui/ProductModal/ProductModal"));
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
   const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
   const [page, setPage] = useState<number>(1);
   const filters = useProductFilters(setPage);

   useEffect(() => {
     filters.setSortBy("rating");
   }, [filters]);

   const handleAddToCart = (product: any) => {
     addToCart(product);
     setShowCart(true);
   };

   return (
     <div className="bg-gradient-to-b from-[#7800c8]/5 via-white to-[#f00000]/5 dark:bg-none min-h-screen">
       <Suspense fallback={<Loading />}>
         <TrendingProducts />
         <ProductGrid
           onProductClick={setSelectedProduct}
           onAddToCart={handleAddToCart}
           hideFilters={false}
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
     </div>
   );
 }

