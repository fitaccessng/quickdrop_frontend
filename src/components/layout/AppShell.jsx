import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";

import { useUiStore } from "../../store/uiStore";
import { MobileTabBar } from "./MobileTabBar";
import { RealtimeNotifications } from "./RealtimeNotifications";

export const AppShell = () => {
  const location = useLocation();
  const theme = useUiStore((state) => state.theme);

  const authPaths = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/vendor/login",
    "/vendor/signup",
    "/vendor/forgot-password",
    "/vendor/reset-password",
  ];

  const hideNavPaths = ["/", "/about"];

  const isAuthPage = authPaths.some((path) => location.pathname.startsWith(path));
  const isHideNavPage = hideNavPaths.some((path) => location.pathname.startsWith(path));
  const shouldHideNav = isAuthPage || isHideNavPage;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen text-base-100">
      <RealtimeNotifications />
      <main className="relative pb-28 md:pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!shouldHideNav && <MobileTabBar />}
    </div>
  );
};
