import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TermsOfServicePage = () => {
  const navigate = useNavigate();
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const terms = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
    },
    {
      title: '2. Use License',
      content: 'Permission is granted to temporarily download one copy of the materials (information or software) on QuickDrop\'s services for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.'
    },
    {
      title: '3. Disclaimer of Warranties',
      content: 'The materials on QuickDrop\'s services are provided on an \'as is\' basis. QuickDrop makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
    },
    {
      title: '4. Limitations of Liability',
      content: 'In no event shall QuickDrop or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on QuickDrop\'s services.'
    },
    {
      title: '5. Accuracy of Materials',
      content: 'The materials appearing on QuickDrop\'s services could include technical, typographical, or photographic errors. QuickDrop does not warrant that any of the materials on the service are accurate, complete, or current.'
    },
    {
      title: '6. Modifications',
      content: 'QuickDrop may revise these terms of service at any time without notice. By using this service, you are agreeing to be bound by the then current version of these terms of service.'
    },
    {
      title: '7. User Responsibilities',
      content: 'Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. Users agree to notify QuickDrop immediately of any unauthorized use of their account.'
    },
    {
      title: '8. Governing Law',
      content: 'These terms and conditions are governed by and construed in accordance with the laws of Kenya, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.'
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
          <h1 className="text-lg font-black text-slate-800">Terms of Service</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* --- Content --- */}
      <main className="px-6 py-8">
        {/* Header Info */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-3xl text-slate-400" style={materialIconFill}>description</span>
            <div>
              <p className="font-black text-slate-800">QuickDrop Terms of Service</p>
              <p className="text-xs text-slate-500">Last Updated: April 2026</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Please read these terms carefully before using the QuickDrop service. Your access and use of the service is conditioned on your acceptance of and compliance with these terms.
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-4">
          {terms.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
              <h3 className="font-black text-slate-800 text-sm mb-3">{section.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
          <p className="text-xs text-slate-500 mb-2 font-black uppercase tracking-wider">Questions?</p>
          <p className="text-sm text-slate-700 mb-4">For any questions about these terms, please contact us</p>
          <button className="px-6 py-3 bg-gradient-to-r from-[#ff9300] to-[#ffb857] text-white font-black text-xs rounded-xl active:scale-95 transition-all inline-flex items-center gap-2">
            <span className="material-symbols-outlined">mail</span>
            Contact Support
          </button>
        </div>

        {/* Acceptance Checkbox */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
          <div className="flex items-start gap-3">
            <input type="checkbox" id="accept-terms" className="w-5 h-5 mt-1 accent-purple-500 cursor-pointer" />
            <label htmlFor="accept-terms" className="flex-1">
              <p className="font-bold text-slate-800 text-sm">I accept the Terms of Service</p>
              <p className="text-xs text-slate-500 mt-1">By checking this box, you confirm that you have read and agree to be bound by all terms and conditions.</p>
            </label>
          </div>
        </div>
      </main>
    </div>
  );
};
