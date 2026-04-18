import { useQuery } from "@tanstack/react-query";

import { fetchProducts } from "../api/products";
import { fetchVendors } from "../api/vendors";
import { PageContainer } from "../components/common/PageContainer";
import { SectionHeading } from "../components/common/SectionHeading";
import { formatMoney } from "../lib/utils";

export const ExplorePage = () => {
  const vendorsQuery = useQuery({ queryKey: ["explore-vendors"], queryFn: () => fetchVendors({}) });
  const productsQuery = useQuery({ queryKey: ["explore-products"], queryFn: () => fetchProducts({}) });

  const vendors = vendorsQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const categories = [...new Set(vendors.map((vendor) => vendor.category))];

  return (
    <PageContainer className="space-y-10">
      <SectionHeading
        eyebrow="Explore"
        title="Discover what is currently live in the marketplace."
        description="This page now uses the backend vendor and product feeds instead of static discovery cards."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.8rem] bg-white/[0.05] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-base-300">Active vendors</p>
          <p className="mt-3 text-4xl font-bold text-white">{vendors.length}</p>
        </div>
        <div className="rounded-[1.8rem] bg-white/[0.05] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-base-300">Catalog products</p>
          <p className="mt-3 text-4xl font-bold text-white">{products.length}</p>
        </div>
        <div className="rounded-[1.8rem] bg-white/[0.05] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-base-300">Categories</p>
          <p className="mt-3 text-4xl font-bold text-white">{categories.length}</p>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Categories"
          title="Backend-powered browsing starts with vendor categories."
          description="These categories are derived from the live vendor feed."
        />
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <div key={category} className="rounded-full bg-white/10 px-4 py-3 text-sm text-base-100">
              {category}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Storefronts"
          title="Vendors currently available."
          description="Use these storefronts to jump into product browsing and cart building."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="rounded-[1.8rem] bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-base-300">{vendor.category}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{vendor.name}</p>
              <p className="mt-2 text-sm text-base-300">{vendor.description}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-base-300">
                <span>{vendor.city}</span>
                <span>{vendor.prep_time_minutes} min</span>
                <span>{formatMoney(vendor.delivery_fee)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Catalog"
          title="Recent products in the feed."
          description="These are pulled from the product API without local mock fixtures."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 9).map((product) => (
            <div key={product.id} className="rounded-[1.8rem] bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-base-300">{product.category}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{product.name}</p>
              <p className="mt-2 text-sm text-base-300">{product.description}</p>
              <p className="mt-4 text-lg font-semibold text-white">{formatMoney(product.price)}</p>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
};
