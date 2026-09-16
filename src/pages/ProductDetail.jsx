import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchProfile } from "../api/auth";
import { createProductReview, fetchProduct, fetchProductReviews, fetchProducts } from "../api/products";
import { fetchVendor } from "../api/vendors";
import { formatMoney } from "../lib/utils";
import { useCartStore } from "../store/cartStore";

const materialFilled = {
  fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24",
};

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const messages = detail.map((item) => item?.msg || item).filter(Boolean);
    if (messages.length) return messages.join(" ");
  }
  return fallback;
};

export const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("favorites")) || []);
  const [flashMessage, setFlashMessage] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewMessage, setReviewMessage] = useState("");

  const productQuery = useQuery({
    queryKey: ["product-detail", productId],
    queryFn: () => fetchProduct(productId),
    enabled: Boolean(productId),
  });
  const reviewsQuery = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => fetchProductReviews(productId),
    enabled: Boolean(productId),
  });
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const vendorQuery = useQuery({
    queryKey: ["product-detail-vendor", productQuery.data?.vendor_id],
    queryFn: () => fetchVendor(productQuery.data.vendor_id),
    enabled: Boolean(productQuery.data?.vendor_id),
  });

  const vendorProductsQuery = useQuery({
    queryKey: ["vendor-products-from-product-detail", vendorQuery.data?.id],
    queryFn: () => fetchProducts({ vendor_id: vendorQuery.data.id }),
    enabled: Boolean(vendorQuery.data?.id),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ productId: currentProductId, ...payload }) => createProductReview({ productId: currentProductId, ...payload }),
    onSuccess: () => {
      setReviewMessage("Your review is now live.");
      setReviewForm((current) => ({ ...current, comment: "" }));
      queryClient.invalidateQueries({ queryKey: ["product-detail", productId] });
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product-detail-vendor", productQuery.data?.vendor_id] });
    },
    onError: (error) => {
      setReviewMessage(getErrorMessage(error, "Unable to save your review right now."));
    },
  });

  const product = productQuery.data;
  const vendor = vendorQuery.data;
  const vendorProducts = vendorProductsQuery.data ?? [];
  const relatedProducts = vendorProducts.filter((item) => item.id !== product?.id).slice(0, 4);
  const reviews = reviewsQuery.data ?? product?.reviews ?? [];
  const totalPrice = (product?.price ?? 0) * quantity;
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isFavorite = product ? favorites.includes(product.id) : false;
  
  const productImages = useMemo(() => {
    if (!product) return ["/favicon.svg"];
    const images = [
      ...(Array.isArray(product.image_urls) ? product.image_urls : []),
      product.image_url,
    ].filter(Boolean);
    return images.length ? [...new Set(images)] : ["/favicon.svg"];
  }, [product]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (!flashMessage && !reviewMessage) return undefined;
    const timer = window.setTimeout(() => {
      setFlashMessage("");
      setReviewMessage("");
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [flashMessage, reviewMessage]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [productId]);

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

  const handleReviewSubmit = (event) => {
    event.preventDefault();
    if (!product) return;
    reviewMutation.mutate({
      productId: product.id,
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment,
    });
  };

  if (productQuery.isLoading || vendorQuery.isLoading) {
    return (
      <div className="min-h-screen bg-white px-4 sm:px-6 pt-24 animate-pulse">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="h-64 sm:h-80 rounded-3xl bg-slate-100" />
          <div className="h-10 w-3/4 rounded-full bg-slate-100" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-slate-100" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="font-headline text-2xl sm:text-3xl font-black text-slate-900">Product not found</h1>
        <button onClick={() => navigate(-1)} className="mt-5 rounded-full bg-slate-900 px-6 py-3 text-white text-sm font-bold active:scale-95 transition-transform">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900 font-body antialiased pb-44 selection:bg-rose-500 selection:text-white">
      {/* Top Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-700 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>

          <h1 className="text-base sm:text-lg font-bold text-slate-900 font-headline tracking-tight truncate px-2 max-w-[200px] sm:max-w-xs">
            {vendor?.name ?? "Vendor"}
          </h1>

          <button
            onClick={() => navigate("/cart")}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-700 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 px-4 sm:px-6 max-w-2xl mx-auto">
        {flashMessage ? (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg">
            {flashMessage}
          </div>
        ) : null}
        {reviewMessage ? (
          <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg">
            {reviewMessage}
          </div>
        ) : null}

        {/* Product Image Viewer */}
        <section className="relative my-4 sm:my-6">
          <div className="aspect-square w-full rounded-3xl overflow-hidden relative bg-slate-100 shadow-sm border border-slate-100">
            <img
              src={productImages[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
            <button
              onClick={toggleFavorite}
              className="absolute top-3.5 right-3.5 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-md active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-rose-600 text-xl" style={isFavorite ? materialFilled : {}}>
                favorite
              </span>
            </button>
          </div>
          
          {/* Thumbnails */}
          {productImages.length > 1 ? (
            <div className="mt-3 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {productImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${activeImageIndex === index ? "border-rose-600 shadow-sm" : "border-transparent opacity-70"}`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        {/* Title & Metadata */}
        <section className="my-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-headline tracking-tight text-slate-900 leading-tight mb-2">
            {product.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 font-bold text-amber-700">
              <span className="material-symbols-outlined text-sm" style={materialFilled}>star</span>
              {Number(product.rating ?? 0).toFixed(1)} ({product.review_count ?? 0})
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">{product.category}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">{product.prep_time_minutes}m prep</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">{product.stock_quantity} left</span>
          </div>
        </section>

        {/* Quick Information Cards */}
        <section className="grid grid-cols-3 gap-2.5 sm:gap-3 my-6">
          <InfoCard label="Price" value={formatMoney(product.price)} />
          <InfoCard
            label="Vendor"
            value={vendor?.name || "QuickDrop"}
            clickable={Boolean(vendor?.id ?? product.vendor_id)}
            onClick={() => navigate(`/vendor/${vendor?.id ?? product.vendor_id}`)}
          />
          <InfoCard label="Status" value={product.is_available ? "Live" : "Paused"} />
        </section>

        {/* Description */}
        <section className="my-6 rounded-3xl border border-slate-100 bg-slate-50/70 p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold font-headline text-slate-900 mb-2">Description</h3>
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            {product.description || "No description provided for this product."}
          </p>
        </section>

        {/* Reviews Section */}
        <section className="my-6 rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-headline text-slate-900">Customer Reviews</h3>
            <p className="text-xs sm:text-sm text-slate-500">Share feedback or read shopper experiences.</p>
          </div>

          <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-3">
              <label className="rounded-2xl bg-slate-50 px-3.5 py-2.5 border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rating</span>
                <select
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))}
                  className="mt-1 w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value} / 5 Stars</option>
                  ))}
                </select>
              </label>
              <label className="rounded-2xl bg-slate-50 px-3.5 py-2.5 border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Review</span>
                <textarea
                  rows={2}
                  value={reviewForm.comment}
                  onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                  placeholder={profileQuery.data ? "What stood out about this product?" : "Log in to review"}
                  className="mt-1 w-full resize-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={!profileQuery.data || reviewMutation.isPending}
              className="w-full sm:w-auto rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:bg-slate-200 transition-colors"
            >
              {reviewMutation.isPending ? "Saving..." : "Post Review"}
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {reviews.length ? (
              reviews.map((review) => (
                <div key={review.id} className="rounded-2xl bg-slate-50 p-4 border border-slate-100/60">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">{review.author_name}</p>
                      <p className="text-[10px] text-slate-400">{new Date(review.updated_at || review.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-800">{review.rating}/5</span>
                  </div>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 text-xs sm:text-sm font-medium text-slate-500 text-center">
                No product reviews yet.
              </div>
            )}
          </div>
        </section>

        {vendor && relatedProducts.length > 0 ? (
          <section className="my-6 rounded-3xl border border-slate-100 bg-slate-50/70 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-headline text-slate-900">More from {vendor.name}</h3>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500">Other products from this vendor</p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/vendor/${vendor.id}`)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-900 hover:text-white"
              >
                View Profile
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {relatedProducts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition-transform active:scale-[0.98]"
                >
                  <div className="h-24 sm:h-28 bg-slate-100">
                    <img src={item.image_url || item.image_urls?.[0] || item.image || "/favicon.svg"} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-1 text-[11px] sm:text-xs font-black text-slate-900">{item.name}</p>
                    <span className="mt-1 block text-[10px] sm:text-xs font-bold text-amber-700">{formatMoney(item.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      {/* Sticky Bottom Action Bar with Safe Area Consideration */}
      <footer className="fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.05)] border-t border-slate-100 px-4 sm:px-6 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="w-full sm:w-auto flex justify-between sm:flex-col items-center sm:items-start">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Price</span>
            <span className="text-2xl sm:text-3xl font-black font-headline text-slate-900">
              {formatMoney(totalPrice)}
            </span>
          </div>

          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-slate-700 active:scale-90 transition-transform shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <span className="font-bold text-sm px-2 text-slate-900 text-center min-w-[20px]">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 text-white active:scale-90 transition-transform shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              className="flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-700 text-white font-headline font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 active:scale-95 transition-all"
            >
              <span>Add to Cart</span>
              <span className="material-symbols-outlined text-base">shopping_cart</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const InfoCard = ({ label, value, clickable = false, onClick }) => (
  <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 text-center border border-slate-100">
    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
    {clickable ? (
      <button
        type="button"
        onClick={onClick}
        className="mt-1.5 block w-full truncate text-xs sm:text-sm font-bold text-slate-900 underline decoration-amber-500 decoration-2 underline-offset-4 transition-colors hover:text-amber-700 active:scale-[0.98]"
      >
        {value}
      </button>
    ) : (
      <p className="mt-1.5 text-xs sm:text-sm font-bold text-slate-900 truncate">{value}</p>
    )}
  </div>
);