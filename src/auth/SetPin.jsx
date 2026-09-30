// src/auth/SetPin.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setPin } from './pin'
import { useRole } from './AuthContext'

export default function SetPin() {
  const navigate = useNavigate()
  const { user } = useRole()

  const [stage, setStage] = useState('enter') // 'enter' -> 'confirm'
  const [firstPin, setFirstPin] = useState('')
  const [pin, setPinInput] = useState('')
  const [error, setError] = useState('')

  async function handleDigit(digit) {
    const next = pin + digit
    setPinInput(next)

    if (next.length !== 4) return

    if (stage === 'enter') {
      setFirstPin(next)
      setPinInput('')
      setStage('confirm')
      return
    }

    // stage === 'confirm'
    if (next !== firstPin) {
      setError("PINs didn't match. Try again.")
      setFirstPin('')
      setPinInput('')
      setStage('enter')
      return
    }

    await setPin(user.id, next)
    navigate('/', { replace: true })
  }

  return (
    <div className="lock-screen">
      <p>{stage === 'enter' ? 'Choose a PIN' : 'Confirm your PIN'}</p>

      <div className="pin-dots">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < pin.length ? 'filled' : ''} />
        ))}
      </div>

      {error && <p className="pin-error">{error}</p>}

      <div className="keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
          <button key={n} onClick={() => handleDigit(String(n))}>
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}