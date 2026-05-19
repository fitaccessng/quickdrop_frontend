import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchProfile } from "../api/auth";
import { createProductReview, fetchProduct, fetchProductReviews } from "../api/products";
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
      <div className="min-h-screen bg-white px-6 pt-24 animate-pulse">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="h-64 rounded-[2rem] bg-surface-container-high" />
          <div className="h-12 w-3/4 rounded-full bg-surface-container-high" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-[1.5rem] bg-surface-container-low" />)}
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
    <div className="min-h-screen bg-white text-on-surface font-body antialiased pb-40">
      <header className="fixed top-0 w-full z-50 bg-white backdrop-blur-xl border-b border-outline/5">
        <div className="max-w-2xl mx-auto flex justify-between items-center px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline/10 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-tertiary">arrow_back</span>
          </button>

          <h1 className="text-xl md:text-2xl font-black text-tertiary font-headline tracking-tight truncate px-2">
            {vendor?.name ?? "Vendor"}
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
        {flashMessage ? (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-on-surface text-surface px-6 py-3 rounded-full text-sm font-bold shadow-lg">
            {flashMessage}
          </div>
        ) : null}
        {reviewMessage ? (
          <div className="fixed top-36 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
            {reviewMessage}
          </div>
        ) : null}

        <section className="relative mb-8 md:mb-12">
          <div className="aspect-square w-full rounded-[2rem] overflow-visible relative">
            <div className="absolute inset-0 bg-primary-container rounded-[2rem] -rotate-2 scale-105 -z-10"></div>
            <img
              src={productImages[activeImageIndex]}
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
          {productImages.length > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-3">
              {productImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-16 w-16 overflow-hidden rounded-2xl border-2 transition-all ${activeImageIndex === index ? "border-[#ff9300]" : "border-transparent"}`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="mb-8">
          <h2 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter text-on-surface leading-tight mb-2">
            {product.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-2 font-bold text-orange-700">
              <span className="material-symbols-outlined text-base" style={materialFilled}>star</span>
              {Number(product.rating ?? 0).toFixed(1)} ({product.review_count ?? 0} reviews)
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-700">{product.category}</span>
            <span className="rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-700">{product.prep_time_minutes} min prep</span>
            <span className="rounded-full bg-slate-100 px-3 py-2 font-semibold text-slate-700">{product.stock_quantity} in stock</span>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3 mb-10">
          <InfoCard label="Price" value={formatMoney(product.price)} />
          <InfoCard label="Vendor" value={vendor?.name || "QuickDrop"} />
          <InfoCard label="Availability" value={product.is_available ? "Live" : "Paused"} />
        </section>

        <section className="mb-12 rounded-[2rem] border border-slate-100 bg-slate-50 p-6">
          <h3 className="text-xl font-bold font-headline text-on-surface mb-4">Product Description</h3>
          <p className="text-on-surface-variant leading-relaxed font-medium">
            {product.description}
          </p>
        </section>

        <section className="mb-12 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold font-headline text-on-surface">Customer Reviews</h3>
              <p className="text-sm text-slate-500">Shoppers can leave feedback and everyone sees the latest product reviews here.</p>
            </div>
          </div>

          <form onSubmit={handleReviewSubmit} className="mt-6 space-y-3">
            <div className="grid grid-cols-[120px_1fr] gap-3 max-sm:grid-cols-1">
              <label className="rounded-[1.5rem] bg-slate-50 px-4 py-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</span>
                <select
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))}
                  className="mt-2 w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value} / 5</option>
                  ))}
                </select>
              </label>
              <label className="rounded-[1.5rem] bg-slate-50 px-4 py-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Review</span>
                <textarea
                  rows={3}
                  value={reviewForm.comment}
                  onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                  placeholder={profileQuery.data ? "Share what stood out about this product" : "Log in to leave a review"}
                  className="mt-2 w-full resize-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={!profileQuery.data || reviewMutation.isPending}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-black uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:bg-slate-200"
            >
              {reviewMutation.isPending ? "Saving Review..." : "Post Review"}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {reviews.length ? (
              reviews.map((review) => (
                <div key={review.id} className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{review.author_name}</p>
                      <p className="text-xs text-slate-400">{new Date(review.updated_at || review.created_at).toLocaleString()}</p>
                    </div>
                    <span className="rounded-full bg-orange-100 px-3 py-2 text-xs font-black text-orange-700">{review.rating}/5</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500">
                No product reviews yet.
              </div>
            )}
          </div>
        </section>

        <button
          onClick={handleAddToCart}
          className="w-full bg-primary text-on-primary font-headline font-bold text-lg py-5 rounded-full flex items-center justify-center gap-3 shadow-[0_12px_24px_-8px_rgba(255,140,0,0.4)] active:scale-95 transition-all duration-200 mb-10"
        >
          <span>Add to Cart</span>
          <span className="material-symbols-outlined">shopping_cart</span>
        </button>
      </main>

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
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest text-tertiary active:scale-90 transition-transform shadow-sm"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span className="font-bold text-lg px-2 text-on-surface w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
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

const InfoCard = ({ label, value }) => (
  <div className="rounded-[1.5rem] bg-surface-container-low p-4 text-center">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-3 text-sm font-bold text-slate-900">{value}</p>
  </div>
);
