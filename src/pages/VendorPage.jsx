import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronRight } from "lucide-react";

import { fetchVendor } from "../api/vendors";
import { fetchProducts } from "../api/products";
import { formatMoney } from "../lib/utils";
import { useCartStore } from "../store/cartStore";
import { ProductList } from "../components/vendor/ProductList";
import { ReviewList } from "../components/vendor/ReviewList";

export const VendorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const [flash, setFlash] = useState("");
  const [activeCategory, setActiveCategory] = useState("Most Popular");

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const vendorQuery = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => fetchVendor(id),
    enabled: Boolean(id),
  });

  const productsQuery = useQuery({
    queryKey: ["vendor-products", id],
    queryFn: () => fetchProducts({ vendor_id: id }),
    enabled: Boolean(id),
  });

  const vendor = vendorQuery.data;
  const vendorProducts = productsQuery.data ?? vendor?.products ?? [];
  const liveCategories = ["Most Popular", ...new Set(vendorProducts.map((product) => product.category).filter(Boolean))];
  const categories = liveCategories.length > 1 ? liveCategories : ["Most Popular"];
  const filteredProducts =
    activeCategory === "Most Popular"
      ? vendorProducts
      : vendorProducts.filter((product) => product.category === activeCategory);
  const vendorReviews = vendor?.reviews ?? [];
  const coverImage = vendor?.cover_image_url || vendor?.cover_image || vendor?.image_url || vendor?.logo_url;
  const deliveryTime = vendor?.prep_time_minutes ?? 20;
  const deliveryFee = vendor?.delivery_fee ?? 0;
  const vendorRating = vendor?.rating ?? 4.8;

  if (vendorQuery.isLoading || productsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] animate-pulse">
        <div className="h-64 bg-slate-200 w-full" />
        <div className="px-6 -mt-16">
          <div className="h-40 bg-white rounded-xl shadow-sm" />
        </div>
      </div>
    );
  }

  if (!vendorQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff]">
        <p className="font-headline text-xl font-bold text-slate-400">Vendor not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] min-h-screen font-body text-on-surface antialiased pb-40">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 bg-[#f5f6ff]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[#0071BC]">arrow_back</span>
          </button>
          <h1 className="font-headline text-2xl font-extrabold tracking-tighter text-[#0071BC]">QuickDrop</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#0071BC]">search</span>
          <div className="w-8 h-8 rounded-full border-2 border-[#0071BC] overflow-hidden">
             <img src="https://ui-avatars.com/api/?name=User&background=0071BC&color=fff" alt="User" />
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-[280px] md:h-[400px] w-full overflow-hidden">
          {coverImage ? (
            <img className="w-full h-full object-cover" src={coverImage} alt={vendor.name} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0071BC] to-[#56b5ff]">
              <span className="font-headline text-4xl font-extrabold text-white">{vendor.name}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9ff] via-transparent to-transparent" />
        </section>

        {/* Vendor Info Card */}
        <section className="px-6 -mt-16 relative z-10 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-xl border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-headline text-3xl font-extrabold tracking-tight mb-1">{vendor.name}</h2>
                <p className="text-[#0071BC] font-semibold text-sm">
                  {vendor.description || "Gourmet Selections & Premium Quality"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#F05A28] to-[#ff8e6a] px-3 py-1 rounded-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">Trending</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  {vendorRating}
                </div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Rating</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-100" />
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[#0071BC]">schedule</span>
                  {deliveryTime} min
                </div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Delivery</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-100" />
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[#F05A28]">local_shipping</span>
                  {formatMoney(deliveryFee)}
                </div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Fee</span>
              </div>
            </div>
          </div>
        </section>

        {/* Flash Message */}
        {flash && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-bounce">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0071BC] px-6 py-2 text-white font-bold shadow-lg">
              <CheckCircle2 size={16} />
              {flash}
            </div>
          </div>
        )}

        {/* Category Scroll */}
        <section className="mt-8 overflow-x-auto no-scrollbar flex gap-3 px-6 mb-6 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeCategory === cat 
                ? "bg-gradient-to-r from-[#0071BC] to-[#0093ef] text-white shadow-md" 
                : "bg-slate-100 text-slate-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Product Grid */}
        <section className="px-6 space-y-8 max-w-4xl mx-auto">
          <div className="flex items-end justify-between">
            <h3 className="font-headline text-2xl font-extrabold text-on-surface">{activeCategory}</h3>
            <span className="text-xs font-bold text-[#0071BC] uppercase tracking-widest">
              {filteredProducts.length} live items
            </span>
          </div>

          {filteredProducts.length ? (
            <ProductList
              products={filteredProducts}
              vendor={vendor}
              onProductClick={(product) => navigate(`/product/${product.id}`)}
              onAddToCart={(product) => {
                addItem(product, vendor);
                setFlash(`${product.name} added!`);
                window.setTimeout(() => setFlash(""), 2200);
              }}
            />
          ) : (
            <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm">
              No products are available for this vendor yet.
            </div>
          )}

          {/* Special Pairing Section */}
          <div className="bg-[#ecf0ff] rounded-xl p-5 flex items-center gap-4 border border-[#ceddff]">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white">
              {vendor.logo_url ? (
                <img className="w-full h-full object-cover opacity-80" src={vendor.logo_url} alt="Combo" />
              ) : null}
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-lg text-[#0071BC]">Curator's Pairing</h4>
              <p className="text-slate-500 text-xs mb-2">Build a custom combo from our signature selections.</p>
              <button className="text-[#0071BC] text-xs font-bold uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-transform">
                Customize <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <section className="pt-8">
            <h3 className="font-headline text-2xl font-extrabold mb-6">Social Proof</h3>
            <ReviewList reviews={vendorReviews} />
          </section>
        </section>
      </main>

      {/* Floating Cart Button */}
      <div className="fixed bottom-28 right-6 z-40">
        <button 
          onClick={() => navigate("/cart")}
          className="bg-gradient-to-br from-[#F05A28] to-[#ff8e6a] w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl relative active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-2xl">shopping_cart</span>
          {cartCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-[#0071BC] text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </div>
          )}
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-2xl rounded-t-2xl shadow-2xl border-t border-slate-100">
        {[
          { icon: "home", label: "Home", active: false },
          { icon: "search", label: "Search", active: true },
          { icon: "local_shipping", label: "Orders", active: false },
          { icon: "person", label: "Profile", active: false },
        ].map((item) => (
          <button 
            key={item.label}
            className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${
              item.active ? "text-[#0071BC] scale-110" : "text-slate-400"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-headline text-[10px] font-bold uppercase tracking-wider mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
