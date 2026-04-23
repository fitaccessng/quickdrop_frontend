import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bolt, 
  CheckCircle2, 
  Leaf, 
  MoveRight,
  Menu,
  X
} from 'lucide-react';
import { QuickDropLogo } from "../components/branding/QuickDropLogo";

export const AboutPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* --- Responsive Navbar --- */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 py-4 ${
          isScrolled ? "bg-white shadow-md py-3" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <QuickDropLogo size={50} showWordmark labelClassName="font-headline text-2xl text-slate-900" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              <Link to="/" className="font-bold text-slate-700 hover:text-[#ff9300] transition-colors">Home</Link>
              <Link to="/about" className="font-bold text-[#ff9300] transition-colors">About</Link>
              <Link to="/vendor/signup" className="font-bold text-slate-700 hover:text-[#ff9300] transition-colors">Become a Partner</Link>
            </div>
            
            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-4">
              <Link to="/login" className="font-bold text-slate-700 hover:text-[#ff9300] transition-colors">
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
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="text-slate-900" size={28} /> : <Menu className="text-slate-900" size={28} />}
          </button>
        </div>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-6 flex flex-col gap-4 md:hidden shadow-2xl">
            <Link to="/" className="text-slate-800 font-bold text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/about" className="text-[#ff9300] font-bold text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link to="/vendor/signup" className="text-slate-800 font-bold text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>Become a Partner</Link>
            <hr className="border-slate-100" />
            <Link to="/login" className="text-slate-800 font-bold text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
            <Link to="/signup" style={{ backgroundColor: "#ff9300" }} className="text-white text-center py-4 rounded-2xl font-bold" onClick={() => setIsMobileMenuOpen(false)}>
              Sign Up
            </Link>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center px-6 max-w-7xl mx-auto overflow-hidden py-32 lg:py-48">
          <div className="grid lg:grid-cols-2 gap-12 items-center z-10">
            <div className="space-y-8">
              <span className="bg-[#ff9300]/10 text-[#ff9300] font-bold tracking-widest text-xs uppercase px-4 py-2 rounded-full w-fit">
                About Quick Drop
              </span>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-slate-900">
                Redefining Urban <span style={{color: "#ff9300"}} className="italic">Logistics.</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-md leading-relaxed">
                From the streets of Sandton to the heart of Cape Town, we're building the kinetic infrastructure for the modern South African city.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  alt="Johannesburg Skyline" 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1570585429632-e8b74372a3ed?auto=format&fit=crop&q=80&w=1000" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-32 bg-slate-50 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-5 md:sticky md:top-32">
                <h2 className="font-headline text-4xl font-bold tracking-tight mb-6 text-slate-900">Our Story</h2>
                <div className="w-20 h-1.5 bg-[#ff9300] rounded-full mb-8"></div>
                <p className="text-lg text-slate-600 leading-relaxed">
                  QuickDrop began with a simple observation: South African cities never sleep, but their delivery systems often do. Founded in 2024, we set out to eliminate the friction between local merchants and their urban customers.
                </p>
              </div>
              <div className="lg:col-span-7 space-y-12">
                <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="font-headline text-2xl font-bold mb-4 text-slate-900">The Mzansi Vision</h3>
                  <p className="text-slate-600 leading-relaxed mb-8">
                    We didn't just want to move packages; we wanted to empower the local economy. By leveraging predictive algorithms tailored for SA's unique urban layout, we've optimized delivery routes to ensure speed without compromising safety.
                  </p>
                  <img 
                    alt="Team collaboration" 
                    className="w-full h-64 object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-700" 
                    src="https://images.unsplash.com/photo-1522071823991-b99c223a7097?auto=format&fit=crop&q=80&w=1000" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-headline text-5xl font-extrabold tracking-tight text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-slate-500 text-lg">The pillars of our kinetic curation across South Africa.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Speed */}
            <div className="group bg-white p-8 rounded-[2.5rem] flex flex-col justify-between h-96 border border-slate-100 hover:border-[#ff9300]/20 transition-all duration-500 hover:shadow-xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#ff9300] flex items-center justify-center mb-6 text-white">
                  <Bolt size={30} fill="currentColor" />
                </div>
                <h3 className="font-headline text-2xl font-bold mb-3 text-slate-900">Speed</h3>
                <p className="text-slate-600 leading-relaxed">Hyper-efficient routing designed for the bustle of SA cities. If it's ordered, it's already on its way.</p>
              </div>
              <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-headline font-bold text-sm text-slate-900">Learn More</span>
                <MoveRight size={20} className="text-slate-900" />
              </div>
            </div>

            {/* Reliability */}
            <div className="group bg-slate-900 p-8 rounded-[2.5rem] flex flex-col justify-between h-[30rem] md:-translate-y-12 shadow-2xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#ff9300] flex items-center justify-center mb-6 text-white">
                  <CheckCircle2 size={30} fill="currentColor" />
                </div>
                <h3 className="font-headline text-2xl font-bold mb-3 text-white">Reliability</h3>
                <p className="text-white/80 leading-relaxed">Precision in every hand-off. We treat every delivery as a priority, ensuring it arrives in pristine condition every time.</p>
              </div>
              <img 
                alt="Premium delivery" 
                className="w-full h-40 object-cover rounded-2xl opacity-40 group-hover:opacity-100 transition-all duration-700" 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600" 
              />
            </div>

            {/* Local Impact */}
            <div className="group bg-white p-8 rounded-[2.5rem] flex flex-col justify-between h-96 border border-slate-100 hover:border-[#ff9300]/20 transition-all duration-500 hover:shadow-xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#ff9300]/10 flex items-center justify-center mb-6 text-[#ff9300]">
                  <Leaf size={30} fill="currentColor" />
                </div>
                <h3 className="font-headline text-2xl font-bold mb-3 text-slate-900">Local Impact</h3>
                <p className="text-slate-600 leading-relaxed">A commitment to SA growth. Supporting local vendors and reducing our carbon footprint in our neighborhoods.</p>
              </div>
              <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-headline font-bold text-sm text-slate-900">Community</span>
                <MoveRight size={20} className="text-slate-900" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[4rem] bg-slate-900 p-12 lg:p-24 text-center">
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="font-headline text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tighter">
                List your business on Quick Drop.
              </h2>
              <p className="text-white/80 text-xl mb-12 leading-relaxed">
                Join the world's most premium delivery network and reach thousands of new customers who value quality.
              </p>
              <Link
                to="/vendor/signup"
                style={{backgroundColor: " #ff9300"}} className="inline-block text-white px-12 py-5 rounded-[2rem] font-extrabold text-xl hover:scale-105 transition-transform shadow-2xl"
              >
                Vendor Signup
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-[#ff9300] text-4xl">rocket_launch</span>
              <span className="text-2xl font-extrabold text-white font-headline tracking-tight">Quick Drop</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg">
              Redefining urban delivery through intentionality, sophistication, and speed.
            </p>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xl mb-8 text-white">Explore</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><Link className="hover:text-[#ff9300] transition-colors" to="/explore">Restaurants</Link></li>
              <li><Link className="hover:text-[#ff9300] transition-colors" to="/explore">Boutiques</Link></li>
              <li><Link className="hover:text-[#ff9300] transition-colors" to="/explore">Groceries</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xl mb-8 text-white">Company</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><Link className="hover:text-[#ff9300] transition-colors" to="/about">Our Story</Link></li>
              <li><Link className="hover:text-[#ff9300] transition-colors" to="/careers">Careers</Link></li>
              <li><Link className="hover:text-[#ff9300] transition-colors" to="/partner">Partner with us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xl mb-8 text-white">Connect</h4>
            <div className="flex gap-4">
              <button className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#ff9300] transition-all"><span className="material-symbols-outlined">public</span></button>
              <button className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#ff9300] transition-all"><span className="material-symbols-outlined">share</span></button>
              <button className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#ff9300] transition-all"><span className="material-symbols-outlined">mail</span></button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-16 mt-16 border-t border-white/5 text-center text-slate-500 font-medium">
          © 2026 Quick Drop. All rights reserved. Crafted for the modern curator.
        </div>
      </footer>
    </div>
  );
};
