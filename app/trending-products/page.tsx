 "use client";

 import { useState, Suspense, useEffect } from "react";
 import dynamic from "next/dynamic";
 import Link from "next/link";
 import { Home, ChevronRight, ArrowLeft } from "lucide-react";
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
     if (typeof window !== 'undefined') {
       window.scrollTo(0, 0)
     }
   }, [])

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
     <div className="bg-gradient-to-b from-[#7800c8]/5 via-white to-[#f00000]/5 dark:bg-none min-h-screen pt-4 sm:pt-6 pb-12">
       <div className="container mx-auto px-2 sm:px-6">
         <div className="flex items-center justify-between mb-4 sm:mb-6">
           <nav className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-sm font-medium overflow-x-auto whitespace-nowrap pb-0.5 scrollbar-hide">
             <Link href="/" className="flex items-center gap-1 text-foreground/60 hover:text-brand-purple shrink-0">
               <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
               <span>Home</span>
             </Link>
             <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground/30 shrink-0" />
             <span className="text-brand-purple font-bold shrink-0">Trending Products</span>
           </nav>

           <Link 
             href="/"
             className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple rounded-full text-[9px] sm:text-xs font-bold transition-all shrink-0 border border-brand-purple/20 shadow-sm"
           >
             <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
             <span className="hidden xs:inline">Back to Home</span>
             <span className="xs:hidden">Home</span>
           </Link>
         </div>

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

         </Suspense>
       </div>
     </div>
   );
 }
