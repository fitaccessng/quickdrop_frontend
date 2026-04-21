import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

export const VendorProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const accountType = useAuthStore((state) => state.accountType);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const location = useLocation();

  if (!hasHydrated) {
    return null;
  }

  if (!token || accountType !== "vendor") {
    return <Navigate to="/vendor/login" replace state={{ redirectTo: location.pathname }} />;
  }

  return children;
};
