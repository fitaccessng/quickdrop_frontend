import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { fetchProducts } from "../api/products";
import { createVendorProduct, fetchVendorProfile, updateVendorProduct } from "../api/vendorPortal";
import { formatMoney } from "../lib/utils";
import { getInventoryStats } from "../lib/vendorPortal";

const initialForm = {
  name: "",
  description: "",
  image_url: "",
  sku: "",
  price: "",
  prep_time_minutes: 15,
  stock_quantity: 0,
  low_stock_threshold: 5,
  is_available: true,
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item.msg === "string") {
          const field = Array.isArray(item.loc) ? item.loc.at(-1) : null;
          return field ? `${field}: ${item.msg}` : item.msg;
        }
        return null;
      })
      .filter(Boolean);

    if (messages.length) {
      return messages.join(" ");
    }
  }

  if (detail && typeof detail === "object" && typeof detail.msg === "string") {
    return detail.msg;
  }

  return fallback;
};

const isLikelyUrl = (value) => typeof value === "string" && /^(https?:)?\/\//.test(value);

export const VendorUploadProductPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [selectedImages, setSelectedImages] = useState([]); 
  const [formError, setFormError] = useState("");

  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const profileQuery = useQuery({ queryKey: ["vendor-profile"], queryFn: fetchVendorProfile });
  const productsQuery = useQuery({
    queryKey: ["vendor-products-upload", profileQuery.data?.id],
    queryFn: () => fetchProducts({ vendor_id: profileQuery.data.id, include_unavailable: true }),
    enabled: Boolean(profileQuery.data?.id),
  });

  const products = productsQuery.data ?? [];
  const stats = useMemo(() => getInventoryStats(products), [products]);
  const vendorCategory = profileQuery.data?.category || "";
  const formattedPrice = form.price ? formatMoney(Number(form.price) || 0) : formatMoney(0);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (selectedImages.length + files.length > 5) {
      alert("You can only upload up to 5 images");
      return;
    }
    Promise.all(
      files.map(async (file) => ({
        file,
        preview: await fileToDataUrl(file),
      })),
    )
      .then((newImages) => setSelectedImages((prev) => [...prev, ...newImages]))
      .catch(() => setFormError("Unable to process one or more images."));
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const invalidateVendorData = () => {
    queryClient.invalidateQueries({ queryKey: ["vendor-products-upload"] });
    queryClient.invalidateQueries({ queryKey: ["vendor-products-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["product-detail-products"] });
  };

  const inventoryMutation = useMutation({
    mutationFn: updateVendorProduct,
    onSuccess: invalidateVendorData,
  });

  const saveMutation = useMutation({
    mutationFn: ({ productId, ...payload }) =>
      productId ? updateVendorProduct({ productId, ...payload }) : createVendorProduct(payload),
    onSuccess: () => {
      setForm(initialForm);
      setSelectedImages([]);
      setFormError("");
      setEditingProductId(null);
      setIsModalOpen(false);
      invalidateVendorData();
    },
    onError: (error) => {
      setFormError(getErrorMessage(error, "Unable to save product right now."));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    const imagePreviews = selectedImages.map((image) => image.preview);
    const primaryImageUrl = isLikelyUrl(imagePreviews[0]) ? imagePreviews[0] : isLikelyUrl(form.image_url) ? form.image_url : null;

    const payload = {
      ...form,
      price: Number(form.price),
      category: vendorCategory,
      stock_quantity: Number(form.stock_quantity),
      low_stock_threshold: Number(form.low_stock_threshold),
      is_available: form.is_available && Number(form.stock_quantity) > 0,
      image_url: primaryImageUrl,
      image_urls: imagePreviews,
    };
    saveMutation.mutate(editingProductId ? { productId: editingProductId, ...payload } : payload);
  };

  const openCreateModal = () => {
    setEditingProductId(null);
    setForm(initialForm);
    setSelectedImages([]);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProductId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      image_url: product.image_url || "",
      sku: product.sku || "",
      price: String(product.price ?? ""),
      prep_time_minutes: product.prep_time_minutes ?? 15,
      stock_quantity: product.stock_quantity ?? 0,
      low_stock_threshold: product.low_stock_threshold ?? 5,
      is_available: Boolean(product.is_available),
    });
    setSelectedImages(
      (product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : []).map((preview, index) => ({
        file: null,
        preview,
        index,
      })),
    );
    setFormError("");
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#FBFBFB] text-slate-900 min-h-screen font-body antialiased pb-32">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-600 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <img alt="Profile" src={profileQuery.data?.logo_url || "/favicon.svg"} className="w-full h-full object-cover" />
        </div>
      </header>

      {/* RESPONSIVE MAIN CONTAINER */}
      <main className="pt-24 px-4 sm:px-6 max-w-5xl mx-auto">
        <section className="bg-slate-950 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl shadow-slate-200 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff9300] mb-1">Store Performance</p>
            <h2 className="text-2xl sm:text-3xl font-headline font-extrabold mb-6">Inventory Status</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatItem label="Total SKUs" value={stats.totalProducts} />
              <StatItem label="Active" value={stats.availableProducts} color="text-emerald-400" />
              <StatItem label="Low Stock" value={stats.lowStockProducts} color="text-amber-400" />
              <StatItem label="Out" value={stats.outOfStockProducts} color="text-red-400" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-[#ff9300] rounded-full blur-[70px] opacity-10"></div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg sm:text-xl font-headline font-extrabold text-slate-900">Catalog Management</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{products.length} Items</span>
          </div>
          {/* RESPONSIVE CATALOG GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} inventoryMutation={inventoryMutation} onEdit={openEditModal} />
            ))}
          </div>
        </section>
      </main>

      <button
        onClick={openCreateModal}
        className="fixed bottom-10 right-6 z-50 w-16 h-16 bg-[#ff9300] rounded-2xl text-white shadow-xl flex items-center justify-center active:scale-95 hover:scale-105 transition-all"
      >
        <span className="material-symbols-outlined text-3xl" style={materialIconFill}>add</span>
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60]"
            />
            {/* RESPONSIVE MODAL PANEL */}
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 md:inset-y-auto md:top-1/2 md:-translate-y-1/2 md:max-w-xl md:mx-auto z-[70] bg-white rounded-t-[3rem] md:rounded-[2.5rem] max-h-[92vh] md:max-h-[85vh] overflow-y-auto px-7 pt-4 pb-12 shadow-2xl"
            >
              {/* Handle Bar (Hidden on Desktop) */}
              <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-4 md:hidden" />
              
              {/* Close Button */}
              <div className="absolute top-6 right-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
              
              <div className="mb-8 text-center pt-4">
                <h2 className="text-2xl font-headline font-extrabold text-slate-900">{editingProductId ? "Edit Product" : "Add Product"}</h2>
                <p className="text-sm text-slate-400 font-medium">{editingProductId ? "Update your product details and images" : "Capture details for your new item"}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* PRODUCT MEDIA SECTION */}
                <div className="space-y-4 bg-orange-50/40 p-5 rounded-[2rem] border border-orange-100/60">
                   <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#ff9300]/10 text-[#ff9300] flex items-center justify-center material-symbols-outlined text-sm font-bold">photo_camera</span>
                        <label className="text-xs font-black uppercase tracking-widest text-slate-800">Product Media</label>
                      </div>
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-orange-100 text-[#ff9300]">
                        {selectedImages.length}/5 uploaded
                      </span>
                   </div>

                   {selectedImages.length < 5 && (
                     <label className="relative border-2 border-dashed border-[#ff9300]/40 bg-white hover:bg-orange-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-sm group">
                       <div className="w-12 h-12 rounded-2xl bg-orange-100/70 text-[#ff9300] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                         <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                       </div>
                       <p className="text-sm font-extrabold text-slate-900">Click to upload photos</p>
                       <p className="text-xs text-slate-400 font-medium mt-0.5">PNG, JPG or WEBP (Max 5 images)</p>
                       <input 
                         type="file" 
                         multiple 
                         accept="image/*" 
                         className="hidden" 
                         onChange={handleImageChange} 
                       />
                     </label>
                   )}

                   {selectedImages.length > 0 && (
                     <div className="space-y-3">
                       <div className="flex items-center justify-between px-1">
                         <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Uploaded previews (First is cover)</p>
                         <button type="button" onClick={() => setSelectedImages([])} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Clear All</button>
                       </div>
                       <div className="grid grid-cols-5 gap-2">
                          {selectedImages.map((img, index) => (
                            <div key={index} className={`relative aspect-square rounded-2xl overflow-hidden border-2 ${index === 0 ? "border-[#ff9300] shadow-md" : "border-slate-200"} bg-white group`}>
                              <img src={img.preview} className="w-full h-full object-cover" alt="Preview" />
                              {index === 0 && (
                                <span className="absolute bottom-1 left-1 bg-[#ff9300] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Cover</span>
                              )}
                              <button 
                                type="button" 
                                onClick={() => removeImage(index)}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <span className="material-symbols-outlined text-white text-base">close</span>
                              </button>
                            </div>
                          ))}
                       </div>
                     </div>
                   )}
                </div>

                {/* FORM INPUTS */}
                <div className="space-y-5">
                  <Field label="Name of Product">
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="modern-input" placeholder="e.g. Vintage Leather Bag" />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Category">
                      <div className="modern-input flex items-center justify-between text-slate-900">
                        <span>{vendorCategory || "Vendor category"}</span>
                        <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#ff9300]">
                          Saved
                        </span>
                      </div>
                    </Field>
                    <Field label="Serial/SKU">
                      <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="modern-input" placeholder="BAG-001" />
                    </Field>
                  </div>

                  {/* REDESIGNED PRICE SECTION */}
                   <div className="flex items-center justify-between px-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center material-symbols-outlined text-sm font-bold">payments</span>
                        <label className="text-xs font-black uppercase tracking-widest text-slate-800">Price</label>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-7 relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-extrabold text-slate-600 shadow-sm group-focus-within:border-[#ff9300] group-focus-within:text-[#ff9300] transition-colors">
                          R
                        </div>
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          className="modern-input pl-16 py-3.5 text-lg font-black bg-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="sm:col-span-5 rounded-2xl border border-orange-200/60 bg-gradient-to-br from-orange-50 to-amber-50/30 px-4 py-3 flex flex-col justify-center">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff9300]">Customer View</span>
                        <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 truncate">{formattedPrice}</span>
                      </div>
                    </div>
                  {/* <div className="space-y-2 bg-slate-50/80 p-5 rounded-[2rem] border border-slate-100">
                   
                  </div> */}

                  <Field label="Product Bio / Description">
                    <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="modern-input py-4 resize-none leading-relaxed" placeholder="Tell customers what makes this special..." />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Stock Avail.">
                      <input required type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="modern-input" placeholder="0" />
                    </Field>
                    <Field label="Low Alert">
                      <input type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} className="modern-input border-transparent focus:border-amber-200" placeholder="5" />
                    </Field>
                  </div>
                </div>

                {formError ? <p className="text-sm font-bold text-red-500">{formError}</p> : null}

                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="w-full py-5 bg-slate-950 text-white font-headline font-extrabold text-lg rounded-[2rem] shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {saveMutation.isPending ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>{editingProductId ? "Save Changes" : "Publish Product"} <span className="material-symbols-outlined text-sm">auto_awesome</span></>
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .modern-input {
          width: 100%;
          background: #f8fafc;
          border: 1.5px solid #f1f5f9;
          border-radius: 1.25rem;
          padding: 0.875rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
        }
        .modern-input:focus {
          background: #ffffff;
          border-color: #ff9300;
          box-shadow: 0 0 0 4px rgba(255, 147, 0, 0.08);
        }
        .modern-input::placeholder {
          color: #cbd5e1;
          font-weight: 500;
        }
      `}} />
    </div>
  );
};

const StatItem = ({ label, value, color = "text-white" }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
    <p className={`text-xl font-black mt-1 ${color}`}>{value}</p>
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1.5">{label}</label>
    {children}
  </div>
);

const ProductItem = ({ product, inventoryMutation, onEdit }) => {
  const isLow = (product.stock_quantity || 0) <= (product.low_stock_threshold || 5);
  const isOut = (product.stock_quantity || 0) <= 0;

  return (
    <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0">
        <img src={product.image_url || product.image_urls?.[0] || "/favicon.svg"} className="w-full h-full object-cover" alt={product.name} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 truncate pr-2">{product.name}</h4>
          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isOut ? "bg-red-50 text-red-500" : isLow ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
            {isOut ? "Out" : isLow ? "Low" : "Live"}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button type="button" onClick={() => onEdit(product)} className="rounded-lg bg-orange-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#ff9300]">
            Edit
          </button>
          <button type="button" onClick={() => inventoryMutation.mutate({ productId: product.id, stock_quantity: Math.max(0, (product.stock_quantity || 0) - 1) })} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-slate-400 hover:text-slate-900 transition-colors">-</button>
          <span className="text-sm font-black w-6 text-center">{product.stock_quantity || 0}</span>
          <button type="button" onClick={() => inventoryMutation.mutate({ productId: product.id, stock_quantity: (product.stock_quantity || 0) + 1, is_available: true })} className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">+</button>
        </div>
      </div>
    </div>
  );
};