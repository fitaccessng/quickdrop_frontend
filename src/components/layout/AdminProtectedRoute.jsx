import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

export const AdminProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const accountType = useAuthStore((state) => state.accountType);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const location = useLocation();

  if (!hasHydrated) {
    return null;
  }

  if (!token || accountType !== "admin") {
    return <Navigate to="/admin/login" replace state={{ redirectTo: location.pathname }} />;
  }

  return children;
};
