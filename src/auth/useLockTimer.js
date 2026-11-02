import { useEffect, useRef, useState, useCallback } from 'react'

const LOCK_AFTER_MS = 1 * 60 * 1000 // 1 minute (change as needed)

export function useLockTimer() {
  const [locked, setLocked] = useState(false)
  const timerRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now()
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setLocked(true), LOCK_AFTER_MS)
  }, [])

  useEffect(() => {
    const events = ['touchstart', 'mousedown', 'keydown', 'scroll']
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))

    // When the app returns to the foreground, check how long we were away
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        if (Date.now() - lastActivityRef.current >= LOCK_AFTER_MS) {
          setLocked(true)
        }
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    resetTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      document.removeEventListener('visibilitychange', onVisible)
      clearTimeout(timerRef.current)
    }
  }, [resetTimer])

  const unlock = () => {
    setLocked(false)
    resetTimer() // restart the countdown after unlocking
  }

  return { locked, unlock }
}