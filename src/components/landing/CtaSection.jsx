import { Link } from "react-router-dom";

import { PageContainer } from "../common/PageContainer";

export const CtaSection = () => (
  <section className="py-16">
    <PageContainer>
      <div className="rounded-[2rem] bg-gradient-to-r from-base-800 via-base-700 to-base-800 p-8 sm:p-12">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-lime">Scale-ready stack</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold text-white sm:text-4xl">
          Web, mobile wrapper, and backend workflows aligned for a real marketplace launch.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-base-200">
          Build acquisition with the landing experience, then switch directly into the marketplace without visual drift.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/marketplace"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-accent-orange to-accent-coral px-6 py-4 font-semibold text-base-950"
          >
            Open marketplace
          </Link>
          <Link to="/dashboard" className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-6 py-4 font-semibold text-white">
            View dashboard
          </Link>
        </div>
      </div>
    </PageContainer>
  </section>
);
