import { useEffect, useState } from 'react'
import { subscribeSyncStatus, syncAll } from '../db/sync'
import { countUnsynced } from '../db/accountSwitch'

export default function SyncBadge() {
  const [status, setStatus] = useState({})
  const [pending, setPending] = useState(0)
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    return subscribeSyncStatus(setStatus)
  }, [])

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)

    window.addEventListener('online', on)
    window.addEventListener('offline', off)

    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  useEffect(() => {
    let alive = true

    const tick = async () => {
      const n = await countUnsynced()

      if (alive) {
        setPending(n)
      }
    }

    tick()

    const id = setInterval(tick, 3000)

    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  let label = 'Synced'

  if (!online) {
    label = pending > 0
      ? `Offline · ${pending}`
      : 'Offline'
  } else if (status.syncing) {
    label = 'Syncing…'
  } else if (status.lastError) {
    label = pending > 0
      ? `Sync error · ${pending}`
      : 'Sync error'
  } else if (pending > 0) {
    label = `${pending} waiting`
  }

  return (
    <button
      type="button"
      onClick={() => syncAll()}
      title={status.lastError || 'Tap to sync now'}
      className="shrink-0 rounded-full bg-pink-100 px-2.5 py-1 text-[10px] font-medium text-pink-700 transition active:scale-95"
    >
      {label}
    </button>
  )
}