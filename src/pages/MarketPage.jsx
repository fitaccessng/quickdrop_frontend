import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/products';
import { useCartStore } from '../store/cartStore';

export const MarketPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);
  const cartItems = useCartStore((state) => state.items);
  const addToCartStore = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  // Design constants
  const signatureGradient = {
    background: 'linear-gradient(135deg, #b61321 0%, #ff7670 100%)',
  };

  const materialIconFill = {
    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
  };

  // Fetch products from backend
  const productsQuery = useQuery({
    queryKey: ['products', activeCategory],
    queryFn: () => fetchProducts({ category: activeCategory === 'All' ? undefined : activeCategory }),
  });

  const categories = ['All', 'Food', 'Grocery', 'Fashion', 'Pharmacy', 'Electronics', 'Beauty'];
  const products = productsQuery.data || [];

  // Filter by search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (e, productId) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (e, product) => {
    e.stopPropagation();
    // Get first vendor as default, ideally this should come from product data
    const defaultVendor = { id: product.vendor_id || 1, name: 'Vendor', logo_url: '' };
    addToCartStore(product, defaultVendor);
  };

  return (
    <div className="bg-slate-50 font-body text-slate-900 antialiased min-h-screen pb-32">
      {/* Fixed Navigation Header */}
      <header className="bg-white/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-900 active:scale-90 transition-transform border border-slate-100"
          >
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          
          <h1 className="text-sm font-black font-headline tracking-tight">Marketplace</h1>
          
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-900 active:scale-90 transition-transform border border-slate-100">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>

        {/* Refined Filter System */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 px-6 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${
                activeCategory === cat 
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="pt-40 px-6">
        {/* Search Bar - Slightly deeper shadow */}
        <section className="mb-8 mt-4">
          <div className="bg-white rounded-[1.5rem] flex items-center px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 focus-within:ring-4 ring-rose-500/10 transition-all">
            <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-slate-900 placeholder:text-slate-400 outline-none text-sm font-semibold"
              placeholder={`Find the best ${activeCategory.toLowerCase()}...`}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Product Grid Container */}
        <section>
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="font-headline text-2xl font-black text-slate-900">
              {activeCategory === 'All' ? 'Everyday Essentials' : activeCategory}
            </h2>
            {productsQuery.isLoading ? (
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md animate-pulse">Loading...</span>
            ) : (
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                {filteredProducts.length} Results
              </span>
            )}
          </div>

          {productsQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-rose-600 rounded-full"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">search_off</span>
              <p className="text-slate-400 font-bold">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white rounded-[2.5rem] p-3 shadow-sm border border-slate-100 flex flex-col active:scale-[0.97] transition-all duration-300 group text-left cursor-pointer hover:shadow-md"
                >
                  {/* Visual Area */}
                  <div className="relative h-44 w-full mb-4 overflow-hidden rounded-[2rem] bg-slate-200">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 right-3">
                      <button 
                        onClick={(e) => toggleFavorite(e, product.id)}
                        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-75 transition-transform"
                        style={{
                          color: favorites.includes(product.id) ? '#dc2626' : '#9ca3af'
                        }}
                      >
                        <span className="material-symbols-outlined text-xl" style={materialIconFill}>
                          {favorites.includes(product.id) ? 'favorite' : 'favorite'}
                        </span>
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <span className="material-symbols-outlined text-amber-400 text-[14px]" style={materialIconFill}>star</span>
                      <span className="text-[10px] font-black text-white">{product.rating || 4.5}</span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="px-2 flex-grow flex flex-col">
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">{product.category || 'Product'}</span>
                    <h3 className="font-bold text-sm text-slate-800 leading-tight mb-3 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="mt-auto flex justify-between items-center pb-1">
                      <span className="text-lg font-black text-slate-900">${product.price}</span>
                      <button 
                        onClick={(e) => addToCart(e, product)}
                        style={signatureGradient}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200 active:scale-90 transition-all hover:rotate-90"
                      >
                        <span className="material-symbols-outlined text-xl font-bold">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Persistent Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-8 pt-4 bg-white/95 backdrop-blur-2xl border-t border-slate-100 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <Link to="/dashboard" className="flex flex-col items-center text-slate-400 group flex-1">
          <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">home</span>
          <span className="text-[10px] font-black uppercase mt-1">Home</span>
        </Link>
        <Link to="/market" className="flex flex-col items-center text-rose-600 flex-1">
          <span className="material-symbols-outlined text-2xl" style={materialIconFill}>storefront</span>
          <span className="text-[10px] font-black uppercase mt-1">Market</span>
        </Link>
        <button onClick={() => navigate('/ride')} className="flex flex-col items-center text-slate-400 group flex-1 hover:text-rose-600 transition-colors">
          <span className="material-symbols-outlined text-2xl">two_wheeler</span>
          <span className="text-[10px] font-black uppercase mt-1">Ride</span>
        </button>
        <Link to="/orders" className="flex flex-col items-center text-slate-400 group flex-1">
          <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">receipt_long</span>
          <span className="text-[10px] font-black uppercase mt-1">Orders</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-slate-400 group flex-1">
          <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">person</span>
          <span className="text-[10px] font-black uppercase mt-1">Profile</span>
        </Link>
      </nav>

      {/* Cart Float */}
      <button 
        onClick={() => navigate('/cart')}
        style={signatureGradient} 
        className="fixed bottom-28 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform z-40 border-4 border-white"
      >
        <span className="material-symbols-outlined text-2xl">shopping_cart</span>
        <div className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
          {cartItems.length}
        </div>
      </button>
    </div>
  );
};