import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/axios';
import { Edit3, Search, X, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  brand: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  inStock: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const inventoryFormSchema = z.object({
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  reservedQuantity: z.coerce.number().min(0, 'Reserved quantity cannot be negative'),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

export const AdminInventory: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Fetch all inventory items
  const { data: inventoryRes, isLoading } = useQuery<ApiResponse<InventoryItem[]>>({
    queryKey: ['admin-inventory-all'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<InventoryItem[]>>('/inventory');
      return response.data;
    },
  });

  const inventoryItems = inventoryRes?.data || [];

  // Form Hooks
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema) as any,
  });

  // Update Inventory Mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async ({ productId, data }: { productId: number; data: InventoryFormValues }) => {
      const response = await api.put(`/inventory/update`, {
        productId,
        quantity: data.quantity,
        reservedQuantity: data.reservedQuantity,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-all'] });
      toast.success('Inventory stocks updated!');
      handleCloseModal();
    },
  });

  const handleOpenEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    reset({
      quantity: item.quantity,
      reservedQuantity: item.reservedQuantity,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const onSubmit = (data: InventoryFormValues) => {
    if (selectedItem) {
      updateInventoryMutation.mutate({ productId: selectedItem.productId, data });
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      (item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    if (showLowStockOnly) {
      return matchesSearch && item.quantity < 10;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 tracking-tight">Storehouse Inventory</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage product stock counts, reserved quotas and verify critical low alerts.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`font-semibold px-4.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border transition-all ${
              showLowStockOnly
                ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle size={14} />
            <span>Low Stock Alerts</span>
          </button>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="flex items-center gap-4 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative max-w-sm w-full group">
          <input
            type="text"
            placeholder="Search by SKU, product name, brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-55/40 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner"
          />
          <button className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Inventory Table Grid */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
            <p className="text-slate-400 text-sm">Compiling inventory ledger...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
                  <th className="py-4 px-6">Product details</th>
                  <th className="py-4 px-6">SKU Code</th>
                  <th className="py-4 px-6">Available Stock</th>
                  <th className="py-4 px-6">Reserved Stock</th>
                  <th className="py-4 px-6">In-Stock Status</th>
                  <th className="py-4 px-6 text-center">Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-655">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-55/20 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <div>
                        <span className="block leading-snug truncate max-w-xs">{item.productName}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">{item.brand}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-450">{item.sku || 'N/A'}</td>
                    <td className="py-4 px-6 font-extrabold text-slate-800">
                      <span className={`px-2 py-0.5 rounded-full border shadow-sm ${
                        item.quantity < 10 ? 'bg-rose-50 border-rose-100 text-rose-600 font-black' : 'text-slate-800 border-slate-100'
                      }`}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-450">{item.reservedQuantity} units</td>
                    <td className="py-4 px-6">
                      {item.inStock ? (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
                          Active
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-600 border-rose-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
                          Empty
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-blue-650 rounded-xl transition-colors cursor-pointer"
                          aria-label="Restock quantity"
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 space-y-4">
            <RefreshCw size={44} className="mx-auto text-slate-200 stroke-[1.5]" />
            <p className="text-sm">No items found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Restock Inventory Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
              <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-extrabold text-slate-805 text-base">
                  Update Stock Inventory
                </h3>
                <button onClick={handleCloseModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Product Reference</span>
                  <span className="font-bold text-slate-700 text-sm leading-tight block">{selectedItem?.productName}</span>
                  <span className="text-[10px] text-slate-450 font-mono">SKU: {selectedItem?.sku || 'N/A'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Available Stock */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-655 uppercase tracking-wider">Available Stock</label>
                    <input
                      type="number"
                      placeholder="100"
                      className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                        errors.quantity ? 'border-rose-400' : 'border-slate-200'
                      }`}
                      {...register('quantity')}
                    />
                    {errors.quantity && <span className="text-xs text-rose-500 font-semibold">{errors.quantity.message}</span>}
                  </div>

                  {/* Reserved Stock */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-655 uppercase tracking-wider">Reserved Stock</label>
                    <input
                      type="number"
                      placeholder="5"
                      className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                        errors.reservedQuantity ? 'border-rose-400' : 'border-slate-200'
                      }`}
                      {...register('reservedQuantity')}
                    />
                    {errors.reservedQuantity && (
                      <span className="text-xs text-rose-500 font-semibold">{errors.reservedQuantity.message}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateInventoryMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {updateInventoryMutation.isPending && (
                      <Loader2 size={13} className="animate-spin" />
                    )}
                    <span>Apply Updates</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
