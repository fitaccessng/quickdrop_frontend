import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { createAddress, fetchProfile, updateAddress, updateProfile } from "../api/auth";
import { fetchOrderQuote, initializePaystackCheckout, submitOrder } from "../api/orders";
import { fetchProducts } from "../api/products";
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

// ============================================================================
// ✅ STANDALONE HELPER COMPONENTS (MOVED OUTSIDE TO FIX THE TYPING FOCUS BUG)
// ============================================================================
const SelectionSheet = ({ title, options, field, value, isOpen, onClose, onSelect }) => (
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
            type="button"
            onClick={() => onSelect(field, opt)}
            className={`w-full p-5 rounded-2xl text-left font-bold transition-all flex justify-between items-center ${
              value === opt ? 'bg-rose-50 text-rose-600' : 'text-slate-600 active:bg-slate-50'
            }`}
          >
            {opt}
            {value === opt && <span className="material-symbols-outlined text-rose-600">check_circle</span>}
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
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full min-w-0 pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 ring-rose-500/10 transition-all"
    />
  </div>
);


// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  
  // Form & UI State
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [deliverySpeed, setDeliverySpeed] = useState("priority");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressMode, setAddressMode] = useState("existing"); 
  const [activeSheet, setActiveSheet] = useState(null); 
  const [browserLocation, setBrowserLocation] = useState({ latitude: null, longitude: null });
  
  const [contactForm, setContactForm] = useState({
    full_name: "",
    phone: "",
    email: "",
  });
  
  const [paymentForm, setPaymentForm] = useState({ reference: "" });

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

  const emptyAddressForm = {
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
  };

  const signatureGradient = "linear-gradient(135deg, #b61321 0%, #ff7670 100%)";

  // Queries & Mutations
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });
  const productsQuery = useQuery({
    queryKey: ["checkout-products"],
    queryFn: () => fetchProducts({ include_unavailable: true }),
  });

  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: (address) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setAddressMode("existing");
      setSelectedAddressId(address.id);
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: updateAddress,
    onSuccess: (address) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSelectedAddressId(address.id);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: submitOrder,
    onSuccess: (response) => {
      clearCart();
      navigate(`/tracking/${response.orders[0].id}`);
    },
  });
  const paystackMutation = useMutation({
    mutationFn: initializePaystackCheckout,
    onSuccess: (response) => {
      window.location.assign(response.authorization_url);
    },
  });

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setBrowserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setAddressForm((current) => ({
          ...current,
          latitude: current.latitude ?? position.coords.latitude,
          longitude: current.longitude ?? position.coords.longitude,
        }));
      },
      () => {},
    );
  }, []);

  // Sync profile contact info initially ONCE when data loads
  useEffect(() => {
    if (!profileQuery.data) return;
    
    setContactForm({
      full_name: profileQuery.data.full_name || "",
      phone: profileQuery.data.phone || "",
      email: profileQuery.data.email || "",
    });
    
    const defaultAddress = profileQuery.data.addresses?.find((address) => address.is_default) || profileQuery.data.addresses?.[0];
    if (defaultAddress && selectedAddressId === null) {
      setSelectedAddressId(defaultAddress.id);
      setAddressMode("existing");
      
      setAddressForm({
        label: defaultAddress.label || "Home",
        recipient_name: defaultAddress.recipient_name || profileQuery.data.full_name || "",
        phone: defaultAddress.phone || profileQuery.data.phone || "",
        line1: defaultAddress.line1 || "",
        city: defaultAddress.city || "",
        state: defaultAddress.state || "Gauteng",
        postal_code: defaultAddress.postal_code || "",
        delivery_notes: defaultAddress.delivery_notes || "",
        latitude: defaultAddress.latitude ?? browserLocation.latitude ?? null,
        longitude: defaultAddress.longitude ?? browserLocation.longitude ?? null,
        is_default: defaultAddress.is_default ?? true,
      });
    }
  }, [profileQuery.data, selectedAddressId, browserLocation.latitude, browserLocation.longitude]);

  // Handler for explicitly switching addresses
  const handleAddressSelect = (address) => {
    setAddressMode("existing");
    setSelectedAddressId(address.id);
    setAddressForm({
      label: address.label || "Home",
      recipient_name: address.recipient_name || profileQuery.data?.full_name || "",
      phone: address.phone || profileQuery.data?.phone || "",
      line1: address.line1 || "",
      city: address.city || "",
      state: address.state || "Gauteng",
      postal_code: address.postal_code || "",
      delivery_notes: address.delivery_notes || "",
      latitude: address.latitude ?? browserLocation.latitude ?? null,
      longitude: address.longitude ?? browserLocation.longitude ?? null,
      is_default: address.is_default ?? true,
    });
  };

  const canCheckout = items.length && (selectedAddressId || profileQuery.data?.addresses?.[0]?.id);
  const quotePayload = canCheckout
    ? {
        address_id: selectedAddressId ?? profileQuery.data?.addresses?.[0]?.id,
        address_latitude: addressForm.latitude ?? browserLocation.latitude,
        address_longitude: addressForm.longitude ?? browserLocation.longitude,
        payment_method: paymentMethod,
        items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
      }
    : null;

  const quoteQuery = useQuery({
    queryKey: ["checkout-quote", quotePayload],
    queryFn: () => fetchOrderQuote(quotePayload),
    enabled: Boolean(quotePayload),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const fallbackSubtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const getCartItemImage = (item) => {
    const product = productsQuery.data?.find((productItem) => productItem.id === item.productId);
    return item.productImage || product?.image_urls?.[0] || product?.image_url || item.vendorLogo || "";
  };
  const totals = quoteQuery.data ?? {
    subtotal_amount: fallbackSubtotal,
    delivery_fee: 0,
    total_amount: fallbackSubtotal,
  };
  const paymentParams = new URLSearchParams(location.search);
  const paymentFailed = paymentParams.get("payment") === "failed";
  const failedReference = paymentParams.get("reference");

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectOption = (field, value) => {
    setAddressForm(prev => ({ 
      ...prev, 
      [field]: value,
      ...(field === 'state' ? { city: "" } : {}) 
    }));
    setActiveSheet(null);
  };

  const openNewAddressMode = () => {
    setAddressMode("new");
    setSelectedAddressId(null);
    setAddressForm({
      ...emptyAddressForm,
      recipient_name: contactForm.full_name || "",
      phone: contactForm.phone || "",
    });
  };

  return (
    <div className="bg-slate-50 font-body text-slate-900 min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex justify-between items-center px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-900 border border-slate-100 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          <h1 className="text-sm font-black text-rose-700 font-headline tracking-widest uppercase">Checkout</h1>
        </div>
      </header>

      <main className="pt-24 pb-48 px-4 sm:px-5 max-w-lg mx-auto space-y-6 sm:space-y-8">
        {paymentFailed ? (
          <section className="rounded-[2rem] border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-600">Payment Failed</p>
                <h2 className="mt-1 text-lg font-black text-slate-900">Paystack did not confirm this checkout.</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  Your order was not completed. Review your details and try the Paystack payment again, or switch to cash on delivery.
                </p>
                {failedReference ? (
                  <p className="mt-3 text-xs font-bold text-slate-500">Reference: {failedReference}</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paystack")}
                    className="rounded-2xl bg-rose-600 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white active:scale-95 transition-transform"
                  >
                    Try Paystack Again
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash_on_delivery")}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 active:scale-95 transition-transform"
                  >
                    Use Cash Instead
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}
        
        {/* Customer Details */}
        <section className="space-y-4">
          <h2 className="font-headline text-lg font-black tracking-tight px-1 uppercase">Customer Details</h2>
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-3">
            <IconInput icon="person" name="full_name" placeholder="Full Name" value={contactForm.full_name} onChange={handleContactChange} />
            <IconInput icon="call" name="phone" placeholder="Phone Number" type="tel" value={contactForm.phone} onChange={handleContactChange} />
            <IconInput icon="mail" name="email" placeholder="Email Address" type="email" value={contactForm.email} onChange={handleContactChange} />
            <button
              type="button"
              onClick={() => updateProfileMutation.mutate({ full_name: contactForm.full_name, phone: contactForm.phone, email: contactForm.email })}
              className="mt-2 w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-transform"
            >
              {updateProfileMutation.isPending ? "Saving profile..." : "Save customer details"}
            </button>
          </div>
        </section>

        {/* Shipping Section */}
        <section className="space-y-4">
          <h2 className="font-headline text-lg font-black tracking-tight px-1 uppercase">Shipping To</h2>
          
          <div className="grid gap-3">
            {(profileQuery.data?.addresses ?? []).map((address) => (
              <button
                type="button"
                key={address.id}
                onClick={() => handleAddressSelect(address)}
                className={`p-5 rounded-[2rem] text-left border-2 transition-all flex items-start gap-4 ${
                  (addressMode === "existing" && selectedAddressId === address.id) ? "border-rose-600 bg-white shadow-md" : "border-transparent bg-white/60 text-slate-400"
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
            <button
              type="button"
              onClick={openNewAddressMode}
              className={`rounded-[2rem] border-2 px-5 py-4 text-left transition-all ${
                addressMode === "new" ? "border-rose-600 bg-white shadow-md" : "border-dashed border-slate-200 bg-white/70"
              }`}
            >
              <p className="text-sm font-black text-slate-900">Add new address</p>
              <p className="mt-1 text-xs font-bold text-slate-400">Use a separate address without overwriting your saved ones.</p>
            </button>
          </div>

          {/* Form Context Panel */}
          <div className="bg-white rounded-[2.5rem] p-5 sm:p-6 shadow-sm border border-slate-100 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
              {addressMode === "new" ? "New South Africa Address" : "Edit Selected Address"}
            </p>
            
            <IconInput icon="person" name="recipient_name" placeholder="Recipient Name" value={addressForm.recipient_name} onChange={handleInputChange} />
            <IconInput icon="call" name="phone" placeholder="Phone Number" type="tel" value={addressForm.phone} onChange={handleInputChange} />
            <IconInput icon="location_on" name="line1" placeholder="Street Address / Complex" value={addressForm.line1} onChange={handleInputChange} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setActiveSheet('state')}
                className="flex items-center gap-3 pl-4 pr-2 py-4 bg-slate-50 rounded-2xl text-left active:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-300 text-xl">map</span>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[8px] uppercase font-black text-slate-400 leading-none mb-1">Province</p>
                  <p className="text-xs font-bold truncate text-slate-900">{addressForm.state}</p>
                </div>
              </button>

              <button 
                type="button"
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
            
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Delivery Notes</p>
              <textarea
                name="delivery_notes"
                rows={3}
                value={addressForm.delivery_notes || ""}
                onChange={handleInputChange}
                placeholder="Gate code, landmark, or rider instructions"
                className="mt-2 w-full resize-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 border-none focus:ring-0 p-0"
              />
            </div>
            
            <button
              type="button"
              onClick={() => {
                if (addressMode === "existing" && selectedAddressId) {
                  updateAddressMutation.mutate({ addressId: selectedAddressId, ...addressForm });
                } else {
                  createAddressMutation.mutate(addressForm);
                }
              }}
              className="mt-2 w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-transform"
            >
              {createAddressMutation.isPending || updateAddressMutation.isPending
                ? "Saving address..."
                : addressMode === "existing" && selectedAddressId
                  ? "Update selected address"
                  : "Confirm new address"}
            </button>
          </div>
        </section>

        {/* Delivery Speed Section */}
        <section className="space-y-4">
          <h2 className="font-headline text-lg font-black tracking-tight px-1 uppercase">Delivery Speed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => setDeliverySpeed('priority')}
              className={`p-6 rounded-[2rem] text-left transition-all border-2 ${deliverySpeed === 'priority' ? 'border-rose-600 bg-white shadow-md' : 'border-transparent bg-white/60'}`}
            >
              <span className="material-symbols-outlined text-rose-600 mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <p className="font-black text-xs uppercase">Priority</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">15-30 mins</p>
            </button>
            <button 
              type="button"
              onClick={() => setDeliverySpeed('standard')}
              className={`p-6 rounded-[2rem] text-left transition-all border-2 ${deliverySpeed === 'standard' ? 'border-rose-600 bg-white shadow-md' : 'border-transparent bg-white/60'}`}
            >
              <span className="material-symbols-outlined text-slate-400 mb-2">schedule</span>
              <p className="font-black text-xs uppercase text-slate-400">Standard</p>
              <p className="text-[10px] font-bold text-slate-300 mt-1">Next Hour</p>
            </button>
          </div>
        </section>

        {/* Payment Section */}
        <section className="space-y-4">
          <h2 className="font-headline text-lg font-black tracking-tight px-1 uppercase">Payment</h2>
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "paystack", label: "Paystack", icon: "credit_card" },
                { id: "cash_on_delivery", label: "Cash", icon: "payments" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPaymentMethod(option.id)}
                  className={`rounded-[1.5rem] border px-3 py-4 text-left transition-all ${paymentMethod === option.id ? "border-rose-600 bg-rose-50" : "border-slate-100 bg-slate-50"}`}
                >
                  <span className="material-symbols-outlined text-slate-700">{option.icon}</span>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-slate-900">{option.label}</p>
                </button>
              ))}
            </div>
            {paymentMethod === "paystack" ? (
              <div className="rounded-[1.75rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="font-black text-slate-900">Secure online payment</p>
                <p className="mt-2">
                  You will be redirected to Paystack to complete your payment, then brought back to QuickDrop after verification.
                </p>
              </div>
            ) : null}
            {paymentFailed ? (
              <div className="rounded-[1.75rem] border border-rose-100 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                Paystack could not confirm your payment. Use the banner above to retry or switch payment method.
              </div>
            ) : null}
            <IconInput icon="tag" name="reference" placeholder="Optional order note or payment reference" value={paymentForm.reference} onChange={handlePaymentChange} />
          </div>
        </section>

        {/* Summary Details */}
        <section className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.lineKey || item.productId} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-100">
                    {getCartItemImage(item) ? <img src={getCartItemImage(item)} alt={item.productName} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">{item.quantity}x</span>
                    <p className="mt-2 font-bold text-xs text-slate-700">{item.productName}</p>
                  </div>
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

      {/* Sheets Elements */}
      <SelectionSheet 
        isOpen={activeSheet === 'state'} 
        title="Choose Province" 
        field="state" 
        value={addressForm.state}
        options={SA_PROVINCES} 
        onSelect={handleSelectOption}
        onClose={() => setActiveSheet(null)} 
      />
      
      <SelectionSheet 
        isOpen={activeSheet === 'city'} 
        title={`Cities in ${addressForm.state}`} 
        field="city" 
        value={addressForm.city}
        options={SA_CITIES[addressForm.state] || []} 
        onSelect={handleSelectOption}
        onClose={() => setActiveSheet(null)} 
      />

      {/* CTA Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-2xl pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] px-4 sm:px-8 z-50 border-t border-slate-100">
        <button
          type="button"
          disabled={!canCheckout || checkoutMutation.isPending || paystackMutation.isPending}
          onClick={() => {
            const payload = {
              address_id: selectedAddressId ?? profileQuery.data?.addresses?.[0]?.id,
              address_latitude: addressForm.latitude ?? browserLocation.latitude,
              address_longitude: addressForm.longitude ?? browserLocation.longitude,
              payment_method: paymentMethod,
              payment_reference: paymentMethod === "cash_on_delivery" ? paymentForm.reference : undefined,
              items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
            };

            if (paymentMethod === "paystack") {
              paystackMutation.mutate(payload);
              return;
            }

            checkoutMutation.mutate(payload);
          }}
          className={`w-full py-5 rounded-2xl text-white font-headline font-black text-lg shadow-xl active:scale-[0.98] transition-all duration-300 ${!canCheckout ? 'bg-slate-200 shadow-none' : ''}`}
          style={canCheckout ? { background: signatureGradient } : {}}
        >
          {checkoutMutation.isPending || paystackMutation.isPending
            ? "PROCESSING..."
            : paymentMethod === "paystack"
              ? `CONTINUE TO PAYSTACK • ${formatMoney(totals.total_amount)}`
              : `PLACE ORDER • ${formatMoney(totals.total_amount)}`}
        </button>
      </footer>
    </div>
  );
};
