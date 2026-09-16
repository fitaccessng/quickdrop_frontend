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
    <div className="bg-[#f7f9fb] font-sans text-[#191c1e] min-h-screen antialiased flex flex-col items-center">
      <div className="w-full max-w-xl min-h-screen flex flex-col bg-[#f7f9fb] relative pb-32">

        {/* Fixed Header */}
        <header className="fixed top-0 w-full max-w-xl z-50 bg-white/90 backdrop-blur-xl border-b border-[#e0e3e5]/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-4 flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] transition-colors" 
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="font-bold text-sm text-[#191c1e] uppercase tracking-wider">Notifications</h1>
            
            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => readAllMutation.mutate()}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#f2f4f6] hover:bg-[#eceef0] text-[#565e74] transition-colors"
                title="Mark all as read"
              >
                Read All
              </button>
              <button
                type="button"
                onClick={() => clearMutation.mutate()}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#ffdad6]/40 hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors"
                title="Clear notifications"
              >
                Clear
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full pt-20 px-4 space-y-4 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-10 h-10 border-4 border-[#e0e3e5] border-t-[#e11d48] rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-[#565e74] uppercase tracking-wider">Syncing notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="bg-white rounded-2xl overflow-hidden border border-[#e0e3e5]/60 shadow-sm divide-y divide-[#eceef0]/60">
              {notifications.map((item) => (
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
                  className={`w-full p-4 text-left transition-colors hover:bg-[#f2f4f6]/60 flex flex-col gap-2 ${!item.is_read ? 'bg-[#f7f9fb]/80' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#f2f4f6] text-[#565e74] border border-[#e0e3e5]">
                        {item.category || 'Update'}
                      </span>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-pulse"></span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#565e74]">
                      {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-[#191c1e]">{item.title}</p>
                    <p className="text-xs text-[#565e74] leading-relaxed">{item.message}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-24 text-center px-6">
              <div className="w-16 h-16 bg-[#f2f4f6] rounded-full flex items-center justify-center mb-4 text-[#565e74] border border-[#e0e3e5]">
                <span className="material-symbols-outlined text-3xl">notifications_off</span>
              </div>
              <h3 className="font-bold text-base text-[#191c1e] mb-1">No Notifications Yet</h3>
              <p className="text-xs text-[#565e74] max-w-xs leading-relaxed">
                When you receive updates regarding orders, deliveries, or system alerts, they will appear right here.
              </p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};