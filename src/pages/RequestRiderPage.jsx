import React, { useEffect, useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

import { quoteRide, requestRide } from "../api/rides";
import { formatMoney } from "../lib/utils";

// Fix Leaflet default marker icon bug in React builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const initialPoint = {
  address: "",
  latitude: "",
  longitude: "",
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildPointAddress = (point) => {
  if (point.address?.trim()) return point.address.trim();
  const latitude = toNumber(point.latitude);
  const longitude = toNumber(point.longitude);
  if (latitude == null || longitude == null) return "";
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
};

const MapEventsHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapPickerSheet = ({ isOpen, onClose, initialLat, initialLng, onConfirm }) => {
  const mapRef = useRef(null);
  const [selectedCoords, setSelectedCoords] = useState(null);

  useEffect(() => {
    const latNum = parseFloat(initialLat);
    const lngNum = parseFloat(initialLng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      setSelectedCoords({ lat: latNum, lng: lngNum });
    } else if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setSelectedCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
      });
    }
  }, [initialLat, initialLng, isOpen]);

  useEffect(() => {
    if (isOpen && selectedCoords) {
      setTimeout(() => {
        const mapInstance = mapRef.current;
        if (mapInstance) {
          mapInstance.invalidateSize();
          mapInstance.setView([selectedCoords.lat, selectedCoords.lng], mapInstance.getZoom());
        }
      }, 150);
    }
  }, [isOpen, selectedCoords?.lat, selectedCoords?.lng]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl md:max-w-4xl z-[101] bg-white rounded-t-[2.5rem] p-6 shadow-2xl transition-transform h-[80vh] flex flex-col">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 flex-shrink-0" />
        
        <h3 className="font-headline font-black text-xs uppercase tracking-widest text-center text-slate-400 mb-4">
          Tap Map to Move Pin
        </h3>
        
        <div className="flex-1 rounded-2xl overflow-hidden relative border border-slate-100 min-h-0 z-10">
          {selectedCoords ? (
            <MapContainer
              center={[selectedCoords.lat, selectedCoords.lng]}
              zoom={14}
              className="w-full h-full"
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[selectedCoords.lat, selectedCoords.lng]} />
              <MapEventsHandler onMapClick={(lat, lng) => setSelectedCoords({ lat, lng })} />
            </MapContainer>
          ) : null}
        </div>

        <div className="mt-4 space-y-3 flex-shrink-0">
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Selected Coordinates</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              {selectedCoords ? `${selectedCoords.lat.toFixed(5)}, ${selectedCoords.lng.toFixed(5)}` : "Waiting for location permission"}
            </p>
          </div>
          
          <button
            type="button"
            disabled={!selectedCoords}
            onClick={() => onConfirm(selectedCoords.lat, selectedCoords.lng)}
            className="w-full py-4 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-transform shadow-md"
          >
            Confirm Location Pin
          </button>
        </div>
      </div>
    </>
  );
};

export const RequestRiderPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  
  const [pickup, setPickup] = useState({ ...initialPoint });
  const [dropoff, setDropoff] = useState({ ...initialPoint });
  const [vehicleType, setVehicleType] = useState("bike");
  const [customerNote, setCustomerNote] = useState("");
  const [message, setMessage] = useState("");
  const [mapTarget, setMapTarget] = useState(null); 

  const pickupLatitude = toNumber(pickup.latitude);
  const pickupLongitude = toNumber(pickup.longitude);
  const dropoffLatitude = toNumber(dropoff.latitude);
  const dropoffLongitude = toNumber(dropoff.longitude);
  const pickupAddress = buildPointAddress(pickup);
  const dropoffAddress = buildPointAddress(dropoff);

  // Scroll to header whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const quoteEnabled =
    pickupLatitude != null &&
    pickupLongitude != null &&
    dropoffLatitude != null &&
    dropoffLongitude != null &&
    pickupAddress.length >= 3 &&
    dropoffAddress.length >= 3;

  const signatureGradient = {
    background: 'linear-gradient(135deg, #b61321 0%, #ff7670 100%)',
  };

  const quoteQuery = useQuery({
    queryKey: ["ride-quote", vehicleType, pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude, pickupAddress, dropoffAddress],
    enabled: quoteEnabled && step >= 2,
    queryFn: () =>
      quoteRide({
        vehicle_type: vehicleType,
        pickup: { address: pickupAddress, latitude: pickupLatitude, longitude: pickupLongitude },
        dropoff: { address: dropoffAddress, latitude: dropoffLatitude, longitude: dropoffLongitude },
      }),
  });

  const mutation = useMutation({
    mutationFn: requestRide,
    onSuccess: (data) => {
      navigate(`/tracking/${data.ride_id}`);
    },
    onError: (error) => {
      const detail = error?.response?.data?.detail;
      setMessage(typeof detail === "string" ? detail : "Unable to request a rider right now.");
    },
  });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const defaultCoords = {
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        };
        setDropoff((current) => ({ ...current, ...defaultCoords }));
        setPickup((current) => ({ ...current, ...defaultCoords }));
      },
      () => {},
    );
  }, []);

  const handleMapSelectionConfirm = (lat, lng) => {
    const coordsUpdate = {
      latitude: String(lat),
      longitude: String(lng),
      address: mapTarget === "pickup" ? pickup.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}` : dropoff.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    };

    if (mapTarget === "pickup") {
      setPickup((prev) => ({ ...prev, ...coordsUpdate }));
    } else if (mapTarget === "dropoff") {
      setDropoff((prev) => ({ ...prev, ...coordsUpdate }));
    }
    setMapTarget(null);
  };

  const vehicles = {
    bike: { label: "Express Bike", desc: "Max 15 kg payload", time: "3 min" },
    car: { label: "Standard Car", desc: "Max 45 kg payload", time: "6 min" },
    xl: { label: "Heavy Freight", desc: "Max 200 kg load", time: "11 min" },
  };

  const recentDestinations = [];

  const handleProceedToVehicles = () => {
    setMessage("");
    if (!quoteEnabled) {
      setMessage("Please provide valid pickup and dropoff destinations first.");
      return;
    }
    setStep(2);
  };

  const handleProceedToCheckout = () => {
    setStep(3);
  };

  const handleBookAndPay = () => {
    setMessage("");
    mutation.mutate({
      vehicle_type: vehicleType,
      pickup: { address: pickupAddress, latitude: pickupLatitude, longitude: pickupLongitude },
      dropoff: { address: dropoffAddress, latitude: dropoffLatitude, longitude: dropoffLongitude },
      customer_note: customerNote,
    });
  };

  return (
    <div className="bg-slate-50 font-body text-slate-900 min-h-screen pb-44 flex flex-col items-center">
      <div className="w-full max-w-4xl lg:max-w-6xl min-h-screen flex flex-col relative">
        
        {/* Top Navbar */}
        <header className="bg-white/90 backdrop-blur-xl fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl lg:max-w-6xl z-50 border-b border-slate-100">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <button
              type="button"
              onClick={() => {
                if (step > 1) setStep(step - 1);
                else navigate(-1);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-900 border border-slate-100 active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back_ios_new</span>
            </button>
            <h1 className="text-xs sm:text-sm font-black font-headline tracking-widest text-slate-900 uppercase">
              {step === 1 && "Route"}
              {step === 2 && "Choose Vehicle"}
              {step === 3 && "Book & Pay"}
            </h1>
            <div className="w-9 sm:w-10 text-right text-xs font-bold text-slate-400">0{step}/03</div>
          </div>
        </header>

        {/* Main Section Content Container */}
        <main className="pt-20 sm:pt-28 px-4 sm:px-6 flex-1 max-w-3xl lg:max-w-5xl mx-auto w-full">
          
          {/* STEP 1: RESPONSIVE MAP + ROUTE INPUT CARDS */}
          {step === 1 && (
            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6 animate-fadeIn">
              
              {/* Interactive Live Map (Left/Top on desktop) */}
              <div className="lg:col-span-7 w-full h-64 sm:h-80 lg:h-[460px] rounded-3xl overflow-hidden relative shadow-sm border border-slate-200/80 z-10">
                <MapContainer 
                  center={[toNumber(pickup.latitude) || -26.2041, toNumber(pickup.longitude) || 28.0473]} 
                  zoom={13} 
                  className="w-full h-full"
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[toNumber(pickup.latitude) || -26.2041, toNumber(pickup.longitude) || 28.0473]} />
                </MapContainer>
              </div>

              {/* Controls Column (Right on desktop) */}
              <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Bolt-Style Route Card Container */}
                  <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
                    
                    {/* Pickup Row */}
                    <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Pickup</span>
                        <input
                          value={pickup.address}
                          onChange={(e) => setPickup(c => ({ ...c, address: e.target.value }))}
                          placeholder="Current location or pickup address"
                          className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none mt-0.5"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setMapTarget("pickup")}
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm active:scale-95"
                        title="Pin on Map"
                      >
                        <span className="material-symbols-outlined text-sm">map</span>
                      </button>
                    </div>

                    {/* Dropoff Row */}
                    <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 relative">
                      <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Dropoff Destination</span>
                        <input
                          value={dropoff.address}
                          onChange={(e) => setDropoff(c => ({ ...c, address: e.target.value }))}
                          placeholder="Where to?"
                          className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none mt-0.5"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setMapTarget("dropoff")}
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm active:scale-95"
                        title="Pin on Map"
                      >
                        <span className="material-symbols-outlined text-sm">location_on</span>
                      </button>
                    </div>
                  </div>

                  {/* Recent / Suggested Destinations List */}
                  <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 divide-y divide-slate-50 max-h-56 overflow-y-auto">
                    <p className="text-[10px] font-black uppercase text-slate-400 px-3 pt-2 pb-1 tracking-widest">Recent Places</p>
                    {recentDestinations.map((place, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDropoff(c => ({ ...c, address: place.address }))}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                            <span className="material-symbols-outlined text-base">schedule</span>
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">{place.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{place.address}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400">{place.distance}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {message && <p className="text-xs font-bold text-rose-600 px-2">{message}</p>}

                <button
                  type="button"
                  onClick={handleProceedToVehicles}
                  style={signatureGradient}
                  className="w-full py-4 rounded-2xl text-white text-xs sm:text-sm font-black uppercase tracking-[0.15em] shadow-lg shadow-rose-200 active:scale-[0.98] transition-all"
                >
                  Proceed to Vehicle Selection
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: VEHICLE TYPE SELECTION */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">
              <section className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Fleet Dispatch Options</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black font-headline text-slate-900">Select Vehicle Capacity</h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-500">Pick the ideal transport category for your item dimensions.</p>
              </section>

              <div className="grid grid-cols-1 gap-3">
                {Object.entries(vehicles).map(([id, option]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setVehicleType(id)}
                    className={`rounded-[2rem] border p-5 text-left transition-all flex items-center justify-between ${
                      vehicleType === id ? "border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/10 shadow-md" : "border-slate-100 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${vehicleType === id ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <span className="material-symbols-outlined text-xl">
                          {id === 'bike' ? 'two_wheeler' : id === 'car' ? 'directions_car' : 'local_shipping'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{option.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{option.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-rose-600 uppercase">~{option.time}</p>
                    </div>
                  </button>
                ))}
              </div>

              {quoteQuery.data && (
                <div className="rounded-[2rem] bg-slate-900 text-white p-6 shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calculated Estimate</p>
                    <p className="text-xl font-black mt-1">{formatMoney(quoteQuery.data.estimated_fare)} <span className="text-xs font-normal text-slate-400">{quoteQuery.data.currency}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-300">Distance: {(quoteQuery.data.distance_meters / 1000).toFixed(1)} km</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-4 rounded-2xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  style={signatureGradient}
                  className="w-2/3 py-4 rounded-2xl text-white text-xs sm:text-sm font-black uppercase tracking-[0.15em] shadow-lg active:scale-[0.98] transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUMMARY & BOOK / PAY */}
          {step === 3 && (
            <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">
              <section className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Booking Summary</p>
                <h2 className="mt-2 text-2xl font-black font-headline text-slate-900">Review & Pay</h2>
                <p className="mt-2 text-xs text-slate-500">Verify your selected vehicle and cost before completing payment.</p>
              </section>

              {/* Summary Breakdown Card */}
              <section className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-sm border border-slate-100 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
                      <span className="material-symbols-outlined text-lg">
                        {vehicleType === 'bike' ? 'two_wheeler' : vehicleType === 'car' ? 'directions_car' : 'local_shipping'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-slate-900">{vehicles[vehicleType]?.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Instant Priority Dispatch</p>
                    </div>
                  </div>
                  <span className="text-base font-black text-rose-600">
                    {quoteQuery.data ? formatMoney(quoteQuery.data.estimated_fare) : "$--"}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Pickup Point</span>
                    <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">{pickupAddress}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Dropoff Destination</span>
                    <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">{dropoffAddress}</span>
                  </div>
                </div>

                <label className="block rounded-[1.5rem] bg-slate-50 px-4 py-3 border border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Courier Note</span>
                  <input
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Gate code, fragile item, etc..."
                    className="mt-1 w-full bg-transparent text-xs font-bold text-slate-900 outline-none"
                  />
                </label>
              </section>

              {/* Payment Method Bar */}
              <section className="rounded-[2rem] bg-white p-5 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">credit_card</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Apple Pay / Card (•• 4092)</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Verified instant checkout</p>
                  </div>
                </div>
                <button type="button" className="text-xs font-bold text-rose-600 hover:underline">Change</button>
              </section>

              {message && <p className="text-xs font-bold text-rose-600 px-2">{message}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-4 rounded-2xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={handleBookAndPay}
                  style={signatureGradient}
                  className="w-2/3 py-4 rounded-2xl text-white text-xs sm:text-sm font-black uppercase tracking-[0.15em] shadow-lg shadow-rose-200 active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                  {mutation.isPending ? "Processing Payment..." : "Book & Pay Now"}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Persistent Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl lg:max-w-6xl z-50 flex justify-around items-center px-2 pb-8 pt-4 bg-white/95 backdrop-blur-2xl border-t border-slate-100 rounded-t-[2.5rem]">
          <Link to="/dashboard" className="flex flex-col items-center text-slate-400 group flex-1">
            <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">home</span>
            <span className="text-[10px] font-black uppercase mt-1">Home</span>
          </Link>
          <Link to="/market" className="flex flex-col items-center text-slate-400 group flex-1">
            <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">storefront</span>
            <span className="text-[10px] font-black uppercase mt-1">Market</span>
          </Link>
          <button onClick={() => { setStep(1); navigate('/ride'); }} className="flex flex-col items-center text-rose-600 flex-1 cursor-default">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>two_wheeler</span>
            <span className="text-[10px] font-black uppercase mt-1">Ride</span>
          </button>
          <Link to="/orders" className="flex flex-col items-center text-slate-400 group flex-1">
            <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">receipt_long</span>
            <span className="text-[10px] font-black uppercase mt-1">Orders</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-slate-400 group flex-1">
            <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">person</span>
            <span className="text-[10px] font-black uppercase mt-1">Profile</span>
          </Link>
        </nav>

        {/* Reusable Map Drawer Component */}
        <MapPickerSheet
          isOpen={!!mapTarget}
          onClose={() => setMapTarget(null)}
          initialLat={mapTarget === "pickup" ? pickup.latitude : dropoff.latitude}
          initialLng={mapTarget === "pickup" ? pickup.longitude : dropoff.longitude}
          onConfirm={handleMapSelectionConfirm}
        />
      </div>
    </div>
  );
};