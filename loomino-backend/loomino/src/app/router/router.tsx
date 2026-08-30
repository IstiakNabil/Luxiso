import { createBrowserRouter, Navigate } from "react-router-dom";

import RootLayout from "@/components/layout/RootLayout";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import GuestRoute from "@/features/auth/components/GuestRoute";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductDetailsPage from "@/pages/ProductDetailsPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import AccountPage from "@/pages/AccountPage";
import WishlistPage from "@/pages/WishlistPage";
import FaqPage from "@/pages/FaqPage";
import ContactPage from "@/pages/ContactPage";
import SustainabilityPage from "@/pages/SustainabilityPage";
import BestSellersPage from "@/pages/BestSellersPage";
import PlusSizePage from "@/pages/PlusSizePage";
import ModiweekPage from "@/pages/ModiweekPage";
import ProfileTab from "@/features/profile/components/ProfileTab";
import PasswordTab from "@/features/profile/components/PasswordTab";
import AddressesTab from "@/features/profile/components/AddressesTab";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import VerifyOTPPage from "@/pages/VerifyOTPPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import NotFoundPage from "@/pages/NotFoundPage";

import AdminRoute from "@/features/admin/layout/AdminRoute";
import AdminGuestRoute from "@/features/admin/layout/AdminGuestRoute";
import AdminLogin from "@/features/admin/pages/AdminLogin";
import AdminForgotPassword from "@/features/admin/pages/AdminForgotPassword";
import AdminRegister from "@/features/admin/pages/AdminRegister";
import AdminLayout from "@/features/admin/layout/AdminLayout";
import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import AdminColors from "@/features/admin/pages/AdminColors";
import AdminSizes from "@/features/admin/pages/AdminSizes";
import AdminCategories from "@/features/admin/pages/AdminCategories";
import AdminBrands from "@/features/admin/pages/AdminBrands";
import AdminCustomers from "@/features/admin/pages/AdminCustomers";
import AdminProducts from "@/features/admin/pages/AdminProducts";
import AdminVariants from "@/features/admin/pages/AdminVariants";
import AdminReviews from "@/features/admin/pages/AdminReviews";
import AdminOrders from "@/features/admin/pages/AdminOrders";
import AdminCoupons from "@/features/admin/pages/AdminCoupons";
import AdminMails from "@/features/admin/pages/AdminMails";
import AdminNewsletters from "@/features/admin/pages/AdminNewsletters";
import AdminHeroSections from "@/features/admin/pages/AdminHeroSections";
import AdminPages from "@/features/admin/pages/AdminPages";
import AdminOfferBanners from "@/features/admin/pages/AdminOfferBanners";
import AdminSiteBanners from "@/features/admin/pages/AdminSiteBanners";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Public routes
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "shop",
        element: <ShopPage />,
      },
      {
        path: "faqs",
        element: <FaqPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "sustainability",
        element: <SustainabilityPage />,
      },
      {
        path: "best-sellers",
        element: <BestSellersPage />,
      },
      {
        path: "plus-size",
        element: <PlusSizePage />,
      },
      {
        path: "modiweek",
        element: <ModiweekPage />,
      },
      {
        path: "products/:slug",
        element: <ProductDetailsPage />,
      },

      // Guest-only routes
      {
        element: <GuestRoute />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "register",
            element: <RegisterPage />,
          },
          {
            path: "verify-email",
            element: <VerifyOTPPage />,
          },
          {
            path: "forgot-password",
            element: <ForgotPasswordPage />,
          },
          {
            path: "reset-password",
            element: <ResetPasswordPage />,
          },
        ],
      },

      // Catch-all
      {
        path: "*",
        element: <NotFoundPage />,
      },

      // Authenticated-only routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "cart",
            element: <CartPage />,
          },
          {
            path: "checkout",
            element: <CheckoutPage />,
          },
          {
            path: "orders",
            element: <OrdersPage />,
          },
          {
            path: "orders/:orderNumber",
            element: <OrderDetailPage />,
          },
          {
            path: "wishlist",
            element: <WishlistPage />,
          },
          {
            path: "account",
            element: <AccountPage />,
            children: [
              {
                index: true,
                element: (
                  <Navigate to="/account/profile" replace />
                ),
              },
              {
                path: "profile",
                element: <ProfileTab />,
              },
              {
                path: "password",
                element: <PasswordTab />,
              },
              {
                path: "addresses",
                element: <AddressesTab />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <AdminGuestRoute />,
    children: [
      { path: "/admin/login", element: <AdminLogin /> },
      {
        path: "/admin/forgot-password",
        element: <AdminForgotPassword />,
      },
      {
        path: "/admin/register",
        element: <AdminRegister />,
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          {
            path: "products",
            element: <AdminProducts />,
          },
          {
            path: "categories",
            element: <AdminCategories />,
          },
          {
            path: "brands",
            element: <AdminBrands />,
          },
          {
            path: "colors",
            element: <AdminColors />,
          },
          {
            path: "sizes",
            element: <AdminSizes />,
          },
          {
            path: "variants",
            element: <AdminVariants />,
          },
          {
            path: "reviews",
            element: <AdminReviews />,
          },
          {
            path: "orders",
            element: <AdminOrders />,
          },
          {
            path: "coupons",
            element: <AdminCoupons />,
          },
          {
            path: "customers",
            element: <AdminCustomers />,
          },
          {
            path: "mails",
            element: <AdminMails />,
          },
          {
            path: "hero-sections",
            element: <AdminHeroSections />,
          },
          {
            path: "pages",
            element: <AdminPages />,
          },
          {
            path: "offer-banners",
            element: <AdminOfferBanners />,
          },
          {
            path: "site-banners",
            element: <AdminSiteBanners />,
          },
          {
            path: "newsletters",
            element: <AdminNewsletters />,
          },
        ],
      },
    ],
  },
]);
