import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotFormValues) => {
    setIsSubmitted(true);
    setEmailAddress(data.email);
    toast.success('Reset link dispatched to your email!');
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
          <h2 className="text-2xl font-bold text-slate-850">Retrieve Password</h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your account email to receive a secure recovery code.
          </p>
        </div>

        {isSubmitted ? (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-emerald-55/40 border border-emerald-100 p-6 rounded-2xl text-center space-y-4"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">Dispatched Successfully</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                An email containing password recovery links has been forwarded to <strong className="text-slate-700">{emailAddress}</strong>.
              </p>
            </div>
            <Link
              to="/login"
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </motion.div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full bg-slate-50 border text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && <span className="text-xs text-rose-500 font-medium">{errors.email.message}</span>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-150 shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              Send Reset Link
            </button>

            <div className="text-center mt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 hover:underline"
              >
                <ArrowLeft size={14} />
                <span>Return to sign in</span>
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
