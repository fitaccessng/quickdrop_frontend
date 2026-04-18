import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export const CartPage = () => {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  
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
    <div className="bg-slate-50 font-body text-slate-900 min-h-screen pb-44">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-900 border border-slate-100 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="text-sm font-black font-headline tracking-tight uppercase">Your Basket</h1>
        <button 
          onClick={clearCart}
          className="text-rose-600 font-black text-[10px] uppercase tracking-widest hover:opacity-70"
        >
          Clear
        </button>
      </header>

      <main className="pt-24 px-6">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-32">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <span className="material-symbols-outlined text-4xl">shopping_cart</span>
            </div>
            <h3 className="font-black text-slate-900 mb-2">Your Basket is Empty</h3>
            <p className="text-sm text-slate-400 font-medium text-center px-10 mb-6">Add items from the marketplace to get started</p>
            <button 
              onClick={() => navigate('/market')}
              style={signatureGradient}
              className="px-8 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <>
        {/* Cart Items List */}
        <section className="space-y-4 mb-8">
          {cartItems.map((item) => (
            <div key={item.lineKey} className="bg-white rounded-[2rem] p-4 flex gap-4 shadow-sm border border-slate-100 relative group overflow-hidden">
              {/* Product Thumbnail */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                {item.vendorLogo && (
                  <img src={item.vendorLogo} alt={item.productName} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-between py-1 flex-grow">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm leading-tight max-w-[120px]">{item.productName}</h3>
                    <button 
                      onClick={() => removeItem(item.lineKey)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">delete_outline</span>
                    </button>
                  </div>
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-1">{item.vendorName}</p>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="font-black text-lg">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                    <button 
                      onClick={() => updateQuantity(item.lineKey, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm active:scale-75 transition-transform"
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="px-3 font-black text-xs">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.lineKey, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm active:scale-75 transition-transform"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Order Summary */}
        <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 mb-10">
          <h2 className="font-headline text-lg font-black mb-4 uppercase tracking-tight">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Subtotal</span>
              <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Fees and taxes calculated at checkout</p>
          </div>
        </section>
          </>
        )}
      </main>

      {/* Floating Checkout Footer */}
      {cartItems.length > 0 && (
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-2xl border-t border-slate-100 px-8 pt-6 pb-10">
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter block">Subtotal</span>
            <span className="text-xl font-black text-slate-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="text-right flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500" style={materialIconFill}>shield</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Secure<br/>Checkout</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/checkout')}
          style={signatureGradient}
          className="w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-white shadow-2xl shadow-rose-200 active:scale-[0.98] transition-all group"
        >
          <span className="font-black uppercase tracking-widest">Proceed to Checkout</span>
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </footer>
      )}
    </div>
  );
};