import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { fetchProducts } from "../api/products";
import { fetchServiceCategories } from "../api/system";
import { fetchVendors } from "../api/vendors";
import { formatMoney } from "../lib/utils";
import { useCartStore } from "../store/cartStore";

const slugify = (value = "") =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const CategoryDetailPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const categoriesQuery = useQuery({
    queryKey: ["service-categories"],
    queryFn: fetchServiceCategories,
  });
  const vendorsQuery = useQuery({
    queryKey: ["category-vendors"],
    queryFn: () => fetchVendors({}),
  });

  const categories = categoriesQuery.data ?? [];
  const vendors = vendorsQuery.data ?? [];

  const matchedCategory = useMemo(() => {
    const direct = categories.find((item) => item.slug === categorySlug);
    if (direct) return direct;
    return categories.find((item) => {
      const slug = slugify(item.name);
      return slug === categorySlug || slug.includes(categorySlug) || categorySlug.includes(slug);
    });
  }, [categories, categorySlug]);

  const categoryName = matchedCategory?.name || categorySlug.replace(/-/g, " ");

  const productsQuery = useQuery({
    queryKey: ["category-products", categoryName],
    queryFn: () => fetchProducts({ category: categoryName }),
    enabled: Boolean(categoryName),
  });

  const products = productsQuery.data ?? [];

  const categoryProducts = useMemo(() => {
    const normalizedCategorySlug = slugify(categoryName);
    return products.filter((item) => {
      const itemSlug = slugify(item.category);
      return itemSlug === categorySlug || itemSlug === normalizedCategorySlug;
    });
  }, [products, categorySlug, categoryName]);

  const vendorMap = useMemo(
    () => Object.fromEntries(vendors.map((vendor) => [vendor.id, vendor])),
    [vendors],
  );

  const isLoading = categoriesQuery.isLoading || productsQuery.isLoading || vendorsQuery.isLoading;

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
              <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase text-slate-400">Category</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate max-w-[220px] sm:max-w-xs capitalize">
              {categoryName}
            </h1>
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
        
        {/* --- Department Hero Banner --- */}
        <section className="relative">
          <div className="relative h-52 sm:h-64 w-full rounded-[32px] overflow-hidden shadow-md border border-rose-950/10 bg-slate-900 group">
            {matchedCategory?.image_url && (
              <img 
                src={matchedCategory.image_url} 
                alt={categoryName} 
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-rose-950/95 via-rose-950/50 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
              <div className="space-y-1.5 sm:space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white capitalize drop-shadow-sm">
                  {categoryName}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                  {categoryProducts.length} item{categoryProducts.length === 1 ? "" : "s"} ready for instant delivery
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Product Grid Section --- */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-0.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Available Items</h2>
                <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100">
                  {categoryProducts.length} Results
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-bold mt-0.5 uppercase tracking-wider">
                Browse products from verified vendors
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-3xl p-3.5 border border-slate-100/90 shadow-sm space-y-3 animate-pulse">
                  <div className="h-4 w-16 bg-slate-100 rounded-full" />
                  <div className="w-full aspect-[4/3] bg-slate-100 rounded-2xl" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {categoryProducts.map((product) => {
                const vendor = vendorMap[product.vendor_id];
                const productImg = product.image_url || product.image_urls?.[0] || product.image || "/favicon.svg";

                return (
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="group relative bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-100/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Top Row: Vendor & Action Icon */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-100/80 truncate max-w-[110px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                          <span className="truncate">{vendor?.name || "Vendor"}</span>
                        </span>
                        <span className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors shadow-2xs">
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </span>
                      </div>

                      {/* Media Container */}
                      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                        <img
                          src={productImg}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                        <span className="absolute bottom-2 left-2 text-[10px] font-black text-white/90 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                          {formatMoney(product.price)}
                        </span>
                      </div>

                      {/* Bottom Title & Details */}
                      <div className="mt-3">
                        <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight group-hover:text-rose-600 transition-colors truncate">
                          {product.name}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                          {vendor?.city || "Local Delivery"}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        {formatMoney(product.price)}
                      </span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          addItem(product, {
                            id: vendor?.id ?? product.vendor_id,
                            name: vendor?.name ?? "Vendor",
                            logo_url: vendor?.logo_url ?? "",
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider transition shadow-sm active:scale-95 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">add</span>
                        <span>Add</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[28px] border border-dashed border-slate-200 p-12 text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-slate-300 block">inventory_2</span>
              <p className="text-xs sm:text-sm text-slate-500 font-bold">No products found in this department yet.</p>
              <Link to="/categories" className="inline-block text-[11px] sm:text-xs font-black text-rose-600 uppercase tracking-wider pt-1">
                Explore other categories
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};