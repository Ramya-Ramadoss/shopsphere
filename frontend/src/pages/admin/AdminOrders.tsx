import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/axios';
import type { Order, ApiResponse } from '../../types';
import { RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch all orders
  const { data: ordersRes, isLoading, refetch } = useQuery<ApiResponse<Order[]>>({
    queryKey: ['admin-orders-all'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Order[]>>('/orders');
      return response.data;
    },
  });

  const orders = ordersRes?.data || [];

  // Update Order Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await api.put(`/orders/update-status/${orderId}`, null, {
        params: { status },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders-all'] });
      toast.success('Order status updated!');
    },
  });

  const handleStatusChange = (orderId: number, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'CONFIRMED':
        return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'PACKED':
        return 'text-purple-650 bg-purple-50 border-purple-100';
      case 'SHIPPED':
        return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'DELIVERED':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'CANCELLED':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 tracking-tight">Orders Registry</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Review customer transactions and update order fulfillment timelines.</p>
        </div>

        <button
          onClick={() => refetch()}
          className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>Reload Logs</span>
        </button>
      </div>

      {/* Orders Table List */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
            <p className="text-slate-400 text-sm">Compiling order registry logs...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
                  <th className="py-4 px-6">Order Reference</th>
                  <th className="py-4 px-6">Customer Reference</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Amount Paid</th>
                  <th className="py-4 px-6">Items details</th>
                  <th className="py-4 px-6">Fulfillment status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-655">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-55/20 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">#ORD-{o.id}</td>
                    <td className="py-4 px-6 font-medium text-slate-500">ID: #CUST-{o.customerId}</td>
                    <td className="py-4 px-6">{new Date(o.orderDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6 font-extrabold text-slate-800">Rs. {o.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6">
                      <div className="max-w-[200px] text-xs space-y-0.5 text-slate-450">
                        {o.orderItems.map((item) => (
                          <span key={item.id} className="block truncate font-medium">
                            {item.productName} (x{item.quantity})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        disabled={o.orderStatus === 'CANCELLED' || o.orderStatus === 'DELIVERED'}
                        className={`font-semibold border text-xs px-2.5 py-1.5 rounded-full uppercase focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${getStatusStyle(
                          o.orderStatus
                        )}`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 space-y-4">
            <RefreshCw size={44} className="mx-auto text-slate-200 stroke-[1.5]" />
            <p className="text-sm">No orders registered in the system database yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
