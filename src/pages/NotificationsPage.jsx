import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    rideUpdates: true,
    promotions: false,
    newFeatures: true,
    pushNotifications: true,
    emailNotifications: false,
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationSettings = [
    {
      category: 'Order & Delivery',
      items: [
        { key: 'orderUpdates', label: 'Order Status Updates', description: 'Get notified when your order status changes' },
        { key: 'rideUpdates', label: 'Ride Updates', description: 'Get notified about your ride status' },
      ]
    },
    {
      category: 'Marketing',
      items: [
        { key: 'promotions', label: 'Promotions & Deals', description: 'Receive exclusive offers and discounts' },
        { key: 'newFeatures', label: 'New Features', description: 'Learn about new features and updates' },
      ]
    },
    {
      category: 'Notification Method',
      items: [
        { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive notifications on your device' },
        { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
      ]
    }
  ];

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
          <h1 className="text-lg font-black text-slate-800">Notifications</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* --- Content --- */}
      <main className="px-6 py-8 space-y-6">
        {notificationSettings.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="px-4 text-xs font-black uppercase tracking-widest text-slate-400">{section.category}</h3>
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm">
              {section.items.map((item, itemIdx) => (
                <div 
                  key={item.key}
                  className={`p-5 flex items-center justify-between ${itemIdx !== section.items.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-slate-800 text-sm">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                  </div>
                  
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleNotification(item.key)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      notifications[item.key] ? 'bg-purple-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};
