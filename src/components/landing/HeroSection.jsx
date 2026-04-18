import { ArrowRight, TimerReset, Truck, WandSparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { PageContainer } from "../common/PageContainer";

const metrics = [
  { label: "Live vendors", value: "240+" },
  { label: "Avg dispatch", value: "23 min" },
  { label: "Service zones", value: "16 cities" },
];

export const HeroSection = () => (
  <section className="px-6 py-20 lg:py-32 max-w-7xl mx-auto text-center">
    <h1 className="font-headline text-5xl md:text-8xl font-extrabold text-on-surface leading-tight mb-8 tracking-tighter">
      Instant delivery for your <span style={{ color: '#b61321' }}><i>Neighbour</i></span> hood.
    </h1>
    <p className="text-xl text-on-surface-variant mb-12 max-w-2xl mx-auto leading-relaxed">
      Premium products from local curators delivered to your doorstep in minutes.
    </p>
    <div className="max-w-4xl mx-auto bg-surface-container-highest p-3 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-stretch gap-2">
      <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-surface rounded-2xl">
        <span className="material-symbols-outlined text-primary">location_on</span>
        <select className="bg-transparent border-none focus:ring-0 font-bold text-on-surface w-40">
          <option>Current Location</option>
          <option>San Francisco, CA</option>
        </select>
        <div className="w-px h-8 bg-outline/20 mx-2"></div>
        <span className="material-symbols-outlined text-outline">search</span>
        <input 
          className="bg-transparent border-none focus:ring-0 w-full px-2 py-1 text-on-surface placeholder:text-outline-variant font-medium" 
          placeholder="Search for food, groceries..." 
          type="text"
        />
      </div>
      <button className="signature-gradient text-on-primary px-10 py-5 rounded-2xl font-bold text-lg hover:brightness-110 transition-all">
        Start Ordering
      </button>
    </div>
  </section>
);