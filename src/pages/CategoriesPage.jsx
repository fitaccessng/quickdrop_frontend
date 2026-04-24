import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

import { fetchServiceCategoryOverview } from '../api/system';
import { useCartStore } from '../store/cartStore';
import { QuickDropLogo } from '../components/branding/QuickDropLogo';

const CATEGORY_ICONS = {
  'Food & Beverages': { icon: 'restaurant', color: 'text-rose-500', bg: 'bg-rose-50' },
  Food: { icon: 'restaurant', color: 'text-rose-500', bg: 'bg-rose-50' },
  Grocery: { icon: 'shopping_basket', color: 'text-amber-500', bg: 'bg-amber-50' },
  Pharmacy: { icon: 'medical_services', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  Fashion: { icon: 'apparel', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  Electronics: { icon: 'devices', color: 'text-blue-500', bg: 'bg-blue-50' },
  Retail: { icon: 'shopping_bag', color: 'text-slate-500', bg: 'bg-slate-50' },
  Others: { icon: 'category', color: 'text-slate-500', bg: 'bg-slate-50' },
};

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const cartItems = useCartStore((state) => state.items);

  const signatureGradient = "linear-gradient(135deg, #b61321 0%, #ff7670 100%)";
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const banners = [
    { id: 1, title: "Summer Cravings", subtitle: "Up to 40% off", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", color: "from-rose-600/80" },
    { id: 2, title: "Fresh Groceries", subtitle: "15 min delivery", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80", color: "from-amber-600/80" },
    { id: 3, title: "Tech & Style", subtitle: "Latest drops daily", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80", color: "from-indigo-600/80" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
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

  const totalProducts = categories.reduce((sum, category) => sum + (category.product_count ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-900 antialiased pb-20">
      {/* --- Premium Sticky Header --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="flex justify-between items-center px-6 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          
          <QuickDropLogo size={32} showWordmark labelClassName="font-headline text-xl font-bold text-slate-900" />

          <button 
            onClick={() => navigate('/cart')}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="pt-4">
        {/* --- Hero Banner Slider --- */}
        <section className="px-6 mb-8">
          <div className="relative h-48 w-full overflow-hidden rounded-[2.5rem] shadow-xl shadow-rose-900/5">
            <AnimatePresence mode="wait">
              {banners.map((banner, index) => index === currentBanner && (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} to-transparent flex flex-col justify-center px-8 text-white`}>
                    <h2 className="text-2xl font-black font-headline mb-1">{banner.title}</h2>
                    <p className="text-sm font-medium opacity-90">{banner.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-8 flex gap-2">
              {banners.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBanner ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
              ))}
            </div>
          </div>
        </section>

        {/* --- Category Horizontal Slider --- */}
        <section className="mb-10">
          <div className="px-6 flex justify-between items-end mb-6">
            <div>
              <h2 className="font-headline text-2xl font-black text-slate-900 tracking-tight leading-none">Departments</h2>
              <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Select to explore items</p>
            </div>
          </div>

          <div className="px-6 flex overflow-x-auto no-scrollbar gap-4 snap-x">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-32 snap-start flex flex-col items-center animate-pulse">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-slate-200 mb-3" />
                  <div className="h-3 w-20 rounded bg-slate-200" />
                  <div className="mt-2 h-2 w-14 rounded bg-slate-100" />
                </div>
              ))
            ) : null}
            {categories.map((category, i) => {
              const theme = CATEGORY_ICONS[category.name] || CATEGORY_ICONS.Others;
              const productCount = category.product_count ?? 0;

              return (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  key={category.id || i}
                  onClick={() => navigate(`/category/${category.slug}`)}
                  className="flex-shrink-0 w-32 snap-start flex flex-col items-center group"
                >
                  <div className={`${theme.bg} w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-3 group-hover:shadow-lg transition-all duration-300 shadow-sm border border-white`}>
                    <span className={`material-symbols-outlined text-4xl ${theme.color}`} style={materialIconFill}>
                      {theme.icon}
                    </span>
                  </div>
                  <span className="font-black text-slate-900 text-[13px] uppercase tracking-tight text-center px-1">
                    {category.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    {productCount} Items
                  </span>
                </motion.button>
              );
            })}
            {!isLoading && !isError && categories.length === 0 ? (
              <div className="w-full rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm font-semibold text-slate-500">
                No categories are available yet.
              </div>
            ) : null}
            {isError ? (
              <div className="w-full rounded-[2rem] border border-rose-100 bg-rose-50 px-6 py-10 text-center text-sm font-semibold text-rose-700">
                We couldn&apos;t load categories right now.
              </div>
            ) : null}
          </div>
        </section>

        {/* --- Premium Stats Bento Box --- */}
        <section className="px-6 grid grid-cols-2 gap-4">
          <div 
            className="col-span-2 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl"
            style={{ background: signatureGradient }}
          >
            <div className="relative z-10">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Global Access</p>
              <h2 className="text-3xl font-black tracking-tight leading-tight mb-6">
                Fresh drops <br/> across {categories.length} sectors.
              </h2>
              <div className="flex gap-10">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1">
                  <p className="text-2xl font-black italic">{totalProducts}</p>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Live Inventory</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1">
                  <p className="text-2xl font-black italic">SA</p>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Market</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
               <span className="material-symbols-outlined text-[180px]">hub</span>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="material-symbols-outlined text-rose-600 mb-2" style={materialIconFill}>bolt</span>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Speed</p>
              <p className="text-lg font-black text-slate-900 mt-1 italic">Under 30m</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="material-symbols-outlined text-slate-800 mb-2" style={materialIconFill}>verified</span>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Quality</p>
              <p className="text-lg font-black text-slate-900 mt-1 italic">Vetted</p>
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};
