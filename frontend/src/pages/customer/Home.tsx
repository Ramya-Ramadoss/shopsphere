import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/axios';
import type { Product, Category, ApiResponse, PageResponse } from '../../types';
import toast from 'react-hot-toast';
import { ProductCard } from '../../components/cards/ProductCard';

import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) {
      toast.error('Please enter a valid email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success(`Thank you for subscribing to our newsletter!`);
    setNewsletterEmail('');
  };

  // Fetch Categories

  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useQuery<ApiResponse<Category[]>>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      return response.data;
    },
  });

  // Fetch Featured Products (size=8)
  const { data: productsResponse, isLoading: isProductsLoading } = useQuery<ApiResponse<PageResponse<Product>>>({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PageResponse<Product>>>('/products/filter', {
        params: { page: 0, size: 8, available: true },
      });
      return response.data;
    },
  });

  const categories = categoriesResponse?.data || [];
  const products = productsResponse?.data?.content || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-16 animate-fade-in pb-12">
      {/* 1. Hero Section */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 md:p-16 flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden shadow-xl shadow-slate-900/10 min-h-[500px]">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex-1 flex flex-col justify-center items-start space-y-6 relative z-10">
          <span className="bg-blue-500/20 text-blue-300 font-semibold px-4.5 py-1.5 rounded-full text-xs uppercase tracking-widest border border-blue-500/30 flex items-center gap-1.5">
            <Sparkles size={12} className="animate-spin text-teal-400" />
            <span>Welcome to ShopSphere v2.0</span>
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold max-w-2xl leading-[1.1] tracking-tight">
            Premium Brands, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Delivered Fast.</span>
          </h1>
          <p className="text-slate-400 max-w-lg leading-relaxed text-sm sm:text-base">
            Discover a state-of-the-art retail ecosystem. Shop curated items across multiple categories with instant checkout billing and simulated digital payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <Link
              to="/products"
              className="bg-blue-600 hover:bg-blue-700 text-white text-center font-bold px-8 py-3.5 rounded-full text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Explore Catalog</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => {
                const element = document.getElementById('featured-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-colors border border-slate-700"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Hero image placeholder frame */}
        <div className="flex-1 w-full max-w-md relative hidden md:block">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-80 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-teal-500/20 border border-slate-700/50 backdrop-blur-md flex items-center justify-center overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
              alt="E-Commerce Hero Frame"
              className="w-full h-full object-cover mix-blend-overlay opacity-90 hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </section>

      {/* 2. Selling Features Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Truck, title: 'Express Delivery', desc: 'Flat Rs. 100 shipping fee. Free for orders above Rs. 2,000.' },
          { icon: ShieldCheck, title: 'Simulated Payments', desc: 'Secure checkout simulation supporting UPI, Cards and Netbanking.' },
          { icon: RotateCcw, title: 'Simple Returns', desc: 'Cancel orders instantly before delivery coordinates process.' },
          { icon: Sparkles, title: 'Invoice Summaries', desc: 'Download structural txt invoice statements directly upon payment.' },
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="bg-white border border-slate-100 p-5 rounded-2xl flex gap-4 items-start shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                <Icon size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">{f.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Browse Categories */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">Browse by Category</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Find premium items organized into catalog categories.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {isCategoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl animate-shimmer bg-slate-200" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {categories.map((c) => (
              <motion.div key={c.id} variants={itemVariants}>
                <Link
                  to={`/products?categoryId=${c.id}`}
                  className="bg-white border border-slate-150 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-xs h-full group"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag size={18} />
                  </div>
                  <span className="font-bold text-slate-700 text-xs sm:text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                    {c.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8 text-slate-450 border border-dashed border-slate-200 rounded-2xl">
            No categories available at the moment
          </div>
        )}
      </section>

      {/* 4. Featured Products */}
      <section id="featured-section" className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">Featured Products</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Browse our recommended catalog items.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
            <span>Shop Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl animate-shimmer bg-slate-200" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((p) => (
              <motion.div key={p.id} variants={itemVariants}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl text-slate-450 space-y-4">
            <ShoppingBag size={48} className="mx-auto text-slate-300 stroke-[1.5]" />
            <p>No products featured in the database yet.</p>
            <Link to="/admin/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm shadow-md transition-colors">
              Add Products
            </Link>
          </div>
        )}
      </section>

      {/* 5. Customer Testimonials */}
      <section className="bg-blue-50/50 border border-blue-50 rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-800">What Our Buyers Say</h2>
          <p className="text-slate-400 text-sm">Real reviews written by verified customer profiles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Aarav Sharma', role: 'Verified Buyer', text: 'Shopsphere makes shopping extremely fast. The transition from placing the order to checking out is seamless, and payment simulations are immediate.', rating: 5 },
            { name: 'Priya Patel', role: 'Premium Member', text: 'Highly recommend this platform. The clean UI is beautiful, and downloading invoice txt receipts keeps my finance logs clean.', rating: 5 },
            { name: 'Karan Malhotra', role: 'Enterprise Client', text: 'Love the notifications panel. I get stock warnings and status changes directly in the top drawer. Very well thought out.', rating: 4 },
          ].map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-inner">
              <div className="flex gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    size={14}
                    className={starIndex < t.rating ? 'fill-current' : 'text-slate-200'}
                  />
                ))}
              </div>
              <p className="text-slate-500 text-sm leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  {t.name.charAt(0)}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-800 text-xs">{t.name}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Newsletter Subscription */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 md:p-16 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-3 flex-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Stay updated with premium offers</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Join the newsletter list and receive information regarding new seasonal inventory batches directly in your mailbox.
          </p>
        </div>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:min-w-[400px]">
          <input
            type="email"
            placeholder="example@shopsphere.com"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 px-5 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-400 flex-1"
          />
          <button type="submit" className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-6 py-3 rounded-2xl text-sm transition-colors cursor-pointer">
            Subscribe
          </button>
        </form>

      </section>
    </div>
  );
};
