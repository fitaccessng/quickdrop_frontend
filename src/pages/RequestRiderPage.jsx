import React, { useEffect, useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
  latitude: "-26.2041", 
  longitude: "28.0473",
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

// ============================================================================
// STANDALONE SUB-COMPONENTS
// ============================================================================
const TextField = ({ label, value, onChange, placeholder }) => (
  <label className="block rounded-[1.5rem] bg-slate-50 px-4 py-4 focus-within:ring-2 focus-within:ring-rose-500/10 transition-all">
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
    />
  </label>
);

// Internal map click event listener hook
const MapEventsHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Interactive Map Sheet Modal
const MapPickerSheet = ({ isOpen, onClose, initialLat, initialLng, onConfirm }) => {
  const mapRef = useRef(null);
  const [selectedCoords, setSelectedCoords] = useState({ lat: -26.2041, lng: 28.0473 });

  // Update pin coordinates when modal opens or inputs change
  useEffect(() => {
    const latNum = parseFloat(initialLat);
    const lngNum = parseFloat(initialLng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      setSelectedCoords({ lat: latNum, lng: lngNum });
    }
  }, [initialLat, initialLng, isOpen]);

  // Handle map container size adjustments safely when transition triggers
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const mapInstance = mapRef.current;
        if (mapInstance) {
          mapInstance.invalidateSize();
          mapInstance.setView([selectedCoords.lat, selectedCoords.lng], mapInstance.getZoom());
        }
      }, 150);
    }
  }, [isOpen, selectedCoords.lat, selectedCoords.lng]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed bottom-0 left-0 w-full z-[101] bg-white rounded-t-[2.5rem] p-6 shadow-2xl transition-transform max-w-md left-1/2 -translate-x-1/2 h-[80vh] flex flex-col">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 flex-shrink-0" />
        
        <h3 className="font-headline font-black text-xs uppercase tracking-widest text-center text-slate-400 mb-4">
          Tap Map to Move Pin
        </h3>
        
        {/* Leaflet Map Wrapper */}
        <div className="flex-1 rounded-2xl overflow-hidden relative border border-slate-100 min-h-0 z-10">
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
        </div>

        <div className="mt-4 space-y-3 flex-shrink-0">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Selected Coordinates</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => onConfirm(selectedCoords.lat, selectedCoords.lng)}
            className="w-full py-4 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
          >
            Confirm Location Pin
          </button>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const RequestRiderPage = () => {
  const navigate = useNavigate();
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
  const quoteEnabled =
    pickupLatitude != null &&
    pickupLongitude != null &&
    dropoffLatitude != null &&
    dropoffLongitude != null &&
    pickupAddress.length >= 3 &&
    dropoffAddress.length >= 3;

  const quoteQuery = useQuery({
    queryKey: ["ride-quote", vehicleType, pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude, pickupAddress, dropoffAddress],
    enabled: quoteEnabled,
    queryFn: () =>
      quoteRide({
        vehicle_type: vehicleType,
        pickup: {
          address: pickupAddress,
          latitude: pickupLatitude,
          longitude: pickupLongitude,
        },
        dropoff: {
          address: dropoffAddress,
          latitude: dropoffLatitude,
          longitude: dropoffLongitude,
        },
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

  const setCurrentLocation = (target) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const value = {
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
          address: "Current Position Set",
        };
        if (target === "pickup") {
          setPickup((current) => ({ ...current, ...value }));
        } else {
          setDropoff((current) => ({ ...current, ...value }));
        }
      },
      () => setMessage("Location permission is needed to use your current position."),
    );
  };

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

  const pricing = {
    bike: { label: "Bike" },
    car: { label: "Car" },
    xl: { label: "XL" },
  };

  const handleRequestRide = () => {
    setMessage("");
    if (!quoteEnabled) {
      setMessage("Add valid pickup and dropoff details before requesting a rider.");
      return;
    }
    mutation.mutate({
      vehicle_type: vehicleType,
      pickup: {
        address: pickupAddress,
        latitude: pickupLatitude,
        longitude: pickupLongitude,
      },
      dropoff: {
        address: dropoffAddress,
        latitude: dropoffLatitude,
        longitude: dropoffLongitude,
      },
      customer_note: customerNote,
    });
  };

  return (
    <div className="bg-slate-50 font-body text-slate-900 min-h-screen pb-40 sm:pb-32">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-slate-100">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-900 border border-slate-100 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-lg">arrow_back_ios_new</span>
          </button>
          <h1 className="text-xs font-black font-headline tracking-widest text-rose-700 uppercase">Request a Rider</h1>
          <div className="w-9" />
        </div>
      </header>

      {/* Main Form Fields Container */}
      <main className="pt-20 px-4 sm:px-6 max-w-md mx-auto space-y-4 sm:space-y-6">
        
        {/* Intro Hero banner */}
        <section className="rounded-[2rem] sm:rounded-[2.5rem] bg-white p-5 sm:p-6 shadow-sm border border-slate-100 mt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Item Delivery</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black font-headline text-slate-900 leading-tight">Send a rider for an item.</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">Set the pickup point, your dropoff point, and dispatch a rider directly to your destination. Pricing and ETA come from the live ride backend.</p>
        </section>

        {/* Pickup Form Segment */}
        <section className="rounded-[2rem] sm:rounded-[2.5rem] bg-white p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pickup Details</h3>
          <TextField label="Pickup address" value={pickup.address} onChange={(value) => setPickup((current) => ({ ...current, address: value }))} placeholder="Store, mall, restaurant, or pickup point" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField label="Pickup latitude" value={pickup.latitude} onChange={(value) => setPickup((current) => ({ ...current, latitude: value }))} placeholder="-26.2041" />
            <TextField label="Pickup longitude" value={pickup.longitude} onChange={(value) => setPickup((current) => ({ ...current, longitude: value }))} placeholder="28.0473" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button" 
              onClick={() => setCurrentLocation("pickup")} 
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 p-3 text-[10px] font-black uppercase tracking-wider text-slate-700 active:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">my_location</span>
              Current Loc
            </button>
            <button 
              type="button" 
              onClick={() => setMapTarget("pickup")} 
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 p-3 text-[10px] font-black uppercase tracking-wider text-rose-700 active:bg-rose-100 transition-colors border border-rose-100"
            >
              <span className="material-symbols-outlined text-sm">map</span>
              Select on Map
            </button>
          </div>
        </section>

        {/* Dropoff Form Segment */}
        <section className="rounded-[2rem] sm:rounded-[2.5rem] bg-white p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dropoff Details</h3>
          <TextField label="Dropoff address" value={dropoff.address} onChange={(value) => setDropoff((current) => ({ ...current, address: value }))} placeholder="Where the rider should deliver the item" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField label="Dropoff latitude" value={dropoff.latitude} onChange={(value) => setDropoff((current) => ({ ...current, latitude: value }))} placeholder="-26.2041" />
            <TextField label="Dropoff longitude" value={dropoff.longitude} onChange={(value) => setDropoff((current) => ({ ...current, longitude: value }))} placeholder="28.0473" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button" 
              onClick={() => setCurrentLocation("dropoff")} 
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 p-3 text-[10px] font-black uppercase tracking-wider text-slate-700 active:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">my_location</span>
              Current Loc
            </button>
            <button 
              type="button" 
              onClick={() => setMapTarget("dropoff")} 
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 p-3 text-[10px] font-black uppercase tracking-wider text-rose-700 active:bg-rose-100 transition-colors border border-rose-100"
            >
              <span className="material-symbols-outlined text-sm">map</span>
              Select on Map
            </button>
          </div>
        </section>

        {/* Vehicle Options Section */}
        <section className="rounded-[2rem] sm:rounded-[2.5rem] bg-white p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle Type</h3>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {Object.entries(pricing).map(([id, option]) => (
              <button
                key={id}
                type="button"
                onClick={() => setVehicleType(id)}
                className={`rounded-2xl border p-3 sm:p-4 text-left transition-all ${
                  vehicleType === id ? "border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/10" : "border-slate-100 bg-slate-50 active:bg-slate-100"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-900">{option.label}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {vehicleType === id && quoteQuery.data ? formatMoney(quoteQuery.data.estimated_fare) : "Live quote"}
                </p>
              </button>
            ))}
          </div>

          {quoteQuery.data ? (
            <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
              <p className="font-black text-slate-900">{formatMoney(quoteQuery.data.estimated_fare)} • {quoteQuery.data.currency}</p>
              <p className="mt-1 text-xs">ETA {Math.max(1, Math.round((quoteQuery.data.eta_seconds ?? 0) / 60))} min • {(quoteQuery.data.distance_meters / 1000).toFixed(1)} km</p>
            </div>
          ) : null}
          
          <label className="block rounded-[1.5rem] bg-slate-50 px-4 py-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rider note</span>
            <textarea
              rows={2}
              value={customerNote}
              onChange={(event) => setCustomerNote(event.target.value)}
              placeholder="Item details, store instructions, or contact notes"
              className="mt-2 w-full resize-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
          
          {message ? <p className="text-xs font-bold text-rose-600 px-1">{message}</p> : null}
        </section>
      </main>

      {/* Sticky Bottom Actions Bar */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-2xl border-t border-slate-100 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] px-4 z-40">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={handleRequestRide}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-[0.15em] shadow-xl active:scale-[0.98] disabled:opacity-50 transition-all"
            style={{ backgroundImage: "linear-gradient(135deg, #b61321 0%, #ff7670 100%)" }}
          >
            {mutation.isPending ? "Requesting Rider..." : "Request Pickup Rider"}
          </button>
        </div>
      </footer>

      {/* Reusable Map Drawer Component */}
      <MapPickerSheet
        isOpen={!!mapTarget}
        onClose={() => setMapTarget(null)}
        initialLat={mapTarget === "pickup" ? pickup.latitude : dropoff.latitude}
        initialLng={mapTarget === "pickup" ? pickup.longitude : dropoff.longitude}
        onConfirm={handleMapSelectionConfirm}
      />
    </div>
  );
};
