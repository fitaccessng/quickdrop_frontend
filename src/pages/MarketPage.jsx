import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/products';
import { fetchServiceCategories } from '../api/system';
import { fetchVendors } from '../api/vendors';
import { useCartStore } from '../store/cartStore';

export const MarketPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);
  const cartItems = useCartStore((state) => state.items);
  const addToCartStore = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  const materialIconFill = {
    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
  };

  // Fetch products from backend
  const productsQuery = useQuery({
    queryKey: ['products', activeCategory],
    queryFn: () => fetchProducts({ category: activeCategory === 'All' ? undefined : activeCategory }),
  });
  const vendorsQuery = useQuery({
    queryKey: ['market-vendors'],
    queryFn: () => fetchVendors({}),
  });
  const categoriesQuery = useQuery({
    queryKey: ['market-categories'],
    queryFn: fetchServiceCategories,
  });

  const categories = ['All Drops', ...(categoriesQuery.data || []).map((category) => category.name)];
  const products = productsQuery.data || [];
  const vendorMap = new Map((vendorsQuery.data || []).map((vendor) => [vendor.id, vendor]));

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
    const vendor = vendorMap.get(product.vendor_id) || {
      id: product.vendor_id,
      name: `Vendor #${product.vendor_id}`,
      logo_url: '',
      city: '',
      category: product.category,
    };
    addToCartStore(product, vendor);
  };

  return (
    <div className="bg-[#f7f9fb] font-body-md text-[#191c1e] min-h-screen antialiased flex flex-col items-center">
      <div className="w-full max-w-xl md:max-w-4xl lg:max-w-6xl min-h-screen flex flex-col bg-[#f7f9fb] relative shadow-[0_1px_8px_rgba(0,0,0,0.04)]">

        {/* Fixed Header */}
        <header className="fixed top-0 w-full max-w-xl md:max-w-4xl lg:max-w-6xl z-50 bg-[#f7f9fb]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#006847] animate-pulse"></span>
                <span className="font-semibold text-[16px] text-[#191c1e]">Food &amp; Beverages</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/cart')}
                className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#e11d48] text-[#fffaf9] font-bold text-[10px] rounded-full flex items-center justify-center shadow-sm">
                  {cartItems.length}
                </span>
              </button>
            
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full pt-20 pb-28 px-4 md:px-6 flex-1 bg-[#f7f9fb]">
          <div className="flex flex-col w-full">

            {/* Delivery Subheader & Quick Search */}
            <section className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between px-1">
               
              </div>

              {/* Search Input Bar */}
              <div className="relative w-full flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-[20px] text-[#565e74]">search</span>
                <input
                  className="w-full h-12 pl-12 pr-16 rounded-full bg-white shadow-sm text-sm text-[#191c1e] placeholder:text-[#565e74]/60 focus:outline-none focus:ring-2 focus:ring-[#e11d48]/30 transition-all font-semibold"
                  placeholder={`Find best ${activeCategory.toLowerCase()}...`}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
              </div>

              {/* Horizontal Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat || (activeCategory === 'All' && cat === 'All Drops');
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat === 'All Drops' ? 'All' : cat)}
                      className={`px-4 py-2 rounded-full font-semibold text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-all ${
                        isActive
                          ? 'bg-[#2d3133] text-[#eff1f3]'
                          : 'bg-white text-[#565e74] hover:text-[#191c1e]'
                      }`}
                      type="button"
                    >
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Marketplace Main Grid */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#565e74] font-bold">Featured Catalog</span>
                  <h2 className="text-xl font-bold text-[#191c1e]">
                    {activeCategory === 'All' ? 'Everyday Curations' : activeCategory}
                  </h2>
                </div>
                {productsQuery.isLoading ? (
                  <span className="text-[#565e74] text-[10px] font-bold uppercase tracking-widest bg-white px-2 py-1 rounded-md animate-pulse">Loading...</span>
                ) : (
                  <span className="text-[#565e74] text-[10px] font-bold uppercase tracking-widest bg-white px-2 py-1 rounded-md shadow-sm">
                    {filteredProducts.length} Results
                  </span>
                )}
              </div>

              {productsQuery.isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-[#e6e8ea] border-t-[#e11d48] rounded-full"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined text-4xl text-[#d8dadc] mb-2">search_off</span>
                  <p className="text-[#565e74] font-bold text-sm">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => {
                    const isFav = favorites.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="rounded-2xl bg-white p-3 shadow-sm flex flex-col gap-2 hover:-translate-y-1 transition-transform group cursor-pointer"
                      >
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#f2f4f6]">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            src={product.image_url || product.image_urls?.[0] || "/favicon.svg"}
                            alt={product.name}
                          />
                          <button
                            onClick={(e) => toggleFavorite(e, product.id)}
                            className="favorite-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-colors shadow-sm"
                            style={{ color: isFav ? '#dc2626' : '#5c3f40' }}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]" style={materialIconFill}>
                              favorite
                            </span>
                          </button>
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#2d3133]/85 backdrop-blur-md text-[#eff1f3] text-[10px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-amber-400" style={materialIconFill}>star</span>
                            <span>{product.rating || 4.9}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase font-bold text-[#e11d48]">
                            {product.category || 'Drop'}
                          </span>
                          <h3 className="text-sm font-bold text-[#191c1e] line-clamp-1">{product.name}</h3>
                          <p className="text-xs text-[#565e74] truncate">
                            {vendorMap.get(product.vendor_id)?.name || 'Local Merchant'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-base font-bold text-[#191c1e]">${product.price}</span>
                          </div>
                          <button
                            onClick={(e) => addToCart(e, product)}
                            className="quick-add-btn w-9 h-9 rounded-full bg-[#e11d48] text-[#fffaf9] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        </main>

        {/* Persistent Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl md:max-w-4xl lg:max-w-6xl z-50 flex justify-around items-center px-2 pb-6 pt-3 bg-white/95 backdrop-blur-2xl border-t border-[#e6e8ea] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
          <Link to="/dashboard" className="flex flex-col items-center text-[#565e74] group flex-1">
            <span className="material-symbols-outlined text-2xl group-hover:text-[#b80035] transition-colors">home</span>
            <span className="text-[10px] font-bold uppercase mt-1">Home</span>
          </Link>
          <Link to="/market" className="flex flex-col items-center text-[#b80035] flex-1">
            <span className="material-symbols-outlined text-2xl" style={materialIconFill}>storefront</span>
            <span className="text-[10px] font-bold uppercase mt-1">Market</span>
          </Link>
          <button onClick={() => navigate('/ride')} className="flex flex-col items-center text-[#565e74] group flex-1 hover:text-[#b80035] transition-colors">
            <span className="material-symbols-outlined text-2xl">two_wheeler</span>
            <span className="text-[10px] font-bold uppercase mt-1">Ride</span>
          </button>
          <Link to="/orders" className="flex flex-col items-center text-[#565e74] group flex-1">
            <span className="material-symbols-outlined text-2xl group-hover:text-[#b80035] transition-colors">receipt_long</span>
            <span className="text-[10px] font-bold uppercase mt-1">Orders</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-[#565e74] group flex-1">
            <span className="material-symbols-outlined text-2xl group-hover:text-[#b80035] transition-colors">person</span>
            <span className="text-[10px] font-bold uppercase mt-1">Profile</span>
          </Link>
        </nav>

      </div>
    </div>
  );
};
