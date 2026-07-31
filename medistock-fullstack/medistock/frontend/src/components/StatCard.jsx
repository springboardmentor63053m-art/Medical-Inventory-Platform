import { motion } from 'framer-motion'

/** Small metric tile used on the dashboards. */
export default function StatCard({ label, value, tone = 'teal' }) {
  const tones = {
    teal: 'text-teal-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
    slate: 'text-slate-700',
  }
  return (
    <motion.div className="card" whileHover={{ y: -3 }}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tones[tone]}`}>{value}</p>
    </motion.div>
  )
}
