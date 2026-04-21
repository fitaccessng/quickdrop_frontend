import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  fetchAdminNotifications,
  fetchCustomerNotifications,
  fetchRiderNotifications,
  fetchVendorNotifications,
} from "../../api/notifications";
import { useAuthStore } from "../../store/authStore";

const roleQueryMap = {
  admin: fetchAdminNotifications,
  rider: fetchRiderNotifications,
  vendor: fetchVendorNotifications,
  user: fetchCustomerNotifications,
};

const playAlertTone = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.4);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.42);
};

export const RealtimeNotifications = () => {
  const { token, accountType } = useAuthStore();
  const previousTopId = useRef(null);
  const queryFn = roleQueryMap[accountType];

  const notificationsQuery = useQuery({
    queryKey: ["notifications", accountType],
    queryFn,
    enabled: Boolean(token && queryFn),
    refetchInterval: 5000,
  });

  const notifications = notificationsQuery.data ?? [];
  const unreadItems = useMemo(() => notifications.filter((item) => !item.is_read), [notifications]);

  useEffect(() => {
    if (!unreadItems.length) return;
    const newestId = unreadItems[0].id;
    if (previousTopId.current == null) {
      previousTopId.current = newestId;
      return;
    }
    if (previousTopId.current !== newestId) {
      previousTopId.current = newestId;
      playAlertTone();
    }
  }, [unreadItems]);

  if (!token || !notifications.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120] hidden w-full max-w-sm space-y-3 md:block">
      {unreadItems.slice(0, 3).map((item) => (
        <div key={item.id} className="rounded-[1.5rem] border border-orange-200 bg-white/95 px-4 py-4 shadow-xl backdrop-blur">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9300]">{item.category}</p>
          <p className="mt-2 text-sm font-extrabold text-slate-900">{item.title}</p>
          <p className="mt-1 text-xs text-slate-500">{item.message}</p>
        </div>
      ))}
    </div>
  );
};
