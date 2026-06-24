import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Truck } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, isLoading, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleQtyChange = (productId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty >= 1) {
      updateCartItem(productId, newQty);
    }
  };

  const handleRemove = (cartItemId: number) => {
    removeFromCart(cartItemId);
  };

  // Calculations
  const subtotal = cart?.totalPrice || 0;
  // Shipping fee is flat Rs. 100, free if order total > 2000
  const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 100;
  // 18% GST calculation
  const tax = parseFloat((subtotal * 0.18).toFixed(2));
  const grandTotal = subtotal + shipping + tax;

  const getProductImage = (imageUrl?: string) => {
    return imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
  };

  if (isLoading && !cart) {
    return (
      <div className="space-y-6 animate-pulse py-6">
        <div className="h-8 w-48 bg-slate-200 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Shopping Cart</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Review the selected products before proceeding to checkout.</p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-xs flex gap-4 items-center"
              >
                {/* Image */}
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={getProductImage(item.productImage)}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                </div>

                {/* Info & Quantity controls */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-700 text-sm sm:text-base leading-snug truncate">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">
                      Rs. {item.price.toLocaleString('en-IN')} each
                    </p>
                  </div>

                  <div className="flex items-center gap-4.5 flex-shrink-0">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-inner">
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity, -1)}
                        className="px-2.5 py-1 hover:bg-slate-100 text-slate-500 font-bold transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-3.5 font-bold text-slate-800 text-xs">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity, 1)}
                        className="px-2.5 py-1 hover:bg-slate-100 text-slate-500 font-bold transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium block uppercase">Total</span>
                      <span className="font-extrabold text-slate-850 text-sm sm:text-base">
                        Rs. {item.subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs h-fit space-y-6">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Order Summary</h3>

            <div className="space-y-3.5 text-sm text-slate-650">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-800">Rs. {subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-bold text-slate-800">
                  {shipping === 0 ? <span className="text-emerald-600">FREE</span> : `Rs. ${shipping}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% Flat)</span>
                <span className="font-bold text-slate-800">Rs. {tax.toLocaleString('en-IN')}</span>
              </div>
              
              {shipping > 0 && (
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-50 flex gap-2 text-xs text-blue-700 leading-normal">
                  <Truck size={14} className="flex-shrink-0 mt-0.5" />
                  <p>Add <strong>Rs. {(2000 - subtotal).toLocaleString('en-IN')}</strong> more for free delivery!</p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 flex justify-between text-base font-black text-slate-800">
                <span>Grand Total</span>
                <span className="text-lg">Rs. {grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all duration-150 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl max-w-lg mx-auto space-y-5">
          <ShoppingBag size={56} className="mx-auto text-slate-350 stroke-[1.5]" />
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-850">Your cart is empty</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
              Looks like you haven't added any products to your shopping cart yet. Let's start shopping!
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
