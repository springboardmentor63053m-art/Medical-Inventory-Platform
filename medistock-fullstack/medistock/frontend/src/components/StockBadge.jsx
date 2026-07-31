/** Shows IN STOCK / LOW / OUT / EXPIRED for a medicine row. */
export default function StockBadge({ medicine }) {
  const expired = new Date(medicine.expiryDate) < new Date()
  if (expired) return <span className="badge bg-rose-100 text-rose-700">Expired</span>
  if (medicine.quantity === 0) return <span className="badge bg-slate-200 text-slate-700">Out of stock</span>
  if (medicine.quantity <= medicine.lowStockThreshold)
    return <span className="badge bg-amber-100 text-amber-700">Low stock</span>
  return <span className="badge bg-emerald-100 text-emerald-700">In stock</span>
}
