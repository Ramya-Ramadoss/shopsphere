import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import type { Product, Category, ApiResponse } from '../../types';
import { Plus, Edit3, Trash2, Search, X, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const productFormSchema = z.object({
  productName: z.string().min(1, 'Product name is required').max(200),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  brand: z.string().min(1, 'Brand is required'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.coerce.number().min(1, 'Please select a category'),
  quantity: z.coerce.number().min(0, 'Initial stock must be 0 or greater'),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export const AdminProducts: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fetch all products (for admin tabular view, list format is simple and easy)
  const { data: productsRes, isLoading } = useQuery<ApiResponse<Product[]>>({
    queryKey: ['admin-all-products'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Product[]>>('/products');
      return response.data;
    },
  });

  const products = productsRes?.data || [];

  // Fetch categories (for selector dropdowns)
  const { data: categoriesRes } = useQuery<ApiResponse<Category[]>>({
    queryKey: ['categories'],
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
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
  });

  // Create Product Mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await api.post('/products', {
        ...data,
        adminId: user?.id,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] });
      toast.success('Product created successfully!');
      handleCloseModal();
    },
  });

  // Update Product Mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormValues }) => {
      const response = await api.put(`/products/${id}`, {
        ...data,
        adminId: user?.id,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] });
      toast.success('Product updated!');
      handleCloseModal();
    },
  });

  // Delete Product Mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] });
      toast.success('Product deleted from inventory');
    },
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    reset({
      productName: '',
      description: '',
      price: 0,
      brand: '',
      sku: '',
      categoryId: 0,
      quantity: 0,
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    reset({
      productName: p.name,
      description: p.description,
      price: p.price,
      brand: p.brand,
      sku: p.brand.toLowerCase() + '-' + p.id, // Fallback mock SKU if undefined
      categoryId: p.category?.id || 0,
      quantity: p.inventory?.quantity || 0,
      imageUrl: p.images && p.images.length > 0 ? p.images[0].imageUrl : '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const onSubmit = (data: ProductFormValues) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-805 tracking-tight">Products Catalog</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage, add or update product catalogs and initial stocking records.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Filter input */}
      <div className="flex items-center gap-4 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative max-w-sm w-full group">
          <input
            type="text"
            placeholder="Search by name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner"
          />
          <button className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Product Table List */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
            <p className="text-slate-400 text-sm">Compiling catalog table...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
                  <th className="py-4 px-6">Product details</th>
                  <th className="py-4 px-6">Brand name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-650">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="block leading-snug line-clamp-1">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: #PROD-{p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium">{p.brand}</td>
                    <td className="py-4 px-6">{p.category?.name || 'Unassigned'}</td>
                    <td className="py-4 px-6 font-extrabold text-slate-800">Rs. {p.price.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6">
                      {p.inventory?.quantity > 0 ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border shadow-sm ${
                          p.inventory.quantity <= 10 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {p.inventory.quantity} Qty
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-600 border-rose-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
                          Out of stock
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-blue-650 rounded-xl transition-colors cursor-pointer"
                          aria-label="Edit product"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                          aria-label="Delete product"
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
            <p className="text-sm">No products found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal Drawer */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50"
              onClick={handleCloseModal}
            />
            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-12 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
              <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-extrabold text-slate-800 text-base">
                  {editingProduct ? 'Modify Product Specifications' : 'Register New Product'}
                </h3>
                <button onClick={handleCloseModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Product Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    placeholder="Galaxy S24 Ultra"
                    className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.productName ? 'border-rose-400' : 'border-slate-200'
                    }`}
                    {...register('productName')}
                  />
                  {errors.productName && <span className="text-xs text-rose-500 font-semibold">{errors.productName.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Brand */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Brand Name</label>
                    <input
                      type="text"
                      placeholder="Samsung"
                      className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                        errors.brand ? 'border-rose-400' : 'border-slate-200'
                      }`}
                      {...register('brand')}
                    />
                    {errors.brand && <span className="text-xs text-rose-500 font-semibold">{errors.brand.message}</span>}
                  </div>

                  {/* SKU */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">SKU Code</label>
                    <input
                      type="text"
                      placeholder="samsung-s24-128"
                      className={`bg-slate-50 border text-slate-855 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                        errors.sku ? 'border-rose-400' : 'border-slate-200'
                      }`}
                      {...register('sku')}
                    />
                    {errors.sku && <span className="text-xs text-rose-500 font-semibold">{errors.sku.message}</span>}
                  </div>

                  {/* Price */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Selling Price (Rs.)</label>
                    <input
                      type="number"
                      placeholder="109999"
                      className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                        errors.price ? 'border-rose-400' : 'border-slate-200'
                      }`}
                      {...register('price')}
                    />
                    {errors.price && <span className="text-xs text-rose-500 font-semibold">{errors.price.message}</span>}
                  </div>

                  {/* Category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Category Category</label>
                    <select
                      className={`bg-slate-50 border text-slate-700 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white ${
                        errors.categoryId ? 'border-rose-400' : 'border-slate-200'
                      }`}
                      {...register('categoryId')}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && <span className="text-xs text-rose-500 font-semibold">{errors.categoryId.message}</span>}
                  </div>
                </div>

                {/* Initial Stock Quantity (only editable on Add, otherwise managed via inventory updates) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {editingProduct ? 'Current Quantity (Information Only)' : 'Initial Stock Quantity'}
                  </label>
                  <input
                    disabled={!!editingProduct}
                    type="number"
                    placeholder="100"
                    className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all border-slate-200 disabled:opacity-60 disabled:cursor-not-allowed`}
                    {...register('quantity')}
                  />
                  {errors.quantity && <span className="text-xs text-rose-500 font-semibold">{errors.quantity.message}</span>}
                </div>

                {/* Product Image URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    className={`bg-slate-50 border text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.imageUrl ? 'border-rose-400' : 'border-slate-200'
                    }`}
                    {...register('imageUrl')}
                  />
                  {errors.imageUrl && <span className="text-xs text-rose-500 font-semibold">{errors.imageUrl.message}</span>}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Detail specifications of the product catalog..."
                    className="bg-slate-50 border border-slate-200 text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white"
                    {...register('description')}
                  />
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
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {(createProductMutation.isPending || updateProductMutation.isPending) && (
                      <Loader2 size={13} className="animate-spin" />
                    )}
                    <span>{editingProduct ? 'Save Specifications' : 'Publish Product'}</span>
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
