
import { useEffect, useRef, useState } from 'react'

const LOCK_AFTER_MS = 1 * 60 * 1000 // 5 minutes

export function useLockTimer() {
  const [locked, setLocked] = useState(false)
  const timerRef = useRef(null)

  const resetTimer = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setLocked(true), LOCK_AFTER_MS)
  }

  useEffect(() => {
    const events = ['touchstart', 'mousedown', 'keydown', 'scroll']
    events.forEach((e) => window.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      clearTimeout(timerRef.current)
    }
  }, [])

  const unlock = () => setLocked(false)

  return { locked, unlock }
}