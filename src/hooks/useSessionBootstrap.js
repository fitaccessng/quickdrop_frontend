import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchProfile } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export const useSessionBootstrap = () => {
  const token = useAuthStore((state) => state.token);
  const accountType = useAuthStore((state) => state.accountType);
  const setProfile = useAuthStore((state) => state.setProfile);
  const clearSession = useAuthStore((state) => state.clearSession);

  const query = useQuery({
    queryKey: ["profile", accountType],
    queryFn: fetchProfile,
    enabled: Boolean(token) && accountType === "user",
  });

  useEffect(() => {
    if (query.data) {
      setProfile(query.data);
    }
  }, [query.data, setProfile]);

  useEffect(() => {
    if (accountType === "user" && query.isError) {
      clearSession();
    }
  }, [accountType, clearSession, query.isError]);

  return query;
};
