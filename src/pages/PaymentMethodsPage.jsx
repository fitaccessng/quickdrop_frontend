import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PaymentMethodsPage = () => {
  const navigate = useNavigate();
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const [paymentMethods] = useState([
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 2, type: 'Mastercard', last4: '5555', expiry: '08/24', isDefault: false },
  ]);

  return (
    <div className="bg-[#f5f6f7] font-body text-slate-900 min-h-screen pb-24 antialiased">
      {/* --- Header --- */}
      <div className="bg-white border-b border-slate-200/60 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-slate-600">arrow_back</span>
          </button>
          <h1 className="text-lg font-black text-slate-800">Payment Methods</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* --- Content --- */}
      <main className="px-6 py-8 space-y-6">
        {/* Payment Methods List */}
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600" style={materialIconFill}>
                    <span className="material-symbols-outlined text-2xl">credit_card</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{method.type} •••• {method.last4}</p>
                    <p className="text-xs text-slate-500">Expires {method.expiry}</p>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full">DEFAULT</span>
                )}
              </div>
              <div className="flex gap-3 mt-4">
                <button className="flex-1 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-all">
                  Edit
                </button>
                <button className="flex-1 py-2 text-sm font-bold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 active:scale-95 transition-all">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Card */}
        <button className="w-full py-4 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-sm uppercase tracking-widest border-2 border-dashed border-emerald-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add_circle</span>
          Add New Card
        </button>
      </main>
    </div>
  );
};
