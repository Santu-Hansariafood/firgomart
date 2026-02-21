'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, MapPin, CreditCard, Package } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext/CartContext';
import BeautifulLoader from '@/components/common/Loader/BeautifulLoader';

const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17932697360';

function StatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const cfOrderId = searchParams.get('order_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');
  const [order, setOrder] = useState<any>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      setMessage('Invalid Order ID');
      return;
    }

    const checkStatus = async () => {
      try {
        if (cfOrderId) {
          try {
            await fetch(`/api/payment/cashfree/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, cfOrderId }),
            });
          } catch (e) {
            console.error("Verification failed", e);
          }
        }

        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        const ord = data.order;
        setOrder(ord);

        const statusVal = String(ord?.status || '').toLowerCase();
        if (['paid', 'confirmed', 'completed', 'shipped', 'delivered'].includes(statusVal)) {
          setStatus('success');
          clearCart();
        } else if (['failed', 'cancelled', 'refunded'].includes(statusVal)) {
          setStatus('failed');
          setMessage('Payment failed or cancelled');
        } else {
          setStatus('failed');
          setMessage('Payment processing or pending. Please check back later.');
        }
      } catch (err) {
        setStatus('failed');
        setMessage('Failed to verify status');
      }
    };

    checkStatus();
  }, [orderId, cfOrderId, clearCart]);

  useEffect(() => {
    if (status !== 'success' || !order) return;
    if (typeof window === 'undefined') return;
    const gtag =
      (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (!gtag) return;
    const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    const sendTo = label
      ? `${GOOGLE_ADS_ID}/${label}`
      : GOOGLE_ADS_ID;
    const amount = Number(order.amount || 0);
    const transactionId = String(order.orderNumber || order._id || '');
    gtag('event', 'conversion', {
      send_to: sendTo,
      value: isNaN(amount) ? 0 : amount,
      currency: 'INR',
      transaction_id: transactionId,
    });
  }, [status, order]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-16 h-16 text-brand-purple animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Verifying Payment...</h2>
        <p className="text-gray-500 mt-2">Please do not close this window.</p>
      </div>
    );
  }

  if (status === 'success' && order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-green-50 p-8 text-center border-b border-green-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Successful!</h1>
            <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
            <div className="mt-4 inline-block px-4 py-1 bg-white rounded-full text-sm font-medium text-gray-600 border border-gray-200">
              Order ID: {order.orderNumber}
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="flex items-center text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  <MapPin className="w-4 h-4 mr-2" /> Shipping Address
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
                  <p className="font-medium text-gray-900 mb-1">{order.buyerName}</p>
                  <p>{order.address}</p>
                  <p>{order.city}, {order.state} - {order.pincode}</p>
                  <p>{order.country}</p>
                  <p className="mt-2 text-gray-500">Phone: {order.phone}</p>
                </div>
              </div>
              
              <div>
                <h3 className="flex items-center text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  <CreditCard className="w-4 h-4 mr-2" /> Payment Summary
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{(order.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{order.deliveryFee ? `₹${order.deliveryFee}` : 'Free'}</span>
                  </div>
                  <div className="border-t border-gray-200 my-2 pt-2 flex justify-between text-base font-bold text-gray-900">
                    <span>Total Paid</span>
                    <span>₹{(order.amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="flex items-center text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              <Package className="w-4 h-4 mr-2" /> Order Items
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.name}
                        {item.selectedSize && <span className="text-gray-500 font-normal ml-1">({item.selectedSize})</span>}
                        {item.appliedOffer && (
                          <div className="text-xs text-green-600 mt-1 font-medium">
                            Offer: {item.appliedOffer.name} ({item.appliedOffer.value}% Off)
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile" className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center">
                View My Orders
              </Link>
              <Link href="/" className="px-6 py-3 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors font-medium text-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <XCircle className="w-20 h-20 text-red-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed or Pending</h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {message || 'We could not confirm your payment. If money was deducted, it will be refunded automatically within 5-7 business days.'}
      </p>
      <div className="flex space-x-4">
        <Link href="/checkout" className="px-6 py-3 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors">
          Try Again
        </Link>
        <Link href="/" className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-12">
      <div className="max-w-4xl mx-auto bg-[var(--background)] text-[color:var(--foreground)] rounded-2xl shadow-sm p-8">
        <Suspense fallback={<BeautifulLoader />}>
            <StatusContent />
        </Suspense>
      </div>
    </div>
  );
}
