import { Link } from "react-router-dom";

import { PageContainer } from "../common/PageContainer";
import { SectionHeading } from "../common/SectionHeading";

export const FeaturedVendorsSection = ({ vendors = [] }) => (
  <section className="py-24 bg-surface-container-low px-6">
    <div className="max-w-7xl mx-auto">
      <div className="mb-16 flex items-end justify-between">
        <div>
          <span className="text-tertiary font-bold uppercase text-xs mb-3 block">Featured</span>
          <h2 className="font-headline text-5xl font-extrabold tracking-tight">Top Curators</h2>
        </div>
        <button className="text-tertiary font-bold flex items-center gap-2 group">
          See All <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link to={vendors[0]?.id ? `/vendor/${vendors[0].id}` : "/explore"} className="md:col-span-2 group cursor-pointer bento-card rounded-[3rem] overflow-hidden bg-white shadow-xl">
          <div className="relative h-[400px]">
            <img className="w-full h-full object-cover" src={vendors[0]?.cover_image_url || vendors[0]?.logo_url || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1000"} alt={vendors[0]?.name || "Featured vendor"} />
            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">star</span>
              <span className="font-bold">4.9</span>
            </div>
          </div>
          <div className="p-10 flex justify-between items-center">
            <div>
              <span className="text-primary font-bold text-sm block">Fine Dining • French</span>
              <h3 className="font-headline text-3xl font-extrabold">{vendors[0]?.name || "Explore vendors"}</h3>
            </div>
          </div>
        </Link>
      </div>
    </div>
  </section>
);
