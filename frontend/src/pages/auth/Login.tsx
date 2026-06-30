import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/axios';
import type { ApiResponse, User } from '../../types';
import toast from 'react-hot-toast';
import { KeyRound, Mail, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, User as UserIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().min(1, 'Email or Login ID is required'),
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
  
  // Multi-role state
  const [loginRole, setLoginRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  
  // Google Simulator popup state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Find redirect destination if coming from guarded path
  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
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
      // Send the role selected in the UI along with credentials to backend
      const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', {
        ...data,
        role: loginRole,
      });
      const { token, id, email, fullName, role } = response.data.data;
      
      const userData: User = {
        id,
        email,
        fullName,
        role: role as 'CUSTOMER' | 'ADMIN',
      };

      login(token, userData);
      toast.success(`Welcome back, ${fullName}! Successfully logged in as ${role}.`);

      // Redirection logic based on role
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const safeDestination = from.startsWith('/admin') ? '/' : from;
        navigate(safeDestination, { replace: true });
      }
    } catch (error: any) {
      console.error('Login error', error);
      // Errors are handled globally by Axios
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async (googleProfile: { googleId: string; email: string; name: string; profileImage: string }) => {
    setIsSubmitting(true);
    try {
      const response = await api.post<ApiResponse<LoginResponseData>>('/auth/google', googleProfile);
      const { token, id, email, fullName, role } = response.data.data;
      
      const userData: User = {
        id,
        email,
        fullName,
        role: role as 'CUSTOMER' | 'ADMIN',
      };

      login(token, userData);
      toast.success(`Google Login Successful! Welcome ${fullName}.`);
      setShowGoogleModal(false);
      
      const safeDestination = from.startsWith('/admin') ? '/' : from;
      navigate(safeDestination, { replace: true });
    } catch (error: any) {
      console.error('Google OAuth error', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mockGoogleAccounts = [
    { name: 'Aarav Patel', email: 'aarav@gmail.com', googleId: 'google_aarav123' },
    { name: 'Diya Reddy', email: 'diya@gmail.com', googleId: 'google_diya123' },
    { name: 'Arjun Kumar', email: 'arjun@gmail.com', googleId: 'google_arjun123' },
  ];

  const triggerGoogleSimulator = () => {
    setShowGoogleModal(true);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleName.trim() || !customGoogleEmail.trim()) {
      toast.error('Please enter both name and email');
      return;
    }
    if (!customGoogleEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    
    handleGoogleLogin({
      googleId: 'google_' + customGoogleEmail.replace(/[^a-zA-Z0-9]/g, ''),
      email: customGoogleEmail.trim(),
      name: customGoogleName.trim(),
      profileImage: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customGoogleName.trim())}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-teal-400/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative z-10"
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-850 tracking-tight">
            {loginRole === 'CUSTOMER' ? 'Customer Account' : 'Administrator Portal'}
          </h2>
          <p className="mt-2 text-sm text-slate-450">
            {loginRole === 'CUSTOMER' 
              ? 'Sign in to buy products, track delivery progress and manage wishlist.' 
              : 'Authorized administration personnel access only.'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 relative">
          <button
            type="button"
            onClick={() => {
              setLoginRole('CUSTOMER');
              setValue('email', '');
              setValue('password', '');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginRole === 'CUSTOMER' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon size={16} />
            <span>Customer Login</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setLoginRole('ADMIN');
              setValue('email', 'ramya.admin@shopsphere.com');
              setValue('password', 'admin123hash');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginRole === 'ADMIN' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={16} />
            <span>Admin Login</span>
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-650 uppercase tracking-wider">
                Email / Login ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="text"
                  placeholder="name@example.com or login ID"
                  className={`w-full bg-slate-50 border text-slate-800 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
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
                <label htmlFor="password" className="text-xs font-semibold text-slate-655 uppercase tracking-wider">
                  Password
                </label>
                {loginRole === 'CUSTOMER' && (
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border text-slate-800 pl-10 pr-10 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
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
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/10 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In as {loginRole === 'CUSTOMER' ? 'Customer' : 'Admin'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Customer Social login / register block */}
        {loginRole === 'CUSTOMER' && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">or sign in with</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={triggerGoogleSimulator}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-sm shadow-slate-100 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div className="text-center text-sm text-slate-450 pt-2">
              <span>Don't have an account yet? </span>
              <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                Create an Account
              </Link>
            </div>
          </div>
        )}
      </motion.div>

      {/* Google Sign-In Simulator Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-red-500">
                  <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-850">Google Login Simulator</h3>
                  <p className="text-xs text-slate-450">Select a mock account or register a new one</p>
                </div>
              </div>

              {/* Preconfigured Google Accounts */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Saved Gmail Accounts
                </span>
                
                {mockGoogleAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleGoogleLogin({
                      googleId: account.googleId,
                      email: account.email,
                      name: account.name,
                      profileImage: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(account.name)}`,
                    })}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-150 hover:border-blue-500 hover:bg-blue-50/20 text-left transition-all cursor-pointer group"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(account.name)}`}
                      alt={account.name}
                      className="w-10 h-10 rounded-full bg-slate-100 border border-slate-100"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-700 text-sm group-hover:text-blue-600">{account.name}</div>
                      <div className="text-xs text-slate-400">{account.email}</div>
                    </div>
                    <ArrowRight size={16} className="text-slate-350 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>

              {/* Custom Google Account registration */}
              <form onSubmit={handleCustomGoogleSubmit} className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Sign in with custom Gmail
                </span>
                <input
                  type="text"
                  placeholder="Full Name (e.g. John Doe)"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 transition-all"
                />
                <input
                  type="email"
                  placeholder="Gmail address (e.g. john@gmail.com)"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 transition-all"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-sm transition-all cursor-pointer"
                >
                  Link & Login Custom Google Account
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
