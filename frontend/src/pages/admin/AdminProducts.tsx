import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import type { Product, Category, ApiResponse } from '../../types';
import { 
  Plus, Edit3, Trash2, Search, X, Loader2, Undo, Archive, 
  CheckSquare, Image as ImageIcon, Star, StarOff, ArrowUp, ArrowDown, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const productFormSchema = z.object({
  productName: z.string().min(1, 'Product name is required').max(200),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  brand: z.string().min(1, 'Brand is required'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.coerce.number().min(1, 'Please select a category'),
  quantity: z.coerce.number().min(0, 'Initial stock must be 0 or greater'),
  imageUrl: z.string().optional(),
  premium: z.boolean().default(false),
  approved: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export const AdminProducts: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Tab control state
  const [currentTab, setCurrentTab] = useState<'catalog' | 'trash' | 'reviews'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Safe Delete verification state
  const [safeDeleteProductId, setSafeDeleteProductId] = useState<number | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isSafeDeleteSubmitting, setIsSafeDeleteSubmitting] = useState(false);

  // Multi-image manager state
  const [imageManagerProduct, setImageManagerProduct] = useState<Product | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isImageAdding, setIsImageAdding] = useState(false);

  // Parse URL tab parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'trash' || tabParam === 'reviews') {
      setCurrentTab(tabParam);
    } else {
      setCurrentTab('catalog');
    }
  }, [location]);

  // Fetch active products
  const { data: productsRes, isLoading: isCatalogLoading } = useQuery<ApiResponse<Product[]>>({
    queryKey: ['admin-all-products'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Product[]>>('/products');
      return response.data;
    },
  });

  // Fetch trash products
  const { data: trashRes, isLoading: isTrashLoading } = useQuery<ApiResponse<Product[]>>({
    queryKey: ['admin-trash-products'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Product[]>>('/products/admin/trash');
      return response.data;
    },
    enabled: currentTab === 'trash',
  });

  // Fetch low review products
  const { data: reviewRes, isLoading: isReviewsLoading } = useQuery<ApiResponse<Product[]>>({
    queryKey: ['admin-review-flagged-products'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Product[]>>('/products/admin/awaiting-verification');
      return response.data;
    },
    enabled: currentTab === 'reviews',
  });

  const products = productsRes?.data || [];
  const trashProducts = trashRes?.data || [];
  const lowReviewProducts = reviewRes?.data || [];

  // Fetch categories
  const { data: categoriesRes } = useQuery<ApiResponse<Category[]>>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      return response.data;
    },
  });

  const categories = categoriesRes?.data || [];

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
  });

  // Create Product
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
      toast.success('Product added successfully!');
      handleCloseModal();
    },
  });

  // Update Product
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
      toast.success('Product specifications updated!');
      handleCloseModal();
    },
  });

  // Safe delete handler trigger
  const handleSafeDeleteTrigger = (id: number) => {
    setSafeDeleteProductId(id);
    setAdminPassword('');
  };

  // Safe delete submit
  const handleSafeDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      toast.error('Admin password is required');
      return;
    }
    if (!safeDeleteProductId) return;

    setIsSafeDeleteSubmitting(true);
    try {
      await api.delete(`/products/${safeDeleteProductId}?password=${encodeURIComponent(adminPassword)}`);
      toast.success('Product successfully moved to Trash (7-day countdown started)');
      setSafeDeleteProductId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-trash-products'] });
    } catch (error: any) {
      console.error('Safe delete error', error);
    } finally {
      setIsSafeDeleteSubmitting(false);
    }
  };

  // Restore product
  const restoreProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/products/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-trash-products'] });
      toast.success('Product successfully restored to catalog');
    },
  });

  // Permanent Delete
  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}/permanent`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trash-products'] });
      toast.success('Product permanently purged');
    },
  });

  // Keep low-review product
  const keepReviewProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/products/${id}/keep`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-review-flagged-products'] });
      toast.success('Product reviews verified and approved');
    },
  });

  // Image actions: Add image
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim() || !imageManagerProduct) return;
    setIsImageAdding(true);
    try {
      await api.post(`/products/${imageManagerProduct.id}/images`, {
        imageUrl: newImageUrl.trim(),
        primaryImage: false,
        altText: imageManagerProduct.name,
      });
      toast.success('Image added');
      setNewImageUrl('');
      // Reload product images by refetching products
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] }).then(() => {
        // Find refreshed product and update state
        const updated = queryClient.getQueryData<ApiResponse<Product[]>>(['admin-all-products'])?.data
          ?.find(p => p.id === imageManagerProduct.id);
        if (updated) setImageManagerProduct(updated);
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsImageAdding(false);
    }
  };

  // Image actions: Delete image
  const handleDeleteImage = async (imageId: number) => {
    if (!imageManagerProduct) return;
    try {
      await api.delete(`/products/${imageManagerProduct.id}/images/${imageId}`);
      toast.success('Image deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] }).then(() => {
        const updated = queryClient.getQueryData<ApiResponse<Product[]>>(['admin-all-products'])?.data
          ?.find(p => p.id === imageManagerProduct.id);
        if (updated) setImageManagerProduct(updated);
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Image actions: Set Cover Image
  const handleSetCoverImage = async (imageId: number) => {
    if (!imageManagerProduct) return;
    try {
      await api.put(`/products/${imageManagerProduct.id}/images/${imageId}/primary`);
      toast.success('Primary cover image updated');
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] }).then(() => {
        const updated = queryClient.getQueryData<ApiResponse<Product[]>>(['admin-all-products'])?.data
          ?.find(p => p.id === imageManagerProduct.id);
        if (updated) setImageManagerProduct(updated);
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Image actions: Shift Sort Order (Reorder)
  const handleShiftImage = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!imageManagerProduct || !imageManagerProduct.images) return;
    const imgs = [...imageManagerProduct.images].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= imgs.length) return;

    // Swap
    const temp = imgs[index];
    imgs[index] = imgs[targetIdx];
    imgs[targetIdx] = temp;

    // Compile new ID order list
    const imageIds = imgs.map(img => img.id);
    try {
      await api.put(`/products/${imageManagerProduct.id}/images/reorder`, { imageIds });
      toast.success('Reordered images successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] }).then(() => {
        const updated = queryClient.getQueryData<ApiResponse<Product[]>>(['admin-all-products'])?.data
          ?.find(p => p.id === imageManagerProduct.id);
        if (updated) setImageManagerProduct(updated);
      });
    } catch (e) {
      console.error(e);
    }
  };

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
      premium: false,
      approved: true,
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
      sku: p.sku || p.brand.toLowerCase() + '-' + p.id,
      categoryId: p.category?.id || 0,
      quantity: p.inventory?.quantity || 0,
      imageUrl: p.images && p.images.length > 0 ? p.images[0].imageUrl : '',
      premium: p.premium || false,
      approved: p.approved !== false,
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

  // Helper: countdown days remaining logic
  const getDaysRemaining = (deletedAtStr?: string) => {
    if (!deletedAtStr) return '7 days left';
    const deletedAt = new Date(deletedAtStr);
    const expiry = new Date(deletedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const diff = expiry.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    if (days <= 0) return 'Expired (Purging shortly)';
    return `${days} days left`;
  };

  const activeCatalogList = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTrashList = trashProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeReviewList = lowReviewProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const switchTab = (tab: 'catalog' | 'trash' | 'reviews') => {
    setSearchTerm('');
    setCurrentTab(tab);
    navigate(`/admin/products?tab=${tab}`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Product Catalog Control</h1>
          <p className="text-slate-550 text-sm mt-1">Supervise the store inventory, verify low-review flags, and restore trashed items.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer self-start sm:self-auto transition-all"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Tab select bar */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => switchTab('catalog')}
          className={`pb-3 relative transition-all cursor-pointer ${
            currentTab === 'catalog' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Active Catalog ({products.length})
        </button>
        <button
          onClick={() => switchTab('trash')}
          className={`pb-3 relative transition-all cursor-pointer ${
            currentTab === 'trash' ? 'text-red-500 border-b-2 border-b-red-500' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Trash & Restoration ({trashProducts.length})
        </button>
        <button
          onClick={() => switchTab('reviews')}
          className={`pb-3 relative transition-all cursor-pointer ${
            currentTab === 'reviews' ? 'text-amber-600 border-b-2 border-b-amber-500' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Low Review Flagged ({lowReviewProducts.length})
        </button>
      </div>

      {/* Search Input bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-sm">
        <div className="relative max-w-sm w-full group">
          <input
            type="text"
            placeholder={
              currentTab === 'catalog' 
                ? 'Search active catalog...' 
                : currentTab === 'trash' 
                ? 'Search product trash...' 
                : 'Search low review items...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-650 focus:bg-white transition-all shadow-inner"
          />
          <button className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Main Lists Container */}
      <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Tab 1: Catalog List */}
        {currentTab === 'catalog' && (
          <>
            {isCatalogLoading ? (
              <div className="py-20 text-center space-y-4">
                <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                <p className="text-slate-400 text-sm">Compiling active products catalog...</p>
              </div>
            ) : activeCatalogList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-450 font-bold border-b border-slate-150 uppercase tracking-wider">
                      <th className="py-4 px-6">Product details</th>
                      <th className="py-4 px-6">Brand name</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Flags</th>
                      <th className="py-4 px-6">Stock Level</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-650">
                    {activeCatalogList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={p.images && p.images.length > 0 
                                  ? p.images.sort((a,b) => (a.sortOrder || 0) - (b.sortOrder || 0))[0].imageUrl 
                                  : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="block leading-snug line-clamp-1">{p.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-500">{p.brand}</td>
                        <td className="py-4 px-6 font-extrabold text-slate-850">₹{p.price.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6">
                          <div className="flex gap-1.5">
                            {p.premium && (
                              <span className="px-2 py-0.5 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-[9px] font-bold uppercase">
                                Premium
                              </span>
                            )}
                            {p.approved === false && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-bold uppercase">
                                Pending Approval
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {p.inventory && p.inventory.quantity > 0 ? (
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border shadow-xs ${
                              p.inventory.quantity <= 10 ? 'bg-amber-50 text-amber-600 border-amber-150' : 'bg-emerald-50 text-emerald-600 border-emerald-150'
                            }`}>
                              {p.inventory.quantity} Qty
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-600 border-rose-150 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-xs">
                              Out of stock
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => setImageManagerProduct(p)}
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-teal-650 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                              title="Manage Images"
                            >
                              <ImageIcon size={15} />
                              <span className="text-[10px]">{p.images?.length || 0}</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-blue-650 rounded-xl transition-colors cursor-pointer"
                              title="Edit specifications"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleSafeDeleteTrigger(p.id)}
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                              title="Safe delete product"
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
                <Archive size={44} className="mx-auto text-slate-200 stroke-[1.5]" />
                <p className="text-sm">No active products found matching "{searchTerm}"</p>
              </div>
            )}
          </>
        )}

        {/* Tab 2: Trash Bin List */}
        {currentTab === 'trash' && (
          <>
            {isTrashLoading ? (
              <div className="py-20 text-center space-y-4">
                <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                <p className="text-slate-400 text-sm">Compiling soft-deleted products list...</p>
              </div>
            ) : activeTrashList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-450 font-bold border-b border-slate-150 uppercase tracking-wider">
                      <th className="py-4 px-6">Product details</th>
                      <th className="py-4 px-6">Deleted Date</th>
                      <th className="py-4 px-6">Deletion countdown</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-650">
                    {activeTrashList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex-shrink-0 opacity-70">
                              <img
                                src={p.images && p.images.length > 0 
                                  ? p.images[0].imageUrl 
                                  : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="block leading-snug line-clamp-1 text-slate-500 line-through">{p.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: #PROD-{p.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-500">
                          {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-extrabold animate-pulse">
                            {getDaysRemaining(p.deletedAt)}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-extrabold text-slate-500">₹{p.price.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => restoreProductMutation.mutate(p.id)}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-emerald-600 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                              title="Restore product to shop"
                            >
                              <Undo size={14} />
                              <span>Restore</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('WARNING: Are you sure you want to permanently delete this product? This action CANNOT be undone!')) {
                                  permanentDeleteMutation.mutate(p.id);
                                }
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                              title="Purge permanently"
                            >
                              <Trash2 size={14} />
                              <span>Purge</span>
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
                <Trash2 size={44} className="mx-auto text-slate-200 stroke-[1.5]" />
                <p className="text-sm">Product Trash is empty</p>
              </div>
            )}
          </>
        )}

        {/* Tab 3: Low Review Flagged List */}
        {currentTab === 'reviews' && (
          <>
            {isReviewsLoading ? (
              <div className="py-20 text-center space-y-4">
                <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                <p className="text-slate-400 text-sm">Scanning products with low ratings...</p>
              </div>
            ) : activeReviewList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-450 font-bold border-b border-slate-150 uppercase tracking-wider">
                      <th className="py-4 px-6">Product details</th>
                      <th className="py-4 px-6">Average rating</th>
                      <th className="py-4 px-6">Low Review Count</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6 text-center">Fulfillment Decisions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-650">
                    {activeReviewList.map((p) => {
                      const avgRating = p.reviews && p.reviews.length > 0
                        ? (p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length).toFixed(1)
                        : '≤ 2.0';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-800">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="block leading-snug line-clamp-1 text-rose-900">{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">Brand: {p.brand}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-500">
                            <div className="flex items-center gap-1 text-rose-500 font-bold">
                              <Star size={14} className="fill-rose-500" />
                              <span>{avgRating} Stars</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-500">
                            {p.reviews?.length || 0} reviews
                          </td>
                          <td className="py-4 px-6 font-extrabold text-slate-800">₹{p.price.toLocaleString('en-IN')}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => keepReviewProductMutation.mutate(p.id)}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-600 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
                                title="Keep Product & approve reviews"
                              >
                                <CheckSquare size={13} />
                                <span>Keep / Verify</span>
                              </button>
                              <button
                                onClick={() => handleSafeDeleteTrigger(p.id)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
                                title="Safe delete from store"
                              >
                                <Trash2 size={13} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 space-y-4">
                <StarOff size={44} className="mx-auto text-slate-200 stroke-[1.5]" />
                <p className="text-sm">No low-review flagged products requiring verification.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal 1: Add/Edit Product Specifications */}
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
              className="fixed top-12 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
              <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-extrabold text-slate-800 text-base">
                  {editingProduct ? 'Modify Product Specifications' : 'Register New Product'}
                </h3>
                <button onClick={handleCloseModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</label>
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

                <div className="grid grid-cols-2 gap-4">
                  {/* Premium Badge switch */}
                  <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <input
                      type="checkbox"
                      id="premium"
                      className="w-4.5 h-4.5 text-blue-600 rounded focus:ring-blue-100 focus:ring-2 transition-all cursor-pointer"
                      {...register('premium')}
                    />
                    <label htmlFor="premium" className="text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer">
                      Premium Product
                    </label>
                  </div>

                  {/* Approved switch */}
                  <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <input
                      type="checkbox"
                      id="approved"
                      className="w-4.5 h-4.5 text-blue-600 rounded focus:ring-blue-100 focus:ring-2 transition-all cursor-pointer"
                      {...register('approved')}
                    />
                    <label htmlFor="approved" className="text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer">
                      Approved Listing
                    </label>
                  </div>
                </div>

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
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
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

      {/* Modal 2: Safe Deletion Admin Password Prompt */}
      <AnimatePresence>
        {safeDeleteProductId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl relative"
            >
              <button
                onClick={() => setSafeDeleteProductId(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4 text-rose-500">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-850">Verify Admin Identity</h3>
                  <p className="text-xs text-slate-450">Confirm credentials to perform soft deletion</p>
                </div>
              </div>

              <form onSubmit={handleSafeDeleteSubmit} className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs text-slate-500 space-y-2 leading-relaxed">
                  <p className="font-semibold text-slate-700">⚠️ Soft Deletion Warnings:</p>
                  <p>• The product is hidden from customer searches and purchase sections immediately.</p>
                  <p>• Trashed items are archived for exactly <span className="font-bold text-rose-600">7 days</span> during which you can restore them.</p>
                  <p>• Expired items are purged permanently via automatic schedulers.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Confirm Admin Password</label>
                  <input
                    type="password"
                    placeholder="Enter your admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-850 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-rose-500 focus:ring-rose-100 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSafeDeleteProductId(null)}
                    className="flex-1 py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSafeDeleteSubmitting}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-500/10 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    {isSafeDeleteSubmitting && <Loader2 size={13} className="animate-spin" />}
                    <span>Confirm Soft Delete</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Standalone Product Multiple Image Manager */}
      <AnimatePresence>
        {imageManagerProduct && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-100 shadow-2xl relative"
            >
              <button
                onClick={() => setImageManagerProduct(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-650">
                  <ImageIcon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-850">Gallery Manager</h3>
                  <p className="text-xs text-slate-450">Manage cover images, upload screenshots and reorder gallery sequence for {imageManagerProduct.name}</p>
                </div>
              </div>

              {/* Upload image form */}
              <form onSubmit={handleAddImage} className="flex gap-2.5 mb-6">
                <input
                  type="text"
                  placeholder="Paste image URL (e.g. https://domain.com/photo.png)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-teal-500 focus:ring-teal-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={isImageAdding || !newImageUrl.trim()}
                  className="px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  {isImageAdding && <Loader2 size={13} className="animate-spin" />}
                  <span>Add URL</span>
                </button>
              </form>

              {/* Images list */}
              <div className="space-y-3.5 max-h-[45vh] overflow-y-auto pr-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Product Image Cards
                </span>
                
                {imageManagerProduct.images && imageManagerProduct.images.length > 0 ? (
                  imageManagerProduct.images
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map((img, idx, arr) => (
                      <div
                        key={img.id}
                        className={`flex items-center gap-3 p-3 bg-slate-50 border rounded-2xl transition-all ${
                          img.primaryImage ? 'border-teal-400 bg-teal-50/10' : 'border-slate-150'
                        }`}
                      >
                        <div className="w-12 h-12 bg-white border border-slate-150 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-650 truncate">{img.imageUrl}</div>
                          <div className="flex gap-2 mt-1">
                            {img.primaryImage ? (
                              <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-[8px] font-bold uppercase">
                                Primary Cover
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSetCoverImage(img.id)}
                                className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer"
                              >
                                Set as Cover
                              </button>
                            )}
                            <span className="text-[9px] text-slate-400">Sort Order: {img.sortOrder || 0}</span>
                          </div>
                        </div>

                        {/* Reordering Controls */}
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleShiftImage(idx, 'UP')}
                            className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-800 disabled:opacity-40 rounded cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleShiftImage(idx, 'DOWN')}
                            className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-800 disabled:opacity-40 rounded cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        {/* Delete Image button */}
                        <button
                          type="button"
                          disabled={img.primaryImage && arr.length > 1}
                          onClick={() => {
                            if (window.confirm('Delete this image?')) {
                              handleDeleteImage(img.id);
                            }
                          }}
                          className="p-2 hover:bg-slate-200 text-slate-450 hover:text-rose-500 rounded-xl cursor-pointer transition-colors"
                          title="Delete image"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">No images registered. Upload one above.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
