'use client'

import { useCart } from '@/context/CartContext/CartContext'
import dynamic from 'next/dynamic'

const Cart = dynamic(() => import('@/components/ui/Cart/Cart'))

export default function CartHost() {
  const { cartItems, showCart, setShowCart, updateQuantity, removeFromCart } = useCart()
  if (!showCart) return null
  return (
    <Cart
      items={cartItems as any}
      onClose={() => setShowCart(false)}
      onUpdateQuantity={updateQuantity as any}
      onRemoveItem={removeFromCart as any}
    />
  )
}

