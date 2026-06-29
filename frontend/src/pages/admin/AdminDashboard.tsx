import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/axios';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  Truck,
  Package,
  Award,
  Trash2,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  Calendar,
  Grid
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { Link } from 'react-router-dom';

interface DashboardResponse {
  totalRevenue: number;
  deliveryChargesCollected: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  activeProducts: number;
  premiumProducts: number;
  ordersToday: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  newCustomers: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  pendingApprovalProducts: number;
  trashProductsCount: number;
  lowReviewProductsCount: number;
  mostOrderedProduct: string;
  leastOrderedProduct: string;
  topCategory: string;

  // Chart datasets
  dailyOrdersChart: any[];
  monthlyOrdersChart: any[];
  categoryDistributionChart: any[];
  productSalesChart: any[];
  customerGrowthChart: any[];
  revenueTrendChart: any[];

  topSellingProducts: any[];
  recentOrders: any[];
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'customers'>('sales');

  const { data: dashboardRes, isLoading } = useQuery<any>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/admin');
      return response.data;
    },
  });

  const data: DashboardResponse = dashboardRes?.data || {
    totalRevenue: 0,
    deliveryChargesCollected: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    activeProducts: 0,
    premiumProducts: 0,
    ordersToday: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    newCustomers: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    pendingApprovalProducts: 0,
    trashProductsCount: 0,
    lowReviewProductsCount: 0,
    mostOrderedProduct: 'None',
    leastOrderedProduct: 'None',
    topCategory: 'None',
    dailyOrdersChart: [],
    monthlyOrdersChart: [],
    categoryDistributionChart: [],
    productSalesChart: [],
    customerGrowthChart: [],
    revenueTrendChart: [],
    topSellingProducts: [],
    recentOrders: [],
  };

  const COLORS = ['#2563EB', '#0D9488', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse py-6">
        <div className="h-8 w-48 bg-slate-200 rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Sparkles className="text-blue-600 animate-pulse" size={28} />
            <span>Store Control Center</span>
          </h1>
          <p className="text-slate-550 text-sm mt-1">Real-time enterprise metrics, live tracking logs, and analytics datasets.</p>
        </div>
        
        {/* Quick Actions Shortcuts */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <Grid size={14} />
            <span>Catalog Manager</span>
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/10 transition-all flex items-center gap-1.5"
          >
            <ShoppingBag size={14} />
            <span>View All Orders</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (Row 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/40 rounded-full translate-x-8 -translate-y-8 pointer-events-none group-hover:scale-110 transition-all" />
          <div className="space-y-1 relative z-10">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Gross Sales Value</span>
            <span className="text-2xl font-extrabold text-slate-800">
              ₹{data.totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-teal-600 font-bold block">↑ Live updates</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm relative z-10">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Shipping Charges */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-teal-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50/40 rounded-full translate-x-8 -translate-y-8 pointer-events-none group-hover:scale-110 transition-all" />
          <div className="space-y-1 relative z-10">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Shipping Collections</span>
            <span className="text-2xl font-extrabold text-slate-800">
              ₹{data.deliveryChargesCollected.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">Standard & Express fees</span>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shadow-sm relative z-10">
            <Truck size={22} />
          </div>
        </div>

        {/* Orders Placed */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-violet-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50/40 rounded-full translate-x-8 -translate-y-8 pointer-events-none group-hover:scale-110 transition-all" />
          <div className="space-y-1 relative z-10">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Volume Orders</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {data.totalOrders}
            </span>
            <span className="text-[10px] text-violet-600 font-bold block">{data.ordersToday} placed today</span>
          </div>
          <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center shadow-sm relative z-10">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/40 rounded-full translate-x-8 -translate-y-8 pointer-events-none group-hover:scale-110 transition-all" />
          <div className="space-y-1 relative z-10">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Customer Base</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {data.totalCustomers}
            </span>
            <span className="text-[10px] text-amber-600 font-bold block">+{data.newCustomers} new (7d)</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-sm relative z-10">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Grid Statistics Segmented View (Row 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Order Fulfillment Statuses */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Health</h3>
          <div className="space-y-3.5">
            <div className="flex justify-between items-center p-3 bg-blue-50/20 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                <span className="text-xs font-semibold text-slate-650">Pending Orders</span>
              </div>
              <span className="text-sm font-extrabold text-slate-800">{data.pendingOrders}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-teal-50/20 rounded-xl border border-teal-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-600" />
                <span className="text-xs font-semibold text-slate-650">Delivered Orders</span>
              </div>
              <span className="text-sm font-extrabold text-slate-800">{data.deliveredOrders}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50/20 rounded-xl border border-red-100">
              <div className="flex items-center gap-2">
                <XCircle size={16} className="text-red-500" />
                <span className="text-xs font-semibold text-slate-650">Cancelled Orders</span>
              </div>
              <span className="text-sm font-extrabold text-slate-800">{data.cancelledOrders}</span>
            </div>
          </div>
        </div>

        {/* Product Catalog Metrics */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog & Inventory</h3>
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
              <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">Total Products</span>
              <span className="text-lg font-extrabold text-slate-800">{data.totalProducts}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
              <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">Active Catalog</span>
              <span className="text-lg font-extrabold text-slate-800">{data.activeProducts}</span>
            </div>
            <div className="p-3 bg-violet-50/40 border border-violet-100 rounded-xl">
              <span className="text-[10px] text-violet-500 font-bold block uppercase tracking-wider">Premium Items</span>
              <span className="text-lg font-extrabold text-violet-850 flex items-center gap-1">
                {data.premiumProducts}
                <Award size={14} className="text-violet-500" />
              </span>
            </div>
            <div className="p-3 bg-rose-50/40 border border-rose-100 rounded-xl">
              <span className="text-[10px] text-rose-500 font-bold block uppercase tracking-wider">Low Stock (&lt;10)</span>
              <span className="text-lg font-extrabold text-rose-850 flex items-center gap-1">
                {data.lowStockProducts}
                {data.lowStockProducts > 0 && <AlertTriangle size={14} className="text-rose-500 animate-bounce" />}
              </span>
            </div>
          </div>
        </div>

        {/* Product Trash, Approvals & Reviews Review Status */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Items & Verification</h3>
          <div className="space-y-3">
            {/* Trash count */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-550 flex items-center gap-1.5">
                <Trash2 size={15} className="text-slate-400" />
                <span>Product Trash Bin</span>
              </span>
              <span className="font-extrabold text-slate-700">{data.trashProductsCount} items</span>
            </div>

            {/* Awaiting Review Verification */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-550 flex items-center gap-1.5">
                <ThumbsDown size={15} className="text-rose-400" />
                <span>Low Review Flagged (≤2)</span>
              </span>
              <span className={`font-extrabold ${data.lowReviewProductsCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                {data.lowReviewProductsCount} products
              </span>
            </div>

            {/* Pending Approvals */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-550 flex items-center gap-1.5">
                <HelpCircle size={15} className="text-amber-500" />
                <span>Pending Admin Approval</span>
              </span>
              <span className="font-extrabold text-slate-700">{data.pendingApprovalProducts} products</span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <Link
              to="/admin/products?tab=trash"
              className="flex-1 py-1.5 text-center bg-slate-50 hover:bg-slate-100 text-slate-650 font-bold rounded-lg text-[10px] border border-slate-200 transition-all"
            >
              Trash Module
            </Link>
            <Link
              to="/admin/products?tab=reviews"
              className="flex-1 py-1.5 text-center bg-slate-50 hover:bg-slate-100 text-slate-650 font-bold rounded-lg text-[10px] border border-slate-200 transition-all"
            >
              Review Flagged
            </Link>
          </div>
        </div>
      </div>

      {/* Catalog Highlights (Row 3) */}
      <div className="bg-slate-100/65 border border-slate-150 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Best Seller Product</span>
          <span className="text-sm font-extrabold text-slate-800 line-clamp-1">{data.mostOrderedProduct}</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Least Selling Item</span>
          <span className="text-sm font-extrabold text-slate-800 line-clamp-1">{data.leastOrderedProduct}</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Highest Yield Category</span>
          <span className="text-sm font-extrabold text-slate-850 block">{data.topCategory}</span>
        </div>
      </div>

      {/* Analytics Tabs and Charts (Row 4) */}
      <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={20} />
              <span>Interactive Analytics Suite</span>
            </h3>
            <p className="text-xs text-slate-400">Toggle views to inspect customer growth, monthly orders, and sales distributions.</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto gap-0.5">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sales' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sales volume
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Inventory Balance
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'customers' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Audience Growth
            </button>
          </div>
        </div>

        {/* Dynamic Recharts Section */}
        <div className="h-80 w-full">
          {activeTab === 'sales' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              <div className="h-full flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Daily Order Count (Last 7 Days)</span>
                </span>
                <div className="h-64 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.dailyOrdersChart}>
                      <defs>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" fontSize={10} tickLine={false} />
                      <YAxis fontSize={10} tickLine={false} allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="orders" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrders)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="h-full flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <DollarSign size={14} />
                  <span>Revenue Trendline (Last 7 Days)</span>
                </span>
                <div className="h-64 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.revenueTrendChart}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" fontSize={10} tickLine={false} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              <div className="h-full flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <PieIcon size={14} />
                  <span>Category Distribution (Products)</span>
                </span>
                {data.categoryDistributionChart.length > 0 ? (
                  <div className="h-64 mt-3 flex items-center">
                    <div className="w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.categoryDistributionChart}
                            dataKey="value"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={3}
                          >
                            {data.categoryDistributionChart.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-1.5 pl-4 overflow-y-auto max-h-52">
                      {data.categoryDistributionChart.map((entry, index) => (
                        <div key={entry.category} className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="line-clamp-1">{entry.category}: {entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400 text-xs">No category data found</div>
                )}
              </div>

              <div className="h-full flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Package size={14} />
                  <span>Top Product Sales Volume (Quantities)</span>
                </span>
                <div className="h-64 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.productSalesChart} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" fontSize={10} tickLine={false} />
                      <YAxis dataKey="name" type="category" fontSize={9} tickLine={false} width={100} />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              <div className="h-full flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Users size={14} />
                  <span>Cumulative Customer signups</span>
                </span>
                <div className="h-64 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.customerGrowthChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="date" fontSize={10} tickLine={false} />
                      <YAxis fontSize={10} tickLine={false} allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="customers" stroke="#EC4899" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="h-full flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Monthly Order Cycles (Last 6 Months)</span>
                </span>
                <div className="h-64 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlyOrdersChart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" fontSize={10} tickLine={false} />
                      <YAxis fontSize={10} tickLine={false} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 5: Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Recent Orders log */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase flex items-center justify-between">
            <span>Recent Orders Log</span>
            <Link to="/admin/orders" className="text-xs text-blue-600 hover:underline capitalize normal-case font-bold">
              view all logs →
            </Link>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
                  <th className="pb-3.5">Order ID</th>
                  <th className="pb-3.5">Date</th>
                  <th className="pb-3.5">Method</th>
                  <th className="pb-3.5">Delivery Fee</th>
                  <th className="pb-3.5">Total price</th>
                  <th className="pb-3.5">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-650">
                {data.recentOrders.length > 0 ? (
                  data.recentOrders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-bold text-blue-650">
                        <Link to="/admin/orders">#ORD-{o.id}</Link>
                      </td>
                      <td className="py-3">{new Date(o.orderDate).toLocaleDateString()}</td>
                      <td className="py-3 font-semibold text-slate-500 text-[10px]">{o.deliveryMethod || 'STANDARD'}</td>
                      <td className="py-3 text-slate-500">₹{o.deliveryCharge || 0}</td>
                      <td className="py-3 font-bold">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wide ${
                          o.orderStatus === 'DELIVERED' 
                            ? 'bg-teal-50 text-teal-600 border border-teal-100'
                            : o.orderStatus === 'PENDING'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-red-50 text-red-500 border border-red-100'
                        }`}>
                          {o.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-400">No recent orders registered</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top selling catalog items */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Top Selling Catalog Items</h3>
          <div className="space-y-3.5">
            {data.topSellingProducts.length > 0 ? (
              data.topSellingProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-150 rounded-2xl group hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white border border-slate-150 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-all"
                      />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-700 text-xs sm:text-sm line-clamp-1">{p.productName}</h4>
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">{p.brand}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-800 text-xs sm:text-sm">₹{p.price.toLocaleString('en-IN')}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No selling stats available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
