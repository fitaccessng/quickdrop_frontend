import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

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

  const categoriesQuery = useQuery({
    queryKey: ["service-categories"],
    queryFn: fetchServiceCategories,
  });
  const productsQuery = useQuery({
    queryKey: ["category-products"],
    queryFn: () => fetchProducts({}),
  });
  const vendorsQuery = useQuery({
    queryKey: ["category-vendors"],
    queryFn: () => fetchVendors({}),
  });

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const vendors = vendorsQuery.data ?? [];

  const matchedCategory = useMemo(() => {
    const direct = categories.find((item) => item.slug === categorySlug);
    if (direct) return direct;
    return categories.find((item) => {
      const slug = slugify(item.name);
      return slug === categorySlug || slug.includes(categorySlug) || categorySlug.includes(slug);
    });
  }, [categories, categorySlug]);

  const categoryName =
    matchedCategory?.name ||
    products.find((item) => slugify(item.category) === categorySlug)?.category ||
    categorySlug.replace(/-/g, " ");

  const categoryProducts = useMemo(
    () =>
      products.filter((item) => {
        const itemSlug = slugify(item.category);
        return itemSlug === categorySlug || itemSlug === slugify(categoryName);
      }),
    [products, categorySlug, categoryName],
  );

  const vendorMap = useMemo(
    () => Object.fromEntries(vendors.map((vendor) => [vendor.id, vendor])),
    [vendors],
  );

  const isLoading = categoriesQuery.isLoading || productsQuery.isLoading || vendorsQuery.isLoading;

  return (
    <div className="min-h-screen bg-[#f5f6f7] px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-slate-600">arrow_back</span>
          </button>
          <Link to="/categories" className="text-rose-600 font-bold text-xs uppercase tracking-wider">
            All Categories
          </Link>
        </header>

        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff9300]">Category</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{categoryName}</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {categoryProducts.length} product{categoryProducts.length === 1 ? "" : "s"} available in this service.
          </p>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-64 rounded-[2rem] bg-white animate-pulse" />
            ))}
          </div>
        ) : categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {categoryProducts.map((product) => {
              const vendor = vendorMap[product.vendor_id];
              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="h-48 bg-slate-100">
                    <img
                      src={product.image_url || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#ff9300]">{product.category}</p>
                      <h2 className="text-lg font-black text-slate-900 mt-1">{product.name}</h2>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>{vendor?.name || "Vendor"}</span>
                      <span>{vendor?.city || "South Africa"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-xl font-black text-slate-900">{formatMoney(product.price)}</span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          addItem(product, {
                            id: vendor?.id ?? product.vendor_id,
                            name: vendor?.name ?? "Vendor",
                            logo_url: vendor?.logo_url ?? "",
                          });
                        }}
                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#ff9300] to-[#ffb857] text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">inventory_2</span>
            <p className="text-slate-500 font-bold">No products found in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
