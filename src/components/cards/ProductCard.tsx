import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import type { Product } from '../../types';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlist } = useWishlist();

  const isFav = isInWishlist(product.id);

  // Retrieve the primary image or a fallback
  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      if (primary) return primary.imageUrl;
      return product.images[0].imageUrl;
    }
    // Standard placeholder if no images
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      const wishlistItem = wishlist?.items.find((item) => item.productId === product.id);
      if (wishlistItem) {
        removeFromWishlist(wishlistItem.id);
      }
    } else {
      addToWishlist(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  // Safe rating average calculation
  const rating = product.averageRating || 4.2;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg hover:shadow-slate-100/50 transition-all overflow-hidden flex flex-col group h-full"
    >
      {/* Product Image Area */}
      <Link to={`/products/${product.id}`} className="relative block pt-[100%] overflow-hidden bg-slate-50">
        {/* Wishlist Toggle Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
            isFav
              ? 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100'
              : 'bg-white/80 backdrop-blur-xs border-slate-150 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
          }`}
          aria-label="Toggle Wishlist"
        >
          <motion.div whileTap={{ scale: 1.3 }}>
            <Heart size={18} className={isFav ? 'fill-current stroke-[2.5]' : 'stroke-[2]'} />
          </motion.div>
        </button>

        {/* Stock Badge */}
        {!product.inventory?.inStock && (
          <span className="absolute bottom-3 left-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase z-10 shadow-sm">
            Sold Out
          </span>
        )}
        {product.inventory?.inStock && product.inventory.quantity <= 10 && (
          <span className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase z-10 shadow-sm">
            Only {product.inventory.quantity} Left
          </span>
        )}

        <img
          src={getProductImage()}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Apply image fallback
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
          }}
        />
      </Link>

      {/* Product Details Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Brand & Rating */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold tracking-wider uppercase text-[10px]">{product.brand}</span>
            <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
              <Star size={11} className="fill-current" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors text-sm sm:text-base leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium">Grand Total</span>
            <span className="font-extrabold text-slate-800 text-base sm:text-lg">
              Rs. {product.price.toLocaleString('en-IN')}
            </span>
          </div>

          {product.inventory?.inStock ? (
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer"
              aria-label="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
          ) : (
            <button
              disabled
              className="bg-slate-100 text-slate-400 p-2.5 rounded-xl cursor-not-allowed border border-slate-200"
              aria-label="Out of stock"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
