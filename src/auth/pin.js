async function hashPin(pin, salt) {
  const enc = new TextEncoder()
  const data = enc.encode(salt + pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function setPin(userId, pin) {
  const salt = crypto.randomUUID()
  const hash = await hashPin(pin, salt)
  await db.settings.put({ key: `pin:${userId}`, value: { salt, hash } })
}

export async function verifyPin(userId, pin) {
  const record = await db.settings.get(`pin:${userId}`)
  if (!record) return false
  const attemptHash = await hashPin(pin, record.value.salt)
  return attemptHash === record.value.hash
}