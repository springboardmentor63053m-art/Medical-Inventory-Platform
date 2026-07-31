import { useEffect, useState } from 'react'
import { notificationApi } from '../api/services'

export default function Notifications() {
  const [items, setItems] = useState([])
  const load = () => notificationApi.list().then(({ data }) => setItems(data))
  useEffect(() => { load() }, [])

  const colours = {
    LOW_STOCK: 'bg-amber-100 text-amber-700',
    OUT_OF_STOCK: 'bg-slate-200 text-slate-700',
    NEAR_EXPIRY: 'bg-amber-100 text-amber-700',
    EXPIRED: 'bg-rose-100 text-rose-700',
    PURCHASE: 'bg-teal-100 text-teal-700',
    SYSTEM: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Notifications</h2>
        <button className="btn-outline" onClick={() => notificationApi.readAll().then(load)}>Mark all read</button>
      </div>
      <div className="card space-y-2">
        {items.map((n) => (
          <div key={n.id} className="flex items-center gap-3 border-b py-2 last:border-0">
            <span className={`badge ${colours[n.type]}`}>{n.type}</span>
            <span className="text-sm">{n.message}</span>
            <span className="ml-auto text-xs text-slate-400">{n.createdAt?.replace('T', ' ').slice(0, 16)}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-500">No notifications yet</p>}
      </div>
    </div>
  )
}
