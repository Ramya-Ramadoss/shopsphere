import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/axios';
import {
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  DollarSign,
  Package,
  Award,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
  Legend,
} from 'recharts';

export const AdminReports: React.FC = () => {
  // Fetch multiple reports concurrently using React Query
  const { data: revenueRes, isLoading: isRevenueLoading } = useQuery<any>({
    queryKey: ['report-revenue'],
    queryFn: async () => {
      const response = await api.get('/reports/revenue');
      return response.data;
    },
  });

  const { data: inventoryRes, isLoading: isInventoryLoading } = useQuery<any>({
    queryKey: ['report-inventory'],
    queryFn: async () => {
      const response = await api.get('/reports/inventory');
      return response.data;
    },
  });

  const { data: categorySalesRes, isLoading: isCategoryLoading } = useQuery<any>({
    queryKey: ['report-category-sales'],
    queryFn: async () => {
      const response = await api.get('/reports/category-sales');
      return response.data;
    },
  });

  const { data: topSellingRes, isLoading: isTopSellingLoading } = useQuery<any>({
    queryKey: ['report-top-selling'],
    queryFn: async () => {
      const response = await api.get('/reports/top-selling');
      return response.data;
    },
  });

  const { data: topCustomersRes, isLoading: isTopCustomersLoading } = useQuery<any>({
    queryKey: ['report-top-customers'],
    queryFn: async () => {
      const response = await api.get('/reports/top-customers');
      return response.data;
    },
  });

  const isReportsLoading =
    isRevenueLoading || isInventoryLoading || isCategoryLoading || isTopSellingLoading || isTopCustomersLoading;

  // Process revenue report data
  const revenueReport = revenueRes?.data || {};
  const totalRevenue = revenueReport.totalRevenue || 0;
  const monthlyRevenueData = Object.entries(revenueReport.monthlyRevenue || {}).map(([month, val]) => ({
    month,
    revenue: val,
  }));

  // Process inventory data
  const inventoryReport = inventoryRes?.data || {};
  const catalogValue = inventoryReport.totalCatalogValue || 0;
  const totalProductsCount = inventoryReport.totalProducts || 0;

  // Process category sales
  const categorySalesMap = categorySalesRes?.data || {};
  const categoryChartData = Object.entries(categorySalesMap).map(([category, val]) => ({
    name: category,
    value: val,
  }));

  // Process top products
  const topSellingMap = topSellingRes?.data || {};
  const topProductsChartData = Object.entries(topSellingMap).map(([productName, quantity]) => ({
    name: productName,
    sales: quantity,
  }));

  // Process top customers
  const topCustomersMap = topCustomersRes?.data || {};
  const topCustomersList = Object.entries(topCustomersMap).map(([customerName, spend]) => ({
    name: customerName,
    spend: spend as number,
  }));

  // Colors for charts cells
  const COLORS = ['#2563EB', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (isReportsLoading) {
    return (
      <div className="space-y-6 animate-pulse py-6">
        <div className="h-8 w-48 bg-slate-200 rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-850 tracking-tight">Business Reports</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Aggregated statistics, category shares, and top customer indexes.</p>
      </div>

      {/* Stats Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Cumulative Revenue */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Cumulative Revenue</span>
            <span className="text-xl font-extrabold text-slate-800">
              Rs. {totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Catalog Value */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Catalog Assets Value</span>
            <span className="text-xl font-extrabold text-slate-800">
              Rs. {catalogValue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-650 rounded-xl flex items-center justify-center">
            <Package size={22} />
          </div>
        </div>

        {/* Catalog Size */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Product Models size</span>
            <span className="text-xl font-extrabold text-slate-800">{totalProductsCount} Models</span>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-650 rounded-xl flex items-center justify-center">
            <BarChart2 size={22} />
          </div>
        </div>
      </div>

      {/* Revenue Monthly trend area chart */}
      {monthlyRevenueData.length > 0 && (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase flex items-center gap-1.5">
            <TrendingUp size={16} className="text-blue-600" />
            <span>Monthly Revenue Trends</span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Grid: Category share & top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category sales pie */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase flex items-center gap-1.5">
            <PieIcon size={16} className="text-teal-600" />
            <span>Sales distribution by Category</span>
          </h3>
          {categoryChartData.length > 0 ? (
            <>
              <div className="h-60 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                      {categoryChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">No category sales metrics compiled</div>
          )}
        </div>

        {/* Top Selling Products bar */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase flex items-center gap-1.5">
            <BarChart2 size={16} className="text-purple-650" />
            <span>Top Selling Products (Quantity)</span>
          </h3>
          {topProductsChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsChartData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={11} tickLine={false} />
                  <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} width={100} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">No sales statistics registered</div>
          )}
        </div>
      </div>

      {/* Top Spending Customers */}
      {topCustomersList.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase flex items-center gap-2">
            <Award size={16} className="text-amber-500" />
            <span>Top Spending Customers Ledger</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
                  <th className="py-3 px-6">Customer Name</th>
                  <th className="py-3 px-6 text-right">Aggregate Spend (Rs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-655">
                {topCustomersList.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 font-bold text-slate-700 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                        {c.name.charAt(0)}
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-extrabold text-slate-800">
                      Rs. {c.spend.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
