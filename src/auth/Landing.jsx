// src/auth/Landing.jsx
import { Navigate } from 'react-router-dom'
import { useRole } from './AuthContext'
import Home from '../features/lookup/Home'

export default function Landing() {
  const { role, loading } = useRole()

  if (loading) return null

  return role === 'owner'
    ? <Navigate to="/owner" replace />
    : <Home />
}