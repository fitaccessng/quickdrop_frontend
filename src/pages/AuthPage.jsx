import { Link } from "react-router-dom";
import { PageContainer } from "../components/common/PageContainer";
import { SectionHeading } from "../components/common/SectionHeading";

export const AuthPage = () => {
  return (
    <PageContainer className="grid gap-8 lg:grid-cols-2">
      <SectionHeading
        eyebrow="Account access"
        title="Choose the right QuickDrop flow for your role."
        description="Customers can order from vendors and manage addresses. Vendors can create a storefront and complete onboarding."
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-[2rem] bg-white/[0.05] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-base-300">Customer</p>
          <p className="mt-3 text-2xl font-semibold text-white">Shop, checkout, and track orders.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/login" className="rounded-2xl bg-white px-5 py-3 font-semibold text-base-950">Sign in</Link>
            <Link to="/signup" className="rounded-2xl bg-white/10 px-5 py-3 font-semibold text-white">Create account</Link>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white/[0.05] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-base-300">Vendor</p>
          <p className="mt-3 text-2xl font-semibold text-white">Launch and configure your storefront.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/vendor/login" className="rounded-2xl bg-white px-5 py-3 font-semibold text-base-950">Vendor login</Link>
            <Link to="/vendor/signup" className="rounded-2xl bg-white/10 px-5 py-3 font-semibold text-white">Vendor signup</Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
