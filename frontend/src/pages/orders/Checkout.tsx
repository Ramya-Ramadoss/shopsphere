import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/axios';
import type { ApiResponse, User } from '../../types';
import { MapPin, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits').max(6, 'Pincode must be 6 digits'),
  country: z.string().min(1, 'Country is required'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface OrderResponseData {
  id: number;
  customerId: number;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
}

export const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'UPI' | 'NET_BANKING' | 'COD'>('CREDIT_CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
  });

  // Fetch full customer details to autofill address
  useEffect(() => {
    if (user?.id) {
      api.get<ApiResponse<User>>(`/customers/${user.id}`)
        .then((res) => {
          const u = res.data.data;
          if (u.fullName) setValue('fullName', u.fullName);
          if (u.phone) setValue('phone', u.phone);
          if (u.address) setValue('address', u.address);
          if (u.city) setValue('city', u.city);
          if (u.state) setValue('state', u.state);
          if (u.pincode) setValue('pincode', u.pincode);
          if (u.country) setValue('country', u.country || 'India');
        })
        .catch((err) => console.error('Error fetching customer address', err));
    }
  }, [user, setValue]);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Update customer address details on server first (to keep sync)
      await api.put(`/customers/${user?.id}`, {
        fullName: data.fullName,
        email: user?.email,
        password: 'dummyPassword123!', // Required by DTO validations, password is encrypted on backend
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
      });

      // 2. Place order (moves cart to order table and deducts stock)
      const orderResponse = await api.post<ApiResponse<OrderResponseData>>('/orders/place', {
        customerId: user?.id,
      });

      const { id: orderId, totalAmount } = orderResponse.data.data;

      // 3. Clear cart query state in client
      clearCart();

      // 4. Handle COD vs Online Payment Flow
      if (paymentMethod === 'COD') {
        // For COD, trigger simulated process automatically on checkout
        const payRes = await api.post('/payments/process', {
          orderId,
          amount: totalAmount,
          paymentMethod: 'COD',
        });
        
        // Generate Invoice
        await api.post(`/invoices/generate/${orderId}`);

        toast.success('Order placed successfully! Cash on Delivery confirmed.');
        navigate('/order-success', {
          state: {
            orderId,
            totalAmount,
            paymentMethod: 'COD',
            transactionId: payRes.data.data?.transactionId || 'TXN-COD-PENDING',
          },
        });
      } else {
        // Online Payment Gateway Simulation
        navigate('/payment', {
          state: {
            orderId,
            totalAmount,
            paymentMethod,
          },
        });
      }
    } catch (error: any) {
      console.error('Checkout error', error);
      // Handled globally
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 100;
  const tax = parseFloat((subtotal * 0.18).toFixed(2));
  const grandTotal = subtotal + shipping + tax;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Checkout Order</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Review your shipping destination and select a payment gateway option.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Address and Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address form */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-5">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" />
              <span>Shipping Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-650 uppercase tracking-wider">Receiver Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.fullName ? 'border-rose-400' : 'border-slate-200'
                  }`}
                  {...register('fullName')}
                />
                {errors.fullName && <span className="text-xs text-rose-500 font-semibold">{errors.fullName.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-650 uppercase tracking-wider">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.phone ? 'border-rose-400' : 'border-slate-200'
                  }`}
                  {...register('phone')}
                />
                {errors.phone && <span className="text-xs text-rose-500 font-semibold">{errors.phone.message}</span>}
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-650 uppercase tracking-wider">Street Address</label>
                <input
                  type="text"
                  placeholder="Address details..."
                  className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.address ? 'border-rose-400' : 'border-slate-200'
                  }`}
                  {...register('address')}
                />
                {errors.address && <span className="text-xs text-rose-500 font-semibold">{errors.address.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-650 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  placeholder="Mumbai"
                  className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.city ? 'border-rose-400' : 'border-slate-200'
                  }`}
                  {...register('city')}
                />
                {errors.city && <span className="text-xs text-rose-500 font-semibold">{errors.city.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-650 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  placeholder="Maharashtra"
                  className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.state ? 'border-rose-400' : 'border-slate-200'
                  }`}
                  {...register('state')}
                />
                {errors.state && <span className="text-xs text-rose-500 font-semibold">{errors.state.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-650 uppercase tracking-wider">Pincode</label>
                <input
                  type="text"
                  placeholder="400001"
                  className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.pincode ? 'border-rose-400' : 'border-slate-200'
                  }`}
                  {...register('pincode')}
                />
                {errors.pincode && <span className="text-xs text-rose-500 font-semibold">{errors.pincode.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-650 uppercase tracking-wider">Country</label>
                <input
                  type="text"
                  placeholder="India"
                  className={`bg-slate-50 border text-slate-855 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.country ? 'border-rose-400' : 'border-slate-200'
                  }`}
                  {...register('country')}
                />
                {errors.country && <span className="text-xs text-rose-500 font-semibold">{errors.country.message}</span>}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" />
              <span>Select Payment Gateway</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { id: 'CREDIT_CARD', label: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay' },
                { id: 'UPI', label: 'UPI / Google Pay', desc: 'Scan and pay instantly' },
                { id: 'NET_BANKING', label: 'Net Banking', desc: 'Select major national banks' },
                { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay cash upon delivery' },
              ].map((m) => (
                <label
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-4 rounded-xl border flex flex-col justify-start text-left cursor-pointer transition-all ${
                    paymentMethod === m.id
                      ? 'bg-blue-50/40 border-blue-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-slate-700 text-sm leading-none mb-1.5">{m.label}</span>
                  <span className="text-[11px] text-slate-400">{m.desc}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Checkout Summary */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs h-fit space-y-6">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Checkout Summary</h3>

          {/* Items Preview */}
          <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
            {cart?.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs text-slate-650">
                <span className="truncate max-w-[150px] font-medium">{item.productName}</span>
                <span className="text-slate-400">x{item.quantity}</span>
                <span className="font-bold">Rs. {item.subtotal.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">Rs. {subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping cost</span>
              <span className="font-bold text-slate-800">{shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18% Flat)</span>
              <span className="font-bold text-slate-800">Rs. {tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-slate-100 pt-4 flex justify-between text-sm font-black text-slate-800">
              <span>Grand Total</span>
              <span>Rs. {grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !cart || cart.items.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Confirming Order...</span>
              </>
            ) : (
              <>
                <span>Place Order</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
