import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { AuthPage } from "../pages/AuthPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { DashboardPage } from "../pages/DashboardPage";
import { HomePage } from "../pages/HomePage";
import { LandingPage } from "../pages/LandingPage";
import { OrderTrackingPage } from "../pages/OrderTrackingPage";
import { OrdersPage } from "../pages/OrdersPage";
import { RidePage } from "../pages/RidePage";
import { RequestRiderPage } from "../pages/RequestRiderPage";
import { VendorPage } from "../pages/VendorPage";
import { ExplorePage } from "../pages/ExplorePage";
import { CategoriesPage } from "../pages/CategoriesPage";
import { AboutPage } from "../pages/AboutPage";
import { MarketPage } from "../pages/MarketPage";
import { ProductPage } from "../pages/ProductPage";
import { Signup } from "../pages/Signup";
import { Login } from "../pages/Login";
import { UnifiedSignup } from "../pages/UnifiedSignup";
import { UnifiedLogin } from "../pages/UnifiedLogin";
import { ForgetPassword } from "../pages/ForgetPassword";
import { ResetPassword } from "../pages/ResetPassword";
import { OnboardingPage } from "../pages/Onboarding";
import { CustomerOnboarding } from "../pages/CustomerOnboarding";
import { VendorForgotPasswordPage } from "../pages/VendorForgotPasswordPage";
import { VendorLoginPage } from "../pages/VendorLoginPage";
import { VendorOnboardingPage } from "../pages/VendorOnboardingPage";
import { VendorResetPasswordPage } from "../pages/VendorResetPasswordPage";
import { VendorSignupPage } from "../pages/VendorSignupPage";
import { RiderOnboarding } from "../pages/RiderOnboarding";
import { ProfilePage } from "../pages/ProfilePage";
import { PersonalInformationPage } from "../pages/PersonalInformationPage";
import { PaymentMethodsPage } from "../pages/PaymentMethodsPage";
import { OrderHistoryPage } from "../pages/OrderHistoryPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { PrivacySecurityPage } from "../pages/PrivacySecurityPage";
import { HelpCenterPage } from "../pages/HelpCenterPage";
import { TermsOfServicePage } from "../pages/TermsOfServicePage";
import { VendorDashboard } from "../pages/VendorDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "marketplace", element: <HomePage /> },
      { path: "vendor/:id", element: <VendorPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "explore", element: <ExplorePage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "signup", element: <UnifiedSignup /> },
      { path: "login", element: <UnifiedLogin /> },
      { path: "forgot-password", element: <ForgetPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "onboarding", element: <CustomerOnboarding /> },
      { path: "market", element: <MarketPage /> },
      { path: "product/:productId", element: <ProductPage /> },
      { path: "vendor/signup", element: <VendorSignupPage /> },
      { path: "vendor/login", element: <VendorLoginPage /> },
      { path: "vendor/forgot-password", element: <VendorForgotPasswordPage /> },
      { path: "vendor/reset-password", element: <VendorResetPasswordPage /> },
      { path: "vendor/onboarding", element: <VendorOnboardingPage /> },
      { path: "vendor/dashboard", element: <VendorDashboard /> },
      { path: "rider/onboarding", element: <RiderOnboarding /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "ride", element: <RidePage /> },
      { path: "request-rider", element: <RequestRiderPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "profile/personal", element: <PersonalInformationPage /> },
      { path: "profile/payments", element: <PaymentMethodsPage /> },
      { path: "profile/orders", element: <OrderHistoryPage /> },
      { path: "profile/notifications", element: <NotificationsPage /> },
      { path: "profile/security", element: <PrivacySecurityPage /> },
      { path: "profile/help", element: <HelpCenterPage /> },
      { path: "profile/terms", element: <TermsOfServicePage /> },

      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "tracking/:id",
        element: (
          <ProtectedRoute>
            <OrderTrackingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
