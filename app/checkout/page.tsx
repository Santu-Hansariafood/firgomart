"use client";

import { useCart } from "@/context/CartContext/CartContext";
import { useAuth } from "@/context/AuthContext";
import Checkout from "@/components/ui/Checkout/Checkout";
import ProtectedRoute from "@/components/ui/ProtectedRoute/ProtectedRoute";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";

export default function CheckoutPage() {
  const { cartItems, updateQuantity, removeFromCart, isLoaded } = useCart();

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <BeautifulLoader />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Checkout
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
    </ProtectedRoute>
  );
}

