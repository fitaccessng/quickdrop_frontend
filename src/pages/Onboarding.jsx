import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * OnboardingPage
 * Replaces the static 'Choose a Path' component with a multi-step 
 * editorial experience. Transitions to '/signup' upon completion.
 */
export const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  // Branding Constants
  const signatureGradient = "linear-gradient(135deg, #ff9300 0%, #ffb857 100%)";
  const kineticGradient = "linear-gradient(135deg, #ff9300 0%, #ffb857 100%)";

  const steps = [
    {
      title: <>Curated for Your <span className="text-[#ff9300]">Lifestyle.</span></>,
      description: "Explore the city's finest flavors and essentials delivered with precision.",
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCuEcBFDC9w5u3EOQtfQcrlc7sKgfERxy-rdgT7kv_fMaMDJBPnTY-izOS0Tf8_BBgi9TyEfMFtoRdIv2vG3WwpW4ubivfzPbrw-qfyOugD1aKZT7mf3QgR-e_SjasyfdJXPs3lX6x_1d57gNDULwCSsN5XeemZc3TJkpYDDurSpNBRgWTT0XlrV6OH38zmCGrZ9H5wzhyfHgTw1FZmldhhnDJQjgfOX4eed_dMlktZzNJ_r8DMDZWk3METPhiQ4k7-cnnBNO2qWbc",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBOgK9DlyO9X5_LOk9aPmG6GaWNkwvRs7pB-1HMjS8NBkaNJgR9YeerfjQf3OTgmV-7GiJDE07FEatLkly_eXfupPOWfae_zI0Vf9EDRYaC9FtkK2VhCzC1tmRZIWNhsGRInIQuy82ouSo7ASRUmVchdd7k5vYtuH_mpUSXjCEnFOpd2qNic19j6gjAG2IDtwcwD-DttUte4znN1IAoLxr-1YO7pSvgdOPuYcgrA6TJRvc37VfogBwwSY1mMN_KifonVk0cxm2o34c",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuArqra6Dh4Q7VCuBR4KBfdmFDbq2sAGpGJfSAWjLPBpT2tFoBeVThcr8T2_rJ6a7NDQS6lV7VPxEY1sYTGl0pu47tQGN3TAQDDDbLRXsTNsU-LAsi2byRtTtGpArbq2F35iXoDYtu4-VYfbLuHIx1wMH-MkAMQWKK33VLXR97I41lnNAKMR5nsBz0tIiMu4vwheA407xYeEotRXwzCdbTipf8ugrEeui1jKXPn-5ARPMEXAtXEKjNQ8jfxTqN3ry17wLEzl1NfQ1KI"
      ],
      type: "editorial"
    },
    {
      title: <>Lightning-Fast <br/>Logistics.</>,
      description: "Our predictive routing ensures your essentials arrive exactly when you need them.",
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDzKhjAEKEu-4d9lkK7uAz2IioU8g1Wjm6qkahVUY49GApQs5goCmJYKjk1wtY7QXnkgzwIjY2wCT84iBoFoD_1FZ-ddChVpmAxMungyVxdMXibBKrQ_RgcVn-SzGMFkO3OYsUDZS9PN--VUkT1WbHOInGQM8g9f7C0YW1bl5b1PDoyzZwFHhuI3WLGZRw0XrRwpkEOV4JKYmSedyfruYd6rmL1DV6woZF46zvmWMsCXvkd4lmtcO0jPRIDiu5WNgob4e9qT_I8gbM"],
      type: "kinetic",
      accentIcon: "bolt"
    },
    {
      title: <>Real-Time <br/><span className="text-[#ff9300]">Fluidity.</span></>,
      description: "Watch your curator move through the city in stunning, high-fidelity real-time map views.",
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDnLgD7lJUO4HHZwIYZv47xn6dFST6yoEsM42EkcEUF_G0fFGH6xO3Rlr-UWzDbz8PGZzkl0wsGAkq0vGKiZQOLHxprYZjrLW26GOzSgebJ4G64zHuTyHlSunbvaT94-3_r5d-rjMZBSmkwCgBv4qOsqQzfEBY0AHMYC3pBSZCJVA3HwClEwM7FSSzVbCyDZiJn0SeCLTaVurfqKGzsh4rcGK1Xtxbsa-W7GFh8aNeWN5BbVt6sYHTgajuTfAHaF8vh8DajyGP5W5Q", "https://lh3.googleusercontent.com/aida-public/AB6AXuD_RhmXG5B_R0d3Q0BjNvnZk2pjvQ0tfZu6Z99X7__T02PL1-0RJZKEhXX6DdJJFM1p4xasPUJ2W8llDrB33EvX8LExEUt68AOcJW2YMuZllkTKc2tQCuJRRpbO7NyCJhpo2m-LC2xFmG7cZuYsukLbACDx3D0a1Bjob55s6WOdbs8R3on7yJyH0p2bvXyjv_98uxJ7y5oBk7ijycEDhwz2MjmbY2uvppXs5Y9c4EQmdbFZDxBuGBfwMzqDI0QD9KLgqoET4sjQuGk"],
      type: "map",
      badge: "Evolution 03"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final transition to the account selection or signup page
      navigate('/signup'); 
    }
  };

  const handleSkip = () => navigate('/signup');

  const step = steps[currentStep];

  return (
    <div className="bg-[#f5f6f7] font-body text-[#2c2f30] antialiased min-h-screen flex flex-col overflow-hidden relative">
      
      {/* --- Header --- */}
      <header className="w-full sticky top-0 z-50 bg-[#f5f6f7]/80 backdrop-blur-md flex justify-between items-center px-6 py-4">
        <button onClick={handleSkip} className="flex items-center hover:opacity-60 transition-opacity">
          <span className="material-symbols-outlined text-[#ff9300]">close</span>
        </button>
        <h1 className="text-[#ff9300] font-black text-xl tracking-tighter font-headline">The Kinetic Curator</h1>
        <div className="w-6" /> 
      </header>

      {/* --- Main Content Section --- */}
      <main className="flex-1 flex flex-col px-6 pt-4 pb-32 overflow-y-auto overflow-x-hidden">
        
        {/* Step 0: Editorial Layout (Asymmetric Grid) */}
        {currentStep === 0 && (
          <div className="relative w-full mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8 h-72 rounded-xl overflow-hidden shadow-sm">
                <img src={step.images[0]} alt="Gourmet" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-4 flex flex-col gap-4">
                <div className="h-32 rounded-xl overflow-hidden">
                  <img src={step.images[1]} alt="Fashion" className="w-full h-full object-cover" />
                </div>
                <div className="h-36 rounded-xl overflow-hidden bg-[#ff9300] relative">
                  <img src={step.images[2]} alt="Groceries" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <span className="text-white font-headline font-bold text-center text-sm">Curated Selection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Kinetic Layout (Hero Focus) */}
        {currentStep === 1 && (
          <div className="relative w-full aspect-[4/5] max-h-[442px] rounded-[2rem] overflow-hidden bg-white mb-10 group animate-in zoom-in-95 duration-700">
            <img className="w-full h-full object-cover" src={step.images[0]} alt="Logistics" />
            <div className="absolute inset-0 opacity-30" style={{ background: kineticGradient, mixBlendMode: 'overlay' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>{step.accentIcon}</span>
            </div>
          </div>
        )}

        {/* Step 2: Map/Fluidity Layout (Interactive Viz) */}
        {currentStep === 2 && (
          <div className="relative w-full h-[400px] rounded-[2rem] overflow-hidden mb-8 animate-in fade-in duration-1000">
            <img className="w-full h-full object-cover grayscale-[0.2]" src={step.images[0]} alt="Map" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f5f6f7]" />
            
            {/* Tracking Card Component */}
            <div className="absolute top-8 left-4 right-4">
              <div className="bg-white rounded-2xl p-4 shadow-xl flex items-center gap-4 border border-white">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#ff9300]">
                  <img className="w-full h-full object-cover" src={step.images[1]} alt="Rider" />
                </div>
                <div className="flex-grow">
                  <p className="font-headline font-bold text-sm text-slate-900">Curator: Julian</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">speed</span> Arriving in 4 mins
                  </p>
                </div>
                <div className="bg-[#bed2fd] text-[#1f3456] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Fluid</div>
              </div>
            </div>

            {/* Kinetic Pulse Anchor */}
            <div className="absolute top-[60%] left-[45%] flex flex-col items-center">
              <div className="p-3 rounded-full shadow-lg relative" style={{ background: signatureGradient }}>
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                <div className="absolute -inset-2 bg-[#ff9300]/20 rounded-full animate-ping" />
              </div>
            </div>
          </div>
        )}

        {/* --- Text Content Area --- */}
        <div className="space-y-4 max-w-sm mt-auto">
          {step.badge && (
            <div className="inline-block px-3 py-1 bg-white rounded-full border border-slate-200">
              <span className="font-label text-[10px] font-black text-[#ff9300] uppercase tracking-[0.2em]">{step.badge}</span>
            </div>
          )}
          <h2 className="font-headline font-extrabold text-4xl leading-[1.1] tracking-tight text-[#2c2f30]">
            {step.title}
          </h2>
          <p className="font-body text-lg leading-relaxed text-slate-500">
            {step.description}
          </p>
        </div>

        {/* --- Progress Indicators --- */}
        <div className="mt-12 flex items-center gap-2">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${currentStep === idx ? 'w-12 shadow-sm' : 'w-3 bg-slate-200'}`}
              style={currentStep === idx ? { background: signatureGradient } : {}}
            />
          ))}
        </div>
      </main>

      {/* --- Navigation Controls --- */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-8 py-6 pb-10 bg-white/80 backdrop-blur-xl rounded-t-[2.5rem] border-t border-slate-100 shadow-[0_-12px_40px_rgba(0,0,0,0.04)]">
        <button 
          onClick={handleSkip}
          className="px-4 py-2 text-[#2c2f30] font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-60 transition-opacity"
        >
          Skip
        </button>

        <button 
          onClick={handleNext}
          className="flex items-center gap-3 text-white rounded-[1.5rem] px-8 py-4 shadow-lg shadow-[#ff9300]/30 active:scale-95 transition-all hover:brightness-110"
          style={{ background: signatureGradient }}
        >
          <span className="font-black text-xs uppercase tracking-widest">
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </span>
          <span className="material-symbols-outlined text-lg">
            {currentStep === steps.length - 1 ? 'rocket_launch' : 'arrow_forward'}
          </span>
        </button>
      </nav>
    </div>
  );
};