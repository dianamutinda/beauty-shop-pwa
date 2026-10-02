
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'

import { AuthProvider, useRole } from './auth/AuthContext'
import { BasketProvider } from './features/lookup/BasketContext'

import Layout from './components/Layout'
import Login from './auth/Login'
import SetPin from './auth/SetPin'
import Landing from './auth/Landing'

// Worker
import Search from './features/lookup/Search'
import ProductDetails from './features/lookup/ProductDetails'
import SaleFlow from './features/lookup/SaleFlow'
import SalesToday from './features/lookup/SalesToday'
import EndOfDay from './features/lookup/EndOfDay'
import Account from './features/lookup/Account'

// Owner
import Products from './features/owner/Products'
import AddProduct from './features/owner/AddProduct'
import EditProduct from './features/owner/EditProduct'
import Categories from './features/owner/Categories'
import Stock from './features/owner/Stock'
import StockUpdate from './features/owner/StockUpdate'
import Count from './features/owner/Count'
import Dashboard from './features/owner/Dashboard'
import Sales from './features/owner/Sales'
import More from './features/owner/More'
import Settings from './features/owner/Settings'
import Activity from './features/owner/Activity'

// Owner → Workers
import Workers from './features/owner/workers/Workers'
import AddWorker from './features/owner/workers/AddWorker'
import WorkerProfile from './features/owner/workers/WorkerProfile'

// Super Admin
import SuperAdminLayout from './features/superAdmin/SuperAdminLayout'
import SuperAdminDashboard from './features/superAdmin/Dashboard'
import SuperAdminShops from './features/superAdmin/Shops'


function RequireAuth() {
  const { user, loading } = useRole()

  if (loading) {
    return null
  }

  return user
    ? <Outlet />
    : <Navigate to="/login" replace />
}


function OwnerOnly() {
  const { role, loading } = useRole()

  if (loading) {
    return null
  }

  return role === 'owner'
    ? <Outlet />
    : <Navigate to="/" replace />
  }


export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <BasketProvider>

          <Routes>

            {/* Public */}
            <Route
              path="/login"
              element={<Login />}
            />

            {/* Super Admin - UI testing for now */}
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

            {/* Authenticated Shop App */}
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>

                {/* Landing */}
                <Route
                  index
                  element={<Landing />}
                />

                {/* PIN setup */}
                <Route
                  path="set-pin"
                  element={<SetPin />}
                />

                {/* Worker / Shop Operations */}
                <Route
                  path="search"
                  element={<Search />}
                />

                <Route
                  path="product/:id"
                  element={<ProductDetails />}
                />

                <Route
                  path="sale"
                  element={<SaleFlow />}
                />

                <Route
                  path="sales"
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

                {/* Keep old URL working */}
                <Route
                  path="sales-today"
                  element={
                    <Navigate
                      to="/sales"
                      replace
                    />
                  }
                />

                {/* Owner */}
                <Route
                  path="owner"
                  element={<OwnerOnly />}
                >
                  <Route
                    index
                    element={<Dashboard />}
                  />

                  <Route
                    path="sales"
                    element={<Sales />}
                  />

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

                  <Route
                    path="categories"
                    element={<Categories />}
                  />

                  <Route
                    path="more"
                    element={<More />}
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

                  <Route
                    path="settings"
                    element={<Settings />}
                  />

                  <Route
                    path="activity"
                    element={<Activity />}
                  />
                </Route>

                {/* Unknown authenticated route */}
                <Route
                  path="*"
                  element={
                    <Navigate
                      to="/"
                      replace
                    />
                  }
                />

              </Route>
            </Route>

          </Routes>

        </BasketProvider>
      </HashRouter>
    </AuthProvider>
  )
}
