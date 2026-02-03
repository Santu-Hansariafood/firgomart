"use client";

import { useCart } from "@/context/CartContext/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import FallbackImage from "@/components/common/Image/FallbackImage";
import Link from "next/link";
import { useEffect, useState } from "react";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState({ subtotal: 0, tax: 0, deliveryFee: 0, total: 0 });
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchPricing = async () => {
      const validItems = cartItems.filter(item => (item.stock ?? 0) > 0);
      
      if (validItems.length === 0) {
        setSummary({ subtotal: 0, tax: 0, deliveryFee: 0, total: 0 });
        setLoadingSummary(false);
        return;
      }

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            items: validItems.map(ci => ({ id: ci.id, quantity: ci.quantity ?? 1 })),
            dryRun: true 
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setSummary({
            subtotal: data.subtotal || 0,
            tax: data.tax || 0,
            deliveryFee: data.deliveryFee || 0,
            total: data.total || 0
          });
        } else {
          const sub = validItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
          setSummary({ subtotal: sub, tax: 0, deliveryFee: sub > 500 ? 0 : 40, total: sub + (sub > 500 ? 0 : 40) });
        }
      } catch (error) {
        const sub = validItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
        setSummary({ subtotal: sub, tax: 0, deliveryFee: sub > 500 ? 0 : 40, total: sub + (sub > 500 ? 0 : 40) });
      } finally {
        setLoadingSummary(false);
      }
    };

    const timer = setTimeout(fetchPricing, 500);
    return () => clearTimeout(timer);
  }, [cartItems]);

  const { subtotal, deliveryFee, total } = summary;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-[color:var(--foreground)] mb-2">Please Login</h2>
        <p className="text-gray-500 mb-6">Login to view your cart and checkout</p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 bg-brand-purple text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-[color:var(--foreground)] mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6 text-center">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-brand-purple text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--foreground)/10] px-4 py-3 flex items-center gap-3 md:hidden">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-6 h-6 text-[color:var(--foreground)]" />
        </button>
        <h1 className="text-lg font-bold text-[color:var(--foreground)]">Shopping Cart ({cartItems.length})</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-[var(--background)] border border-[var(--foreground)/10] rounded-xl shadow-sm"
              >
                <div className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                  <FallbackImage
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-[color:var(--foreground)] line-clamp-2 text-sm">
                      {item.name}
                    </h3>
                    <p className="text-brand-purple font-bold mt-1">₹{item.price}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[var(--foreground)/20] rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                        disabled={(item.quantity || 1) <= 1}
                      >
                        <Minus className="w-3 h-3 text-[color:var(--foreground)]" />
                      </button>
                      <span className="px-2 text-sm font-medium text-[color:var(--foreground)]">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                        disabled={(item.quantity || 1) >= (item.stock || 10)}
                      >
                        <Plus className="w-3 h-3 text-[color:var(--foreground)]" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="md:w-80 shrink-0">
            <div className="bg-[var(--background)] border border-[var(--foreground)/10] rounded-xl p-4 shadow-sm sticky top-24">
              <h2 className="font-bold text-lg mb-4 text-[color:var(--foreground)]">Order Summary</h2>
              <div className="space-y-2 text-sm text-[color:var(--foreground)]/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {summary.tax > 0 && (
                  <div className="flex justify-between">
                    <span>GST (Tax)</span>
                    <span>₹{summary.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-green-600">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                </div>
                <div className="border-t border-[var(--foreground)/10] pt-2 mt-2 flex justify-between font-bold text-base text-[color:var(--foreground)]">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => router.push("/checkout")}
                className="w-full mt-6 py-3 bg-brand-purple text-white rounded-lg font-bold shadow-lg shadow-brand-purple/30 hover:shadow-brand-purple/50 transition-all active:scale-[0.98]"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
