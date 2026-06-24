import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/axios';
import type { Category, ApiResponse } from '../../types';
import { Plus, Edit3, Trash2, Search, X, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Fetch Categories
  const { data: categoriesRes, isLoading } = useQuery<ApiResponse<Category[]>>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      return response.data;
    },
  });

  const categories = categoriesRes?.data || [];

  // Form Hooks
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema) as any,
  });

  // Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const response = await api.post('/categories', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category created successfully!');
      handleCloseModal();
    },
  });

  // Update Category Mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormValues }) => {
      const response = await api.put(`/categories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category details updated!');
      handleCloseModal();
    },
  });

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category removed');
    },
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    reset({
      name: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Category) => {
    setEditingCategory(c);
    reset({
      name: c.name,
      description: c.description || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const onSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete category? All associated products may become unassigned.')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 tracking-tight">Categories Catalog</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage catalog categories and classify storefront products.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search Input bar */}
      <div className="flex items-center gap-4 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative max-w-sm w-full group">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner"
          />
          <button className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Category Table Grid */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
            <p className="text-slate-400 text-sm">Compiling category table...</p>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
                  <th className="py-4 px-6">Category ID</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-655">
                {filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-55/20 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-450 font-bold">#CAT-{c.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">{c.name}</td>
                    <td className="py-4 px-6 text-slate-450 max-w-sm truncate">{c.description || '—'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-blue-650 rounded-xl transition-colors cursor-pointer"
                          aria-label="Edit category"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 hover:bg-slate-100 text-slate-450 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                          aria-label="Delete category"
                        >
                          <Trash2 size={15} />
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
            <p className="text-sm">No categories found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
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
                <h3 className="font-extrabold text-slate-800 text-base">
                  {editingCategory ? 'Modify Category' : 'Register Category'}
                </h3>
                <button onClick={handleCloseModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                {/* Category Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-655 uppercase tracking-wider">Category Name</label>
                  <input
                    type="text"
                    placeholder="Electronics"
                    className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.name ? 'border-rose-400' : 'border-slate-200'
                    }`}
                    {...register('name')}
                  />
                  {errors.name && <span className="text-xs text-rose-500 font-semibold">{errors.name.message}</span>}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-650 uppercase tracking-wider">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Provide short classification descriptions..."
                    className="bg-slate-50 border border-slate-200 text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white"
                    {...register('description')}
                  />
                  {errors.description && <span className="text-xs text-rose-500 font-semibold">{errors.description.message}</span>}
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
                    disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && (
                      <Loader2 size={13} className="animate-spin" />
                    )}
                    <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
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
