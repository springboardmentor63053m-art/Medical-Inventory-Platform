import { Link } from 'react-router-dom'

export default function Landing() {
  const modules = [
    {
      title: 'Secure access',
      description: 'JWT authentication, role-based permissions, and password recovery for admins, pharmacists, and staff.',
      accent: 'Authentication & roles',
    },
    {
      title: 'Medicine inventory',
      description: 'Add, update, search, and manage stock across categories, batches, and suppliers with full history.',
      accent: 'Inventory control',
    },
    {
      title: 'Supplier management',
      description: 'Track supplier details, contact information, purchases, and performance in one place.',
      accent: 'Supplier workflow',
    },
    {
      title: 'Expiry & alerts',
      description: 'Monitor near-expiry and expired products with low-stock and stock movement notifications.',
      accent: 'Risk prevention',
    },
    {
      title: 'Dashboard analytics',
      description: 'Visualize stock health, purchase summaries, and inventory insights for quick decision-making.',
      accent: 'Analytics',
    },
    {
      title: 'Reports & exports',
      description: 'Generate purchase, expiry, and inventory reports for PDF or Excel export.',
      accent: 'Reporting',
    },
  ]

  const stats = [
    { label: 'Real-time stock updates', value: '24/7' },
    { label: 'Expiry monitoring', value: 'Instant' },
    { label: 'Inventory visibility', value: 'Full' },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#14b8a6,_#0f172a_60%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-slate-900/50 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/20 text-lg font-semibold text-teal-300">
              M
            </div>
            <div>
              <p className="text-base font-semibold">MediStock</p>
              <p className="text-xs text-slate-400">Medical inventory management platform</p>
            </div>
          </div>
          <Link
            to="/login"
            className="rounded-full bg-teal-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-400"
          >
            Sign in
          </Link>
        </header>

        <main className="space-y-10">
          <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-sm text-teal-200">
                Full-stack inventory management for pharmacies and hospitals
              </div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Keep medicine stock, suppliers, and expiry data in one smart workspace.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-300 sm:text-xl">
                MediStock helps teams manage inventory, prevent shortages, and act on expiring stock with clear dashboards and alerts.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Get started
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-800/70 p-4 text-center">
                    <p className="text-2xl font-semibold text-teal-300">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-6 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-300">Platform modules</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Everything needed for modern inventory operations</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((module) => (
                <div key={module.title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/20">
                  <p className="text-sm font-medium text-teal-300">{module.accent}</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{module.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{module.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-teal-500/20 bg-teal-500/10 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-200">Built for</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Pharmacies, hospitals, and healthcare teams</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">Admin</span>
                <span className="rounded-full border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">Pharmacist</span>
                <span className="rounded-full border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">Staff</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
