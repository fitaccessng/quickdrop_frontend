import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clearNotifications, fetchNotificationFeed, markAllNotificationsRead, markNotificationRead } from "../api/notifications";
import { useAuthStore } from "../store/authStore";

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const accountType = useAuthStore((state) => state.accountType);
  const userId = useAuthStore((state) => state.user?.id);
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications-feed", accountType, userId, "page"],
    queryFn: () => fetchNotificationFeed({ limit: 100 }),
    enabled: Boolean(token && accountType && userId),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-feed"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-feed"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-feed"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  return (
    <div className="bg-[#f5f6f7] font-body text-slate-900 min-h-screen pb-24 antialiased">
      <div className="bg-white border-b border-slate-200/60 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-slate-600">arrow_back</span>
          </button>
          <h1 className="text-lg font-black text-slate-800">Notifications</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => readAllMutation.mutate()}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500"
            >
              Read All
            </button>
            <button
              type="button"
              onClick={() => clearMutation.mutate()}
              className="text-[10px] font-black uppercase tracking-widest text-rose-500"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <main className="px-6 py-8 space-y-6">
        {isLoading ? (
          <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-8 text-center font-black uppercase tracking-widest text-slate-400">
            Loading Notifications...
          </div>
        ) : notifications.length ? (
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm">
            {notifications.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (!item.is_read) {
                    readMutation.mutate(item.id);
                  }
                  if (item.action_url) {
                    navigate(item.action_url);
                  }
                }}
                className={`w-full p-5 text-left ${index !== notifications.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#ff9300]">{item.category}</p>
                    <p className="mt-1 font-bold text-slate-800 text-sm">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-2">{item.message}</p>
                  </div>
                  {!item.is_read ? (
                    <span className="rounded-full bg-[#ff9300] px-2 py-1 text-[9px] font-black uppercase text-white">
                      New
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">notifications</span>
            <p className="font-black text-slate-400 text-sm">No notifications yet</p>
          </div>
        )}
      </main>
    </div>
  );
};
