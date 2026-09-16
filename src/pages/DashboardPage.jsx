import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/products';
import { fetchServiceCategories } from '../api/system';
import { fetchVendors } from '../api/vendors';
import { useCartStore } from '../store/cartStore';
import { QuickDropLogo } from '../components/branding/QuickDropLogo';

const CATEGORY_THEMES = [
  { matcher: ["food", "restaurant", "beverage"], icon: "restaurant", color: "text-rose-500", bg: "bg-rose-50", tag: "Cravings" },
  { matcher: ["pharmacy", "health", "medical"], icon: "medical_services", color: "text-emerald-500", bg: "bg-emerald-50", tag: "Health" },
  { matcher: ["grocery", "grocer", "market"], icon: "shopping_basket", color: "text-amber-500", bg: "bg-amber-50", tag: "Fresh" },
  { matcher: ["fashion", "apparel", "clothing", "beauty"], icon: "apparel", color: "text-indigo-500", bg: "bg-indigo-50", tag: "Trends" },
  { matcher: ["electronics", "tech", "device"], icon: "devices", color: "text-blue-500", bg: "bg-blue-50", tag: "Tech" },
  { matcher: ["courier", "delivery", "logistics"], icon: "local_shipping", color: "text-cyan-500", bg: "bg-cyan-50", tag: "Dispatch" },
];

const getCategoryTheme = (name = "") => {
  const normalized = String(name).toLowerCase();
  return CATEGORY_THEMES.find((item) => item.matcher.some((keyword) => normalized.includes(keyword))) || {
    icon: "category",
    color: "text-slate-500",
    bg: "bg-slate-100",
    tag: "Browse",
  };
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);
  const cartItems = useCartStore((state) => state.items);
  const addToCartStore = useCartStore((state) => state.addItem);

  const signatureGradient = {
    background: 'linear-gradient(135deg, #b61321 0%, #ff7670 100%)',
  };

  const materialIconFill = {
    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
  };

  const banners = [
    { id: 1, title: "Summer Cravings", subtitle: "Up to 40% off on cold drinks", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", color: "from-orange-500/90" },
    { id: 2, title: "Fresh Groceries", subtitle: "Delivered in 15 minutes", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80", color: "from-emerald-600/90" },
    { id: 3, title: "New Fashion Drop", subtitle: "Check out the latest trends", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80", color: "from-purple-600/90" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts({ limit: 8 }),
  });

  const vendorsQuery = useQuery({
    queryKey: ['vendors'],
    queryFn: () => fetchVendors({ limit: 4 }),
  });

  const categoriesQuery = useQuery({
    queryKey: ["service-categories"],
    queryFn: fetchServiceCategories,
  });

  const products = productsQuery.data || [];
  const vendors = vendorsQuery.data || [];
  const categories = categoriesQuery.data || [];
  const vendorMap = new Map(vendors.map((vendor) => [vendor.id, vendor]));

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
    const vendor = vendorMap.get(product.vendor_id) || {
      id: product.vendor_id,
      name: `Vendor #${product.vendor_id}`,
      logo_url: '',
      city: '',
      category: product.category,
    };
    addToCartStore(product, vendor);
  };

  const services = categories.map((category) => {
    const theme = getCategoryTheme(category.name);
    return {
      name: category.name,
      icon: theme.icon,
      color: theme.color,
      bg: theme.bg,
      link: `/category/${category.slug}`,
      tag: theme.tag,
    };
  });

  return (
    <div className="bg-slate-50/50 font-body text-slate-900 antialiased min-h-screen pb-32 selection:bg-rose-500 selection:text-white">
      {/* TopAppBar */}
      <header className="bg-white/90 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-2">
            <QuickDropLogo size={36} showWordmark labelClassName="font-headline text-xl font-black tracking-tight text-slate-900" />
          </div>
          <button
            type="button"
            onClick={() => navigate("/profile/notifications")}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-600 hover:bg-slate-200/60 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>
      </header>

      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Banner Slideshow */}
        <section className="my-4 sm:my-6">
          <div className="relative h-44 sm:h-64 w-full overflow-hidden rounded-3xl shadow-sm border border-slate-100">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
              >
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} to-transparent/20 flex flex-col justify-center px-6 sm:px-10 text-white max-w-lg`}>
                  <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit mb-2">Special Offer</span>
                  <h2 className="text-xl sm:text-3xl font-black font-headline tracking-tight mb-1">{banner.title}</h2>
                  <p className="text-xs sm:text-sm font-medium text-white/90">{banner.subtitle}</p>
                  <button className="mt-3.5 bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-xl w-fit shadow-sm active:scale-95 transition-transform hover:bg-slate-50">
                    Shop Now
                  </button>
                </div>
              </div>
            ))}
            {/* Dots */}
            <div className="absolute bottom-4 right-6 flex gap-1.5 z-10">
              {banners.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBanner ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="my-6">
          <div className="bg-white rounded-2xl flex items-center px-4 py-3 shadow-sm border border-slate-200/60 focus-within:border-rose-500/50 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all">
            <span className="material-symbols-outlined text-slate-400 mr-3 text-xl">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-slate-900 placeholder:text-slate-400 outline-none text-sm font-medium"
              placeholder="Search for food, grocery or brands..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                Clear
              </button>
            )}
          </div>
        </section>

        {/* Discover Services Slider */}
        <section className="my-8">
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Discover Services</h2>
            <Link to="/categories" className="text-rose-600 hover:text-rose-700 font-semibold text-xs uppercase tracking-wider">View All</Link>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-3 sm:gap-4 pb-2 snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
            {services.map((service, i) => (
              <Link 
                to={service.link} 
                key={i}
                className="flex-shrink-0 w-24 sm:w-28 snap-start flex flex-col items-center group text-center"
              >
                <div className={`${service.bg} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-2.5 group-hover:scale-105 group-active:scale-95 transition-all shadow-sm border border-black/[0.02]`}>
                  <span className={`material-symbols-outlined text-2xl sm:text-3xl ${service.color}`} style={materialIconFill}>
                    {service.icon}
                  </span>
                </div>
                <span className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-1">{service.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">{service.tag}</span>
              </Link>
            ))}
            {!categoriesQuery.isLoading && services.length === 0 ? (
              <div className="flex min-w-[220px] items-center rounded-2xl bg-white px-5 py-4 text-xs font-semibold text-slate-500 shadow-sm border border-slate-100">
                No admin categories active yet.
              </div>
            ) : null}
          </div>
        </section>

        {/* Featured Products */}
        <section className="my-8">
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Featured Products</h2>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-200/60 px-2.5 py-1 rounded-full">
              {productsQuery.isLoading ? 'Loading...' : `${filteredProducts.length} Results`}
            </span>
          </div>

          {productsQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-7 h-7 border-3 border-slate-200 border-t-rose-600 rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-sm border border-slate-100 flex flex-col active:scale-[0.98] transition-all duration-200 group text-left cursor-pointer hover:shadow-md hover:border-slate-200/80"
                >
                  {/* Visual Area */}
                  <div className="relative h-36 sm:h-44 w-full mb-3 overflow-hidden rounded-xl sm:rounded-2xl bg-slate-100">
                    <img 
                      src={product.image_url || product.image_urls?.[0] || "/favicon.svg"} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <button 
                        onClick={(e) => toggleFavorite(e, product.id)}
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-75 transition-transform"
                        style={{ color: favorites.includes(product.id) ? '#dc2626' : '#9ca3af' }}
                      >
                        <span className="material-symbols-outlined text-lg" style={materialIconFill}>
                          {favorites.includes(product.id) ? 'favorite' : 'favorite'}
                        </span>
                      </button>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-slate-900/70 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-amber-400 text-[12px]" style={materialIconFill}>star</span>
                      <span className="text-[10px] font-bold text-white">{product.rating || 4.5}</span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="px-1 flex-grow flex flex-col">
                    <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest mb-0.5">{product.category || 'Product'}</span>
                    <h3 className="font-semibold text-xs sm:text-sm text-slate-800 leading-snug mb-3 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="mt-auto flex justify-between items-center">
                      <span className="text-sm sm:text-base font-black text-slate-900">${product.price}</span>
                      <button 
                        onClick={(e) => addToCart(e, product)}
                        style={signatureGradient}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white shadow-md shadow-rose-500/20 active:scale-90 transition-transform"
                      >
                        <span className="material-symbols-outlined text-base font-bold">add</span>
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
          <section className="my-8">
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Top Rated Vendors</h2>
              <Link to="/vendors" className="text-rose-600 hover:text-rose-700 font-semibold text-xs uppercase tracking-wider">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vendors.map((vendor) => (
                <div 
                  key={vendor.id} 
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-sm border border-slate-100 group active:scale-[0.99] transition-all duration-200 cursor-pointer hover:shadow-md" 
                  onClick={() => navigate(`/vendor/${vendor.id}`)}
                >
                  <div className="h-36 sm:h-40 relative bg-slate-100">
                    {vendor.logo_url && (
                      <img alt={vendor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={vendor.logo_url} />
                    )}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-amber-500 text-xs" style={materialIconFill}>star</span>
                      <span className="text-xs font-black text-slate-900">{vendor.rating || 4.5}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-sm mb-0.5">{vendor.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mb-3">{vendor.category || 'Restaurant'}</p>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                      <span>{vendor.delivery_time || '20-30'} mins</span>
                      <span className="text-emerald-600 font-semibold">Free Delivery</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 pb-6 pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <Link to="/dashboard" className="flex flex-col items-center text-rose-600 flex-1">
          <span className="material-symbols-outlined text-[22px]" style={materialIconFill}>home</span>
          <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5">Home</span>
        </Link>
        <Link to="/market" className="flex flex-col items-center text-slate-400 hover:text-slate-600 transition-colors flex-1">
          <span className="material-symbols-outlined text-[22px]">storefront</span>
          <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5">Market</span>
        </Link>
        <button onClick={() => navigate('/ride')} className="flex flex-col items-center text-slate-400 hover:text-slate-600 transition-colors flex-1">
          <span className="material-symbols-outlined text-[22px]">two_wheeler</span>
          <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5">Ride</span>
        </button>
        <Link to="/orders" className="flex flex-col items-center text-slate-400 hover:text-slate-600 transition-colors flex-1">
          <span className="material-symbols-outlined text-[22px]">receipt_long</span>
          <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5">Orders</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-slate-400 hover:text-slate-600 transition-colors flex-1">
          <span className="material-symbols-outlined text-[22px]">person</span>
          <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5">Profile</span>
        </Link>
      </nav>

      {/* Cart FAB - Fixed responsiveness with safe spacing above bottom nav */}
      <button 
        onClick={() => navigate('/cart')} 
        style={signatureGradient} 
        className="fixed right-4 sm:right-6 bottom-[calc(5rem+env(safe-area-inset-bottom))] w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl shadow-rose-600/30 flex items-center justify-center text-white active:scale-90 transition-transform z-50 border-2 border-white"
      >
        <span className="material-symbols-outlined text-xl sm:text-2xl">shopping_cart</span>
        {cartItems.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
            {cartItems.length}
          </div>
        )}
      </button>
    </div>
  );
};