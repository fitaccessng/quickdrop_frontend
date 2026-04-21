import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { AdminProtectedRoute } from "../components/layout/AdminProtectedRoute";
import { RiderProtectedRoute } from "../components/layout/RiderProtectedRoute";
import { VendorProtectedRoute } from "../components/layout/VendorProtectedRoute";
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
import { RiderLoginPage } from "../pages/RiderLoginPage";
import { RiderSignupPage } from "../pages/RiderSignupPage";
import { RiderForgotPasswordPage } from "../pages/RiderForgotPasswordPage";
import { RiderDashboardPage } from "../pages/RiderDashboardPage";
import { RiderOrderManagementPage } from "../pages/RiderOrderManagementPage";
import { RiderOrderRequestsPage } from "../pages/RiderOrderRequestsPage";
import { RiderWalletPage } from "../pages/RiderWalletPage";
import { RiderNavigatePage } from "../pages/RiderNavigatePage";
import { RiderProfilePage } from "../pages/RiderProfilePage";
import { RiderAnalyticsPage } from "../pages/RiderAnalyticsPage";
import { AdminLoginPage } from "../pages/AdminLoginPage";
import { AdminSignupPage } from "../pages/AdminSignupPage";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";
import { AdminCategoriesPage } from "../pages/AdminCategoriesPage";
import { AdminDeliveryPricingPage } from "../pages/AdminDeliveryPricingPage";
import { AdminVendorsPage } from "../pages/AdminVendorsPage";
import { AdminVendorAnalyticsPage } from "../pages/AdminVendorAnalyticsPage";
import { AdminOrdersPage } from "../pages/AdminOrdersPage";
import { AdminUsersPage } from "../pages/AdminUsersPage";
import { AdminUserDetailPage } from "../pages/AdminUserDetailPage";
import { AdminRidersPage } from "../pages/AdminRidersPage";
import { AdminProfilePage } from "../pages/AdminProfilePage";
import { AdminTrackRiderPage } from "../pages/AdminTrackRiderPage";
import { ProfilePage } from "../pages/ProfilePage";
import { PersonalInformationPage } from "../pages/PersonalInformationPage";
import { PaymentMethodsPage } from "../pages/PaymentMethodsPage";
import { OrderHistoryPage } from "../pages/OrderHistoryPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { PrivacySecurityPage } from "../pages/PrivacySecurityPage";
import { HelpCenterPage } from "../pages/HelpCenterPage";
import { TermsOfServicePage } from "../pages/TermsOfServicePage";
import { VendorDashboard } from "../pages/VendorDashboard";
import { VendorUploadProductPage } from "../pages/VendorUploadProductPage";
import { VendorOrdersPage } from "../pages/VendorOrdersPage";
import { VendorAnalyticsPage } from "../pages/VendorAnalyticsPage";
import { VendorProfilePage } from "../pages/VendorProfilePage";
import { CategoryDetailPage } from "../pages/CategoryDetailPage";
import { AppErrorPage } from "../pages/AppErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <AppErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "marketplace", element: <HomePage /> },
      { path: "vendor/:id", element: <VendorPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "explore", element: <ExplorePage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "category/:categorySlug", element: <CategoryDetailPage /> },
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
      {
        path: "vendor/dashboard",
        element: (
          <VendorProtectedRoute>
            <VendorDashboard />
          </VendorProtectedRoute>
        ),
      },
      {
        path: "vendor/upload-product",
        element: (
          <VendorProtectedRoute>
            <VendorUploadProductPage />
          </VendorProtectedRoute>
        ),
      },
      {
        path: "vendor/orders",
        element: (
          <VendorProtectedRoute>
            <VendorOrdersPage />
          </VendorProtectedRoute>
        ),
      },
      {
        path: "vendor/analytics",
        element: (
          <VendorProtectedRoute>
            <VendorAnalyticsPage />
          </VendorProtectedRoute>
        ),
      },
      {
        path: "vendor/profile",
        element: (
          <VendorProtectedRoute>
            <VendorProfilePage />
          </VendorProtectedRoute>
        ),
      },
      { path: "rider/signup", element: <RiderSignupPage /> },
      { path: "rider/login", element: <RiderLoginPage /> },
      { path: "rider/forgot-password", element: <RiderForgotPasswordPage /> },
      { path: "admin/signup", element: <AdminSignupPage /> },
      { path: "admin/login", element: <AdminLoginPage /> },
      { path: "rider/onboarding", element: <RiderOnboarding /> },
      {
        path: "admin/dashboard",
        element: (
          <AdminProtectedRoute>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/categories",
        element: (
          <AdminProtectedRoute>
            <AdminCategoriesPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/delivery-pricing",
        element: (
          <AdminProtectedRoute>
            <AdminDeliveryPricingPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/vendors",
        element: (
          <AdminProtectedRoute>
            <AdminVendorsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/vendors/:vendorId/analytics",
        element: (
          <AdminProtectedRoute>
            <AdminVendorAnalyticsPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/orders",
        element: (
          <AdminProtectedRoute>
            <AdminOrdersPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/orders/history",
        element: (
          <AdminProtectedRoute>
            <AdminOrdersPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/orders/:orderId/track",
        element: (
          <AdminProtectedRoute>
            <AdminTrackRiderPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <AdminProtectedRoute>
            <AdminUsersPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/users/:userId",
        element: (
          <AdminProtectedRoute>
            <AdminUserDetailPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/riders",
        element: (
          <AdminProtectedRoute>
            <AdminRidersPage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/profile",
        element: (
          <AdminProtectedRoute>
            <AdminProfilePage />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "rider/dashboard",
        element: (
          <RiderProtectedRoute>
            <RiderDashboardPage />
          </RiderProtectedRoute>
        ),
      },
      {
        path: "rider/orders",
        element: (
          <RiderProtectedRoute>
            <RiderOrderManagementPage />
          </RiderProtectedRoute>
        ),
      },
      {
        path: "rider/order-requests",
        element: (
          <RiderProtectedRoute>
            <RiderOrderRequestsPage />
          </RiderProtectedRoute>
        ),
      },
      {
        path: "rider/wallet",
        element: (
          <RiderProtectedRoute>
            <RiderWalletPage />
          </RiderProtectedRoute>
        ),
      },
      {
        path: "rider/navigate/:orderId",
        element: (
          <RiderProtectedRoute>
            <RiderNavigatePage />
          </RiderProtectedRoute>
        ),
      },
      {
        path: "rider/profile",
        element: (
          <RiderProtectedRoute>
            <RiderProfilePage />
          </RiderProtectedRoute>
        ),
      },
      {
        path: "rider/analytics",
        element: (
          <RiderProtectedRoute>
            <RiderAnalyticsPage />
          </RiderProtectedRoute>
        ),
      },
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
