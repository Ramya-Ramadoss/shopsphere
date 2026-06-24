import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import api from '../../services/axios';
import { CreditCard, QrCode, Building, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { orderId?: number; totalAmount?: number; paymentMethod?: string } | null;

  const [isPaying, setIsPaying] = useState(false);

  // Form Fields State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('SBI');

  if (!state || !state.orderId || !state.totalAmount || !state.paymentMethod) {
    // If visited directly without valid state context, redirect back
    return <Navigate to="/cart" replace />;
  }

  const { orderId, totalAmount, paymentMethod } = state;

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);

    try {
      // 1. Process mock payment
      const paymentResponse = await api.post('/payments/process', {
        orderId,
        amount: totalAmount,
        paymentMethod,
      });

      const paymentData = paymentResponse.data.data;

      if (paymentData.paymentStatus === 'SUCCESS') {
        // 2. Generate Invoice immediately
        await api.post(`/invoices/generate/${orderId}`);

        toast.success('Simulated transaction authorized successfully!');
        navigate('/order-success', {
          state: {
            orderId,
            totalAmount,
            paymentMethod,
            transactionId: paymentData.transactionId,
          },
          replace: true,
        });
      } else {
        toast.error('Payment authorization failed. Try another method.');
      }
    } catch (err) {
      console.error('Payment processing failed', err);
      // Axios error handler notifies user
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full py-12 px-4 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6"
      >
        <div className="text-center space-y-2 border-b border-slate-100 pb-4">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Payment Simulation</span>
          <h2 className="text-2xl font-bold text-slate-805">Gateway Authorization</h2>
          <div className="flex justify-between items-center text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-100 mt-4">
            <div className="text-left">
              <span className="font-semibold block">Order Reference</span>
              <span>#ORD-{orderId}</span>
            </div>
            <div className="text-right">
              <span className="font-semibold block">Amount Due</span>
              <span className="font-black text-slate-800">Rs. {totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handlePaymentSubmit} className="space-y-5">
          {/* Render inputs based on selected method */}
          {paymentMethod === 'CREDIT_CARD' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Card Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <CreditCard size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="4111 2222 3333 4444"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Expiry</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">CVV</label>
                  <input
                    type="password"
                    required
                    placeholder="•••"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'UPI' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">UPI ID / VPA</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <QrCode size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="username@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-850 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'NET_BANKING' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Select Bank</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building size={18} />
                </div>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white"
                >
                  <option value="SBI">State Bank of India (SBI)</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="AXIS">Axis Bank</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isPaying}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          >
            {isPaying ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Simulating payment...</span>
              </>
            ) : (
              <span>Verify & Pay Rs. {totalAmount.toLocaleString('en-IN')}</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/checkout')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 hover:underline"
          >
            <ArrowLeft size={14} />
            <span>Cancel and Go Back</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
