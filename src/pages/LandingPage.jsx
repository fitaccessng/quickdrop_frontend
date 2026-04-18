import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchVendors } from "../api/vendors";
import { MapPin, Search, Menu, X } from 'lucide-react';

export const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch only approved vendors
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["approved-vendors"],
    queryFn: () => fetchVendors({ approved: true }),
  });

  // Handle navbar background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-white font-body">
      {/* --- Updated Navbar --- */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 py-4 ${
          isScrolled ? "bg-white shadow-md py-3" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-4xl ${isScrolled ? "text-[#ff9300]" : "text-white"}`}>
              rocket_launch
            </span>
            <span className={`text-2xl font-extrabold font-headline tracking-tight ${isScrolled ? "text-slate-900" : "text-white"}`}>
              Quick Drop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              <Link to="/" className={`font-bold hover:text-[#ff9300] transition-colors ${isScrolled ? "text-slate-700" : "text-white"}`}>Home</Link>
              <Link to="/about" className={`font-bold hover:text-[#ff9300] transition-colors ${isScrolled ? "text-slate-700" : "text-white"}`}>About</Link>
              <Link to="/vendor/signup" className={`font-bold hover:text-[#ff9300] transition-colors ${isScrolled ? "text-slate-700" : "text-white"}`}>Become a Partner</Link>
            </div>
            
            <div className="h-6 w-px bg-slate-300/30 mx-2"></div>

            <div className="flex items-center gap-4">
              <Link to="/login" className={`font-bold hover:text-[#ff9300] transition-colors ${isScrolled ? "text-slate-700" : "text-white"}`}>
                Sign In
              </Link>
              <Link 
                to="/signup" 
                style={{ backgroundColor: "#ff9300" }}
                className="text-white px-6 py-2.5 rounded-full font-bold hover:brightness-110 transition-all shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled ? "text-slate-900" : "text-white"} size={28} />
            ) : (
              <Menu className={isScrolled ? "text-slate-900" : "text-white"} size={28} />
            )}
          </button>
        </div>

        {/* Mobile Sidebar/Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-6 flex flex-col gap-4 md:hidden shadow-2xl">
            <Link to="/" className="text-slate-800 font-bold text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/about" className="text-slate-800 font-bold text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link to="/vendor/signup" className="text-slate-800 font-bold text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>Become a Partner</Link>
            <hr className="border-slate-100" />
            <Link to="/login" className="text-slate-800 font-bold text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
            <Link to="/signup" style={{ backgroundColor: "#ff9300" }} className="text-white text-center py-4 rounded-2xl font-bold" onClick={() => setIsMobileMenuOpen(false)}>
              Sign Up
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section 
        className="relative px-6 py-24 lg:py-48 text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.65)), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="font-headline text-5xl md:text-8xl font-extrabold text-white leading-tight mb-8 tracking-tighter">
            Instant delivery for your <span style={{color: "#ff9300"}} className="text-italic">Neighbourhood</span>.
          </h1>
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Premium products from local curators delivered to your doorstep in minutes. Experience the new standard of urban logistics.
          </p>
        </div>
        
        {/* Search Bar Container */}
        <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-stretch gap-2 border border-white/20 relative z-10">
          <div className="flex-1 flex flex-col md:flex-row items-center bg-white rounded-[2rem] px-4 py-2 md:py-1">
            <div className="flex items-center gap-2 w-full md:w-auto px-2 py-2 md:py-0 border-b md:border-b-0 md:border-r border-slate-100">
              <MapPin size={20} className="text-[#ff9300] shrink-0" />
              <select className="bg-transparent border-none focus:ring-0 font-bold text-slate-800 text-sm md:text-base cursor-pointer outline-none min-w-[160px]">
                <option value="sandton">Sandton, GP</option>
                <option value="umhlanga">Umhlanga, KZN</option>
                <option value="cape-town">Cape Town, WC</option>
                <option value="pretoria">Pretoria, GP</option>
              </select>
            </div>
            <div className="flex-1 flex items-center gap-3 w-full px-4 py-3 md:py-0">
              <Search size={20} className="text-slate-400 shrink-0" />
              <input
                className="bg-transparent border-none focus:ring-0 w-full py-1 text-slate-700 placeholder:text-slate-400 font-medium text-sm md:text-base outline-none"
                placeholder="Search for restaurants, groceries or fashion..."
                type="text"
              />
            </div>
          </div>
          <Link
            to="/explore"
            style={{ backgroundColor: "#ff9300" }}
            className="text-white px-10 py-5 rounded-[2rem] font-extrabold text-lg hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center"
          >
            Start Ordering
          </Link>
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <span className="text-black font-bold tracking-widest uppercase text-xs mb-3 block">Categories</span>
            <h2 className="text-black font-headline text-4xl md:text-5xl font-extrabold tracking-tight">Everything you need.</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 h-auto md:h-[600px]">
          {/* Food */}
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] bg-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80" alt="food" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-white text-3xl font-extrabold font-headline mb-2">Food</h3>
              <p className="text-white/80 font-medium">120+ Premium Restaurants</p>
            </div>
          </div>

          {/* Groceries */}
          <div className="md:col-span-2 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] bg-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80" alt="groceries" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-8">
              <h3 className="text-white text-2xl font-extrabold font-headline">Groceries</h3>
            </div>
          </div>

          {/* Fashion */}
          <div className="md:col-span-2 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] bg-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80" alt="fashion" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-8">
              <h3 className="text-white text-2xl font-extrabold font-headline">Fashion</h3>
            </div>
          </div>

          {/* Pharmacy */}
          <div className="md:col-span-2 lg:col-span-1 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] bg-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-700 to-red-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative h-full p-8 flex flex-col justify-end">
              <span className="material-symbols-outlined text-black text-4xl mb-4">medical_services</span>
              <h3 className="text-black text-xl font-extrabold font-headline">Pharmacy</h3>
            </div>
          </div>

          {/* Services */}
          <div className="md:col-span-2 lg:col-span-3 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] bg-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80" alt="services" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-8">
              <h3 className="text-white text-2xl font-extrabold font-headline">Services</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vendors Bento */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex items-end justify-between">
            <div>
              <span className="text-black font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Featured</span>
              <h2 className="text-black font-headline text-5xl font-extrabold tracking-tight">Top Curators</h2>
            </div>
            <button className="text-black font-bold flex items-center gap-2 group hover:gap-3 transition-all">
              See All
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          {isLoading ? (
            <div className="text-black text-lg">Loading vendors...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {vendors.slice(0, 3).map((vendor, idx) => (
                <div
                  key={vendor.id}
                  className={`group cursor-pointer rounded-[3rem] overflow-hidden bg-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${idx === 0 ? 'md:col-span-2' : ''} flex flex-col`}
                >
                  <div className={idx === 0 ? "relative h-[400px]" : "relative h-[250px]"}>
                    <img className="w-full h-full object-cover" src={vendor.image_url || "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80"} alt={vendor.name} />
                    <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-black">{vendor.rating ?? '4.9'}</span>
                    </div>
                  </div>
                  <div className={idx === 0 ? "p-10 flex justify-between items-center" : "p-8 flex-1 flex flex-col justify-between"}>
                    <div>
                      <span className="text-primary font-bold text-xs mb-1 block uppercase tracking-wider">{vendor.category}</span>
                      <h3 className={`font-headline ${idx === 0 ? "text-3xl" : "text-2xl"} font-extrabold mb-1 text-black`}>{vendor.name}</h3>
                    </div>
                    <div className={idx === 0 ? "text-right" : "flex justify-between items-end mt-4"}>
                      <span className="text-black font-semibold text-base md:text-xl">{vendor.delivery_time ?? '25-35 min'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-black font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Designed for you in mind.</h2>
          <p className="text-black text-lg max-w-xl mx-auto">Getting what you need has never been this seamless.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-slate-200 z-0"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-slate-900 text-white mx-auto flex items-center justify-center mb-8 shadow-2xl">
              <span className="material-symbols-outlined text-4xl">grid_view</span>
            </div>
            <h3 className="text-black font-headline text-2xl font-extrabold mb-4">Browse anything</h3>
            <p className="text-black text-lg leading-relaxed">Choose from our hand-picked selection of the city's finest vendors.</p>
          </div>

          <div className="relative z-10 text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-slate-900 text-white mx-auto flex items-center justify-center mb-8 shadow-2xl">
              <span className="material-symbols-outlined text-4xl">touch_app</span>
            </div>
            <h3 className="text-black font-headline text-2xl font-extrabold mb-4">Order instantly</h3>
            <p className="text-black text-lg leading-relaxed">Seamless one-tap checkout with Apple Pay or your saved card.</p>
          </div>

          <div className="relative z-10 text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-red-600 to-red-500 text-white mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-red-500/30">
              <span className="material-symbols-outlined text-4xl">local_shipping</span>
            </div>
            <h3 className="text-black font-headline text-2xl font-extrabold mb-4">Get it delivered</h3>
            <p className="text-black text-lg leading-relaxed">Our curated courier fleet ensures your items arrive fast and in pristine condition.</p>
          </div>
        </div>
      </section>

      {/* Vendor CTA Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[4rem] bg-slate-900 p-12 lg:p-24 text-center">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="font-headline text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tighter">List your business on Quick Drop.</h2>
            <Link to="/vendor/signup" style={{backgroundColor: " #ff9300"}} className="inline-block text-white px-12 py-5 rounded-[2rem] font-extrabold text-xl hover:scale-105 transition-transform shadow-2xl">
              Vendor Signup
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-[#ff9300] text-4xl">rocket_launch</span>
              <span className="text-2xl font-extrabold font-headline tracking-tight">Quick Drop</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg">Redefining urban delivery through intentionality, sophistication, and speed.</p>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xl mb-8">Explore</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><a className="hover:text-[#ff9300] transition-colors" href="#">Restaurants</a></li>
              <li><a className="hover:text-[#ff9300] transition-colors" href="#">Boutiques</a></li>
              <li><a className="hover:text-[#ff9300] transition-colors" href="#">Groceries</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xl mb-8">Company</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><a className="hover:text-[#ff9300] transition-colors" href="#">Our Story</a></li>
              <li><a className="hover:text-[#ff9300] transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-[#ff9300] transition-colors" href="#">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xl mb-8">Connect</h4>
            <div className="flex gap-4">
              <button className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#ff9300] transition-all"><span className="material-symbols-outlined">public</span></button>
              <button className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#ff9300] transition-all"><span className="material-symbols-outlined">share</span></button>
              <button className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#ff9300] transition-all"><span className="material-symbols-outlined">mail</span></button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-16 mt-16 border-t border-white/5 text-center text-slate-500 font-medium">
          © 2024 Quick Drop. All rights reserved. Crafted for the modern curator.
        </div>
      </footer>
    </div>
  );
};