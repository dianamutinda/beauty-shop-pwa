import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getShop, renameShop } from '../../db/shop'
import {
  getLastBackupAt,
  getLowStockDefault,
  hasPin,
  removePin,
  setLowStockDefault,
  setPin,
} from '../../db/settings'
import { createBackup, createProductsCsv, restoreBackup } from '../../db/backup'
import { downloadFile } from '../../lib/download'
import { formatUpdated } from '../../lib/format'

const inputClass =
  'w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400'
const buttonClass = 'rounded-xl bg-pink-600 px-4 py-2 text-sm text-white disabled:opacity-50'
const outlineClass = 'rounded-xl border border-pink-300 px-4 py-2 text-sm text-pink-700'

function useAction() {
  const [state, setState] = useState({ type: '', text: '' })

  async function run(action, successText) {
    setState({ type: '', text: '' })
    try {
      await action()
      if (successText) setState({ type: 'ok', text: successText })
      return true
    } catch (err) {
      setState({ type: 'error', text: err.message || 'Something went wrong.' })
      return false
    }
  }

  return [state, run]
}

function Status({ state }) {
  if (!state.text) return null
  const color = state.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
  return <p className={`rounded-xl px-4 py-3 text-sm ${color}`}>{state.text}</p>
}

function Section({ title, children }) {
  return (
    <section className="space-y-3 rounded-xl border border-pink-100 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      {children}
    </section>
  )
}

function ShopSection() {
  const shop = useLiveQuery(() => getShop(), [])
  const [name, setName] = useState(null)
  const [state, run] = useAction()

  if (!shop) return null

  return (
    <Section title="Shop name">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          run(() => renameShop(name ?? shop.name), 'Saved.')
        }}
        className="flex gap-2"
      >
        <input className={inputClass} value={name ?? shop.name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className={buttonClass}>Save</button>
      </form>
      <Status state={state} />
    </Section>
  )
}

function LowStockSection() {
  const current = useLiveQuery(() => getLowStockDefault(), [])
  const [value, setValue] = useState(null)
  const [state, run] = useAction()

  if (current === undefined) return null

  return (
    <Section title="Low stock warning">
      <p className="text-xs text-gray-500">
        Products without their own level are flagged as low at or below this number.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          run(() => setLowStockDefault(value ?? String(current)), 'Saved.')
        }}
        className="flex gap-2"
      >
        <input
          className={inputClass}
          type="number"
          inputMode="numeric"
          min="0"
          value={value ?? String(current)}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className={buttonClass}>Save</button>
      </form>
      <Status state={state} />
    </Section>
  )
}

function PinSection() {
  const pinSet = useLiveQuery(() => hasPin(), [])
  const [current, setCurrent] = useState('')
  const [pin, setPinValue] = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, run] = useAction()

  if (pinSet === undefined) return null

  function clearFields() {
    setCurrent('')
    setPinValue('')
    setConfirm('')
  }

  function requireCurrent() {
    if (pinSet && !current) throw new Error('Enter your current PIN first.')
  }

  async function handleSave(e) {
    e.preventDefault()
    const ok = await run(async () => {
      requireCurrent()
      if (pin !== confirm) throw new Error('The two PINs do not match.')
      await setPin(pin, current)
    }, pinSet ? 'PIN changed.' : 'PIN saved.')
    if (ok) clearFields()
  }

  async function handleRemove() {
    if (!window.confirm('Remove the PIN? Anyone will be able to switch to Owner.')) return
    const ok = await run(async () => {
      requireCurrent()
      await removePin(current)
    }, 'PIN removed.')
    if (ok) clearFields()
  }

  return (
    <Section title="Owner PIN">
      <p className={`text-xs ${pinSet ? 'text-green-700' : 'text-amber-600'}`}>
        {pinSet
          ? 'A PIN is set. Switching to Owner asks for it.'
          : 'No PIN set. Anyone can switch to Owner from the header.'}
      </p>

      <form onSubmit={handleSave} className="space-y-2">
        {pinSet && (
          <>
            <p className="text-xs text-gray-500">Enter your current PIN to change or remove it.</p>
            <input
              className={inputClass}
              type="password"
              inputMode="numeric"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Current PIN"
            />
          </>
        )}
        <input
          className={inputClass}
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPinValue(e.target.value)}
          placeholder={pinSet ? 'New PIN (4 to 6 digits)' : 'PIN (4 to 6 digits)'}
        />
        <input
          className={inputClass}
          type="password"
          inputMode="numeric"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm PIN"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={!pin} className={buttonClass}>
            {pinSet ? 'Change PIN' : 'Set PIN'}
          </button>
          {pinSet && (
            <button type="button" onClick={handleRemove} className={outlineClass}>
              Remove PIN
            </button>
          )}
        </div>
      </form>
      <Status state={state} />
    </Section>
  )
}

function BackupSection() {
  const lastBackup = useLiveQuery(() => getLastBackupAt(), [])
  const [state, run] = useAction()

  function stamp() {
    return new Date().toISOString().slice(0, 10)
  }

  function handleBackup() {
    run(async () => {
      const backup = await createBackup()
      downloadFile(`shop-backup-${stamp()}.json`, JSON.stringify(backup), 'application/json')
    }, 'Backup downloaded. Keep the file somewhere safe, like your email or Google Drive.')
  }

  function handleCsv() {
    run(async () => {
      const csv = await createProductsCsv()
      downloadFile(`products-${stamp()}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8')
    }, 'Products exported.')
  }

  async function handleRestore(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (!window.confirm('Restoring replaces ALL data on this device with the file. Continue?')) return

    const ok = await run(async () => {
      const backup = JSON.parse(await file.text())
      await restoreBackup(backup)
    })

    if (ok) {
      window.alert('Restore complete. The app will now reload.')
      window.location.reload()
    }
  }

  return (
    <Section title="Backup & Export">
      <p className="text-xs text-gray-500">
        Your data is stored only on this device. If the browser data is cleared or the phone is lost,
        it is gone. Download a backup regularly.
      </p>
      <p className="text-sm text-gray-700">
        Last backup: {lastBackup === undefined ? '' : lastBackup ? formatUpdated(lastBackup) : 'never'}
      </p>
      <div className="flex flex-wrap gap-2">
        <button onClick={handleBackup} className={buttonClass}>Download backup</button>
        <button onClick={handleCsv} className={outlineClass}>Export products (CSV)</button>
      </div>
      <label className="block">
        <span className="text-sm text-gray-700">Restore from a backup file</span>
        <input
          type="file"
          accept="application/json,.json"
          onChange={handleRestore}
          className="mt-1 block w-full text-sm text-gray-600"
        />
      </label>
      <Status state={state} />
    </Section>
  )
}

export default function Settings() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-pink-700">Settings</h2>
      <ShopSection />
      <LowStockSection />
      <PinSection />
      <BackupSection />
    </div>
  )
}