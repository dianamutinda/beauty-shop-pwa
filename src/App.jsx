
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

import { AuthProvider, useRole } from './auth/AuthContext';
import { BasketProvider } from './features/lookup/BasketContext';
import { ThemeProvider } from './context/ThemeContext';

// Existing layouts
import Layout from './components/Layout';
import AppLayout from './components/layout/AppLayout';

// Authentication
import Login from './auth/Login';
import SetPin from './auth/SetPin';
import Landing from './auth/Landing';

// Worker
import Search from './features/lookup/Search';
import ProductDetails from './features/lookup/ProductDetails';
import SaleFlow from './features/lookup/SaleFlow';
import SalesToday from './features/lookup/SalesToday';
import EndOfDay from './features/lookup/EndOfDay';
import Account from './features/lookup/Account';

// Owner
import Products from './features/owner/Products';
import AddProduct from './features/owner/AddProduct';
import EditProduct from './features/owner/EditProduct';
import Categories from './features/owner/Categories';
import Stock from './features/owner/Stock';
import StockUpdate from './features/owner/StockUpdate';
import Count from './features/owner/Count';
import Dashboard from './features/owner/Dashboard';
import Sales from './features/owner/Sales';
import SalesSummary from './features/owner/SalesSummary';
import More from './features/owner/More';
import Settings from './features/owner/Settings';
import Activity from './features/owner/Activity';

// Owner → Workers
import Workers from './features/owner/workers/Workers';
import AddWorker from './features/owner/workers/AddWorker';
import WorkerProfile from './features/owner/workers/WorkerProfile';

// Super Admin
import SuperAdminLayout from './features/superAdmin/SuperAdminLayout';
import SuperAdminDashboard from './features/superAdmin/Dashboard';
import SuperAdminShops from './features/superAdmin/Shops';


// Authentication guard
function RequireAuth() {
  const { user, loading } = useRole();

  if (loading) return null;

  return user
    ? <Outlet />
    : <Navigate to="/login" replace />;
}


// Owner role guard
function OwnerOnly() {
  const { role, loading } = useRole();

  if (loading) return null;

  return role === 'owner'
    ? <Outlet />
    : <Navigate to="/" replace />;
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

                {/* Worker application - existing layout */}
                <Route element={<Layout />}>

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

                  {/* Old URL compatibility */}
                  <Route
                    path="sales-today"
                    element={<Navigate to="/sales" replace />}
                  />

                </Route>


                {/* Owner application - new layout */}
                <Route
                  path="owner"
                  element={<OwnerOnly />}
                >
                  <Route element={<AppLayout />}>

                    {/* Dashboard */}
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />

                    <Route
                      path="dashboard"
                      element={<Dashboard />}
                    />

                    {/* Sales */}
                    <Route
                      path="sales"
                      element={<Sales />}
                    />

                    <Route
                      path="sales-summary"
                      element={<SalesSummary />}
                    />

                    <Route
                      path="end-of-day"
                      element={
                        <Navigate
                          to="/owner/sales-summary"
                          replace
                        />
                      }
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
  );
}
