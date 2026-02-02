"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import FallbackImage from "@/components/common/Image/FallbackImage";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
import { useCart } from "@/context/CartContext/CartContext";

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
}

export default function WishlistPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { addToCart, setShowCart } = useCart();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect or show empty state handled by UI
      setLoading(false);
      return;
    }

    fetch("/api/user/wishlist")
      .then((res) => res.json())
      .then((data) => {
        if (data.wishlist) {
          setWishlist(data.wishlist);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const removeFromWishlist = async (productId: string) => {
    // Optimistic update
    setWishlist((prev) => prev.filter((p) => p._id !== productId));

    try {
      await fetch("/api/user/wishlist", {
        method: "POST", // POST handles toggle/remove logic
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    } catch {
      // Revert if failed (optional, usually not needed for wishlist)
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
    <div className="min-h-screen bg-[var(--background)] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
          >
            <ArrowLeft className="w-6 h-6 text-[color:var(--foreground)]" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[color:var(--foreground)] flex items-center gap-2">
            <Heart className="w-8 h-8 text-brand-red fill-brand-red" />
            My Wishlist
          </h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <Heart className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-xl font-medium text-gray-500 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-6">Save items you love to buy later</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[var(--background)] border border-[var(--foreground)/10] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative aspect-square bg-gray-50">
                  <FallbackImage
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-xs"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {(product.stock ?? 0) <= 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="font-medium text-[color:var(--foreground)] line-clamp-2 h-10 leading-tight">
                      {product.name}
                    </h3>
                    {product.brand && (
                        <span className="text-xs text-gray-500">{product.brand}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-lg font-bold text-[color:var(--foreground)]">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={(product.stock ?? 0) <= 0}
                    className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
                      (product.stock ?? 0) > 0
                        ? "bg-brand-purple text-white hover:bg-purple-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {(product.stock ?? 0) > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
