import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { useAuth } from './AuthContext';
import type { Cart, ApiResponse } from '../types';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Query to get the cart
  const { data: cartResponse, isLoading } = useQuery<ApiResponse<Cart>>({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Cart>>(`/cart/${user?.id}`);
      return response.data;
    },
    enabled: isAuthenticated && user?.role === 'CUSTOMER' && !!user?.id,
  });

  const cart = cartResponse?.data || null;

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const response = await api.post<ApiResponse<Cart>>('/cart/add', {
        customerId: user?.id,
        productId,
        quantity,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', user?.id], data);
      toast.success('Product added to cart!');
    },
  });

  // Update cart item quantity mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const response = await api.put<ApiResponse<Cart>>('/cart/update', {
        customerId: user?.id,
        productId,
        quantity,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', user?.id], data);
      toast.success('Cart updated!');
    },
  });

  // Remove cart item mutation
  const removeCartItemMutation = useMutation({
    mutationFn: async (cartItemId: number) => {
      await api.delete(`/cart/remove/${cartItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast.success('Item removed from cart!');
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/cart/clear/${user?.id}`);
    },
    onSuccess: () => {
      queryClient.setQueryData(['cart', user?.id], null);
      toast.success('Cart cleared!');
    },
  });

  const addToCart = async (productId: number, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart.');
      return;
    }
    await addToCartMutation.mutateAsync({ productId, quantity });
  };

  const updateCartItem = async (productId: number, quantity: number) => {
    await updateCartMutation.mutateAsync({ productId, quantity });
  };

  const removeFromCart = async (cartItemId: number) => {
    await removeCartItemMutation.mutateAsync(cartItemId);
  };

  const clearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading: isLoading || addToCartMutation.isPending || updateCartMutation.isPending || removeCartItemMutation.isPending || clearCartMutation.isPending,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
