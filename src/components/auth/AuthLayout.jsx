import React from 'react';

export const AuthLayout = ({ children, title, subtitle, variant = "customer" }) => {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative bg-white font-body text-on-surface antialiased overflow-x-hidden">
      {/* Kinetic Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-surface-container rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-primary-container/20 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(74,6,114,0.12)] overflow-hidden">
        {/* Branding/Visual Side */}
        <div className="hidden md:flex relative bg-surface-container-low p-12 flex-col justify-between">
          <div className="z-10">
            <div className="flex items-center gap-2 mb-12">
              <span className="material-symbols-outlined text-primary text-3xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                electric_bolt
              </span>
              <span className="font-headline font-black text-2xl tracking-tighter text-on-surface">QuickDrop</span>
            </div>
            <h1 className="font-headline text-5xl font-extrabold text-on-surface leading-[1.1] mb-6">
              Deliver <br />
              <span className="text-primary-container">Your Orders</span> <br />
              With Care.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-sm leading-relaxed">
              {variant === "vendor" 
                ? "Access your merchant dashboard and manage your storefront with premium tools."
                : "Access your personalized dashboard and discover the next wave of sophisticated lifestyle curation."
              }
            </p>
          </div>

         

          {/* Abstract Visual Shape */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <img
              className="w-full h-full object-cover"
              alt="abstract flowing 3D organic shapes"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuByM8alXIMMGong8T83TSE_4pKsxUg37Cu3f3eTjiq3mZFcn7ywFSvKIP1QSISMl0nhImIlZ-eBuM__F0X6Y7rvK4e_9AOphO8KduzXkCrXzZGrPXE_qCVjFPeoi6FiM33kIWiyvHhPKPABxExeDGlgs1TB2vQdTJeDk2Gl3vaaaaBT-xT44wXuRu441ywVCjyIEAfyEExif3pR7rY-nprSkMgfC95pThdAH7UZCp8Hl9r0GrX90xzxlEkyzQrYjdtXDwUXskuOFTI"
            />
          </div>
        </div>

        {/* Form Side */}
        <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center">
          <div className="md:hidden flex items-center gap-2 mb-12 justify-center">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              electric_bolt
            </span>
            <span className="font-headline font-black text-2xl tracking-tighter text-on-surface">QuickDrop</span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">{title}</h2>
            <p className="text-on-surface-variant font-medium">{subtitle}</p>
          </div>

          {children}

          {/* Footer Meta */}
         
        </div>
      </div>
    </main>
  );
};
