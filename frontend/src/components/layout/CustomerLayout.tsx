import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../services/axios';
import type { Notification, ApiResponse } from '../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Menu,
  X,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomerLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch notifications
  const { data: notificationsData } = useQuery<ApiResponse<Notification[]>>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Notification[]>>(`/notifications/customer/${user?.id}`);
      return res.data;
    },
    enabled: isAuthenticated && user?.role === 'CUSTOMER' && !!user?.id,
  });

  const notifications = notificationsData?.data || [];
  const unreadNotifications = notifications.filter((n) => !n.read);

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.put(`/notifications/read/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  // Close menus when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 hidden md:flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-1">
          <MapPin size={12} className="text-teal-400" />
          <span>Deliver to India - Experience fast shipping</span>
        </div>
        <div className="flex gap-4">
          <Link to="/help" className="hover:text-white transition-colors">Help Center</Link>
          <Link to="/track-order" className="hover:text-white transition-colors">Track Order</Link>
          <span>Free delivery for orders above Rs. 2,000</span>
        </div>
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              S
            </div>
            <span className="font-bold text-xl sm:text-2xl text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
              Shop<span className="text-teal-500 font-extrabold">Sphere</span>
            </span>
          </Link>

          {/* Search Bar Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg relative group"
          >
            <input
              type="text"
              placeholder="Search products, brands and categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-4 pr-10 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200 shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Actions & Navigation */}
          <nav className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/products"
              className="hidden lg:inline-block font-medium text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              Explore Shop
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-rose-500 hover:bg-slate-50 rounded-full transition-all duration-200"
              aria-label="Wishlist"
            >
              <Heart size={22} />
              {wishlist && wishlist.items && wishlist.items.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm shadow-rose-500/20"
                >
                  {wishlist.items.length}
                </motion.span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-all duration-200"
              aria-label="Cart"
            >
              <ShoppingBag size={22} />
              {cart && cart.items && cart.items.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm shadow-blue-600/20"
                >
                  {cart.items.reduce((total, item) => total + item.quantity, 0)}
                </motion.span>
              )}
            </Link>

            {/* Notifications Icon (Only Auth) */}
            {isAuthenticated && user?.role === 'CUSTOMER' && (
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-all duration-200"
                aria-label="Notifications"
              >
                <Bell size={22} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>
            )}

            {/* Profile Dropdown or Login Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 text-slate-700 hover:bg-slate-50 rounded-lg sm:rounded-full transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 text-teal-700 flex items-center justify-center font-semibold text-sm shadow-inner uppercase">
                    {user?.fullName.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-medium text-sm max-w-[100px] truncate">
                    {user?.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:inline" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 py-2"
                      >
                        <div className="px-4 py-2 border-b border-slate-100 mb-1.5">
                          <p className="font-semibold text-slate-800 text-sm truncate">{user?.fullName}</p>
                          <p className="text-slate-400 text-xs truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <UserIcon size={16} />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <ShoppingBag size={16} />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <Heart size={16} />
                          <span>My Wishlist</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left border-t border-slate-100 mt-1.5"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-5 py-2.5 rounded-full text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-full md:hidden transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 w-80 max-w-full h-full bg-white z-50 shadow-2xl p-6 flex flex-col gap-6 md:hidden"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <span className="font-bold text-slate-800 text-lg">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-4 pr-10 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                >
                  <Search size={18} />
                </button>
              </form>

              <div className="flex flex-col gap-4 text-slate-700 font-medium">
                <Link to="/" className="hover:text-blue-600 py-1 transition-colors">Home</Link>
                <Link to="/products" className="hover:text-blue-600 py-1 transition-colors">All Products</Link>
                <Link to="/wishlist" className="hover:text-blue-600 py-1 transition-colors">Wishlist</Link>
                <Link to="/cart" className="hover:text-blue-600 py-1 transition-colors">Shopping Cart</Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="hover:text-blue-600 py-1 transition-colors">My Profile</Link>
                    <Link to="/orders" className="hover:text-blue-600 py-1 transition-colors">My Orders</Link>
                    <button
                      onClick={handleLogout}
                      className="text-left text-rose-600 py-1 hover:text-rose-700 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="w-full bg-blue-600 text-white text-center font-semibold py-2.5 rounded-full shadow-md shadow-blue-500/20 hover:bg-blue-700 mt-4 block"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications Panel Slide-out Drawer */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40"
              onClick={() => setIsNotificationsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 w-96 max-w-full h-full bg-white z-50 shadow-2xl p-6 flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Bell size={20} className="text-blue-600" />
                  <span className="font-bold text-slate-800 text-lg">Notifications</span>
                  {unreadNotifications.length > 0 && (
                    <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      {unreadNotifications.length} New
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Notification list */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markAsReadMutation.mutate(n.id)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 flex gap-3 ${
                        n.read
                          ? 'bg-slate-50 border-slate-100 text-slate-500'
                          : 'bg-blue-50/50 border-blue-100 text-slate-800 shadow-sm cursor-pointer hover:bg-blue-50'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {n.read ? (
                          <CheckCircle size={16} className="text-slate-400" />
                        ) : (
                          <span className="w-2.5 h-2.5 bg-blue-600 rounded-full block animate-pulse mt-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-relaxed">{n.message}</p>
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                          <Clock size={10} />
                          <span>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                    <Bell size={36} className="text-slate-300 stroke-[1.5]" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col justify-start">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="flex flex-col gap-4">
            <span className="font-bold text-2xl text-white tracking-tight">
              Shop<span className="text-teal-400">Sphere</span>
            </span>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your ultimate destination for modern, premium retail shopping. Experience high quality products, instant shipping and a secure digital payments interface.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Shop Categories</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/products?category=Electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=Fashion" className="hover:text-white transition-colors">Apparel & Fashion</Link></li>
              <li><Link to="/products?category=Home" className="hover:text-white transition-colors">Home & Living</Link></li>
              <li><Link to="/products?category=Books" className="hover:text-white transition-colors">Books & Stationary</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order History</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist Catalog</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Newsletter</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Subscribe to get notified about our premium offers, discount cycles, and new catalog additions.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email..."
                className="bg-slate-800 text-white text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-400 flex-1 border border-slate-700"
              />
              <button
                type="submit"
                className="bg-teal-500 text-slate-900 hover:bg-teal-400 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ShopSphere Enterprise Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
