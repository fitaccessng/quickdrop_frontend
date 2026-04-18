import { Bike, Package, Sandwich, Sparkles } from "lucide-react";

import { PageContainer } from "../common/PageContainer";
import { SectionHeading } from "../common/SectionHeading";

const categories = [
  { title: "Fast meals", note: "For lunch rushes and dinner cravings.", icon: Sandwich },
  { title: "Retail essentials", note: "Household, grocery, and convenience runs.", icon: Package },
  { title: "Beauty and wellness", note: "Premium care delivered with same-day speed.", icon: Sparkles },
  { title: "Courier dispatch", note: "Urgent city deliveries with rider handoff.", icon: Bike },
];

export const CategoriesSection = () => (
  <section className="py-20 px-6 max-w-7xl mx-auto">
    <div className="mb-12">
      <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 block">Categories</span>
      <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight">Everything you need.</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 h-auto md:h-[600px]">
      <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] bg-surface-container bento-card">
        <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000" alt="Food" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-8 left-8 text-white">
          <h3 className="text-3xl font-extrabold font-headline">Food</h3>
        </div>
      </div>
      {/* Add other grid items here following the same pattern */}
    </div>
  </section>
);
