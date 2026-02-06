"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
import { useCart } from "@/context/CartContext/CartContext";
import dynamic from "next/dynamic";
import { fadeInUp, staggerContainer } from '@/utils/animations/animations'

const ProductModal = dynamic(() => import("@/components/ui/ProductModal/ProductModal"));
const ProductImageSlider = dynamic(() => import('@/components/common/ProductImageSlider/ProductImageSlider'))

interface Product {
  _id: string;
  name: string;
  image: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  stock?: number;
  category?: string;
  brand?: string;
  unitsPerPack?: number;
  description?: string;
  features?: string[];
  rating?: number;
}

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { addToCart, setShowCart } = useCart();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const formatPrice = (v: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v)
  const sanitizeImageUrl = (src: string) => (src || '').trim().replace(/[)]+$/g, '')

  useEffect(() => {
    if (!isAuthenticated) return;

    fetch("/api/user/wishlist")
      .then((res) => res.json())
      .then((data) => {
        if (data.wishlist) {
          setWishlist(data.wishlist);
        }
      })
      .catch(() => {})
      .finally(() => setInternalLoading(false));
  }, [isAuthenticated]);

  const removeFromWishlist = async (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p._id !== productId));

    try {
      await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    } catch {
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity: 1,
    });
    setShowCart(true);
  };

  const handleProductClick = (product: Product) => {
      setSelectedProduct(product);
  };

  const loading = isAuthenticated ? internalLoading : false;
  if (loading) return <BeautifulLoader />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4 text-center">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-[color:var(--foreground)] mb-2">Please Login</h2>
        <p className="text-gray-500 mb-6">Login to view your wishlist</p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-12 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-brand-purple/5 dark:bg-brand-purple/20 -skew-y-3 transform origin-top-left -z-10" />
      <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-rose-500/5 dark:bg-rose-500/20 rounded-full blur-[80px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-foreground/5 rounded-full transition-colors md:hidden"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="space-y-2">
             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-brand-red fill-brand-red" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-purple via-indigo-500 to-brand-purple dark:from-violet-300 dark:via-pink-300 dark:to-violet-300 bg-[length:200%_auto] animate-gradient">
                My Wishlist
              </span>
            </h1>
            <div className="flex items-center gap-3 text-sm text-foreground/60 font-medium pl-1">
               <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20 shadow-sm backdrop-blur-sm">
                {wishlist.length} Saved Items
              </span>
            </div>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-foreground/20" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Your wishlist is empty</h3>
            <p className="text-foreground/60 max-w-md mx-auto mb-6">
              Save items you love to buy later. Browse our products and find something you love.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-8 py-3 bg-brand-purple text-white rounded-xl font-medium shadow-lg shadow-brand-purple/20 hover:bg-brand-purple/90 transition-all hover:scale-105 active:scale-95"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 lg:gap-8"
          >
            {wishlist.map((product) => (
              <motion.div
                key={product._id}
                variants={fadeInUp}
                layout
                className="group bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-purple/10 transition-all duration-500 border border-foreground/5 hover:-translate-y-1.5"
              >
                <div 
                  className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-900/50 cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <ProductImageSlider
                    images={
                      product.images && product.images.length > 0
                        ? product.images.map(sanitizeImageUrl)
                        : [sanitizeImageUrl(product.image)]
                    }
                    name={product.name}
                    interval={2500}
                  />
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none" />

                   <button
                    onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(product._id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md dark:bg-black/50 rounded-full flex items-center justify-center text-brand-red hover:bg-red-50 dark:hover:bg-red-900/30 transition-all shadow-lg z-20 hover:scale-110"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {(typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1) || product.name.toLowerCase().includes('combo') ? (
                    <span className="absolute bottom-3 left-3 right-3 text-center bg-white/95 dark:bg-violet-600/90 backdrop-blur-md text-violet-700 dark:text-white text-[10px] font-bold px-2 py-1.5 rounded-xl shadow-lg z-10 border border-violet-200/50 dark:border-violet-500/50 shadow-violet-500/10">
                      {product.name.toLowerCase().includes('combo') ? '✨ COMBO OFFER' : `📦 PACK OF ${product.unitsPerPack}`}
                    </span>
                  ) : null}

                  {product.discount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg shadow-red-500/30 z-20">
                      -{product.discount}%
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="mb-3">
                    {product.category && (
                        <p className="text-[10px] font-medium text-brand-purple mb-1 uppercase tracking-wider opacity-80">{product.category}</p>
                    )}
                    <h3 
                      className="text-sm font-bold text-foreground leading-snug line-clamp-2 cursor-pointer hover:text-brand-purple transition-colors min-h-[2.5em]"
                      onClick={() => handleProductClick(product)}
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-end justify-between gap-2 mb-4">
                    <div className="flex flex-col">
                      <span className="text-lg font-extrabold text-foreground">₹{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-foreground/40 line-through font-medium">MRP ₹{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                    {typeof product.rating === "number" && (
                      <div className="flex items-center gap-1 bg-brand-purple/10 px-1.5 py-0.5 rounded-md border border-brand-purple/20">
                      <span className="text-brand-purple text-[10px]">★</span>
                      <span className="text-xs font-bold text-brand-purple">
                        {product.rating}
                      </span>
                    </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProductClick(product)}
                      className="hidden sm:inline-flex flex-1 py-2.5 border border-foreground/10 text-foreground/70 rounded-xl hover:bg-foreground/5 hover:text-foreground transition-all text-xs font-bold items-center justify-center uppercase tracking-wide"
                    >
                      Details
                    </button>
                    <button
                      onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                      }}
                      disabled={(product.stock ?? 0) <= 0}
                      className={`flex-1 py-2.5 rounded-xl transition-all duration-300 text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${
                        (product.stock ?? 0) > 0
                          ? 'bg-brand-purple text-white shadow-brand-purple/25 hover:bg-brand-purple/90'
                          : 'bg-foreground/5 text-foreground/30 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{(product.stock ?? 0) > 0 ? 'Add' : 'Sold'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={{
              ...selectedProduct,
              id: selectedProduct._id,
              category: selectedProduct.category || "General",
            }}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(productWithQty) => {
              addToCart({
                id: selectedProduct._id,
                name: selectedProduct.name,
                price: selectedProduct.price,
                image: selectedProduct.image,
                stock: selectedProduct.stock,
                quantity: productWithQty.quantity || 1,
              });
              setShowCart(true);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
