import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { fetchProducts } from '../api/products';
import { fetchServiceCategories } from '../api/system';

const CATEGORY_ICONS = {
  'Food & Beverages': 'restaurant',
  Food: 'restaurant',
  Grocery: 'shopping_basket',
  Retail: 'shopping_bag',
  Electronics: 'devices',
  Fashion: 'checkroom',
  Pharmacy: 'local_pharmacy',
  Others: 'category',
};

const BANNERS = [
  { id: 1, title: "Fresh Flavors", sub: "Up to 20% off meals", color: "from-orange-500 to-red-600" },
  { id: 2, title: "Quick Groceries", sub: "Delivery in 15 mins", color: "from-blue-600 to-indigo-700" },
  { id: 3, title: "Tech Deals", sub: "Modern gadgets for you", color: "from-slate-800 to-black" },
];

const slugify = (value = '') =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const { data: categoriesData } = useQuery({
    queryKey: ['service-categories'],
    queryFn: fetchServiceCategories,
  });

  const { data: productsData } = useQuery({
    queryKey: ['all-category-products'],
    queryFn: () => fetchProducts({}),
  });

  const products = productsData ?? [];
  const categories = categoriesData ?? [];

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      {/* --- Premium Sticky Header --- */}
      <header className="sticky top-0 z-50 bg-slate-950 px-6 py-5 flex items-center justify-between shadow-xl">
        <button 
          onClick={() => navigate(-1)}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 text-white active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        <h1 className="text-white font-headline text-lg font-black tracking-tight uppercase italic">QuickDrop</h1>

        <button 
          onClick={() => navigate('/cart')}
          className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-[#ff9300] text-white active:scale-90 transition-transform shadow-lg shadow-orange-500/20"
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="absolute -top-1 -right-1 bg-white text-slate-950 text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-orange-500">
            2
          </span>
        </button>
      </header>

      {/* --- Hero Banner Slider --- */}
      <div className="px-6 py-6 overflow-x-auto no-scrollbar flex gap-4 snap-x">
        {BANNERS.map((banner) => (
          <div 
            key={banner.id}
            className={`min-w-[85%] sm:min-w-[400px] h-44 rounded-[2.5rem] bg-gradient-to-br ${banner.color} p-8 flex flex-col justify-end snap-center shadow-2xl relative overflow-hidden`}
          >
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <h3 className="text-white text-2xl font-black leading-tight tracking-tight">{banner.title}</h3>
            <p className="text-white/80 text-sm font-medium tracking-wide">{banner.sub}</p>
          </div>
        ))}
      </div>

      {/* --- Category Horizontal Slider --- */}
      <div className="mt-4">
        <div className="px-6 flex items-center justify-between mb-4">
          <h2 className="text-slate-900 font-black text-sm uppercase tracking-widest">Categories</h2>
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Slide to browse</span>
        </div>

        <div className="px-6 pb-8 overflow-x-auto no-scrollbar flex gap-3">
          {categories.map((category) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={category.id || category.slug}
              onClick={() => navigate(`/category/${category.slug}`)}
              className="min-w-[110px] bg-white border border-slate-100 rounded-[2rem] p-5 flex flex-col items-center gap-3 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-active:bg-orange-50">
                <span className="material-symbols-outlined text-2xl" style={materialIconFill}>
                  {CATEGORY_ICONS[category.name] || 'category'}
                </span>
              </div>
              <p className="text-[11px] font-black text-slate-800 text-center uppercase tracking-tighter leading-none">
                {category.name}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* --- Detailed Bento Grid for Stats --- */}
      <div className="px-6 grid grid-cols-2 gap-4 pb-12">
        <div className="col-span-2 bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Our Ecosystem</p>
            <h2 className="text-3xl font-black tracking-tight leading-none mb-6">Explore <br/> Unlimited Drops</h2>
            <div className="flex gap-10">
              <div>
                <p className="text-2xl font-black italic">{categories.length}</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Sectors</p>
              </div>
              <div>
                <p className="text-2xl font-black italic">{products.length}</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Live Items</p>
              </div>
            </div>
          </div>
          {/* Abstract SVG Background */}
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-10 -translate-y-10 scale-150">
             <span className="material-symbols-outlined text-[200px]" style={materialIconFill}>dashboard</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-orange-500 mb-2">auto_awesome</span>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Average Density</p>
            <p className="text-xl font-black text-slate-900 mt-1">
               {categories.length > 0 ? (products.length / categories.length).toFixed(1) : 0}
            </p>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-blue-500 mb-2">speed</span>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Market Health</p>
            <p className="text-xl font-black text-slate-900 mt-1">Optimal</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};