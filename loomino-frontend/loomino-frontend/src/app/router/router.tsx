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
import OnSalePage from "@/pages/OnSalePage";
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
import AdminTypes from "@/features/admin/pages/AdminTypes";
import AdminCustomers from "@/features/admin/pages/AdminCustomers";
import AdminProducts from "@/features/admin/pages/AdminProducts";
import AdminVariants from "@/features/admin/pages/AdminVariants";
import AdminReviews from "@/features/admin/pages/AdminReviews";
import AdminOrders from "@/features/admin/pages/AdminOrders";
import AdminCoupons from "@/features/admin/pages/AdminCoupons";
import AdminMails from "@/features/admin/pages/AdminMails";
import AdminNewsletters from "@/features/admin/pages/AdminNewsletters";
import AdminOfferBanners from "@/features/admin/pages/AdminOfferBanners";
import AdminSiteBanners from "@/features/admin/pages/AdminSiteBanners";
import AdminSettings from "@/features/admin/pages/AdminSettings";

import POSRoute from "@/features/pos/layout/POSRoute";
import POSLayout from "@/features/pos/layout/POSLayout";
import POSHomePage from "@/features/pos/pages/POSHomePage";
import POSUsersPage from "@/features/pos/pages/POSUsersPage";
import POSRolesPage from "@/features/pos/pages/POSRolesPage";
import POSCustomersPage from "@/features/pos/pages/POSCustomersPage";
import POSSuppliersPage from "@/features/pos/pages/POSSuppliersPage";
import POSCustomerGroupsPage from "@/features/pos/pages/POSCustomerGroupsPage";
import POSImportContactsPage from "@/features/pos/pages/POSImportContactsPage";
import POSUnitsPage from "@/features/pos/pages/POSUnitsPage";
import POSCategoriesPage from "@/features/pos/pages/POSCategoriesPage";
import POSBrandsPage from "@/features/pos/pages/POSBrandsPage";
import POSPrintLabelsPage from "@/features/pos/pages/POSPrintLabelsPage";
import POSPurchaseListPage from "@/features/pos/pages/POSPurchaseListPage";
import POSAddPurchasePage from "@/features/pos/pages/POSAddPurchasePage";
import POSPurchaseReturnListPage from "@/features/pos/pages/POSPurchaseReturnListPage";
import POSAllSalesPage from "@/features/pos/pages/POSAllSalesPage";
import POSAddSalePage from "@/features/pos/pages/POSAddSalePage";
import POSDraftsListPage from "@/features/pos/pages/POSDraftsListPage";
import POSAddDraftPage from "@/features/pos/pages/POSAddDraftPage";
import POSQuotationsListPage from "@/features/pos/pages/POSQuotationsListPage";
import POSAddQuotationPage from "@/features/pos/pages/POSAddQuotationPage";
import POSSellReturnListPage from "@/features/pos/pages/POSSellReturnListPage";
import POSAddSellReturnPage from "@/features/pos/pages/POSAddSellReturnPage";
import POSRegisterPage from "@/features/pos/pages/POSRegisterPage";
import POSOnlineSummaryPage from "@/features/pos/pages/POSOnlineSummaryPage";
import POSOnlineProductsPage from "@/features/pos/pages/POSOnlineProductsPage";
import POSOnlineSalesPage from "@/features/pos/pages/POSOnlineSalesPage";
import POSStockAdjustmentListPage from "@/features/pos/pages/POSStockAdjustmentListPage";
import POSAddStockAdjustmentPage from "@/features/pos/pages/POSAddStockAdjustmentPage";
import POSExpenseListPage from "@/features/pos/pages/POSExpenseListPage";
import POSAddExpensePage from "@/features/pos/pages/POSAddExpensePage";
import POSExpenseCategoriesPage from "@/features/pos/pages/POSExpenseCategoriesPage";
import POSPurchasePaymentReportPage from "@/features/pos/pages/POSPurchasePaymentReportPage";
import POSSellPaymentReportPage from "@/features/pos/pages/POSSellPaymentReportPage";
import POSProductPurchaseReportPage from "@/features/pos/pages/POSProductPurchaseReportPage";
import POSExpenseReportPage from "@/features/pos/pages/POSExpenseReportPage";
import POSStockReportPage from "@/features/pos/pages/POSStockReportPage";
import POSProductSaleReportPage from "@/features/pos/pages/POSProductSaleReportPage";
import POSTrendingProductsPage from "@/features/pos/pages/POSTrendingProductsPage";
import POSStockAdjustmentReportPage from "@/features/pos/pages/POSStockAdjustmentReportPage";
import POSBusinessSettingsPage from "@/features/pos/pages/POSBusinessSettingsPage";
import POSBusinessLocationsPage from "@/features/pos/pages/POSBusinessLocationsPage";
import POSPrefixSettingsPage from "@/features/pos/pages/POSPrefixSettingsPage";
import POSAddPurchaseReturnPage from "@/features/pos/pages/POSAddPurchaseReturnPage";
import POSProductListPage from "@/features/pos/pages/POSProductListPage";
import POSAddProductPage from "@/features/pos/pages/POSAddProductPage";
import POSEditProductPage from "@/features/pos/pages/POSEditProductPage";

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
        path: "on-sale",
        element: <OnSalePage />,
      },
      {
        // Old URL — redirect so existing bookmarks/links keep working.
        path: "modiweek",
        element: <Navigate to="/on-sale" replace />,
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
            path: "types",
            element: <AdminTypes />,
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
            path: "offer-banners",
            element: <AdminOfferBanners />,
          },
          {
            path: "site-banners",
            element: <AdminSiteBanners />,
          },
          {
            path: "settings",
            element: <AdminSettings />,
          },
          {
            path: "newsletters",
            element: <AdminNewsletters />,
          },
        ],
      },
    ],
  },
  // POS — sibling to the AdminRoute block above, not nested inside it.
  // e-commerce admin (is_staff) and POS access are independent even
  // though both live under /admin/* and share the same login session.
  {
    element: <POSRoute />,
    children: [
      {
        path: "/admin/pos",
        element: <POSLayout />,
        children: [
          { index: true, element: <POSHomePage /> },
          { path: "users", element: <POSUsersPage /> },
          { path: "roles", element: <POSRolesPage /> },
          { path: "contacts/customers", element: <POSCustomersPage /> },
          { path: "contacts/suppliers", element: <POSSuppliersPage /> },
          { path: "contacts/customer-groups", element: <POSCustomerGroupsPage /> },
          { path: "contacts/import", element: <POSImportContactsPage /> },
          { path: "products/units", element: <POSUnitsPage /> },
          { path: "products/categories", element: <POSCategoriesPage /> },
          { path: "products/brands", element: <POSBrandsPage /> },
          { path: "products/print-labels", element: <POSPrintLabelsPage /> },
          { path: "purchases/list", element: <POSPurchaseListPage /> },
          { path: "purchases/add", element: <POSAddPurchasePage /> },
          { path: "purchases/returns", element: <POSPurchaseReturnListPage /> },
          { path: "purchases/returns/add", element: <POSAddPurchaseReturnPage /> },
          { path: "sell/list", element: <POSAllSalesPage /> },
          { path: "sell/add", element: <POSAddSalePage /> },
          { path: "sell/drafts", element: <POSDraftsListPage /> },
          { path: "sell/drafts/add", element: <POSAddDraftPage /> },
          { path: "sell/quotations", element: <POSQuotationsListPage /> },
          { path: "sell/quotations/add", element: <POSAddQuotationPage /> },
          { path: "sell/returns", element: <POSSellReturnListPage /> },
          { path: "sell/returns/add", element: <POSAddSellReturnPage /> },
          { path: "sell/register", element: <POSRegisterPage /> },
          { path: "online/summary", element: <POSOnlineSummaryPage /> },
          { path: "online/products", element: <POSOnlineProductsPage /> },
          { path: "online/sales", element: <POSOnlineSalesPage /> },
          { path: "stock-adjustments/list", element: <POSStockAdjustmentListPage /> },
          { path: "stock-adjustments/add", element: <POSAddStockAdjustmentPage /> },
          { path: "expenses/list", element: <POSExpenseListPage /> },
          { path: "expenses/add", element: <POSAddExpensePage /> },
          { path: "expenses/categories", element: <POSExpenseCategoriesPage /> },
          { path: "reports/purchase-payments", element: <POSPurchasePaymentReportPage /> },
          { path: "reports/sale-payments", element: <POSSellPaymentReportPage /> },
          { path: "reports/product-purchases", element: <POSProductPurchaseReportPage /> },
          { path: "reports/expenses", element: <POSExpenseReportPage /> },
          { path: "reports/stock", element: <POSStockReportPage /> },
          { path: "reports/product-sales", element: <POSProductSaleReportPage /> },
          { path: "reports/trending-products", element: <POSTrendingProductsPage /> },
          { path: "reports/stock-adjustments", element: <POSStockAdjustmentReportPage /> },
          { path: "settings/business", element: <POSBusinessSettingsPage /> },
          { path: "settings/locations", element: <POSBusinessLocationsPage /> },
          { path: "settings/prefixes", element: <POSPrefixSettingsPage /> },
          { path: "products/list", element: <POSProductListPage /> },
          { path: "products/add", element: <POSAddProductPage /> },
          { path: "products/:id/edit", element: <POSEditProductPage /> },
        ],
      },
    ],
  },
]);
