import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderLookupPage from "./pages/OrderLookupPage";
import UploadProofPage from "./pages/UploadProofPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminLayout from "./components/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProductFormPage from "./pages/admin/AdminProductFormPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderManualPage from "./pages/admin/AdminOrderManualPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminPriceTiersPage from "./pages/admin/AdminPriceTiersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

import ScrollToTop from "./components/ScrollToTop";

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      {/* Public Routes with Navbar */}
      <Route
        path="/*"
        element={
          <div className="min-h-screen flex flex-col bg-[#9b9b9b]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/about"
                  element={
                    <div className="container-layout py-8">
                      <AboutPage />
                    </div>
                  }
                />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/success/:orderId"
                  element={
                    <ProtectedRoute>
                      <OrderSuccessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/lookup"
                  element={
                    <ProtectedRoute>
                      <div className="container-layout py-8">
                        <OrderLookupPage />
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload-proof"
                  element={
                    <ProtectedRoute>
                      <div className="container-layout py-8">
                        <UploadProofPage />
                      </div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        }
      />

      {/* Admin Routes with Layout */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/manual" element={<AdminOrderManualPage />} />
        <Route path="price-tiers" element={<AdminPriceTiersPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
