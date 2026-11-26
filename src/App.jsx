
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'

import { AuthProvider, useRole } from './context/AuthContext'
import { BasketProvider } from './context/BasketContext'
import { ThemeProvider } from './context/ThemeContext'

// Layouts
import AppLayout from './features/sales/components/layout/AppLayout'
import SuperAdminLayout from './pages/superAdmin/SuperAdminLayout'

// Authentication
import Login from './auth/Login'
import SetPin from './auth/SetPin'
import Landing from './auth/Landing'

// Lookup / Worker pages
import Search from './pages/lookup/Search'
import ProductDetails from './pages/lookup/ProductDetails'
import SalesToday from './pages/lookup/SalesToday'
import EndOfDay from './pages/lookup/EndOfDay'
import Account from './pages/lookup/Account'

// Shared sales pages
import SaleFlow from './features/sales/pages/SaleFlow'
import SalesHistory from './features/sales/pages/SalesHistory'
import SalesDetails from './features/sales/pages/SalesDetails'
import CreditCustomers from './features/sales/pages/CreditCustomers'
import CollectPayment from './features/sales/pages/CollectPayment'

// Owner pages
import Products from './pages/owner/Products'
import AddProduct from './pages/owner/AddProduct'
import EditProduct from './pages/owner/EditProduct'
import Categories from './pages/owner/Categories'
import Stock from './pages/owner/Stock'
import StockUpdate from './pages/owner/StockUpdate'
import Count from './pages/owner/Count'
import Dashboard from './pages/owner/Dashboard'
import Sales from './pages/owner/Sales'
import SalesSummary from './pages/owner/SalesSummary'
import More from './pages/owner/More'
import Settings from './pages/owner/Settings'
import Activity from './pages/owner/Activity'

// Owner workers
import Workers from './pages/owner/workers/Workers'
import AddWorker from './pages/owner/workers/AddWorker'
import WorkerProfile from './pages/owner/workers/WorkerProfile'

// Super Admin pages
import SuperAdminDashboard from './pages/superAdmin/Dashboard'
import SuperAdminShops from './pages/superAdmin/Shops'


// Authentication guard
function RequireAuth() {
  const { user, loading } = useRole()

  if (loading) return null

  return user
    ? <Outlet />
    : <Navigate to="/login" replace />
}


// Owner role guard
function OwnerOnly() {
  const { role, loading } = useRole()

  if (loading) return null

  return role === 'owner'
    ? <Outlet />
    : <Navigate to="/" replace />
}


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <BasketProvider>
            <Routes>

              {/* Public */}
              <Route
                path="/login"
                element={<Login />}
              />

              {/* Super Admin */}
              <Route element={<SuperAdminLayout />}>
                <Route
                  path="/super-admin"
                  element={<SuperAdminDashboard />}
                />

                <Route
                  path="/super-admin/shops"
                  element={<SuperAdminShops />}
                />
              </Route>

              {/* Authenticated application */}
              <Route element={<RequireAuth />}>

                {/* Worker application */}
                <Route element={<AppLayout />}>
                  <Route
                    index
                    element={<Landing />}
                  />

                  <Route
                    path="set-pin"
                    element={<SetPin />}
                  />

                  <Route
                    path="search"
                    element={<Search />}
                  />

                  <Route
                    path="product/:id"
                    element={<ProductDetails />}
                  />

                  {/* Shared sales */}
                  <Route
                    path="sale"
                    element={<SaleFlow />}
                  />

                  <Route
                    path="sales"
                    element={<SalesHistory />}
                  />

                  <Route
                    path="sales/:saleId"
                    element={<SalesDetails />}
                  />

                  <Route
                    path="credit-customers"
                    element={<CreditCustomers />}
                  />

                  <Route
                    path="sales/:saleId/collect-payment"
                    element={<CollectPayment />}
                  />

                  <Route
                    path="sales-today"
                    element={<SalesToday />}
                  />

                  <Route
                    path="end-of-day"
                    element={<EndOfDay />}
                  />

                  <Route
                    path="account"
                    element={<Account />}
                  />
                </Route>

                {/* Owner application */}
                <Route
                  path="owner"
                  element={<OwnerOnly />}
                >
                  <Route element={<AppLayout />}>
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />

                    <Route
                      path="dashboard"
                      element={<Dashboard />}
                    />

                    {/* Shared sales */}
                    <Route
                      path="sale"
                      element={<SaleFlow />}
                    />

                    <Route
                      path="sales"
                      element={<SalesHistory />}
                    />

                    <Route
                      path="sales/:saleId"
                      element={<SalesDetails />}
                    />

                    <Route
                      path="credit-customers"
                      element={<CreditCustomers />}
                    />

                    <Route
                      path="sales/:saleId/collect-payment"
                      element={<CollectPayment />}
                    />

                    <Route
                      path="sales-summary"
                      element={<SalesSummary />}
                    />

                    {/* Products */}
                    <Route
                      path="products"
                      element={<Products />}
                    />

                    <Route
                      path="products/new"
                      element={<AddProduct />}
                    />

                    <Route
                      path="products/:id/edit"
                      element={<EditProduct />}
                    />

                    <Route
                      path="categories"
                      element={<Categories />}
                    />

                    {/* Stock */}
                    <Route
                      path="stock"
                      element={<Stock />}
                    />

                    <Route
                      path="stock/:id"
                      element={<StockUpdate />}
                    />

                    <Route
                      path="count"
                      element={<Count />}
                    />

                    {/* Workers */}
                    <Route
                      path="workers"
                      element={<Workers />}
                    />

                    <Route
                      path="workers/:id"
                      element={<WorkerProfile />}
                    />

                    <Route
                      path="workers/new"
                      element={<AddWorker />}
                    />

                    {/* Other */}
                    <Route
                      path="more"
                      element={<More />}
                    />

                    <Route
                      path="settings"
                      element={<Settings />}
                    />

                    <Route
                      path="activity"
                      element={<Activity />}
                    />
                  </Route>
                </Route>

                {/* Unknown authenticated route */}
                <Route
                  path="*"
                  element={<Navigate to="/" replace />}
                />

              </Route>
            </Routes>
          </BasketProvider>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
