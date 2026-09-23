import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { RoleProvider, useRole } from './RoleContext'
import Layout from './components/Layout'
import Home from './features/lookup/Home'
import Search from './features/lookup/Search'
import ProductDetails from './features/lookup/ProductDetails'
import Products from './features/owner/Products'
import AddProduct from './features/owner/AddProduct'
import EditProduct from './features/owner/EditProduct'
import Categories from './features/owner/Categories'
import Stock from './features/owner/Stock'
import StockUpdate from './features/owner/StockUpdate'
import Count from './features/owner/Count'
import Dashboard from './features/owner/Dashboard'
import Settings from './features/owner/Settings'
import SaleFlow from './features/lookup/SaleFlow'

function OwnerOnly() {
  const { role } = useRole()
  return role === 'owner' ? <Outlet /> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <RoleProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="sale" element={<SaleFlow />} />
            
            <Route path="owner" element={<OwnerOnly />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<AddProduct />} />
              <Route path="products/:id/edit" element={<EditProduct />} />
              <Route path="stock" element={<Stock />} />
              <Route path="stock/:id" element={<StockUpdate />} />
              <Route path="count" element={<Count />} />
              <Route path="categories" element={<Categories />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </RoleProvider>
  )
}