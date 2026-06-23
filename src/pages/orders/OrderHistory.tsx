import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import type { Order, ApiResponse, Invoice } from '../../types';
import { Calendar, ReceiptText, Clock, Download, Ban, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch Order history
  const { data: ordersResponse, isLoading } = useQuery<ApiResponse<Order[]>>({
    queryKey: ['orders-history', user?.id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Order[]>>(`/orders/customer/${user?.id}`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  const orders = ordersResponse?.data || [];

  // Cancel Order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await api.put(`/orders/cancel/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-history', user?.id] });
      toast.success('Order cancelled successfully!');
    },
  });

  // Download Invoice handler
  const handleDownloadInvoice = async (orderId: number) => {
    try {
      // 1. Get invoice details for order
      const invoiceRes = await api.get<ApiResponse<Invoice>>(`/invoices/order/${orderId}`);
      const invoice = invoiceRes.data.data;

      // 2. Fetch raw text file summary
      const downloadRes = await api.get(`/invoices/download/${invoice.id}`, {
        responseType: 'blob',
      });

      const blob = new Blob([downloadRes.data], { type: 'text/plain' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `invoice_${invoice.invoiceNumber}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Invoice document saved!');
    } catch (err) {
      console.error('Invoice download failed', err);
      toast.error('Could not download invoice file.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'PACKED':
        return 'bg-purple-50 text-purple-650 border-purple-100';
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const isCancelable = (status: string) => {
    return status === 'PENDING' || status === 'CONFIRMED';
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse py-6">
        <div className="h-8 w-48 bg-slate-200 rounded-full" />
        <div className="h-44 bg-slate-200 rounded-2xl" />
        <div className="h-44 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Order Logs</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Track shipping progress and check transaction invoice sheets.</p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden"
            >
              {/* Order Header Summary */}
              <div className="bg-slate-50/60 p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-150">
                    <Clock size={13} className="text-blue-600" />
                    <span>#ORD-{order.id}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span>Total Amount: </span>
                    <strong className="text-slate-800 text-sm">Rs. {order.totalAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border shadow-sm ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Order Items & Actions */}
              <div className="p-6 space-y-6">
                <div className="divide-y divide-slate-50">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-700 leading-tight block">{item.productName}</span>
                        <span className="text-xs text-slate-450 font-semibold">Qty: {item.quantity} × Rs. {item.unitPrice}</span>
                      </div>
                      <span className="font-extrabold text-slate-800">Rs. {item.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Progress Node Timeline */}
                {order.orderStatus !== 'CANCELLED' && (
                  <div className="pt-6 border-t border-slate-50">
                    <div className="flex justify-between max-w-lg mx-auto relative">
                      {/* Line background */}
                      <div className="absolute top-[13px] left-3 right-3 h-[2px] bg-slate-200 -z-10" />

                      {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((nodeStatus, idx) => {
                        const statusesOrder = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];
                        const currentIdx = statusesOrder.indexOf(order.orderStatus);
                        const nodeIdx = statusesOrder.indexOf(nodeStatus);
                        const isCompleted = currentIdx >= nodeIdx;

                        return (
                          <div key={nodeStatus} className="flex flex-col items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold text-xs ${
                                isCompleted
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                  : 'bg-white border-slate-250 text-slate-350 shadow-inner'
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              isCompleted ? 'text-blue-600' : 'text-slate-400'
                            }`}>
                              {nodeStatus}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                  <button
                    onClick={() => handleDownloadInvoice(order.id)}
                    className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download Invoice</span>
                  </button>
                  {isCancelable(order.orderStatus) && (
                    <button
                      onClick={() => cancelOrderMutation.mutate(order.id)}
                      disabled={cancelOrderMutation.isPending}
                      className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors border border-rose-100 cursor-pointer disabled:opacity-50"
                    >
                      {cancelOrderMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Ban size={14} />
                      )}
                      <span>Cancel Order</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl max-w-lg mx-auto space-y-5">
          <ReceiptText size={56} className="mx-auto text-slate-350 stroke-[1.5]" />
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-850">No orders registered</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
              You haven't made any purchases on ShopSphere yet. Shop our items and confirm checkouts!
            </p>
          </div>
          <Link
            to="/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full text-sm shadow-md transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};
