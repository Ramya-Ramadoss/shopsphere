import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/axios';
import type { Invoice, ApiResponse } from '../../types';
import { CheckCircle2, Download, ShoppingBag, ReceiptText, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const state = location.state as {
    orderId?: number;
    totalAmount?: number;
    paymentMethod?: string;
    transactionId?: string;
  } | null;

  if (!state || !state.orderId) {
    return <Navigate to="/" replace />;
  }

  const { orderId, totalAmount, paymentMethod, transactionId } = state;

  // Fetch invoice details for the order reference
  const { data: invoiceResponse } = useQuery<ApiResponse<Invoice>>({
    queryKey: ['invoice-order', orderId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Invoice>>(`/invoices/order/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });

  const invoice = invoiceResponse?.data;

  // Download Invoice Summary (Plain text txt)
  const handleDownloadInvoice = async () => {
    if (!invoice) {
      toast.error('Invoice details not compiled yet. Please wait.');
      return;
    }

    try {
      const response = await api.get(`/invoices/download/${invoice.id}`, {
        responseType: 'blob', // Important for binaries/raw bytes
      });

      const blob = new Blob([response.data], { type: 'text/plain' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `invoice_summary_${invoice.invoiceNumber}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Invoice document saved to downloads!');
    } catch (err) {
      console.error('Invoice download failed', err);
      toast.error('Could not download invoice file.');
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full py-12 px-4 sm:px-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 text-center space-y-6"
      >
        {/* Animated Check badge */}
        <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
          <CheckCircle2 size={44} className="stroke-[1.5] animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            Checkout Completed
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-805">Order Placed Successfully!</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            Your shopping order has been registered. The stock quantity is deducted and receipt files are compiled.
          </p>
        </div>

        {/* Transaction Summary Panel */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left text-xs text-slate-600 space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold uppercase">Order Reference</span>
            <span className="font-bold text-slate-800">#ORD-{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold uppercase">Amount Cleared</span>
            <span className="font-bold text-slate-805">Rs. {totalAmount?.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold uppercase">Payment Gateway</span>
            <span className="font-bold text-slate-800">{paymentMethod}</span>
          </div>
          {transactionId && (
            <div className="flex justify-between border-t border-slate-100 pt-2.5">
              <span className="text-slate-400 font-semibold uppercase">Transaction Code</span>
              <span className="font-mono font-bold text-teal-600">{transactionId}</span>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3.5 pt-4">
          <button
            onClick={handleDownloadInvoice}
            disabled={!invoice}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            <span>Download Invoice</span>
          </button>
          <Link
            to="/products"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-colors shadow-md shadow-blue-500/10"
          >
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="text-center pt-2">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
          >
            <ReceiptText size={14} />
            <span>Go to Order History Log</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
