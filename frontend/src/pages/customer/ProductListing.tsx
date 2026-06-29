import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/axios';
import type { Product, Category, ApiResponse, PageResponse } from '../../types';
import { ProductCard } from '../../components/cards/ProductCard';
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  FilterX,
} from 'lucide-react';

export const ProductListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('categoryId') || '');
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');
  const [availability, setAvailability] = useState<string>(searchParams.get('available') || '');
  const [premiumOnly, setPremiumOnly] = useState<boolean>(searchParams.get('premium') === 'true');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'id,asc');
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '0', 10));
  const pageSize = 12;

  // Sync state from query parameters on load
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('categoryId') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setAvailability(searchParams.get('available') || '');
    setPremiumOnly(searchParams.get('premium') === 'true');
    setSortBy(searchParams.get('sort') || 'id,asc');
    setPage(parseInt(searchParams.get('page') || '0', 10));
  }, [searchParams]);

  // Fetch Categories
  const { data: categoriesResponse } = useQuery<ApiResponse<Category[]>>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      return response.data;
    },
  });

  const categories = categoriesResponse?.data || [];

  // Fetch paginated & filtered products
  const { data: productsResponse, isLoading, isError, refetch } = useQuery<ApiResponse<PageResponse<Product>>>({
    queryKey: ['products', selectedCategory, minPrice, maxPrice, availability, sortBy, page, searchQuery],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        size: pageSize,
        sort: sortBy,
      };

      if (selectedCategory) params.categoryId = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (availability) params.available = availability === 'true';
      if (searchQuery) params.name = searchQuery;

      const response = await api.get<ApiResponse<PageResponse<Product>>>('/products/filter', { params });
      return response.data;
    },
  });

  const pageData = productsResponse?.data;
  const products = (pageData?.content || []).filter(p => !premiumOnly || p.premium);
  const totalPages = pageData?.totalPages || 0;

  const updateFilters = (newParams: Record<string, string | number>) => {
    const current = Object.fromEntries(searchParams.entries());
    const updated = { ...current, ...newParams, page: 0 } as Record<string, any>; // Reset page on filter change
    
    // Clear empty parameters and stringify values for setSearchParams
    const stringifiedParams: Record<string, string> = {};
    Object.keys(updated).forEach((key) => {
      if (updated[key] !== undefined && updated[key] !== null && updated[key] !== '') {
        stringifiedParams[key] = updated[key].toString();
      }
    });

    setSearchParams(stringifiedParams);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setAvailability('');
    setPremiumOnly(false);
    setSortBy('id,asc');
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setSearchParams({
        ...Object.fromEntries(searchParams.entries()),
        page: newPage.toString(),
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Search & Header Title banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Product Catalog</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Browse and filter through our enterprise inventory records.
          </p>
        </div>

        {/* Real-time search form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateFilters({ search: searchQuery });
          }}
          className="relative max-w-sm w-full group"
        >
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 pl-4 pr-10 py-2.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-xs"
          />
          <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
            <Search size={18} />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs h-fit lg:sticky lg:top-28">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <SlidersHorizontal size={18} className="text-blue-600" />
              <span>Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Clear</span>
            </button>
          </div>

          {/* Categories Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => updateFilters({ categoryId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Fields */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Price range (Rs.)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={() => updateFilters({ minPrice })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <span className="text-slate-400 text-xs">—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={() => updateFilters({ maxPrice })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Availability Switches */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Availability</label>
            <select
              value={availability}
              onChange={(e) => updateFilters({ available: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Any Status</option>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>

          {/* Premium Collection Switch */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              id="premiumOnly"
              checked={premiumOnly}
              onChange={(e) => updateFilters({ premium: e.target.checked.toString() })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-100 cursor-pointer"
            />
            <label htmlFor="premiumOnly" className="text-xs font-bold text-slate-650 uppercase tracking-wider cursor-pointer select-none">
              Premium Items Only
            </label>
          </div>

          {/* Sort By Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sorting Option</label>
            <select
              value={sortBy}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="id,asc">Default ID</option>
              <option value="price,asc">Price: Low to High</option>
              <option value="price,desc">Price: High to Low</option>
              <option value="name,asc">Alphabetical: A-Z</option>
            </select>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 rounded-2xl animate-shimmer bg-slate-200" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16 bg-white border border-rose-100 rounded-3xl text-rose-500 max-w-md mx-auto space-y-4">
              <FilterX size={48} className="mx-auto" />
              <h3 className="font-bold text-lg">Failed to load catalog</h3>
              <p className="text-xs text-rose-400">Please verify connection parameters and try again.</p>
              <button
                onClick={() => refetch()}
                className="bg-rose-500 text-white font-semibold px-6 py-2 rounded-xl text-xs"
              >
                Retry Request
              </button>
            </div>
          ) : products.length > 0 ? (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8 border-t border-slate-100">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-semibold text-slate-500">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl space-y-4">
              <FilterX size={52} className="mx-auto text-slate-300 stroke-[1.5]" />
              <h3 className="text-lg font-bold text-slate-800">No products found</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                No inventory records matched your filters. Try resetting search fields or adjusting price range selections.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-md transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
