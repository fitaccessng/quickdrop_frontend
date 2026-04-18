import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchProducts } from "../api/products";
import { fetchVendors } from "../api/vendors";
import { formatMoney } from "../lib/utils";
import { useCartStore } from "../store/cartStore";

const materialFilled = {
  fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24",
};

const statFallbacks = [
  { key: "calories", label: "Kcal", fallback: "580" },
  { key: "protein", label: "Proteins", fallback: "32g" },
  { key: "fat", label: "Fats", fallback: "28g" },
  { key: "carbs", label: "Carbo", fallback: "44g" },
];

const defaultIngredients = ["Organic Beef", "Aged Cheddar", "Gluten-Free Option"];

const normalizeNutrition = (product) => {
  const nutrition = product?.nutritionInfo ?? {};
  return {
    calories: nutrition.calories ?? product?.calories ?? "580",
    protein: nutrition.protein ?? "32g",
    fat: nutrition.fat ?? "28g",
    carbs: nutrition.carbs ?? "44g",
  };
};

export const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("favorites")) || []);
  const [flashMessage, setFlashMessage] = useState("");

  const productsQuery = useQuery({
    queryKey: ["product-detail-products"],
    queryFn: () => fetchProducts({}),
  });

  const vendorsQuery = useQuery({
    queryKey: ["product-detail-vendors"],
    queryFn: () => fetchVendors({}),
  });

  const product = useMemo(
    () => productsQuery.data?.find((item) => String(item.id) === String(productId)),
    [productId, productsQuery.data],
  );

  const vendor = useMemo(() => {
    if (!product) return null;
    return vendorsQuery.data?.find((item) => item.id === product.vendor_id) ?? product.vendor ?? null;
  }, [product, vendorsQuery.data]);

  const nutrition = useMemo(() => normalizeNutrition(product), [product]);
  const ingredients = product?.ingredients?.length ? product.ingredients : defaultIngredients;
  const rating = product?.rating ?? vendor?.rating ?? 4.9;
  const reviewCount = product?.reviews ?? vendor?.review_count ?? 120;
  const totalPrice = (product?.price ?? 0) * quantity;
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isFavorite = product ? favorites.includes(product.id) : false;

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (!flashMessage) return undefined;
    const timer = window.setTimeout(() => setFlashMessage(""), 2200);
    return () => window.clearTimeout(timer);
  }, [flashMessage]);

  const handleAddToCart = () => {
    if (!product) return;

    const cartVendor = {
      id: vendor?.id ?? product.vendor_id ?? 1,
      name: vendor?.name ?? "Vendor",
      logo_url: vendor?.logo_url ?? "",
    };

    for (let index = 0; index < quantity; index += 1) {
      addItem(product, cartVendor);
    }

    setFlashMessage(`${product.name} added to cart`);
  };

  const toggleFavorite = () => {
    if (!product) return;
    setFavorites((current) =>
      current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id],
    );
  };

  if (productsQuery.isLoading || vendorsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-surface px-6 pt-24 animate-pulse">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="h-64 rounded-[2rem] bg-surface-container-high" />
          <div className="h-12 w-3/4 rounded-full bg-surface-container-high" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-full bg-surface-container-low" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
        <h1 className="font-headline text-3xl font-black text-on-surface">Product not found</h1>
        <button onClick={() => navigate(-1)} className="mt-6 rounded-full bg-primary px-8 py-3 text-on-primary font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body antialiased pb-40">
      {/* Top Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline/5">
        <div className="max-w-2xl mx-auto flex justify-between items-center px-6 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline/10 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-tertiary">arrow_back</span>
          </button>
          
          <h1 className="text-xl md:text-2xl font-black text-tertiary font-headline tracking-tight truncate px-2">
            {vendor?.name ?? "The Digital Organicist"}
          </h1>

          <button 
            onClick={() => navigate("/cart")}
            className="relative w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline/10 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-on-surface">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {flashMessage && (
           <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-on-surface text-surface px-6 py-3 rounded-full text-sm font-bold shadow-lg">
            {flashMessage}
          </div>
        )}

        {/* Hero Image Section */}
        <section className="relative mb-8 md:mb-12">
          <div className="aspect-square w-full rounded-[2rem] overflow-visible relative">
            <div className="absolute inset-0 bg-primary-container rounded-[2rem] -rotate-2 scale-105 -z-10"></div>
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover rounded-[2rem] shadow-xl transition-transform duration-500 hover:scale-[1.02]" 
            />
            <button 
              onClick={toggleFavorite}
              className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-surface/90 backdrop-blur shadow-lg border border-outline/10 active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-error" style={isFavorite ? materialFilled : {}}>
                favorite
              </span>
            </button>
          </div>
        </section>

        {/* Product Title */}
        <section className="mb-8">
          <h2 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter text-on-surface leading-tight mb-2">
            {product.name}
          </h2>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={materialFilled}>star</span>
            <span className="font-bold text-on-surface">{Number(rating).toFixed(1)}</span>
            <span className="text-on-surface-variant text-sm">({reviewCount}+ Reviews)</span>
          </div>
        </section>

        {/* Nutrition Facts Bento Grid */}
        <section className="grid grid-cols-4 gap-3 mb-10">
          {statFallbacks.map((stat) => (
            <div key={stat.key} className="bg-surface-container-low p-4 rounded-full flex flex-col items-center justify-center text-center">
              <span className="text-tertiary font-bold text-lg font-headline">
                {nutrition[stat.key] || stat.fallback}
              </span>
              <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        {/* Description Section */}
        <section className="mb-12">
          <h3 className="text-xl font-bold font-headline text-on-surface mb-4">Ingredients</h3>
          <p className="text-on-surface-variant leading-relaxed mb-6 font-medium">
            {product.description || "Our signature organic selection prepared with the freshest ingredients and house-made sauces."}
          </p>
          <div className="flex flex-wrap gap-3">
            {ingredients.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-full text-sm font-semibold text-on-surface-variant border border-outline/10">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Primary Buy Button */}
        <button 
          onClick={handleAddToCart}
          className="w-full bg-primary text-on-primary font-headline font-bold text-lg py-5 rounded-full flex items-center justify-center gap-3 shadow-[0_12px_24px_-8px_rgba(255,140,0,0.4)] active:scale-95 transition-all duration-200 mb-10"
        >
          <span>Buy Now</span>
          <span className="material-symbols-outlined">shopping_cart</span>
        </button>
      </main>

      {/* Sticky Footer with Price and Counter */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-2xl rounded-t-[2rem] shadow-[0_-8px_32px_rgba(0,0,0,0.06)] px-8 pt-6 pb-10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest">Total Price</span>
            <span className="text-3xl font-black font-headline text-on-surface">
              {formatMoney(totalPrice)}
            </span>
          </div>
          
          <div className="flex items-center gap-4 bg-surface-container-high p-1 rounded-full">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest text-tertiary active:scale-90 transition-transform shadow-sm"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span className="font-bold text-lg px-2 text-on-surface w-6 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-on-primary active:scale-90 transition-transform shadow-sm"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};