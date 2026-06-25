import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { Trash2, ShoppingCart, Heart, Search } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { wishlist, isLoading, removeFromWishlist, moveToCart } = useWishlist();
  const [searchTerm, setSearchTerm] = useState('');

  const items = wishlist?.items || [];

  const filteredItems = items.filter((item) =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductImage = (imageUrl?: string) => {
    return imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
  };

  if (isLoading && !wishlist) {
    return (
      <div className="space-y-6 animate-pulse py-6">
        <div className="h-8 w-48 bg-slate-200 rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Wishlist</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Keep track of items you like and move them to cart anytime.</p>
        </div>

        {items.length > 0 && (
          <div className="relative max-w-xs w-full group">
            <input
              type="text"
              placeholder="Search wishlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-4 pr-10 py-2.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-xs"
            />
            <button className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </button>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Image */}
                <Link to={`/products/${item.productId}`} className="relative block pt-[100%] overflow-hidden bg-slate-50">
                  <img
                    src={getProductImage(item.productImage)}
                    alt={item.productName}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                </Link>

                {/* Details */}
                <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <Link to={`/products/${item.productId}`}>
                      <h3 className="font-bold text-slate-700 hover:text-blue-600 transition-colors text-sm sm:text-base leading-snug line-clamp-2">
                        {item.productName}
                      </h3>
                    </Link>
                    <span className="font-extrabold text-slate-800 text-sm sm:text-base block">
                      Rs. {(item.price || 0).toLocaleString('en-IN')}
                    </span>

                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-50">
                    <button
                      onClick={() => moveToCart(item.productId)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      <ShoppingCart size={13} />
                      <span>Move to Cart</span>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-2 border border-slate-200 hover:border-rose-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <p className="text-sm">No items in your wishlist match "{searchTerm}"</p>
          </div>
        )
      ) : (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl max-w-lg mx-auto space-y-5">
          <Heart size={56} className="mx-auto text-slate-350 stroke-[1.5]" />
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-850">Your wishlist is empty</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
              Find items you love while exploring our catalog and tap the heart icon to save them here!
            </p>
          </div>
          <Link
            to="/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full text-sm shadow-md transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};
