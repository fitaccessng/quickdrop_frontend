import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { fetchProducts } from '../api/products';
import { fetchServiceCategories } from '../api/system';
import { PageContainer } from '../components/common/PageContainer';
import { SectionHeading } from '../components/common/SectionHeading';

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

const CATEGORY_COLORS = {
  'Food & Beverages': { bg: 'from-orange-400 to-red-500', icon: 'text-orange-500' },
  Food: { bg: 'from-orange-400 to-red-500', icon: 'text-orange-500' },
  Grocery: { bg: 'from-amber-400 to-yellow-500', icon: 'text-amber-500' },
  Retail: { bg: 'from-blue-400 to-purple-500', icon: 'text-blue-500' },
  Electronics: { bg: 'from-purple-400 to-pink-500', icon: 'text-purple-500' },
  Fashion: { bg: 'from-pink-400 to-rose-500', icon: 'text-pink-500' },
  Pharmacy: { bg: 'from-green-400 to-emerald-500', icon: 'text-green-500' },
  Others: { bg: 'from-slate-400 to-slate-500', icon: 'text-slate-500' },
};

const slugify = (value = '') =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const categoriesQuery = useQuery({
    queryKey: ['service-categories'],
    queryFn: fetchServiceCategories,
  });

  const productsQuery = useQuery({
    queryKey: ['all-category-products'],
    queryFn: () => fetchProducts({}),
  });

  const products = productsQuery.data ?? [];
  const fallbackCategories = useMemo(
    () =>
      [...new Set(products.map((product) => product.category).filter(Boolean))]
        .sort()
        .map((name, index) => ({
          id: `fallback-${index}`,
          name,
          slug: slugify(name),
          description: null,
        })),
    [products],
  );

  const categories = categoriesQuery.data?.length ? categoriesQuery.data : fallbackCategories;

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <PageContainer className="py-8 space-y-8">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Browse services by category"
          description="Choose a category to see the products available inside it"
        />

        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const colors = CATEGORY_COLORS[category.name] || CATEGORY_COLORS.Others;
              const icon = CATEGORY_ICONS[category.name] || CATEGORY_ICONS.Others;
              const categoryProductCount = products.filter((product) => product.category === category.name).length;

              return (
                <button
                  key={category.id || category.slug}
                  onClick={() => navigate(`/category/${category.slug}`)}
                  className="group relative rounded-[2rem] p-6 transition-all duration-300 transform bg-white shadow-sm hover:shadow-md hover:-translate-y-1 border border-slate-100"
                >
                  <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity`} />

                  <div className="relative z-10 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-slate-100">
                      <span className={`material-symbols-outlined text-2xl transition-colors ${colors.icon}`} style={materialIconFill}>
                        {icon}
                      </span>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-black tracking-tight transition-colors text-slate-900">{category.name}</p>
                      <p className="text-xs font-bold transition-colors text-slate-400">
                        {categoryProductCount} {categoryProductCount === 1 ? 'product' : 'products'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Categories</p>
            <p className="text-4xl font-black text-[#ff9300] mt-2">{categories.length}</p>
          </div>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Products</p>
            <p className="text-4xl font-black text-[#ff9300] mt-2">{products.length}</p>
          </div>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Avg Products/Cat</p>
            <p className="text-4xl font-black text-[#ff9300] mt-2">
              {categories.length > 0 ? (products.length / categories.length).toFixed(1) : 0}
            </p>
          </div>
        </section>
      </PageContainer>
    </div>
  );
};
