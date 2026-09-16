import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../api/products";
import { useCartStore } from '../store/cartStore';
import { formatMoney } from '../lib/utils';

export const CartPage = () => {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const productsQuery = useQuery({
    queryKey: ["cart-products"],
    queryFn: () => fetchProducts({ include_unavailable: true }),
  });
  
  // Design constants
  const signatureGradient = {
    background: 'linear-gradient(135deg, #b61321 0%, #ff7670 100%)',
  };

  const materialIconFill = {
    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  const removeItem = (lineKey) => {
    updateQuantity(lineKey, 0);
  };

  return (
    <div className="bg-slate-50 font-body text-slate-900 min-h-screen pb-32">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-900 border border-slate-100 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-sm">arrow_back_ios_new</span>
        </button>
        <h1 className="text-xs sm:text-sm font-black font-headline tracking-tight uppercase">Your Basket</h1>
        <button 
          onClick={clearCart}
          className="text-rose-600 font-black text-[10px] uppercase tracking-widest hover:opacity-75"
        >
          Clear
        </button>
      </header>

      <main className="pt-20 px-4 sm:px-6 max-w-2xl mx-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <span className="material-symbols-outlined text-3xl sm:text-4xl">shopping_cart</span>
            </div>
            <h3 className="font-black text-slate-900 mb-1.5 text-base sm:text-lg">Your Basket is Empty</h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium px-6 mb-6">Add items from the marketplace to get started</p>
            <button 
              onClick={() => navigate('/market')}
              style={signatureGradient}
              className="px-6 sm:px-8 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <section className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <div key={item.lineKey} className="bg-white rounded-3xl p-3.5 sm:p-4 flex gap-3.5 sm:gap-4 shadow-sm border border-slate-100 relative group overflow-hidden">
                  {/* Product Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                    {(() => {
                      const product = productsQuery.data?.find((productItem) => productItem.id === item.productId);
                      const imageSrc = item.productImage || product?.image_urls?.[0] || product?.image_url || item.vendorLogo;
                      return imageSrc ? (
                        <img src={imageSrc} alt={item.productName} className="w-full h-full object-cover" />
                      ) : null;
                    })()}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col justify-between py-0.5 flex-grow min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-xs sm:text-sm leading-tight truncate text-slate-900">{item.productName}</h3>
                        <button 
                          onClick={() => removeItem(item.lineKey)}
                          className="text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-lg">delete_outline</span>
                        </button>
                      </div>
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-0.5 truncate">{item.vendorName}</p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="font-black text-base sm:text-lg text-slate-900">{formatMoney(item.unitPrice * item.quantity)}</span>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-slate-50 rounded-xl p-0.5 border border-slate-100">
                        <button 
                          onClick={() => updateQuantity(item.lineKey, item.quantity - 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm active:scale-75 transition-transform"
                        >
                          <span className="material-symbols-outlined text-xs sm:text-sm">remove</span>
                        </button>
                        <span className="px-2.5 font-black text-xs">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.lineKey, item.quantity + 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm active:scale-75 transition-transform"
                        >
                          <span className="material-symbols-outlined text-xs sm:text-sm">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Order Summary */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 mb-6">
              <h2 className="font-headline text-sm sm:text-base font-black mb-3 uppercase tracking-tight text-slate-900">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900 text-sm sm:text-base">{formatMoney(subtotal)}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Fees and taxes calculated at checkout</p>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Floating Checkout Footer */}
      {cartItems.length > 0 && (
        <footer className="fixed bottom-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 sm:px-8 py-3.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <span className="text-slate-400 text-[9px] font-black uppercase tracking-tighter block leading-none mb-1">Subtotal</span>
                <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">{formatMoney(subtotal)}</span>
              </div>
              <div className="text-right flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-500 text-base" style={materialIconFill}>shield</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase leading-tight">Secure<br/>Checkout</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              style={signatureGradient}
              className="w-full h-12 sm:h-14 rounded-2xl flex items-center justify-center gap-2 text-white shadow-lg shadow-rose-200 active:scale-[0.98] transition-all group"
            >
              <span className="font-black uppercase tracking-widest text-xs sm:text-sm">Proceed to Checkout</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};