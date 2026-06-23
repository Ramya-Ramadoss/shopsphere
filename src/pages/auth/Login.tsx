import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/axios';
import type { ApiResponse, User } from '../../types';
import toast from 'react-hot-toast';
import { KeyRound, Mail, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginResponseData {
  token: string;
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find redirect destination if coming from guarded path
  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', data);
      const { token, id, email, fullName, role } = response.data.data;
      
      const userData: User = {
        id,
        email,
        fullName,
        role: role as 'CUSTOMER' | 'ADMIN',
      };

      login(token, userData);
      toast.success(`Welcome back, ${fullName}!`);

      // Redirection logic based on role
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error('Login error', error);
      // Errors are handled globally by Axios, but we set submitting false
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
              S
            </div>
            <span className="font-bold text-2xl text-slate-800 tracking-tight">
              Shop<span className="text-teal-500">Sphere</span>
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-850">Account Login</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to check out products, track orders and manage wishlist.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full bg-slate-50 border text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-rose-500 font-medium pl-1">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border text-slate-800 pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.password
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-rose-500 font-medium pl-1">{errors.password.message}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-450 mt-6 pt-4 border-t border-slate-100">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
