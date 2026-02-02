'use client';

import { useState } from 'react';
import { Search, Package, Truck, MapPin, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/track-order?query=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Tracking details not found');
      }
    } catch (err) {
      setError('Failed to fetch tracking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">Track Your Order</h1>
          <p className="text-gray-500">
            Enter your Order ID or Tracking Number (AWB) to see the status.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <form onSubmit={handleTrack} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. ORD-123456 or 1234567890"
              className="w-full pl-12 pr-32 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[var(--foreground)] focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-brand-purple text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track'}
            </button>
          </form>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-700 dark:text-red-400 mb-8"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {result.order && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Order Details</h3>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <span className="block text-xs text-gray-400">Order ID</span>
                    <span className="font-medium text-[var(--foreground)]">{result.order.orderId}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">Date</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {new Date(result.order.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                      {result.order.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {result.tracking ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                        <Truck className="w-5 h-5 text-brand-purple" />
                        {result.tracking.status}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Courier: {result.tracking.courier} | AWB: {result.tracking.awb}
                      </p>
                    </div>
                    {result.tracking.trackUrl && (
                       <a 
                         href={result.tracking.trackUrl} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-sm text-brand-purple hover:underline flex items-center gap-1"
                       >
                         View on Courier Site <ArrowRight className="w-4 h-4" />
                       </a>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {result.tracking.events && result.tracking.events.length > 0 ? (
                    <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200 dark:before:bg-gray-700">
                      {result.tracking.events.map((event: any, idx: number) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 ${
                            idx === 0 
                              ? 'border-brand-purple bg-white dark:bg-gray-900' 
                              : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
                          }`}></div>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div>
                              <p className={`font-medium ${idx === 0 ? 'text-[var(--foreground)]' : 'text-gray-600 dark:text-gray-400'}`}>
                                {event.status}
                              </p>
                              <p className="text-sm text-gray-500 mt-0.5">{event.location}</p>
                            </div>
                            <time className="text-xs text-gray-400 whitespace-nowrap bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                              {new Date(event.time).toLocaleString()}
                            </time>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No tracking events available yet.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 text-center">
                <p className="text-yellow-800 dark:text-yellow-200">
                  {result.message || "Tracking details are not available at this moment. Please check back later."}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
