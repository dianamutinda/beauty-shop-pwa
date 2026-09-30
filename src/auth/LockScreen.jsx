// src/auth/LockScreen.jsx — updated
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyPin } from './pin'
import { useRole } from './AuthContext'

export function LockScreen({ userId, onUnlock }) {
  const navigate = useNavigate()
  const { signOut } = useRole()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleDigit = async (digit) => {
    const next = pin + digit
    setPin(next)

    if (next.length === 4) {
      const ok = await verifyPin(userId, next)
      if (ok) {
        onUnlock()
      } else {
        setError(true)
        setPin('')
      }
    }
  }

  async function handleForgotPin() {
    await signOut()
    navigate('/login', { state: { resetPin: true } })
  }

  return (
    <div className="lock-screen">
      <p>Enter your PIN</p>
      <div className="pin-dots">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < pin.length ? 'filled' : ''} />
        ))}
      </div>
      {error && <p className="pin-error">Wrong PIN, try again</p>}
      <div className="keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
          <button key={n} onClick={() => handleDigit(String(n))}>
            {n}
          </button>
        ))}
      </div>
      <button className="forgot-pin" onClick={handleForgotPin}>
        Forgot PIN?
      </button>
    </div>
  )
}