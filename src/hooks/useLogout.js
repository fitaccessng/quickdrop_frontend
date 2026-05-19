import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

const getSignedOutRoute = (accountType) => {
  if (accountType === "rider") return "/rider/login";
  if (accountType === "vendor") return "/vendor/login";
  if (accountType === "admin") return "/admin/login";
  return "/login";
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const accountType = useAuthStore((state) => state.accountType);
  const clearCart = useCartStore((state) => state.clearCart);

  return (overrideRoute) => {
    clearSession();
    clearCart();
    queryClient.clear();
    localStorage.removeItem("quickdrop-auth");
    navigate(overrideRoute || getSignedOutRoute(accountType), { replace: true });
  };
};
