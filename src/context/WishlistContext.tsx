import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { useAuth } from './AuthContext';
import type { Wishlist, ApiResponse } from '../types';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlist: Wishlist | null;
  isLoading: boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (wishlistItemId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  moveToCart: (productId: number) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Query to get the wishlist
  const { data: wishlistResponse, isLoading } = useQuery<ApiResponse<Wishlist>>({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Wishlist>>(`/wishlist/${user?.id}`);
      return response.data;
    },
    enabled: isAuthenticated && user?.role === 'CUSTOMER' && !!user?.id,
  });

  const wishlist = wishlistResponse?.data || null;

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await api.post<ApiResponse<Wishlist>>('/wishlist/add', {
        customerId: user?.id,
        productId,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['wishlist', user?.id], data);
      toast.success('Added to wishlist!');
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (wishlistItemId: number) => {
      await api.delete(`/wishlist/remove/${wishlistItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
      toast.success('Removed from wishlist!');
    },
  });

  // Move to cart mutation
  const moveToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      await api.post('/wishlist/move-to-cart', {
        customerId: user?.id,
        productId,
      });
    },
    onSuccess: () => {
      // Invalidate both cart and wishlist queries so they refresh
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast.success('Moved item to cart!');
    },
  });

  const addToWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist.');
      return;
    }
    await addToWishlistMutation.mutateAsync(productId);
  };

  const removeFromWishlist = async (wishlistItemId: number) => {
    await removeFromWishlistMutation.mutateAsync(wishlistItemId);
  };

  const moveToCart = async (productId: number) => {
    await moveToCartMutation.mutateAsync(productId);
  };

  const isInWishlist = (productId: number): boolean => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some((item) => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading: isLoading || addToWishlistMutation.isPending || removeFromWishlistMutation.isPending || moveToCartMutation.isPending,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        moveToCart,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
