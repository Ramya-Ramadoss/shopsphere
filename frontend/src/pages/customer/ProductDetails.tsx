import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import type { Product, Review, ApiResponse, PageResponse } from '../../types';
import { ProductCard } from '../../components/cards/ProductCard';
import {
  Heart,
  ShoppingCart,
  Star,
  ShieldCheck,
  RotateCcw,
  Truck,
  MessageSquareCode,
  Loader2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';

const reviewSchema = z.object({
  rating: z.coerce.number().min(1, 'Please select a rating').max(5),
  reviewText: z.string().min(3, 'Review text must be at least 3 characters'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlist } = useWishlist();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ transform: 'scale(1)' });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transform: 'scale(1)' });
  };

  const getStandardArrivalDate = () => {
    const standardDate = new Date();
    standardDate.setDate(standardDate.getDate() + 4);
    return standardDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const getExpressArrivalDate = () => {
    const expressDate = new Date();
    expressDate.setDate(expressDate.getDate() + 1);
    return expressDate.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const productId = parseInt(id || '0', 10);

  // Fetch product detail
  const { data: productResponse, isLoading: isProductLoading, isError } = useQuery<ApiResponse<Product>>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Product>>(`/products/${productId}`);
      return response.data;
    },
    enabled: !!productId,
  });

  const product = productResponse?.data;

  // Set default selected image
  useEffect(() => {
    if (product) {
      if (product.images && product.images.length > 0) {
        // Sort by sortOrder and get first
        const sorted = [...product.images].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        const primary = sorted.find((img) => img.primaryImage);
        setSelectedImage(primary ? primary.imageUrl : sorted[0].imageUrl);
      } else {
        setSelectedImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop');
      }
    }
  }, [product]);

  // Track recently viewed product
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER' && productId) {
      api.post('/recently-viewed', {
        customerId: user.id,
        productId,
      }).catch((err) => console.error('Error tracking view history', err));
    }
  }, [productId, user, isAuthenticated]);

  // Fetch reviews
  const { data: reviewsResponse, isLoading: isReviewsLoading } = useQuery<ApiResponse<Review[]>>({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`);
      return response.data;
    },
    enabled: !!productId,
  });

  const reviews = reviewsResponse?.data || [];

  // Fetch related products (same category)
  const { data: relatedResponse } = useQuery<ApiResponse<PageResponse<Product>>>({
    queryKey: ['related-products', product?.category?.id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PageResponse<Product>>>('/products/filter', {
        params: { categoryId: product?.category?.id, size: 4, available: true },
      });
      return response.data;
    },
    enabled: !!product?.category?.id,
  });

  const relatedProducts = (relatedResponse?.data?.content || []).filter((p) => p.id !== productId);

  // Add Review Mutation
  const addReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const response = await api.post('/reviews', {
        productId,
        customerId: user?.id,
        ...data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] }); // Update ratings average
      toast.success('Review published successfully!');
      reset();
    },
  });

  // Review Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema) as any,
    defaultValues: {
      rating: 5,
      reviewText: '',
    },
  });

  const handleReviewSubmit = (data: ReviewFormValues) => {
    if (!isAuthenticated) {
      toast.error('Please login to post a review');
      return;
    }
    addReviewMutation.mutate(data);
  };

  const handleWishlistToggle = () => {
    const isFav = isInWishlist(productId);
    if (isFav) {
      const wishlistItem = wishlist?.items.find((item) => item.productId === productId);
      if (wishlistItem) removeFromWishlist(wishlistItem.id);
    } else {
      addToWishlist(productId);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      await addToCart(product.id, quantity);
      navigate('/cart');
    }
  };

  if (isProductLoading) {
    return (
      <div className="space-y-8 animate-pulse py-6">
        <div className="h-6 w-48 bg-slate-200 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-5 w-1/3 bg-slate-200 rounded-lg" />
            <div className="h-20 w-full bg-slate-200 rounded-2xl" />
            <div className="h-10 w-40 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-20 space-y-4 max-w-sm mx-auto">
        <h2 className="text-2xl font-bold text-slate-800">Product not found</h2>
        <p className="text-sm text-slate-400">The product specifications you requested are unavailable.</p>
        <Link to="/products" className="inline-block bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full text-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const sortedImages = [...(product.images || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const imagesList = sortedImages.length > 0 ? sortedImages : [{ id: 0, imageUrl: selectedImage, primaryImage: true }];

  return (
    <div className="space-y-16 pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link to="/products" className="hover:text-blue-600 transition-colors">Products</Link>
        <ChevronRight size={12} />
        <span className="text-slate-650 max-w-[200px] truncate">{product.name}</span>
      </nav>

      {/* Product Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Image Gallery with Hover Zoom */}
        <div className="space-y-4">
          <div 
            className="aspect-square w-full rounded-3xl border border-slate-100 bg-slate-50 overflow-hidden relative shadow-sm cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={selectedImage}
              alt={product.name}
              style={{
                transition: 'transform 0.1s ease-out',
                ...zoomStyle
              }}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
              }}
            />
          </div>
          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {imagesList.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border flex-shrink-0 bg-slate-50 transition-all ${
                    selectedImage === img.imageUrl
                      ? 'border-blue-600 ring-2 ring-blue-100'
                      : 'border-slate-250 hover:border-slate-400'
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Spec Details Info */}
        <div className="space-y-6 flex flex-col justify-start">
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">{product.brand}</span>
                {product.premium && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] font-extrabold uppercase tracking-widest shadow-xs">
                    ✨ Premium
                  </span>
                )}
              </div>
              {product.inventory?.inStock && (
                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full">
                  <Star size={11} className="fill-current" />
                  <span>{(product.averageRating || 4.2).toFixed(1)} ({reviews.length} reviews)</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-805 leading-snug">{product.name}</h1>
          </div>

          {/* Pricing */}
          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Selling Price</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-800">
                Rs. {product.price.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              {product.inventory?.inStock ? (
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1 shadow-sm">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-ping" />
                  In Stock
                </span>
              ) : (
                <span className="bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Short description */}
          <p className="text-slate-500 text-sm leading-relaxed">{product.description}</p>

          {/* Dynamic delivery charges estimations */}
          <div className="p-4 bg-blue-50/20 border border-blue-100 rounded-2xl space-y-2 text-xs text-slate-600 leading-normal">
            <span className="font-bold text-slate-700 uppercase text-[9px] tracking-wider block mb-1">
              🚚 Delivery & Arrival Forecast
            </span>
            <div className="flex justify-between items-center">
              <span>Standard Delivery:</span>
              <span className="font-semibold text-slate-800">Arriving by {getStandardArrivalDate()}</span>
            </div>
            <div className="text-[10px] text-slate-450 italic">
              ₹49 standard shipping fee (FREE for orders above ₹999)
            </div>
            <div className="flex justify-between items-center border-t border-slate-100/60 pt-2 mt-1">
              <span>Express Delivery Option:</span>
              <span className="font-bold text-blue-650 flex items-center gap-1">
                <span>Get it {getExpressArrivalDate()}</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-450 italic">
              ₹99 flat fee (order before 6 PM for next-day dispatch)
            </div>
          </div>

          {/* Quantity selector & Action Buttons */}
          {product.inventory?.inStock && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-inner">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 hover:bg-slate-50 text-slate-500 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-slate-800 text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.inventory.quantity, quantity + 1))}
                    className="px-3.5 py-1.5 hover:bg-slate-50 text-slate-500 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-400">({product.inventory.quantity} units available)</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all duration-150 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all duration-150 cursor-pointer"
                >
                  <span>Buy It Now</span>
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isInWishlist(productId)
                      ? 'bg-rose-50 border-rose-100 text-rose-500'
                      : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={18} className={isInWishlist(productId) ? 'fill-current' : ''} />
                </button>
              </div>
            </div>
          )}

          {/* Delivery & Warranty info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-550 font-medium">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-teal-600" />
              <span>Flat Rs. 100 Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-teal-600" />
              <span>Easy Return Logs</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-teal-600" />
              <span>100% Secure Gateway</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications & Reviews */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200">
          {[
            { id: 'desc', label: 'Overview' },
            { id: 'specs', label: 'Details' },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 -mb-[2px] ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          {activeTab === 'desc' && (
            <div className="prose text-slate-500 text-sm leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-650 max-w-xl">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400 font-semibold">Brand name</span>
                <span className="font-bold">{product.brand}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400 font-semibold">Category ID</span>
                <span className="font-bold">{product.category?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400 font-semibold">Asset Status</span>
                <span className="font-bold text-teal-600">Available</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-400 font-semibold">Catalog ID</span>
                <span className="font-bold">#PROD-{product.id}</span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Reviews listing */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-slate-800 text-base">Customer Reviews</h3>
                {isReviewsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-20 rounded-xl animate-shimmer bg-slate-200" />
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                              {r.customerName?.charAt(0) || 'U'}
                            </div>
                            <span className="font-bold text-slate-700">{r.customerName || 'Anonymous User'}</span>
                          </div>
                          <span className="text-slate-400">{new Date(r.reviewDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              size={12}
                              className={starIndex < r.rating ? 'fill-current' : 'text-slate-200'}
                            />
                          ))}
                        </div>
                        <p className="text-slate-650 text-xs sm:text-sm leading-relaxed">{r.comment || (r as any).reviewText}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <p className="text-sm">No reviews found for this product. Be the first to review!</p>
                  </div>
                )}
              </div>

              {/* Add review form */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 h-fit space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Write a Review</h3>
                {isAuthenticated ? (
                  <form onSubmit={handleSubmit(handleReviewSubmit)} className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score Rating</label>
                      <select
                        className="w-full bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                        {...register('rating')}
                      >
                        <option value="5">5 Stars (Excellent)</option>
                        <option value="4">4 Stars (Good)</option>
                        <option value="3">3 Stars (Average)</option>
                        <option value="2">2 Stars (Poor)</option>
                        <option value="1">1 Star (Very Bad)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Review comments</label>
                      <textarea
                        rows={4}
                        placeholder="Write comments about your experience..."
                        className="w-full bg-white border border-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                        {...register('reviewText')}
                      />
                      {errors.reviewText && (
                        <span className="text-xs text-rose-500 font-semibold">{errors.reviewText.message}</span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={addReviewMutation.isPending}
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors disabled:opacity-50"
                    >
                      {addReviewMutation.isPending ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <MessageSquareCode size={14} />
                          <span>Publish Review</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 text-slate-400 space-y-3">
                    <p className="text-xs leading-relaxed">
                      You must be signed in as a registered customer to leave product reviews.
                    </p>
                    <Link
                      to="/login"
                      className="inline-block bg-blue-600 text-white hover:bg-blue-700 font-bold px-4 py-2 rounded-xl text-xs"
                    >
                      Login Portal
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Flame size={20} className="text-amber-500 animate-pulse" />
              <span>Similar Products</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">Customers who viewed this item also explored these products.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
