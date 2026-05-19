// RiderNavigatePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  acceptRiderOrder,
  fetchRiderOrderRequests,
  fetchRiderOrders,
  fetchRiderProfile,
  fetchRiderTracking,
  rejectRiderOrder,
  updateRiderLocation,
  updateRiderOrder,
} from "../api/rider";
import { formatMoney } from "../lib/utils";

const ROUTING_URL = "https://router.project-osrm.org/route/v1/driving/";

const statusActions = [
  { id: "on_the_way", label: "On Way", note: "Rider is heading to the customer." },
  { id: "delivered", label: "Delivered", note: "Order delivered successfully." },
];

export const RiderNavigatePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [geoMessage, setGeoMessage] = useState("Waiting for GPS...");
  const [isLocationDenied, setIsLocationDenied] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [liveLocation, setLiveLocation] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLineRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);
  const routeTimeoutRef = useRef(null);

  // React Query Hook Subscriptions
  const ordersQuery = useQuery({
    queryKey: ["rider-orders"],
    queryFn: fetchRiderOrders,
    refetchInterval: 3000,
  });
  
  const requestsQuery = useQuery({
    queryKey: ["rider-order-requests", "navigate"],
    queryFn: fetchRiderOrderRequests,
    refetchInterval: 3000,
  });
  
  const profileQuery = useQuery({
    queryKey: ["rider-profile", "navigate"],
    queryFn: fetchRiderProfile,
  });

  const activeOrder = useMemo(() => {
    const managedOrders = ordersQuery.data ?? [];
    const requestOrders = requestsQuery.data ?? [];
    if (orderId) {
      return [...managedOrders, ...requestOrders].find((order) => String(order.id) === String(orderId)) ?? null;
    }
    return managedOrders[0] ?? requestOrders.find((order) => order.requires_rider_response) ?? null;
  }, [orderId, ordersQuery.data, requestsQuery.data]);

  const trackingQuery = useQuery({
    queryKey: ["rider-order-tracking", activeOrder?.id],
    queryFn: () => fetchRiderTracking(activeOrder.id),
    enabled: Boolean(activeOrder?.id),
    refetchInterval: 3000,
  });

  const trackedOrder = trackingQuery.data ?? activeOrder;

  // Global Mutation Triggers
  const locationMutation = useMutation({ mutationFn: updateRiderLocation });
  const statusMutation = useMutation({
    mutationFn: updateRiderOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
      queryClient.invalidateQueries({ queryKey: ["rider-order-requests"] });
    },
  });
  const acceptMutation = useMutation({
    mutationFn: acceptRiderOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
      queryClient.invalidateQueries({ queryKey: ["rider-order-requests"] });
    },
  });
  const rejectMutation = useMutation({
    mutationFn: rejectRiderOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
      navigate("/rider/order-requests");
    },
  });

  const profileLocation = useMemo(() => {
    if (profileQuery.data?.current_latitude != null && profileQuery.data?.current_longitude != null) {
      return { lat: Number(profileQuery.data.current_latitude), lng: Number(profileQuery.data.current_longitude) };
    }
    return null;
  }, [profileQuery.data]);

  const riderLocation = useMemo(() => {
    if (liveLocation) return liveLocation;
    if (trackedOrder?.tracking_latitude != null && trackedOrder?.tracking_longitude != null) {
      return { lat: Number(trackedOrder.tracking_latitude), lng: Number(trackedOrder.tracking_longitude) };
    }
    return profileLocation;
  }, [liveLocation, trackedOrder, profileLocation]);

  const destination = useMemo(() => {
    if (trackedOrder?.address?.latitude != null && trackedOrder?.address?.longitude != null) {
      return { lat: Number(trackedOrder.address.latitude), lng: Number(trackedOrder.address.longitude) };
    }
    return null;
  }, [trackedOrder]);

  const pendingAssignedOrders = useMemo(
    () => (requestsQuery.data || []).filter((order) => order.requires_rider_response),
    [requestsQuery.data]
  );

  // Watch Device Hardware GPS Transceiver
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoMessage("GPS missing.");
      return undefined;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setIsLocationDenied(false); 
        const now = Date.now();
        const currentCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLiveLocation(currentCoords);
        setGeoMessage("Live GPS active");

        if (trackedOrder?.id && now - lastSentRef.current > 4000) {
          lastSentRef.current = now;
          locationMutation.mutate({
            orderId: trackedOrder.id,
            tracking_latitude: position.coords.latitude,
            tracking_longitude: position.coords.longitude,
          });
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setIsLocationDenied(true); 
        }
        setGeoMessage("GPS Failure");
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [trackedOrder?.id]);

  const drawStraightLine = (start, end) => {
    if (!mapInstanceRef.current) return;
    const points = [[start.lat, start.lng], [end.lat, end.lng]];
    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current);
    }
    routeLineRef.current = L.polyline(points, {
      color: "#ff8c00",
      weight: 5,
      opacity: 0.8,
      dashArray: "8, 8"
    }).addTo(mapInstanceRef.current);
  };

  const fetchRoute = async (start, end) => {
    if (!start || !end || !mapInstanceRef.current) return;
    setIsRouteLoading(true);

    try {
      const url = `${ROUTING_URL}${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === "Ok" && data.routes?.[0]) {
        const route = data.routes[0];
        setRouteDistance(route.distance);
        setRouteDuration(route.duration);
        
        if (route.geometry?.coordinates) {
          const leafletCoordinates = route.geometry.coordinates.map(coord => [
            Number(coord[1]), 
            Number(coord[0])  
          ]);

          if (routeLineRef.current) {
            mapInstanceRef.current.removeLayer(routeLineRef.current);
          }

          routeLineRef.current = L.polyline(leafletCoordinates, {
            color: "#ff8c00",     
            weight: 6,            
            opacity: 0.9,
            lineJoin: "round",
            lineCap: "round"
          }).addTo(mapInstanceRef.current);
        } else {
          drawStraightLine(start, end);
        }
      } else {
        drawStraightLine(start, end);
      }
    } catch {
      drawStraightLine(start, end);
    } finally {
      setIsRouteLoading(false);
    }
  };

  // Base Map Mounting Canvas Configuration
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initialView = riderLocation || { lat: 6.5244, lng: 3.3792 };
    mapInstanceRef.current = L.map(mapRef.current, { zoomControl: false }).setView([initialView.lat, initialView.lng], 14);
    
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, []);

  // Sync Map Pin Overlay Components
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (riderLocation) {
      const riderIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: #ff8c00; width: 32px; height: 32px; border-radius: 10px; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15);"><span style="font-size: 14px;">🏍️</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLatLng([riderLocation.lat, riderLocation.lng]);
      } else {
        riderMarkerRef.current = L.marker([riderLocation.lat, riderLocation.lng], { icon: riderIcon }).addTo(mapInstanceRef.current);
      }
    }

    if (destination) {
      const destIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: #0A192F; width: 32px; height: 32px; border-radius: 10px; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15);"><span style="font-size: 14px;">🏁</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setLatLng([destination.lat, destination.lng]);
      } else {
        destinationMarkerRef.current = L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(mapInstanceRef.current);
      }
    }

    if (riderLocation && destination) {
      if (routeTimeoutRef.current) clearTimeout(routeTimeoutRef.current);
      routeTimeoutRef.current = setTimeout(() => {
        fetchRoute(riderLocation, destination);
        const bounds = L.latLngBounds([[riderLocation.lat, riderLocation.lng], [destination.lat, destination.lng]]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }, 400);
    }
  }, [riderLocation, destination]);

  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 overflow-hidden antialiased select-none font-body">
      {/* Dynamic Header System Context */}
      <header className="bg-white fixed top-0 left-0 right-0 z-[1002] border-b border-slate-100 h-14 max-w-md mx-auto">
        <div className="flex items-center justify-between h-full px-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-lg font-bold">arrow_back_ios_new</span>
          </button>
          
          <span className="text-xs font-black tracking-widest text-[#0A192F] uppercase">Transit Navigation</span>

          <button 
            type="button" 
            onClick={() => setIsSheetExpanded(!isSheetExpanded)} 
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] active:scale-90 transition-transform relative"
          >
            <span className="material-symbols-outlined text-xl">layers</span>
            {pendingAssignedOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white ring-2 ring-white">
                {pendingAssignedOrders.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Framework Viewport Section */}
      <div className="relative flex-1 w-full mt-14 overflow-hidden z-0">
        <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />

        {/* GPS Permission Access Blocker Modal */}
        {isLocationDenied && (
          <div className="absolute inset-0 z-[2000] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-3 border border-red-500/20">
              <span className="material-symbols-outlined text-3xl">location_off</span>
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wide">GPS Signal Disconnected</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
              We need your active coordinates to trace your delivery run. Enable location access inside your system privacy manager.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-5 px-5 py-3 bg-[#ff8c00] text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-orange-500/15"
            >
              Refresh Transceiver Map
            </button>
          </div>
        )}

        {/* Floating Top Level Telemetry Overlay Feed */}
        <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2 pointer-events-none max-w-md mx-auto">
          <div className="flex-1 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-md pointer-events-auto flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${liveLocation ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            <p className="text-[10px] font-black text-slate-200 truncate uppercase tracking-wider">{geoMessage}</p>
          </div>
          <div className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl p-2.5 shadow-md px-3 pointer-events-auto text-right flex-shrink-0">
            <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Payout</p>
            <p className="text-xs font-black text-slate-900 mt-0.5">{formatMoney(trackedOrder?.delivery_fee || 0)}</p>
          </div>
        </div>

        {/* Responsive Sliding Control Panel Bottom Sheet */}
        <div className={`absolute bottom-0 left-0 right-0 z-[1001] bg-white border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] rounded-t-[2rem] transition-all duration-300 ease-in-out max-w-md mx-auto ${isSheetExpanded ? "h-[65vh]" : "h-16"}`}>
          <div 
            className="w-full py-2.5 flex flex-col items-center justify-center cursor-pointer rounded-t-[2rem]" 
            onClick={() => setIsSheetExpanded(!isSheetExpanded)}
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
            {!isSheetExpanded && (
              <p className="text-[9px] font-black uppercase text-[#ff8c00] tracking-widest mt-1.5">
                {pendingAssignedOrders.length ? `${pendingAssignedOrders.length} Urgent Requests Waiting` : "Pull Up Control Console"}
              </p>
            )}
          </div>

          {/* Expanded Core Container Content Form */}
          <div className={`overflow-y-auto px-4 pb-6 space-y-4 ${isSheetExpanded ? "h-[calc(65vh-40px)]" : "hidden"}`}>
            {pendingAssignedOrders.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-wider text-orange-500">New Order Dispatch Pending</p>
                {pendingAssignedOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-orange-200 bg-orange-50/40 p-3 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wide">Pickup Point</p>
                        <p className="text-xs font-black text-slate-900 truncate">{order.vendor?.name}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wide mt-1.5">Dropoff</p>
                        <p className="text-xs font-bold text-slate-600 truncate">{order.address?.line1 || "Address pending"}</p>
                      </div>
                      <span className="text-xs font-black text-orange-600 flex-shrink-0">{formatMoney(order.delivery_fee)}</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={() => acceptMutation.mutate({ orderId: order.id, current_latitude: riderLocation?.lat, current_longitude: riderLocation?.lng })} 
                        className="flex-1 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-lg active:scale-95 transition-transform"
                      >
                        Accept Run
                      </button>
                      <button 
                        onClick={() => rejectMutation.mutate({ orderId: order.id })} 
                        className="px-3 py-2 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-lg active:scale-95 transition-transform"
                      >
                        Pass
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {trackedOrder && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                  <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-50 text-[#ff8c00]">
                    Status: {trackedOrder.status.replace("_", " ")}
                  </span>
                  {isRouteLoading && <span className="text-[10px] font-bold text-slate-400 animate-pulse">Calculating path...</span>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <MetricCard label="Remaining Way" value={routeDistance ? `${(routeDistance / 1000).toFixed(1)} km` : "—"} />
                  <MetricCard label="Estimated Eta" value={routeDuration ? `${Math.round(routeDuration / 60)} mins` : "—"} />
                </div>

                {/* Dark Client Contact Utility Badge Box */}
                <div className="rounded-2xl bg-[#0A192F] p-3.5 text-white flex items-center justify-between shadow-sm">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recipient Customer</p>
                    <p className="text-xs font-black mt-0.5 truncate">{trackedOrder.customer?.full_name || "Customer"}</p>
                    <p className="text-[11px] text-slate-300 font-bold truncate mt-0.5">{trackedOrder.address?.line1 || "Address pending"}</p>
                  </div>
                  <a 
                    href={`tel:${trackedOrder.customer?.phone || ""}`} 
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white flex-shrink-0 active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-lg">call</span>
                  </a>
                </div>

                {/* Workflow Status Modifier Triggers */}
                <div className="space-y-2 pt-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Update Delivery Tracker</p>
                  <div className="grid grid-cols-2 gap-2">
                    {statusActions.map((action) => {
                      const isActive = trackedOrder.status === action.id;
                      return (
                        <button 
                          key={action.id} 
                          disabled={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ orderId: trackedOrder.id, status: action.id, tracking_note: action.note, tracking_latitude: riderLocation?.lat, tracking_longitude: riderLocation?.lng })} 
                          className={`rounded-xl py-3 text-[10px] font-black uppercase tracking-wider transition-all text-center truncate ${isActive ? "bg-slate-900 text-white shadow-md" : "bg-slate-50 text-slate-500 border border-slate-200/60"}`}
                        >
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100">
    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-0.5 text-xs font-black text-slate-900">{value}</p>
  </div>
);