import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock3, Search, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { fetchProducts } from "../api/products";
import { fetchVendors } from "../api/vendors";
import { PageContainer } from "../components/common/PageContainer";
import { formatMoney } from "../lib/utils";

export const HomePage = () => {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const vendorsQuery = useQuery({ queryKey: ["marketplace-vendors"], queryFn: () => fetchVendors({}) });
  const productsQuery = useQuery({ queryKey: ["marketplace-products"], queryFn: () => fetchProducts({}) });

  const vendors = vendorsQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const categories = useMemo(() => ["All", ...new Set(vendors.map((vendor) => vendor.category))], [vendors]);
  const vendorMap = useMemo(() => Object.fromEntries(vendors.map((vendor) => [vendor.id, vendor])), [vendors]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const vendor = vendorMap[product.vendor_id];
      const matchesCategory = category === "All" || product.category === category || vendor?.category === category;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        [product.name, product.description, vendor?.name, product.category].some((value) =>
          String(value ?? "").toLowerCase().includes(term),
        );
      return matchesCategory && matchesSearch;
    });
  }, [category, products, search, vendorMap]);

  const featuredVendors = vendors.slice(0, 3);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#fff7ed_45%,#ffffff_100%)] text-slate-900">
      <PageContainer className="space-y-8 pb-10 pt-5 sm:space-y-10 sm:pt-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-5 py-6 text-white shadow-[0_30px_80px_-40px_rgba(2,6,23,0.85)] sm:px-7 sm:py-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-200/80">Marketplace</p>
              <h1 className="mt-3 font-headline text-3xl font-black tracking-tight sm:text-5xl">
                Mobile-first ordering from live vendors near you.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Every card on this screen is powered by the backend vendor and product feeds, with filters tuned for one-handed browsing first.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3 rounded-[1.1rem] bg-white px-4 py-3 text-slate-900">
                <Search size={18} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products, categories, or vendors"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                      category === item ? "bg-orange-300 text-slate-950" : "bg-white/10 text-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {featuredVendors.map((vendor) => (
            <Link
              key={vendor.id}
              to={`/vendor/${vendor.id}`}
              className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{vendor.category}</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">{vendor.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{vendor.description}</p>
              <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Star size={15} className="text-amber-500" />
                  {vendor.rating.toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={15} />
                  {vendor.prep_time_minutes} min
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Catalog</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Fresh from the backend feed</h2>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
              See all
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {productsQuery.isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-44 animate-pulse rounded-[1.7rem] bg-slate-200/70" />
                ))
              : filteredProducts.slice(0, 9).map((product) => {
                  const vendor = vendorMap[product.vendor_id];

                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{product.category}</p>
                      <h3 className="mt-3 text-lg font-bold text-slate-950">{product.name}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{product.description}</p>
                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-lg font-black text-slate-950">{formatMoney(product.price)}</p>
                          <p className="text-xs text-slate-500">
                            {vendor?.name ?? "Vendor"} · {product.prep_time_minutes} min
                          </p>
                        </div>
                        <span className="rounded-full bg-orange-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                          View
                        </span>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </section>
      </PageContainer>
    </div>
  );
};
