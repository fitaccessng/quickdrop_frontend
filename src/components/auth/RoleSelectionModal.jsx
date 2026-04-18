import React from 'react';

export const RoleSelectionModal = ({ isOpen, onSelectRole, isLoading }) => {
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  if (!isOpen) return null;

  const roles = [
    {
      id: 'user',
      title: 'Customer',
      description: 'Browse and order from vendors in your area',
      icon: 'shopping_cart',
      color: 'from-blue-400 to-blue-600',
    },
    {
      id: 'vendor',
      title: 'Merchant',
      description: 'Sell your products and manage orders',
      icon: 'storefront',
      color: 'from-orange-400 to-orange-600',
    },
    {
      id: 'rider',
      title: 'Rider',
      description: 'Earn by delivering orders',
      icon: 'two_wheeler',
      color: 'from-emerald-400 to-emerald-600',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800">Choose Your Role</h2>
          <p className="text-sm text-slate-500 mt-2">Select how you want to use QuickDrop</p>
        </div>

        <div className="space-y-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              disabled={isLoading}
              className={`w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-left group`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white flex-shrink-0 group-hover:shadow-lg transition-all`} style={materialIconFill}>
                  <span className="material-symbols-outlined text-lg">{role.icon}</span>
                </div>
                <div>
                  <p className="font-black text-slate-800">{role.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          You can change your role later in settings
        </p>
      </div>
    </div>
  );
};
