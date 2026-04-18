import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const HelpCenterPage = () => {
  const navigate = useNavigate();
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I place an order?',
      answer: 'You can place an order by browsing vendors, adding items to your cart, and proceeding to checkout. Enter your delivery address and payment details to complete the order.'
    },
    {
      id: 2,
      question: 'What payment methods do you accept?',
      answer: 'We accept Visa, Mastercard, M-Pesa, and other digital payment methods. You can manage your payment methods in your account settings.'
    },
    {
      id: 3,
      question: 'How long does delivery take?',
      answer: 'Delivery times vary by vendor and location. Most orders are delivered within 30-60 minutes. You can track your order in real-time.'
    },
    {
      id: 4,
      question: 'Can I cancel my order?',
      answer: 'You can cancel your order within the first 5 minutes. After that, contact our support team for assistance.'
    },
    {
      id: 5,
      question: 'How do I request a rider?',
      answer: 'Go to the "Request Rider" section, enter your pickup and delivery details, and select your preferred vehicle type.'
    },
  ];

  const supportChannels = [
    {
      icon: 'mail',
      title: 'Email Support',
      description: 'support@quickdrop.co.ke',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: 'phone',
      title: 'Call Us',
      description: '+254 700 123 456',
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      icon: 'chat',
      title: 'Live Chat',
      description: 'Available 9 AM - 6 PM',
      color: 'bg-purple-50 text-purple-600'
    },
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
          <h1 className="text-lg font-black text-slate-800">Help Center</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* --- Content --- */}
      <main className="px-6 py-8 space-y-8">
        
        {/* FAQ Section */}
        <section className="space-y-3">
          <h3 className="px-4 text-xs font-black uppercase tracking-widest text-slate-400">Frequently Asked Questions</h3>
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm space-y-2 p-2">
            {faqs.map((faq, idx) => (
              <button
                key={faq.id}
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                className="w-full text-left"
              >
                <div className="p-4 hover:bg-slate-50 transition-colors rounded-xl flex items-center justify-between">
                  <p className="font-bold text-slate-800 text-sm pr-4">{faq.question}</p>
                  <span className={`material-symbols-outlined text-slate-400 flex-shrink-0 transition-transform ${expandedFAQ === faq.id ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
                {expandedFAQ === faq.id && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Support Channels */}
        <section className="space-y-3">
          <h3 className="px-4 text-xs font-black uppercase tracking-widest text-slate-400">Contact Support</h3>
          <div className="grid grid-cols-1 gap-3">
            {supportChannels.map((channel, idx) => (
              <button 
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${channel.color} flex items-center justify-center flex-shrink-0`} style={materialIconFill}>
                    <span className="material-symbols-outlined text-xl">{channel.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{channel.title}</p>
                    <p className="text-xs text-slate-500">{channel.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Documentation Links */}
        <section className="space-y-3">
          <h3 className="px-4 text-xs font-black uppercase tracking-widest text-slate-400">Resources</h3>
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm">
            <button className="w-full p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-cyan-600" style={materialIconFill}>article</span>
                <p className="font-bold text-slate-800 text-sm">Getting Started Guide</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
            <button className="w-full p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-cyan-600" style={materialIconFill}>local_shipping</span>
                <p className="font-bold text-slate-800 text-sm">Delivery Information</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
            <button className="w-full p-5 hover:bg-slate-50 transition-colors text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-cyan-600" style={materialIconFill}>security</span>
                <p className="font-bold text-slate-800 text-sm">Safety & Security</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
