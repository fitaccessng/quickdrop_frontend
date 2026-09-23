import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminServiceCategory,
  fetchAdminServiceCategories,
  updateAdminServiceCategory,
} from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";

const initialForm = {
  name: "",
  description: "",
  image_url: "",
  is_active: true,
};

export const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["admin-service-categories"],
    queryFn: fetchAdminServiceCategories,
  });

  const createMutation = useMutation({
    mutationFn: createAdminServiceCategory,
    onSuccess: () => {
      setMessage("Category created.");
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ["admin-service-categories"] });
    },
    onError: (error) => {
      setMessage(error.response?.data?.detail || "Unable to create category.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminServiceCategory,
    onSuccess: () => {
      setMessage("Category updated.");
      setEditingId(null);
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ["admin-service-categories"] });
    },
    onError: (error) => {
      setMessage(error.response?.data?.detail || "Unable to update category.");
    },
  });

  const categories = categoriesQuery.data ?? [];
  const activeCount = useMemo(() => categories.filter((item) => item.is_active).length, [categories]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");
    if (editingId) {
      updateMutation.mutate({ categoryId: editingId, ...form });
      return;
    }
    createMutation.mutate(form);
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 3.5 * 1024 * 1024) {
      setMessage("Please choose an image smaller than 3.5 MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image_url: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <AdminShell title="Service Categories" subtitle="Manage the category list used across onboarding, services, and product discovery.">
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9300]">
            {editingId ? "Edit Category" : "New Category"}
          </p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field
              label="Category Name"
              value={form.name}
              onChange={(value) => setForm((current) => ({ ...current, name: value }))}
            />
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Category Image</span>
              {form.image_url ? (
                <div className="relative h-40 overflow-hidden rounded-2xl bg-slate-100">
                  <img src={form.image_url} alt="Category preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, image_url: "" }))}
                    className="absolute right-3 top-3 rounded-xl bg-slate-950/80 px-3 py-2 text-xs font-black text-white"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
              />
            </div>
            <label className="block space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                placeholder="Optional note about where this category should be used."
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <span className="text-sm font-bold text-slate-700">Active</span>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                className="h-4 w-4 accent-slate-900"
              />
            </label>
            {message ? <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p> : null}
            <div className="flex gap-3">
              <button
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-2xl bg-slate-900 px-5 py-4 text-sm font-black uppercase tracking-widest text-white"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingId
                    ? "Update Category"
                    : "Create Category"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(initialForm);
                    setMessage("");
                  }}
                  className="rounded-2xl bg-slate-100 px-5 py-4 text-sm font-black uppercase tracking-widest text-slate-700"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total Categories" value={categories.length} />
            <StatCard label="Active Categories" value={activeCount} accent />
            <StatCard label="Inactive Categories" value={categories.length - activeCount} />
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9300]">Current Categories</p>
            <div className="mt-4 space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {category.image_url ? (
                      <img src={category.image_url} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-[10px] font-bold text-slate-500">Image</div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-extrabold text-slate-900">{category.name}</p>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest ${category.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                          {category.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{category.slug}</p>
                      {category.description ? <p className="mt-2 text-sm text-slate-600">{category.description}</p> : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(category.id);
                        setForm({
                          name: category.name || "",
                          description: category.description || "",
                          image_url: category.image_url || "",
                          is_active: category.is_active,
                        });
                        setMessage("");
                      }}
                      className="rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateMutation.mutate({
                          categoryId: category.id,
                          is_active: !category.is_active,
                        })
                      }
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white"
                    >
                      {category.is_active ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              ))}
              {!categories.length ? <p className="text-sm text-slate-500">No categories found yet.</p> : null}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
};

const Field = ({ label, value, onChange }) => (
  <label className="block space-y-2">
    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
    <input
      value={value}
      required
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
    />
  </label>
);

const StatCard = ({ label, value, accent }) => (
  <div className={`rounded-[1.75rem] border p-5 shadow-sm ${accent ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"}`}>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
  </div>
);
