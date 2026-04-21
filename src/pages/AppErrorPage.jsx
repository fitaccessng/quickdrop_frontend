import React from "react";
import { Link, useRouteError } from "react-router-dom";

export const AppErrorPage = () => {
  const error = useRouteError();
  const status = error?.status || 500;
  const title = status === 404 ? "Page not found" : "Something went wrong";
  const detail = error?.statusText || error?.message || "The page could not be loaded.";

  return (
    <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff9300]">QuickDrop</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">{title}</h1>
        <p className="mt-3 text-sm font-medium text-slate-500">{detail}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/" className="px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-black uppercase tracking-widest">
            Home
          </Link>
          <Link to="/categories" className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-black uppercase tracking-widest">
            Categories
          </Link>
        </div>
      </div>
    </div>
  );
};
