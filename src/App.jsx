import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { RoleProvider, useRole } from './RoleContext'
import Layout from './components/Layout'
import Placeholder from './components/Placeholder'
import Home from './features/lookup/Home'
import Search from './features/lookup/Search'
import ProductDetails from './features/lookup/ProductDetails'

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
            
            <Route path="owner" element={<OwnerOnly />}>
              <Route index element={<Placeholder title="Owner Dashboard" />} />
              <Route path="products" element={<Placeholder title="Products" />} />
              <Route path="stock" element={<Placeholder title="Stock Update" />} />
              <Route path="categories" element={<Placeholder title="Categories" />} />
              <Route path="settings" element={<Placeholder title="Settings" />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </RoleProvider>
  )
}