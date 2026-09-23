import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

import { fetchServiceCategoryOverview } from '../api/system';
import { useCartStore } from '../store/cartStore';

const slugify = (value = "") =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Fallback background images if a category image isn't provided by the API
const CATEGORY_FALLBACK_IMAGES = {
  'Food & Beverages': 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg',
  'Grocery & Mart': 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg',
  'Pharmacy & Care': 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg',
  'Fashion & Apparel': 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg',
  'Electronics & Tech': 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg',
  'Retail & Gifts': 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg',
  'Lifestyle & Home': 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg',
  'All Local Services': 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg',
};

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Services');
  const cartItems = useCartStore((state) => state.items);

  const banners = [
    { 
      id: 1, 
      title: "Summer Cravings", 
      subtitle: "Up to 40% off gourmet kitchens & chef drops this weekend", 
      tag: "Flash Drop", 
      image: "https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg", 
      color: "from-rose-950/95 via-rose-950/50 to-transparent" 
    },
    { 
      id: 2, 
      title: "Fresh Groceries", 
      subtitle: "Superfast 15 min doorstep delivery from local marts", 
      tag: "Express", 
      image: "https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg", 
      color: "from-amber-950/95 via-amber-950/50 to-transparent" 
    },
    { 
      id: 3, 
      title: "Tech & Style Drops", 
      subtitle: "Discover trending gadgets and seasonal apparel", 
      tag: "New Arrivals", 
      image: "https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg", 
      color: "from-indigo-950/95 via-indigo-950/50 to-transparent" 
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['service-categories-overview'],
    queryFn: fetchServiceCategoryOverview,
  });

  const filterChips = ['All Services', 'Fast Delivery', 'Offers & Deals', 'Top Rated'];

  return (
    <div className="bg-slate-50 text-slate-900 antialiased min-h-screen pb-32 selection:bg-rose-100 selection:text-rose-900">
      {/* TOP APP BAR / HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100/80 transition-all">
        <div className="max-w-4xl lg:max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white text-slate-700 border border-slate-200/70 shadow-sm active:scale-95 transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase text-slate-400">Catalogue</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">All Departments</h1>
          </div>

          <button 
            onClick={() => navigate('/cart')}
            className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-white text-slate-700 border border-slate-200/70 shadow-sm active:scale-95 transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-rose-200">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER EXPANDS ON TABLET/DESKTOP */}
      <main className="max-w-4xl lg:max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        
        {/* SEARCH & QUICK FILTER BAR */}
        <section className="space-y-3 max-w-2xl mx-auto w-full">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px] pointer-events-none">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 1,200+ stores, food, tech..." 
              className="w-full bg-white border border-slate-200/80 rounded-2xl py-3.5 pl-12 pr-12 text-xs sm:text-sm font-semibold placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-sm transition"
            />
            <button className="absolute right-3 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:scale-90 transition">
              <span className="material-symbols-outlined text-[16px]">tune</span>
            </button>
          </div>

          {/* Quick Category Filter Chips */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar py-1">
            {filterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setActiveFilter(chip)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition shadow-sm ${
                  activeFilter === chip 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 active:scale-95'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* PROMOTIONAL HERO CAROUSEL / BENTO BANNER */}
        <section className="relative">
          <div className="relative h-52 sm:h-64 w-full rounded-[32px] overflow-hidden shadow-md border border-rose-950/10 bg-slate-900 group">
            <AnimatePresence mode="wait">
              {banners.map((banner, index) => index === currentBanner && (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0"
                >
                  <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${banner.color} flex flex-col justify-end p-6 sm:p-8 text-white`}>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-rose-200 text-xs font-semibold">Over 48 restaurants & stores</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                        {banner.title}
                      </h2>
                      <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed max-w-md">
                        {banner.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/15">
                      <div className="flex items-center gap-1.5">
                        {banners.map((_, i) => (
                          <span 
                            key={i} 
                            onClick={() => setCurrentBanner(i)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${i === currentBanner ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} 
                          />
                        ))}
                      </div>
                      <button className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-white text-rose-950 px-4 py-2 rounded-xl active:scale-95 transition shadow-sm">
                        Order Now
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* MAIN CATEGORY GRID SECTION (Responsive: 2 cols on mobile, 3 on tablet, 4 on wide screen) */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-0.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Explore Departments</h2>
                <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100">
                  {categories.length > 0 ? `${categories.length} Available` : '8 Available'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {categories.map((cat) => {
              const fallbackImg = CATEGORY_FALLBACK_IMAGES[cat.name] || CATEGORY_FALLBACK_IMAGES['Others'];
              const imageUrl = cat.image_url || fallbackImg;
              const categorySlug = cat.slug || slugify(cat.name);

              return (
                <div 
                  key={cat.id || cat.name}
                  onClick={() => navigate(`/category/${categorySlug}`)}
                  className="group relative bg-white rounded-3xl p-3 sm:p-3.5 border border-slate-100/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-100/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      {cat.vendor_count || '24'} Vends
                    </span>
                    <span className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </span>
                  </div>

                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                    <img src={imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                    <span className="absolute bottom-2 left-2 text-[10px] font-black text-white/90 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                      {cat.badge || 'Popular'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight group-hover:text-rose-600 transition-colors truncate">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">{cat.description || 'Explore top vendors'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PROMOTIONAL CARD: NEED HELP FINDING SOMETHING */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[28px] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-8 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="space-y-1 z-10">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">Can't find a category?</span>
            <h4 className="text-sm sm:text-base font-black text-white">Request a store or item</h4>
            <p className="text-xs text-slate-300 font-medium">We'll source it for you within 30 minutes</p>
          </div>
          <button className="z-10 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-black shrink-0 transition shadow-sm">
            Request Item
          </button>
        </section>
      </main>
    </div>
  );
};