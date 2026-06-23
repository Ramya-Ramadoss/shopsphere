import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/axios';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';

interface DashboardResponse {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  topSellingProducts: any[];
  recentOrders: any[];
}

export const AdminDashboard: React.FC = () => {

  // Fetch admin dashboard details
  const { data: dashboardRes, isLoading } = useQuery<any>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/admin');
      return response.data;
    },
  });

  const data: DashboardResponse = dashboardRes?.data || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    lowStockProducts: 0,
    topSellingProducts: [],
    recentOrders: [],
  };

  // Recharts Chart configurations
  const statsData = [
    { name: 'Pending', value: data.pendingOrders, color: '#F59E0B' },
    { name: 'Delivered', value: data.deliveredOrders, color: '#22C55E' },
    { name: 'Cancelled', value: data.cancelledOrders, color: '#EF4444' },
  ].filter((s) => s.value > 0);

  const defaultStatsData = [
    { name: 'Pending', value: 3, color: '#F59E0B' },
    { name: 'Delivered', value: 12, color: '#22C55E' },
    { name: 'Cancelled', value: 1, color: '#EF4444' },
  ];

  const pieData = statsData.length > 0 ? statsData : defaultStatsData;

  const chartData = [
    { name: 'Total Orders', count: data.totalOrders },
    { name: 'Delivered', count: data.deliveredOrders },
    { name: 'Pending', count: data.pendingOrders },
    { name: 'Cancelled', count: data.cancelledOrders },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse py-6">
        <div className="h-8 w-48 bg-slate-200 rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Real-time summaries of ShopSphere store metrics and sales volume.</p>
      </div>

      {/* Stats Widget Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Total Revenue</span>
            <span className="text-xl font-extrabold text-slate-800">
              Rs. {data.totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Orders Processed</span>
            <span className="text-xl font-extrabold text-slate-800">{data.totalOrders}</span>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-650 rounded-xl flex items-center justify-center shadow-inner">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Customers Directory</span>
            <span className="text-xl font-extrabold text-slate-800">{data.totalCustomers}</span>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-inner">
            <Users size={22} />
          </div>
        </div>

        {/* Catalog Assets */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Stock Alerts</span>
            <span className="text-xl font-extrabold text-slate-800">
              {data.lowStockProducts} <span className="text-xs font-semibold text-rose-500">Low Stock</span>
            </span>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shadow-inner">
            <AlertTriangle size={22} className={data.lowStockProducts > 0 ? 'animate-bounce' : ''} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Bar Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase flex items-center gap-1.5">
            <TrendingUp size={16} className="text-blue-600" />
            <span>Orders Lifecycle Status</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Status Pie Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Order Fulfillment Ratio</h3>
          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs font-semibold text-slate-500">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                <span>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders Table */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
                  <th className="pb-3.5">Order ID</th>
                  <th className="pb-3.5">Date</th>
                  <th className="pb-3.5">Total price</th>
                  <th className="pb-3.5">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-650">
                {data.recentOrders.length > 0 ? (
                  data.recentOrders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-semibold text-blue-600">
                        <Link to="/admin/orders">#ORD-{o.id}</Link>
                      </td>
                      <td className="py-3">{new Date(o.orderDate).toLocaleDateString()}</td>
                      <td className="py-3 font-bold">Rs. {o.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3">
                        <span className="font-bold uppercase text-[9px] tracking-wide">
                          {o.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">No recent orders registered</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Top Selling Products</h3>
          <div className="space-y-3.5">
            {data.topSellingProducts.length > 0 ? (
              data.topSellingProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-700 text-xs sm:text-sm line-clamp-1">{p.name}</h4>
                      <span className="text-[10px] text-slate-450 font-semibold">{p.brand}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-800 text-xs sm:text-sm">Rs. {p.price.toLocaleString('en-IN')}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400">
                No products stats available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
