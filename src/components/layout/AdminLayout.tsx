import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Menu,
  X,
  Bell,
  Calendar,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: ShoppingBag, label: 'Products' },
    { path: '/admin/categories', icon: Layers, label: 'Categories' },
    { path: '/admin/orders', icon: TrendingUp, label: 'Orders' },
    { path: '/admin/inventory', icon: BarChart2, label: 'Inventory' },
    { path: '/admin/reports', icon: TrendingUp, label: 'Reports' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPath = location.pathname;

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out relative flex-shrink-0 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-teal-400 text-slate-950 font-black text-lg flex items-center justify-center flex-shrink-0 shadow-md">
            S
          </div>
          {!isSidebarCollapsed && (
            <span className="font-extrabold text-lg text-white tracking-tight leading-none whitespace-nowrap">
              ShopSphere <span className="text-teal-400 font-medium text-xs block uppercase tracking-widest mt-0.5">Admin Hub</span>
            </span>
          )}
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPath.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <IconComponent size={20} className="flex-shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isSidebarCollapsed && <span>Logout Portal</span>}
          </button>
        </div>

        {/* Sidebar Toggle Handle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3.5 top-24 w-7 h-7 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white cursor-pointer shadow-md z-10"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 w-64 h-full bg-slate-900 text-slate-300 border-r border-slate-800 z-50 p-6 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-400 text-slate-950 font-black text-base flex items-center justify-center">
                    S
                  </div>
                  <span className="font-extrabold text-white">ShopSphere Admin</span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = currentPath.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-teal-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <IconComponent size={20} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-slate-800 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout Portal</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 flex justify-between items-center shadow-xs flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Quick Summary or Path Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
              <Calendar size={13} className="text-teal-600" />
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Notifications Button */}
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>

            <div className="h-6 w-[1px] bg-slate-200" />

            {/* Admin Avatar & Label */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-sm shadow-sm">
                A
              </div>
              <div className="hidden lg:block text-left">
                <p className="font-semibold text-sm leading-none text-slate-800">{user?.fullName || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Control Center</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-start">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
