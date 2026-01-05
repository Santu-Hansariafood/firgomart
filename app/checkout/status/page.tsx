'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext/CartContext';

function StatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('id');
  const cfOrderId = searchParams.get('order_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');
  const { clearCart } = useCart();

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      setMessage('Invalid Order ID');
      return;
    }

    const checkStatus = async () => {
      try {
        const safeJson = async (res: Response) => {
          try {
            return await res.json();
          } catch {
            try {
              const t = await res.text();
              return { errorText: t };
            } catch {
              return {};
            }
          }
        };
        if (cfOrderId) {
          try {
            const v = await fetch(`/api/payment/cashfree/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, cfOrderId }),
            })
            await safeJson(v)
          } catch {}
        }
        const res = await fetch(`/api/orders/${orderId}/tracking`);
        const data = await safeJson(res);
        const statusVal = String(data?.tracking?.status || '').toLowerCase();
        if (statusVal === 'confirmed' || statusVal === 'completed' || statusVal === 'paid') {
          setStatus('success');
          clearCart();
        } else if (statusVal === 'failed' || statusVal === 'cancelled' || statusVal === 'refunded') {
          setStatus('failed');
          setMessage('Payment failed');
        } else {
          setMessage('Payment is processing. Please check your order history.');
          setStatus('failed');
        }
      } catch (err) {
        setStatus('failed');
        setMessage('Failed to verify status');
      }
    };

    checkStatus();
  }, [orderId, cfOrderId, clearCart]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Verifying Payment...</h2>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Your order has been placed successfully. You will receive a confirmation email shortly.
        </p>
        <div className="flex space-x-4">
          <Link href="/profile" className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
            View Order
          </Link>
          <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <XCircle className="w-20 h-20 text-red-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
      <p className="text-red-600 mb-8 max-w-md">
        {message || 'Something went wrong with your payment.'}
      </p>
      <div className="flex space-x-4">
        <Link href="/checkout" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <Suspense fallback={<div>Loading...</div>}>
            <StatusContent />
        </Suspense>
      </div>
    </div>
  );
}
