import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/axios';
import { Link } from 'react-router-dom';
import type { ApiResponse, User } from '../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  Phone,
  Settings,
  Heart,
  ShoppingBag,
  History,
  Trash2,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits').max(6),
  country: z.string().min(1, 'Country is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface RecentlyViewedItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  viewedAt: string;
}

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch full details
  const { data: customerRes, isLoading: isCustomerLoading } = useQuery<ApiResponse<User>>({
    queryKey: ['customer-profile', user?.id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<User>>(`/customers/${user?.id}`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  const customer = customerRes?.data;

  // Fetch recently viewed history
  const { data: historyRes } = useQuery<ApiResponse<RecentlyViewedItem[]>>({
    queryKey: ['recently-viewed', user?.id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<RecentlyViewedItem[]>>(`/recently-viewed/${user?.id}`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  const viewHistory = historyRes?.data || [];

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await api.put<ApiResponse<User>>(`/customers/${user?.id}`, {
        fullName: data.fullName,
        email: user?.email,
        password: 'dummyPassword123!', // Required by backend DTO, but ignored/encrypted
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile', user?.id] });
      updateUser({ fullName: data.data.fullName }); // Sync auth state
      toast.success('Profile details updated!');
      setIsEditing(false);
    },
  });

  // Clear History Mutation
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/recently-viewed/${user?.id}`);
    },
    onSuccess: () => {
      queryClient.setQueryData(['recently-viewed', user?.id], null);
      toast.success('Viewing history cleared!');
    },
  });

  // Form hooks
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Autofill forms on data load
  useEffect(() => {
    if (customer) {
      setValue('fullName', customer.fullName);
      setValue('phone', customer.phone || '');
      setValue('address', customer.address || '');
      setValue('city', customer.city || '');
      setValue('state', customer.state || '');
      setValue('pincode', customer.pincode || '');
      setValue('country', customer.country || 'India');
    }
  }, [customer, setValue]);

  const handleProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  if (isCustomerLoading) {
    return (
      <div className="space-y-6 animate-pulse py-6">
        <div className="h-8 w-48 bg-slate-200 rounded-full" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Profile</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage your shipping destination address details and secure settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Details Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
              <h3 className="font-bold text-slate-805 text-base flex items-center gap-2">
                <Settings size={18} className="text-blue-600" />
                <span>Personal Information</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Info'}
              </button>
            </div>

            <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Name</label>
                  <input
                    disabled={!isEditing}
                    type="text"
                    className={`bg-slate-50 border text-slate-800 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.fullName ? 'border-rose-400' : 'border-slate-200'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    {...register('fullName')}
                  />
                  {errors.fullName && <span className="text-xs text-rose-500 font-semibold">{errors.fullName.message}</span>}
                </div>

                {/* Email (Readonly always) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      disabled
                      type="email"
                      value={customer?.email || ''}
                      className="w-full bg-slate-100 border border-slate-200 text-slate-450 pl-10 pr-4 py-2.5 rounded-xl text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input
                      disabled={!isEditing}
                      type="tel"
                      className={`w-full bg-slate-50 border text-slate-805 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                        errors.phone ? 'border-rose-400' : 'border-slate-200'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                      {...register('phone')}
                    />
                  </div>
                  {errors.phone && <span className="text-xs text-rose-500 font-semibold">{errors.phone.message}</span>}
                </div>

                {/* Address */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Street Address</label>
                  <input
                    disabled={!isEditing}
                    type="text"
                    className={`bg-slate-50 border text-slate-805 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.address ? 'border-rose-400' : 'border-slate-200'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    {...register('address')}
                  />
                  {errors.address && <span className="text-xs text-rose-500 font-semibold">{errors.address.message}</span>}
                </div>

                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">City</label>
                  <input
                    disabled={!isEditing}
                    type="text"
                    className={`bg-slate-50 border text-slate-805 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.city ? 'border-rose-400' : 'border-slate-200'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    {...register('city')}
                  />
                  {errors.city && <span className="text-xs text-rose-500 font-semibold">{errors.city.message}</span>}
                </div>

                {/* State */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">State</label>
                  <input
                    disabled={!isEditing}
                    type="text"
                    className={`bg-slate-50 border text-slate-805 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.state ? 'border-rose-400' : 'border-slate-200'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    {...register('state')}
                  />
                  {errors.state && <span className="text-xs text-rose-500 font-semibold">{errors.state.message}</span>}
                </div>

                {/* Pincode */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Pincode</label>
                  <input
                    disabled={!isEditing}
                    type="text"
                    className={`bg-slate-50 border text-slate-805 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.pincode ? 'border-rose-400' : 'border-slate-200'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    {...register('pincode')}
                  />
                  {errors.pincode && <span className="text-xs text-rose-500 font-semibold">{errors.pincode.message}</span>}
                </div>

                {/* Country */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Country</label>
                  <input
                    disabled={!isEditing}
                    type="text"
                    className={`bg-slate-50 border text-slate-805 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.country ? 'border-rose-400' : 'border-slate-200'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    {...register('country')}
                  />
                  {errors.country && <span className="text-xs text-rose-500 font-semibold">{errors.country.message}</span>}
                </div>
              </div>

              {isEditing && (
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-blue-500/10"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  <span>Save Changes</span>
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Mini Dashboard statistics */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">Overview Stats</h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-650">Customer orders</span>
                </div>
                <span className="font-extrabold text-slate-800 text-sm">Active account</span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                    <Heart size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-650">Wishlist Catalog</span>
                </div>
                <span className="font-extrabold text-slate-800 text-sm">Live sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed Products */}
      {viewHistory.length > 0 && (
        <section className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <div className="flex justify-between items-end border-b border-slate-100 pb-3">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <History size={20} className="text-teal-650" />
                <span>Recently Viewed</span>
              </h2>
              <p className="text-slate-400 text-xs">Products you checked out recently during your session.</p>
            </div>
            <button
              onClick={() => clearHistoryMutation.mutate()}
              disabled={clearHistoryMutation.isPending}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear History</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {viewHistory.map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.productId}`}
                className="bg-slate-55/30 border border-slate-100 hover:border-slate-300 p-3 rounded-2xl flex flex-col items-center justify-between text-center gap-2 group transition-all"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={getProductImage(item.productImage)}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                </div>
                <span className="font-bold text-slate-700 text-xs line-clamp-1 group-hover:text-blue-600 transition-colors w-full">
                  {item.productName}
                </span>
                <span className="text-[10px] text-slate-450 font-extrabold">Rs. {(item.price || 0).toLocaleString('en-IN')}</span>

              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const getProductImage = (imageUrl?: string) => {
  return imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
};
