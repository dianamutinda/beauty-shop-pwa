import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { RoleProvider, useRole } from './RoleContext'
import { BasketProvider } from './features/lookup/BasketContext'

import Layout from './components/Layout'

import Home from './features/lookup/Home'
import Search from './features/lookup/Search'
import ProductDetails from './features/lookup/ProductDetails'
import SaleFlow from './features/lookup/SaleFlow'
import SalesToday from './features/lookup/SalesToday'
import EndOfDay from './features/lookup/EndOfDay'
import Account from './features/lookup/Account'

import Products from './features/owner/Products'
import AddProduct from './features/owner/AddProduct'
import EditProduct from './features/owner/EditProduct'
import Categories from './features/owner/Categories'
import Stock from './features/owner/Stock'
import StockUpdate from './features/owner/StockUpdate'
import Count from './features/owner/Count'
import Dashboard from './features/owner/Dashboard'
import Settings from './features/owner/Settings'

function OwnerOnly() {
  const { role } = useRole()

  return role === 'owner'
    ? <Outlet />
    : <Navigate to="/" replace />
}

export default function App() {
  return (
    <RoleProvider>
      <HashRouter>
        <BasketProvider>
          <Routes>
            <Route element={<Layout />}>

              {/* Worker */}
              <Route index element={<Home />} />

              <Route path="search" element={<Search />} />

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
                element={<Navigate to="/sales" replace />}
              />

              {/* Owner */}
              <Route path="owner" element={<OwnerOnly />}>
                <Route index element={<Dashboard />} />

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
                  path="settings"
                  element={<Settings />}
                />
              </Route>

              {/* Unknown route */}
              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />

            </Route>
          </Routes>
        </BasketProvider>
      </HashRouter>
    </RoleProvider>
  )
}