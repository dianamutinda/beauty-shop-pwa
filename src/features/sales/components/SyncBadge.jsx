
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { subscribeSyncStatus, syncAll } from '../../../db/sync';
import { countUnsynced } from '../../../db/accountSwitch';

export default function SyncBadge() {
  const [status, setStatus] = useState({});
  const [pending, setPending] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    return subscribeSyncStatus(setStatus);
  }, []);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);

    window.addEventListener('online', on);
    window.addEventListener('offline', off);

    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const tick = async () => {
      const n = await countUnsynced();

      if (alive) {
        setPending(n);
      }
    };

    tick();

    const id = setInterval(tick, 3000);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  let label = 'Synced';
  let iconColor = 'text-status-success';

  if (!online) {
    label = pending > 0
      ? `Offline, ${pending} pending`
      : 'Offline';
    iconColor = 'text-status-warning';
  } else if (status.syncing) {
    label = 'Syncing';
    iconColor = 'text-interactive-primary';
  } else if (status.lastError) {
    label = pending > 0
      ? `Sync error, ${pending} pending`
      : 'Sync error';
    iconColor = 'text-status-error';
  } else if (pending > 0) {
    label = `${pending} waiting to sync`;
    iconColor = 'text-status-warning';
  }

  return (
    <button
      type="button"
      onClick={() => syncAll()}
      title={`${label}. ${status.lastError || 'Click to sync now'}`}
      aria-label={`${label}. Click to sync now`}
      className="
        relative flex h-10 w-10 shrink-0
        items-center justify-center rounded-lg
        text-text-secondary transition-colors
        hover:bg-surface hover:text-text-primary
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-interactive-primary
      "
    >
      <RefreshCw
        size={19}
        className={`
          ${iconColor}
          ${status.syncing ? 'animate-spin' : ''}
        `}
      />

      {pending > 0 && (
        <span className="
          absolute right-1 top-1
          flex h-4 min-w-4 items-center
          justify-center rounded-full
          bg-status-warning px-1
          text-[10px] font-semibold text-white
        ">
          {pending > 9 ? '9+' : pending}
        </span>
      )}
    </button>
  );
}
