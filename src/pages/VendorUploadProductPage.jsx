import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { fetchProducts } from "../api/products";
import { createVendorProduct, fetchVendorProfile, updateVendorProduct } from "../api/vendorPortal";
import { formatMoney } from "../lib/utils";
import { getInventoryStats, isFoodCategory } from "../lib/vendorPortal";

const initialForm = {
  name: "",
  description: "",
  image_url: "",
  sku: "",
  price: "",
  category: "",
  prep_time_minutes: 15,
  stock_quantity: 0,
  low_stock_threshold: 5,
  is_available: true,
};

export const VendorUploadProductPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedImages, setSelectedImages] = useState([]); // Array of {file, preview}

  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const profileQuery = useQuery({ queryKey: ["vendor-profile"], queryFn: fetchVendorProfile });
  const productsQuery = useQuery({
    queryKey: ["vendor-products-upload", profileQuery.data?.id],
    queryFn: () => fetchProducts({ vendor_id: profileQuery.data.id, include_unavailable: true }),
    enabled: Boolean(profileQuery.data?.id),
  });

  const products = productsQuery.data ?? [];
  const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))], [products]);
  const stats = useMemo(() => getInventoryStats(products), [products]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 5) {
      alert("You can only upload up to 5 images");
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const invalidateVendorData = () => {
    queryClient.invalidateQueries({ queryKey: ["vendor-products-upload"] });
    queryClient.invalidateQueries({ queryKey: ["vendor-products-dashboard"] });
  };

  const createMutation = useMutation({
    mutationFn: createVendorProduct,
    onSuccess: () => {
      setForm(initialForm);
      setSelectedImages([]);
      setIsModalOpen(false);
      invalidateVendorData();
    },
  });

  const inventoryMutation = useMutation({
    mutationFn: updateVendorProduct,
    onSuccess: invalidateVendorData,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      low_stock_threshold: Number(form.low_stock_threshold),
      is_available: form.is_available && Number(form.stock_quantity) > 0,
    };
    // Note: In a real app, you'd upload selectedImages to S3/Cloudinary here first
    createMutation.mutate(payload);
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
          <img alt="Profile" src={profileQuery.data?.logo_url || "https://via.placeholder.com/150"} className="w-full h-full object-cover" />
        </div>
      </header>

      <main className="pt-24 px-5 max-w-md mx-auto">
        <section className="bg-slate-950 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-slate-200 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff9300] mb-1">Store Performance</p>
            <h2 className="text-2xl font-headline font-extrabold mb-6">Inventory Status</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatItem label="Total SKUs" value={stats.totalProducts} />
              <StatItem label="Active" value={stats.availableProducts} color="text-emerald-400" />
              <StatItem label="Low Stock" value={stats.lowStockProducts} color="text-amber-400" />
              <StatItem label="Out" value={stats.outOfStockProducts} color="text-red-400" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-[#ff9300] rounded-full blur-[70px] opacity-10"></div>
        </section>

        <section className="space-y-4">
          <h3 className="px-2 text-lg font-headline font-extrabold text-slate-900">Catalog Management</h3>
          <div className="space-y-3">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} inventoryMutation={inventoryMutation} />
            ))}
          </div>
        </section>
      </main>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-6 z-50 w-16 h-16 bg-[#ff9300] rounded-2xl text-white shadow-xl flex items-center justify-center active:scale-90 transition-transform"
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
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[3rem] max-h-[92vh] overflow-y-auto px-7 pt-4 pb-12 shadow-2xl"
      >
        {/* Handle Bar */}
        <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-4" />
        
        {/* Close Button */}
        <div className="absolute top-6 right-6">
          <button 
            onClick={() => setIsModalOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        
        <div className="mb-8 text-center pt-4">
          <h2 className="text-2xl font-headline font-extrabold text-slate-900">Add Product</h2>
          <p className="text-sm text-slate-400 font-medium">Capture details for your new item</p>
        </div>
             

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* MULTIPLE IMAGE SELECTION */}
                <div className="space-y-4">
                   <div className="flex justify-between items-end px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Media ({selectedImages.length}/5)</label>
                      {selectedImages.length > 0 && (
                        <button type="button" onClick={() => setSelectedImages([])} className="text-[10px] font-bold text-red-400 uppercase">Clear All</button>
                      )}
                   </div>
                   <div className="grid grid-cols-5 gap-2">
                      {selectedImages.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group">
                          <img src={img.preview} className="w-full h-full object-cover" alt="Preview" />
                          <button 
                            type="button" 
                            onClick={() => removeImage(index)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-white text-sm">close</span>
                          </button>
                        </div>
                      ))}
                      
                      {selectedImages.length < 5 && (
                        <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 hover:border-[#ff9300]/40 transition-all active:scale-95">
                          <span className="material-symbols-outlined text-xl">add_a_photo</span>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageChange} 
                          />
                        </label>
                      )}
                      
                      {/* Empty Placeholder Slots to keep grid consistent */}
                      {[...Array(Math.max(0, 4 - selectedImages.length))].map((_, i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-slate-50/50 border border-slate-50" />
                      ))}
                   </div>
                </div>

                {/* UPDATED INPUT DESIGN */}
                <div className="space-y-5">
                  <Field label="Name of Product">
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="modern-input" placeholder="e.g. Vintage Leather Bag" />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Category">
                      <div className="relative">
                        <input list="modal-cats" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="modern-input pr-10" placeholder="Fashion" />
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm pointer-events-none">expand_more</span>
                      </div>
                      <datalist id="modal-cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
                    </Field>
                    <Field label="Serial/SKU">
                      <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="modern-input" placeholder="BAG-001" />
                    </Field>
                  </div>

                <Field label="Price">
  <div className="relative group">
    {/* South African Rand Symbol Container */}
    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[13px] font-black text-slate-500 group-focus-within:bg-[#ff9300]/10 group-focus-within:text-[#ff9300] transition-colors">
      R
    </div>
    <input 
      required 
      type="number" 
      value={form.price} 
      onChange={(e) => setForm({ ...form, price: e.target.value })} 
      className="modern-input pl-14" 
      placeholder="0.00" 
    />
  </div>
</Field>

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

                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full py-5 bg-slate-950 text-white font-headline font-extrabold text-lg rounded-[2rem] shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Publish Product <span className="material-symbols-outlined text-sm">auto_awesome</span></>
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

const ProductItem = ({ product, inventoryMutation }) => {
  const isLow = (product.stock_quantity || 0) <= (product.low_stock_threshold || 5);
  const isOut = (product.stock_quantity || 0) <= 0;

  return (
    <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0">
        <img src={product.image_url || `https://picsum.photos/seed/${product.id}/200`} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 truncate pr-2">{product.name}</h4>
          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isOut ? "bg-red-50 text-red-500" : isLow ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
            {isOut ? "Out" : isLow ? "Low" : "Live"}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={() => inventoryMutation.mutate({ productId: product.id, stock_quantity: Math.max(0, (product.stock_quantity || 0) - 1) })} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-slate-400 hover:text-slate-900 transition-colors">-</button>
          <span className="text-sm font-black w-6 text-center">{product.stock_quantity || 0}</span>
          <button onClick={() => inventoryMutation.mutate({ productId: product.id, stock_quantity: (product.stock_quantity || 0) + 1, is_available: true })} className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">+</button>
        </div>
      </div>
    </div>
  );
};