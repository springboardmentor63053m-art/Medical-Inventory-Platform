import { useEffect, useState } from 'react'
import { dashboardApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'

/** Admin sees everything; Pharmacist/Staff see the inventory-focused view. */
export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => { dashboardApi.stats().then(({ data }) => setStats(data)) }, [])

  if (!stats) return <p>Loading dashboard...</p>
  const isAdmin = user.role === 'ADMIN'

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{isAdmin ? 'Admin' : 'Pharmacist'} Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total medicines" value={stats.totalMedicines} />
        <StatCard label="Low stock" value={stats.lowStockCount} tone="amber" />
        <StatCard label="Out of stock" value={stats.outOfStockCount} tone="rose" />
        <StatCard label="Expiring soon" value={stats.nearExpiryCount} tone="amber" />
        <StatCard label="Expired" value={stats.expiredCount} tone="rose" />
        <StatCard label="Suppliers" value={stats.totalSuppliers} tone="slate" />
        <StatCard label="Inventory value" value={`Rs ${stats.inventoryValue}`} />
        {isAdmin && <StatCard label="Users" value={stats.totalUsers} tone="slate" />}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 font-semibold">Stock by category</h3>
          {Object.entries(stats.stockByCategory || {}).map(([name, qty]) => (
            <div key={name} className="mb-2">
              <div className="flex justify-between text-sm"><span>{name}</span><span>{qty}</span></div>
              <div className="h-2 rounded bg-slate-100">
                <div className="h-2 rounded bg-teal-500" style={{ width: `${Math.min(100, qty)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="mb-3 font-semibold">{isAdmin ? 'Recent stock movements' : 'Recent activity'}</h3>
          <ul className="space-y-1 text-sm text-slate-600">
            {(stats.recentActivity || []).map((a, i) => <li key={i}>- {a}</li>)}
            {(stats.recentActivity || []).length === 0 && <li>No activity yet</li>}
          </ul>
        </div>
      </div>

      {isAdmin && (
        <div className="card">
          <h3 className="mb-3 font-semibold">Supplier analytics (medicines supplied)</h3>
          <ul className="text-sm text-slate-600">
            {Object.entries(stats.medicinesBySupplier || {}).map(([name, count]) => (
              <li key={name}>{name}: {count}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm">Total purchase cost: <b>Rs {stats.totalPurchaseCost}</b></p>
        </div>
      )}
    </div>
  )
}
