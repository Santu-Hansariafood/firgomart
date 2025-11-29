"use client";

import { useCart } from "@/context/CartContext/CartContext";
import { useAuth } from "@/context/AuthContext";
import Checkout from "@/components/ui/Checkout/Checkout";
import ProtectedRoute from "@/components/ui/ProtectedRoute/ProtectedRoute";

export default function CheckoutPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

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

