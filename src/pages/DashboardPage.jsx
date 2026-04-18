import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/products';
import { fetchVendors } from '../api/vendors';
import { useCartStore } from '../store/cartStore';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);
  const cartItems = useCartStore((state) => state.items);
  const addToCartStore = useCartStore((state) => state.addItem);

  // Design constants
  const signatureGradient = {
    background: 'linear-gradient(135deg, #b61321 0%, #ff7670 100%)',
  };

  const materialIconFill = {
    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
  };

  // Promotional Banners
  const banners = [
    { id: 1, title: "Summer Cravings", subtitle: "Up to 40% off on cold drinks", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", color: "from-orange-500/80" },
    { id: 2, title: "Fresh Groceries", subtitle: "Delivered in 15 minutes", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80", color: "from-green-600/80" },
    { id: 3, title: "New Fashion Drop", subtitle: "Check out the latest trends", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80", color: "from-purple-600/80" },
  ];

  // Auto-slide effect for banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch products from backend
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts({ limit: 6 }),
  });

  // Fetch vendors from backend
  const vendorsQuery = useQuery({
    queryKey: ['vendors'],
    queryFn: () => fetchVendors({ limit: 2 }),
  });

  const products = productsQuery.data || [];
  const vendors = vendorsQuery.data || [];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const shareProduct = (e, product) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name}`,
        url: window.location.href,
      });
    } else {
      const url = `${window.location.origin}/product/${product.id}`;
      navigator.clipboard.writeText(url);
      alert('Product link copied to clipboard!');
    }
  };

  const services = [
    { name: 'Food', icon: 'restaurant', color: 'text-rose-500', bg: 'bg-rose-50', link: '/category/food', tag: 'Cravings' },
    { name: 'Pharmacy', icon: 'medical_services', color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/category/pharmacy', tag: 'Health' },
    { name: 'Grocery', icon: 'shopping_basket', color: 'text-amber-500', bg: 'bg-amber-50', link: '/category/grocery', tag: 'Fresh' },
    { name: 'Fashion', icon: 'apparel', color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/category/fashion', tag: 'Trends' },
    { name: 'Electronics', icon: 'devices', color: 'text-blue-500', bg: 'bg-blue-50', link: '/category/electronics', tag: 'Tech' },
  ];

  return (
    <div className="bg-slate-50 font-body text-on-surface antialiased min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-slate-100">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600">location_on</span>
            <span className="text-xl font-black text-slate-900 font-headline tracking-tight">QuickDrop</span>
          </div>
          <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 active:scale-90 transition-transform">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <main className="pt-20">
        {/* Banner Slideshow */}
        <section className="px-6 mb-8 mt-2">
          <div className="relative h-48 w-full overflow-hidden rounded-[2rem] shadow-lg">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
              >
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} to-transparent flex flex-col justify-center px-8 text-white`}>
                  <h2 className="text-2xl font-black font-headline mb-1">{banner.title}</h2>
                  <p className="text-sm font-medium opacity-90">{banner.subtitle}</p>
                  <button className="mt-4 bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-full w-fit active:scale-95 transition-transform">
                    Shop Now
                  </button>
                </div>
              </div>
            ))}
            {/* Dots */}
            <div className="absolute bottom-4 left-8 flex gap-2">
              {banners.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBanner ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="px-6 mb-8">
          <div className="bg-white rounded-2xl flex items-center px-4 py-4 shadow-sm border border-slate-100 transition-focus-within ring-rose-500/20 focus-within:ring-4">
            <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-slate-900 placeholder:text-slate-400 outline-none text-sm font-medium"
              placeholder="Search for food, grocery or brands"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Discover Services Slider */}
        <section className="mb-10">
          <div className="px-6 flex justify-between items-end mb-4">
            <h2 className="font-headline text-xl font-black text-slate-900 tracking-tight">Discover Services</h2>
            <Link to="/categories" className="text-rose-600 font-bold text-xs uppercase tracking-wider">View All</Link>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-4 px-6 snap-x">
            {services.map((service, i) => (
              <Link 
                to={service.link} 
                key={i}
                className="flex-shrink-0 w-28 snap-start flex flex-col items-center group"
              >
                <div className={`${service.bg} w-20 h-20 rounded-3xl flex items-center justify-center mb-3 group-active:scale-90 transition-transform shadow-sm`}>
                  <span className={`material-symbols-outlined text-3xl ${service.color}`} style={materialIconFill}>
                    {service.icon}
                  </span>
                </div>
                <span className="font-bold text-slate-800 text-sm">{service.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{service.tag}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="px-6 mb-10">
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="font-headline text-xl font-black text-slate-900">Featured Products</h2>
            {productsQuery.isLoading ? (
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md animate-pulse">Loading...</span>
            ) : (
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                {filteredProducts.length} Results
              </span>
            )}
          </div>

          {productsQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-rose-600 rounded-full"></div>
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
                  <div className="relative h-44 w-full mb-4 overflow-hidden rounded-[2rem]">
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

        {/* Top Rated Vendors */}
        {!vendorsQuery.isLoading && vendors.length > 0 && (
          <section className="px-6 mb-10">
            <div className="flex justify-between items-end mb-6">
              <h2 className="font-headline text-xl font-black text-slate-900 tracking-tight">Top Rated</h2>
              <Link to="/vendors" className="text-rose-600 font-bold text-xs uppercase tracking-wider">View All</Link>
            </div>
            <div className="flex flex-col gap-6">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="bg-white rounded-[2rem] overflow-hidden flex flex-col shadow-sm border border-slate-100 group active:scale-[0.98] transition-transform duration-200 cursor-pointer" onClick={() => navigate(`/vendor/${vendor.id}`)}>
                  <div className="h-44 relative bg-slate-200">
                    {vendor.logo_url && (
                      <img alt={vendor.name} className="w-full h-full object-cover" src={vendor.logo_url} />
                    )}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-amber-500 text-sm" style={materialIconFill}>star</span>
                      <span className="text-xs font-black text-slate-900">{vendor.rating || 4.5}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-slate-900 text-sm mb-1">{vendor.name}</h3>
                    <p className="text-[12px] text-slate-600 font-medium mb-3">{vendor.category || 'Restaurant'}</p>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>{vendor.delivery_time || '20-30'} min</span>
                      <span className="text-emerald-600">Free Delivery</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-8 pt-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <Link to="/dashboard" className="flex flex-col items-center text-rose-600 flex-1">
          <span className="material-symbols-outlined text-2xl" style={materialIconFill}>home</span>
          <span className="text-[10px] font-black uppercase mt-1">Home</span>
        </Link>
        <Link to="/market" className="flex flex-col items-center text-slate-400 hover:text-rose-600 transition-colors flex-1">
          <span className="material-symbols-outlined text-2xl">storefront</span>
          <span className="text-[10px] font-black uppercase mt-1">Market</span>
        </Link>
        <button onClick={() => navigate('/ride')} className="flex flex-col items-center text-slate-400 hover:text-rose-600 transition-colors flex-1">
          <span className="material-symbols-outlined text-2xl">two_wheeler</span>
          <span className="text-[10px] font-black uppercase mt-1">Ride</span>
        </button>
        <Link to="/orders" className="flex flex-col items-center text-slate-400 hover:text-rose-600 transition-colors flex-1">
          <span className="material-symbols-outlined text-2xl">receipt_long</span>
          <span className="text-[10px] font-black uppercase mt-1">Orders</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-slate-400 hover:text-rose-600 transition-colors flex-1">
          <span className="material-symbols-outlined text-2xl">person</span>
          <span className="text-[10px] font-black uppercase mt-1">Profile</span>
        </Link>
      </nav>

      {/* Cart FAB */}
      <button onClick={() => navigate('/cart')} style={signatureGradient} className="fixed bottom-28 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform z-40 border-4 border-white">
        <span className="material-symbols-outlined text-2xl">shopping_cart</span>
        <div className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
          {cartItems.length}
        </div>
      </button>
    </div>
  );
};