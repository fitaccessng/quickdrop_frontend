import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

export const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const accountType = useAuthStore((state) => state.accountType);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const location = useLocation();

  // Show nothing while hydrating
  if (!hasHydrated) {
    return null;
  }

  if (!token || accountType !== "user") {
    return <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />;
  }

  return children;
};
