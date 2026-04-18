import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchVendors } from '../api/vendors';
import { PageContainer } from '../components/common/PageContainer';
import { SectionHeading } from '../components/common/SectionHeading';
import { formatMoney } from '../lib/utils';

const CATEGORY_ICONS = {
  'Food & Beverages': 'restaurant',
  'Retail': 'shopping_bag',
  'Electronics': 'devices',
  'Fashion': 'checkroom',
  'Pharmacy': 'local_pharmacy',
  'Others': 'category',
};

const CATEGORY_COLORS = {
  'Food & Beverages': { bg: 'from-orange-400 to-red-500', icon: 'text-orange-500' },
  'Retail': { bg: 'from-blue-400 to-purple-500', icon: 'text-blue-500' },
  'Electronics': { bg: 'from-purple-400 to-pink-500', icon: 'text-purple-500' },
  'Fashion': { bg: 'from-pink-400 to-rose-500', icon: 'text-pink-500' },
  'Pharmacy': { bg: 'from-green-400 to-emerald-500', icon: 'text-green-500' },
  'Others': { bg: 'from-slate-400 to-slate-500', icon: 'text-slate-500' },
};

export const CategoriesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  // Fetch all vendors to extract unique categories
  const allVendorsQuery = useQuery({
    queryKey: ['all-vendors-categories'],
    queryFn: () => fetchVendors({}),
  });

  // Fetch vendors for selected category
  const categoryVendorsQuery = useQuery({
    queryKey: ['vendors-category', selectedCategory],
    queryFn: () => fetchVendors({ category: selectedCategory }),
    enabled: !!selectedCategory,
  });

  const allVendors = allVendorsQuery.data ?? [];
  const categories = [...new Set(allVendors.map(v => v.category))].sort();
  
  const categoryVendors = categoryVendorsQuery.data ?? [];
  const vendorCount = selectedCategory ? categoryVendors.length : 0;

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <PageContainer className="py-8 space-y-8">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Browse vendors by category"
          description="Select a category to see all available vendors"
        />

        {/* Categories Grid */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              const colors = CATEGORY_COLORS[category];
              const icon = CATEGORY_ICONS[category];
              const categoryVendorCount = allVendors.filter(v => v.category === category).length;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`group relative rounded-[2rem] p-6 transition-all duration-300 transform ${
                    isSelected
                      ? `bg-gradient-to-br ${colors.bg} shadow-2xl scale-105`
                      : 'bg-white shadow-sm hover:shadow-md hover:-translate-y-1 border border-slate-100'
                  }`}
                >
                  {/* Background decoration */}
                  <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  
                  <div className="relative z-10 flex flex-col items-center text-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-white/30' : 'bg-slate-100'
                    }`}>
                      <span 
                        className={`material-symbols-outlined text-2xl transition-colors ${
                          isSelected ? 'text-white' : colors.icon
                        }`}
                        style={materialIconFill}
                      >
                        {icon}
                      </span>
                    </div>

                    <div className="flex-1">
                      <p className={`text-sm font-black tracking-tight transition-colors ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}>
                        {category}
                      </p>
                      <p className={`text-xs font-bold transition-colors ${
                        isSelected ? 'text-white/80' : 'text-slate-400'
                      }`}>
                        {categoryVendorCount} {categoryVendorCount === 1 ? 'vendor' : 'vendors'}
                      </p>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-green-500" style={materialIconFill}>
                        check_circle
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Category Vendors */}
        {selectedCategory && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{selectedCategory}</h2>
                <p className="text-sm text-slate-400 font-bold mt-1">
                  {vendorCount} {vendorCount === 1 ? 'vendor' : 'vendors'} available
                </p>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-all"
              >
                Clear Filter
              </button>
            </div>

            {categoryVendorsQuery.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse" />
                ))}
              </div>
            ) : categoryVendors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryVendors.map((vendor) => (
                  <div 
                    key={vendor.id}
                    className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-slate-100 cursor-pointer"
                  >
                    {/* Logo */}
                    {vendor.logo_url && (
                      <div className="mb-4 h-24 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                        <img 
                          src={vendor.logo_url} 
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Vendor Info */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-[#ff9300]">
                          {vendor.category}
                        </p>
                        <h3 className="text-lg font-black text-slate-900 mt-1">{vendor.name}</h3>
                      </div>

                      <p className="text-sm text-slate-600 line-clamp-2">{vendor.description}</p>

                      {/* Rating */}
                      {vendor.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-yellow-500" style={materialIconFill}>
                            star
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {vendor.rating.toFixed(1)} ({vendor.review_count})
                          </span>
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {vendor.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {vendor.prep_time_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">local_shipping</span>
                          {formatMoney(vendor.delivery_fee)}
                        </span>
                      </div>

                      {/* Min Order */}
                      {vendor.minimum_order_amount > 0 && (
                        <div className="pt-2 text-xs text-slate-500">
                          Min order: <span className="font-bold text-slate-700">{formatMoney(vendor.minimum_order_amount)}</span>
                        </div>
                      )}

                      <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#ff9300] to-[#ffb857] text-white font-black text-sm uppercase tracking-widest hover:shadow-lg active:scale-95 transition-all">
                        View Store
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 block mb-4">
                  store
                </span>
                <p className="text-slate-500 font-bold">No vendors available in this category</p>
              </div>
            )}
          </section>
        )}

        {/* Stats when no category selected */}
        {!selectedCategory && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Categories</p>
              <p className="text-4xl font-black text-[#ff9300] mt-2">{categories.length}</p>
            </div>
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Vendors</p>
              <p className="text-4xl font-black text-[#ff9300] mt-2">{allVendors.length}</p>
            </div>
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Avg Vendors/Cat</p>
              <p className="text-4xl font-black text-[#ff9300] mt-2">
                {categories.length > 0 ? (allVendors.length / categories.length).toFixed(1) : 0}
              </p>
            </div>
          </section>
        )}
      </PageContainer>
    </div>
  );
};
