import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { createAddress, fetchProfile } from "../api/auth";
import { fetchOrderQuote, submitOrder } from "../api/orders";
import { formatMoney } from "../lib/utils";
import { useCartStore } from "../store/cartStore";

// --- SA Data ---
const SA_PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
];

const SA_CITIES = {
  "Gauteng": ["Johannesburg", "Pretoria", "Sandton", "Soweto", "Centurion"],
  "Western Cape": ["Cape Town", "Stellenbosch", "Paarl", "George", "Somerset West"],
  "KwaZulu-Natal": ["Durban", "Umhlanga", "Pietermaritzburg", "Ballito"],
  "Eastern Cape": ["Gqeberha", "East London", "Makhanda"],
  "Free State": ["Bloemfontein", "Welkom", "Sasolburg"],
  "Limpopo": ["Polokwane", "Thohoyandou", "Phalaborwa"],
  "Mpumalanga": ["Mbombela", "Secunda", "Emalahleni"],
  "North West": ["Mahikeng", "Potchefstroom", "Rustenburg"],
  "Northern Cape": ["Kimberley", "Upington", "Kuruman"]
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  
  // Form & UI State
  const [paymentMethod, setPaymentMethod] = useState("paystack_card");
  const [deliverySpeed, setDeliverySpeed] = useState("priority");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null); // 'state' | 'city'
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    recipient_name: "",
    phone: "",
    line1: "",
    city: "",
    state: "Gauteng",
    postal_code: "",
    delivery_notes: "",
    latitude: null,
    longitude: null,
    is_default: true,
  });

  const signatureGradient = "linear-gradient(135deg, #b61321 0%, #ff7670 100%)";

  // Queries & Mutations
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: (address) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSelectedAddressId(address.id);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: submitOrder,
    onSuccess: (response) => {
      clearCart();
      navigate(`/tracking/${response.orders[0].id}`);
    },
  });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAddressForm((current) => ({
          ...current,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      () => {},
    );
  }, []);

  const canCheckout = items.length && (selectedAddressId || profileQuery.data?.addresses?.[0]?.id);
  const quotePayload = canCheckout
    ? {
        address_id: selectedAddressId ?? profileQuery.data?.addresses?.[0]?.id,
        payment_method: paymentMethod,
        items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
      }
    : null;

  const quoteQuery = useQuery({
    queryKey: ["checkout-quote", quotePayload],
    queryFn: () => fetchOrderQuote(quotePayload),
    enabled: Boolean(quotePayload),
  });

  const fallbackSubtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totals = quoteQuery.data ?? {
    subtotal_amount: fallbackSubtotal,
    delivery_fee: 0,
    total_amount: fallbackSubtotal,
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectOption = (field, value) => {
    setAddressForm(prev => ({ 
      ...prev, 
      [field]: value,
      ...(field === 'state' ? { city: "" } : {}) // Reset city if province changes
    }));
    setActiveSheet(null);
  };

  // --- Sub-Components ---

  const SelectionSheet = ({ title, options, field, isOpen, onClose }) => (
    <>
      <div 
        className={`fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      <div 
        className={`fixed bottom-0 left-0 w-full z-[101] bg-white rounded-t-[2.5rem] p-8 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-2xl ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6" />
        <h3 className="font-headline font-black text-lg uppercase tracking-widest mb-6 text-center text-slate-900">{title}</h3>
        <div className="max-h-[45vh] overflow-y-auto space-y-2 no-scrollbar pb-10">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelectOption(field, opt)}
              className={`w-full p-5 rounded-2xl text-left font-bold transition-all flex justify-between items-center ${
                addressForm[field] === opt ? 'bg-rose-50 text-rose-600' : 'text-slate-600 active:bg-slate-50'
              }`}
            >
              {opt}
              {addressForm[field] === opt && <span className="material-symbols-outlined text-rose-600">check_circle</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const IconInput = ({ icon, name, placeholder, type = "text", value, onChange }) => (
    <div className="relative flex items-center group">
      <span className="material-symbols-outlined absolute left-4 text-slate-300 group-focus-within:text-rose-500 transition-colors text-xl">
        {icon}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 ring-rose-500/10 transition-all"
      />
    </div>
  );

  return (
    <div className="bg-slate-50 font-body text-slate-900 min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-900 border border-slate-100 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          <h1 className="text-sm font-black text-rose-700 font-headline tracking-widest uppercase">Checkout</h1>
        </div>
      </header>

      <main className="pt-24 pb-48 px-4 max-w-lg mx-auto space-y-8">
        
        {/* Section: Delivery Address */}
        <section className="space-y-4">
          <h2 className="font-headline text-lg font-black tracking-tight px-1 uppercase">Shipping To</h2>
          
          {/* Address List */}
          <div className="grid gap-3">
            {(profileQuery.data?.addresses ?? []).map((address) => (
              <button
                key={address.id}
                onClick={() => setSelectedAddressId(address.id)}
                className={`p-5 rounded-[2rem] text-left border-2 transition-all flex items-start gap-4 ${
                  (selectedAddressId === address.id) ? "border-rose-600 bg-white shadow-md" : "border-transparent bg-white/60 text-slate-400"
                }`}
              >
                <span className="material-symbols-outlined mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {address.label === "Home" ? "home" : "work"}
                </span>
                <div className="flex-1">
                  <p className="font-black text-sm text-slate-900 leading-none mb-1">{address.label}</p>
                  <p className="text-xs font-bold opacity-80">{address.line1}, {address.city}</p>
                </div>
              </button>
            ))}
          </div>

          {/* SA Address Form */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">New South Africa Address</p>
            
            <IconInput icon="person" name="recipient_name" placeholder="Recipient Name" value={addressForm.recipient_name} onChange={handleInputChange} />
            <IconInput icon="call" name="phone" placeholder="Phone Number" type="tel" value={addressForm.phone} onChange={handleInputChange} />
            <IconInput icon="location_on" name="line1" placeholder="Street Address / Complex" value={addressForm.line1} onChange={handleInputChange} />
            
            <div className="grid grid-cols-2 gap-3">
              {/* Province Trigger */}
              <button 
                onClick={() => setActiveSheet('state')}
                className="flex items-center gap-3 pl-4 pr-2 py-4 bg-slate-50 rounded-2xl text-left active:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-300 text-xl">map</span>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[8px] uppercase font-black text-slate-400 leading-none mb-1">Province</p>
                  <p className="text-xs font-bold truncate text-slate-900">{addressForm.state}</p>
                </div>
              </button>

              {/* City Trigger */}
              <button 
                onClick={() => setActiveSheet('city')}
                className="flex items-center gap-3 pl-4 pr-2 py-4 bg-slate-50 rounded-2xl text-left active:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-300 text-xl">location_city</span>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[8px] uppercase font-black text-slate-400 leading-none mb-1">City</p>
                  <p className="text-xs font-bold truncate text-slate-900">{addressForm.city || "Select..."}</p>
                </div>
              </button>
            </div>

            <IconInput icon="pin_drop" name="postal_code" placeholder="Postal Code" value={addressForm.postal_code} onChange={handleInputChange} />
            
            <button
              onClick={() => createAddressMutation.mutate(addressForm)}
              className="mt-2 w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-transform"
            >
              {createAddressMutation.isPending ? "Validating..." : "Confirm New Address"}
            </button>
          </div>
        </section>

        {/* Section: Delivery Speed */}
        <section className="space-y-4">
          <h2 className="font-headline text-lg font-black tracking-tight px-1 uppercase">Delivery Speed</h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setDeliverySpeed('priority')}
              className={`p-6 rounded-[2rem] text-left transition-all border-2 ${deliverySpeed === 'priority' ? 'border-rose-600 bg-white shadow-md' : 'border-transparent bg-white/60'}`}
            >
              <span className="material-symbols-outlined text-rose-600 mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <p className="font-black text-xs uppercase">Priority</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">15-30 mins</p>
            </button>
            <button 
              onClick={() => setDeliverySpeed('standard')}
              className={`p-6 rounded-[2rem] text-left transition-all border-2 ${deliverySpeed === 'standard' ? 'border-rose-600 bg-white shadow-md' : 'border-transparent bg-white/60'}`}
            >
              <span className="material-symbols-outlined text-slate-400 mb-2">schedule</span>
              <p className="font-black text-xs uppercase text-slate-400">Standard</p>
              <p className="text-[10px] font-bold text-slate-300 mt-1">Next Hour</p>
            </button>
          </div>
        </section>

        {/* Section: Totals */}
        <section className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.lineKey} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">{item.quantity}x</span>
                  <p className="font-bold text-xs text-slate-700">{item.productName}</p>
                </div>
                <span className="font-bold text-xs text-slate-900">{formatMoney(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="h-px bg-slate-50"></div>

          <div className="space-y-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-900">{formatMoney(totals.subtotal_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-slate-900">{formatMoney(totals.delivery_fee)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 text-rose-600">
              <span className="text-xs">Grand Total</span>
              <span className="text-3xl tracking-tighter text-slate-900">{formatMoney(totals.total_amount)}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Dynamic Bottom Sheets */}
      <SelectionSheet 
        isOpen={activeSheet === 'state'} 
        title="Choose Province" 
        field="state" 
        options={SA_PROVINCES} 
        onClose={() => setActiveSheet(null)} 
      />
      
      <SelectionSheet 
        isOpen={activeSheet === 'city'} 
        title={`Cities in ${addressForm.state}`} 
        field="city" 
        options={SA_CITIES[addressForm.state] || []} 
        onClose={() => setActiveSheet(null)} 
      />

      {/* Sticky Action Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-2xl pt-4 pb-10 px-8 z-50 border-t border-slate-100">
        <button
          disabled={!canCheckout || checkoutMutation.isPending}
          onClick={() => checkoutMutation.mutate({
            address_id: selectedAddressId ?? profileQuery.data?.addresses?.[0]?.id,
            payment_method: paymentMethod,
            items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
          })}
          className={`w-full py-5 rounded-2xl text-white font-headline font-black text-lg shadow-xl active:scale-[0.98] transition-all duration-300 ${!canCheckout ? 'bg-slate-200 shadow-none' : ''}`}
          style={canCheckout ? { background: signatureGradient } : {}}
        >
          {checkoutMutation.isPending ? "PROCESSING..." : `PAY ${formatMoney(totals.total_amount)}`}
        </button>
      </footer>
    </div>
  );
};
