import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/axios';
import type { ApiResponse } from '../../types';
import toast from 'react-hot-toast';
import { User, Mail, KeyRound, Phone, MapPin, Globe, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name cannot exceed 100 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must contain exactly 10 digits'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must contain exactly 6 digits'),
  country: z.string().min(1, 'Country is required'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await api.post<ApiResponse<any>>('/customers/register', data);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error', error);
      // Handled globally by Axios
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
              S
            </div>
            <span className="font-bold text-2xl text-slate-800 tracking-tight">
              Shop<span className="text-teal-500">Sphere</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-850">Create an Account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign up to get a personal shopping cart, track shipments, and build your wishlist.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`w-full bg-slate-50 border text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.fullName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                  }`}
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && <span className="text-xs text-rose-500 font-medium">{errors.fullName.message}</span>}
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full bg-slate-50 border text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && <span className="text-xs text-rose-500 font-medium">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={16} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                  }`}
                  {...register('password')}
                />
              </div>
              {errors.password && <span className="text-xs text-rose-500 font-medium">{errors.password.message}</span>}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone size={16} />
                </div>
                <input
                  type="tel"
                  placeholder="9876543210"
                  className={`w-full bg-slate-50 border text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.phone ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                  }`}
                  {...register('phone')}
                />
              </div>
              {errors.phone && <span className="text-xs text-rose-500 font-medium">{errors.phone.message}</span>}
            </div>

            {/* Address */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Street Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Flat, House no., Apartment, Street"
                  className={`w-full bg-slate-50 border text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.address ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                  }`}
                  {...register('address')}
                />
              </div>
              {errors.address && <span className="text-xs text-rose-500 font-medium">{errors.address.message}</span>}
            </div>

            {/* City */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">City</label>
              <input
                type="text"
                placeholder="Mumbai"
                className={`w-full bg-slate-50 border text-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.city ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                }`}
                {...register('city')}
              />
              {errors.city && <span className="text-xs text-rose-500 font-medium">{errors.city.message}</span>}
            </div>

            {/* State */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">State</label>
              <input
                type="text"
                placeholder="Maharashtra"
                className={`w-full bg-slate-50 border text-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.state ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                }`}
                {...register('state')}
              />
              {errors.state && <span className="text-xs text-rose-500 font-medium">{errors.state.message}</span>}
            </div>

            {/* Pincode */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Pincode</label>
              <input
                type="text"
                placeholder="400001"
                className={`w-full bg-slate-50 border text-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.pincode ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                }`}
                {...register('pincode')}
              />
              {errors.pincode && <span className="text-xs text-rose-500 font-medium">{errors.pincode.message}</span>}
            </div>

            {/* Country */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Country</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Globe size={16} />
                </div>
                <input
                  type="text"
                  placeholder="India"
                  className={`w-full bg-slate-50 border text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.country ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                  }`}
                  {...register('country')}
                />
              </div>
              {errors.country && <span className="text-xs text-rose-500 font-medium">{errors.country.message}</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-150 disabled:opacity-50 shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-450 mt-6 pt-4 border-t border-slate-100">
          <span>Already have an account? </span>
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
