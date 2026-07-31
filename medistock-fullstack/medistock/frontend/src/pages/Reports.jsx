import { reportApi } from '../api/services'

const types = [
  { key: 'inventory', label: 'Full inventory report' },
  { key: 'low-stock', label: 'Low stock report' },
  { key: 'near-expiry', label: 'Near-expiry report' },
  { key: 'expired', label: 'Expired medicines report' },
]

export default function Reports() {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Reports &amp; Export</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {types.map((t) => (
          <div key={t.key} className="card flex items-center justify-between">
            <span className="font-medium">{t.label}</span>
            <div className="space-x-2">
              <button className="btn-outline" onClick={() => reportApi.download('pdf', t.key)}>PDF</button>
              <button className="btn-primary" onClick={() => reportApi.download('excel', t.key)}>Excel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
