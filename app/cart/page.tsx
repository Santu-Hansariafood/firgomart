"use client";

import { useCart } from "@/context/CartContext/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Gift, ShieldCheck } from "lucide-react";
import FallbackImage from "@/components/common/Image/FallbackImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGeolocation } from "@/hooks/product-grid/useGeolocation";
import { getMaxQuantity, getCurrencyForCountry } from "@/utils/productUtils";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState({ subtotal: 0, tax: 0, deliveryFee: 0, total: 0 });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const { countryCode } = useGeolocation();
  const currency = getCurrencyForCountry(countryCode);

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
        <div className="w-24 h-24 bg-[var(--foreground)/5] rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-[var(--foreground)/20]" />
        </div>
        <h2 className="text-2xl font-bold text-[color:var(--foreground)] mb-2">Your Cart is Empty</h2>
        <p className="text-[var(--foreground)/60] mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Browse our products and find something you love.
        </p>
        <Link
          href="/"
          className="px-8 py-3 bg-brand-purple text-white rounded-xl font-medium shadow-lg shadow-brand-purple/20 hover:bg-brand-purple/90 transition-all hover:scale-105 active:scale-95"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-12">
      <div className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--foreground)/10] px-4 py-3 flex items-center gap-3 md:hidden">
        <Link href="/" className="p-2 -ml-2 hover:bg-[var(--foreground)/5] rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-[color:var(--foreground)]" />
        </Link>
        <h1 className="text-lg font-bold text-[color:var(--foreground)]">Shopping Cart ({cartItems.length})</h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
        <div className="hidden md:flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 -ml-2 hover:bg-[var(--foreground)/5] rounded-full transition-colors group" title="Back to Home">
            <ArrowLeft className="w-6 h-6 text-[color:var(--foreground)] group-hover:text-brand-purple transition-colors" />
          </Link>
          <h1 className="text-3xl font-heading font-bold text-[color:var(--foreground)]">Shopping Cart</h1>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._uniqueId || item.id}
                className="group flex gap-4 p-4 bg-[var(--card-bg,var(--background))] border border-[var(--foreground)/10] rounded-xl shadow-sm hover:shadow-md transition-all hover:border-brand-purple/20"
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-[var(--foreground)/5] rounded-lg overflow-hidden">
                  <FallbackImage
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-medium text-[color:var(--foreground)] line-clamp-2 text-base sm:text-lg leading-tight">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item._uniqueId || item.id)}
                        className="p-2 text-[var(--foreground)/40] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors -mr-2 -mt-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {item.appliedOffer && (
                      <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-xs font-medium text-green-600 dark:text-green-400">
                        <Gift className="w-3.5 h-3.5 mr-1.5" />
                        {item.appliedOffer.name} 
                        {item.appliedOffer.value ? ` (${item.appliedOffer.value}${String(item.appliedOffer.type).includes('discount') ? '% OFF' : ''})` : ''}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">
                        {currency.symbol}
                        {item.price}
                      </p>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-sm text-[var(--foreground)/40] line-through">
                          {currency.symbol}
                          {item.originalPrice}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center border border-[var(--foreground)/20] rounded-lg overflow-hidden bg-[var(--background)]">
                      <button
                        onClick={() => updateQuantity(item._uniqueId || item.id, (item.quantity || 1) - 1)}
                        className="p-2 hover:bg-[var(--foreground)/5] transition-colors disabled:opacity-30"
                        disabled={(item.quantity || 1) <= 1}
                      >
                        <Minus className="w-4 h-4 text-[color:var(--foreground)]" />
                      </button>
                      <span className="px-3 text-base font-semibold text-[color:var(--foreground)] min-w-[2rem] text-center">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._uniqueId || item.id, (item.quantity || 1) + 1)}
                        className="p-2 hover:bg-[var(--foreground)/5] transition-colors disabled:opacity-30"
                        disabled={(item.quantity || 1) >= Math.min(getMaxQuantity(item.price), item.stock || 10)}
                      >
                        <Plus className="w-4 h-4 text-[color:var(--foreground)]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:w-96 shrink-0">
            <div className="bg-[var(--card-bg,var(--background))] border border-[var(--foreground)/10] rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="font-heading font-bold text-xl mb-6 text-[color:var(--foreground)]">Order Summary</h2>
              <div className="space-y-3 text-sm text-[color:var(--foreground)]/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[color:var(--foreground)]">
                    {currency.symbol}
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                
                {summary.tax > 0 && (
                  <div className="flex justify-between">
                    <span>GST (Tax)</span>
                    <span className="font-medium text-[color:var(--foreground)]">
                      {currency.symbol}
                      {summary.tax.toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-green-600">
                    {deliveryFee === 0 ? "FREE" : `${currency.symbol}${deliveryFee}`}
                  </span>
                </div>

                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Platform Fees</span>
                  <span className="font-medium">
                    FREE ({currency.symbol}
                    0)
                  </span>
                </div>
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Packaging Fees</span>
                  <span className="font-medium">
                    FREE ({currency.symbol}
                    0)
                  </span>
                </div>
                <div className="border-t border-[var(--foreground)/10] pt-4 mt-2 flex justify-between items-end">
                  <span className="font-bold text-base text-[color:var(--foreground)]">Total Amount</span>
                  <span className="font-sans font-extrabold text-2xl text-[color:var(--foreground)]">
                    {currency.symbol}
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full py-4 bg-brand-purple text-white rounded-xl font-bold shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 hover:bg-brand-purple/90 transition-all active:scale-[0.98]"
                >
                  Proceed to Checkout
                </button>
                <div className="flex items-center justify-center gap-2 text-xs text-[var(--foreground)/40]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
