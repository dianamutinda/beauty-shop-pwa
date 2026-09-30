import { db } from './index'

export function enqueue(table, recordId, op = 'upsert') {
  return db.syncQueue.add({
    table,
    recordId,
    op,
    createdAt: new Date().toISOString(),
  })
}