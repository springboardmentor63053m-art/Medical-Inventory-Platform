import { useState } from 'react'
import {
  BookOpen, Calendar, CheckCircle2, Clock, Target,
  Code2, Database, Shield, BarChart2, Users, Package,
  ChevronDown, ChevronUp, Layers, GitBranch, Server,
  Monitor, Cpu, FileText, Star, ArrowRight, AlertTriangle,
  Activity, Pill, Truck, ShoppingCart, Receipt, Bell,
  Zap, Lock, TrendingUp, Globe, Award,
} from 'lucide-react'

/* ─────────────────────────────────────────────────
   PROJECT DATA
   ───────────────────────────────────────────────── */

const PROJECT_INFO = {
  name: 'MediStock Pro — Medical Inventory Management Platform',
  org: 'Infosys Springboard Internship',
  type: 'B.Tech Final Year Project | Computer Science Engineering',
  duration: '4 Weeks',
  stack: 'Spring Boot 3.2.5 + React 18 + Java 21 + TailwindCSS',
  currentProgress: 100,
}

// ── WEEK 1 ──────────────────────────────────────
const week1Objectives = [
  { id: 'O1', text: 'Develop a secure role-based authentication system with JWT tokens' },
  { id: 'O2', text: 'Implement comprehensive medicine and category management' },
  { id: 'O3', text: 'Track real-time inventory levels with automatic low-stock and expiry alerts' },
  { id: 'O4', text: 'Manage purchase orders from suppliers and integrate them into stock' },
  { id: 'O5', text: 'Record and track medicine sales with automatic stock deduction' },
  { id: 'O6', text: 'Generate detailed analytical reports and dashboard KPIs' },
  { id: 'O7', text: 'Maintain audit trails through stock movement logs' },
  { id: 'O8', text: 'Support multi-role access for Administrators, Pharmacists, Inventory Managers, and Staff' },
  { id: 'O9', text: 'Provide a responsive, modern UI accessible across desktop and tablet devices' },
  { id: 'O10', text: 'Deliver a containerized application ready for deployment' },
]

const roles = [
  { role: 'ADMIN', color: 'from-red-500 to-rose-600', desc: 'Full system access — all modules, user management, configuration' },
  { role: 'PHARMACIST', color: 'from-blue-500 to-cyan-600', desc: 'Dispense medicines, record sales, view inventory and alerts' },
  { role: 'INVENTORY_MANAGER', color: 'from-emerald-500 to-teal-600', desc: 'Manage procurement, suppliers, stock movements, reports' },
  { role: 'STAFF', color: 'from-violet-500 to-purple-600', desc: 'Read-only access — inventory lookup, dashboard view' },
]

const techStack = [
  { layer: 'Frontend', items: ['React 18', 'Vite 5', 'TailwindCSS 3', 'Recharts', 'Lucide Icons', 'Axios'] },
  { layer: 'Backend', items: ['Java 21', 'Spring Boot 3.2.5', 'Spring Security', 'Spring Data JPA', 'JWT (jjwt 0.12.5)'] },
  { layer: 'Database', items: ['H2 (MySQL Mode, Dev)', 'MySQL 8.0 (Prod)', 'Hibernate ORM', 'HikariCP Pool'] },
  { layer: 'DevOps', items: ['Docker', 'Docker Compose', 'Maven 3.9', 'Node.js 20+', 'nginx'] },
]

const week1Tasks = [
  { task: 'Project setup — Spring Boot 3.2.5 + React 18 + Vite 5' },
  { task: 'JWT Authentication & Role-Based Access Control (BCrypt + JJWT)' },
  { task: 'Entity design — Users, Roles, Employees, Medicines, Categories' },
  { task: 'Entity design — Suppliers, Inventory, Purchases, Sales, Alerts, StockMovements' },
  { task: 'H2 in-memory database (MySQL mode) with Hibernate auto-DDL' },
  { task: 'REST API — AuthController (login + register with JWT)' },
  { task: 'REST API — MedicineController, CategoryController, InventoryController' },
  { task: 'REST API — SupplierController, PurchaseController, SalesController' },
  { task: 'REST API — AlertController, DashboardController, EmployeeController' },
  { task: 'Frontend routing with React Router v6 — PrivateRoute guard' },
  { task: 'AuthContext + ThemeContext (dark/light mode persistence)' },
  { task: 'Axios instance with JWT Bearer interceptor + 401 auto-logout' },
  { task: 'Responsive Sidebar with role-based navigation visibility' },
  { task: 'DataInitializer — auto-seeds 10 medicines, 10 suppliers, 10+ records' },
  { task: 'Spring @Scheduled alert engine — daily low-stock & expiry checks at 6 AM' },
  { task: 'Docker Dockerfile (backend) + Dockerfile (frontend/nginx) + docker-compose.yml' },
  { task: 'Full academic Week 1 documentation (FR/NFR, architecture, ER diagram)' },
]

// ── WEEK 2 ──────────────────────────────────────
const week2Tasks = [
  { task: 'Dashboard — KPI cards, Admin/Pharmacist view switcher, Recharts area + bar + pie charts' },
  { task: 'Medicines — CRUD modal, search by name/brand/generic, filter by category/supplier/status' },
  { task: 'Inventory — All/LowStock/Expiring tabs, batch/expiry/location display, stock adjust modal' },
  { task: 'Suppliers — CRUD, GST/license fields, performance rating cards, city/state display' },
  { task: 'Purchases — Create PO with multi-item rows, PENDING→RECEIVED workflow, auto stock-in' },
  { task: 'Sales — Multi-item cart, MRP auto-fill, CASH/CARD/UPI/INSURANCE, auto stock-out' },
  { task: 'Alerts — Active/All tabs, LOW_STOCK/EXPIRY types, acknowledge & resolve workflow' },
  { task: 'Reports — 5 report types, date filter, Export PDF (print API), Export CSV download' },
  { task: 'Employees — Card grid, CRUD (admin), ACTIVE/INACTIVE status, linked user accounts' },
  { task: 'Profile — Personal info display, password change form with current/new password' },
  { task: 'Settings — Notification preferences, alert thresholds, theme selection' },
  { task: 'Command Palette (Ctrl+K) — keyboard navigation to any page' },
  { task: 'ThemeToggle pill — animated 3-option (Light/Dark/Auto) with Spring physics' },
  { task: 'Navbar — Notification bell badge, dropdown with alert list, user menu' },
  { task: 'Glassmorphism dark/light mode design system — Inter + Outfit fonts' },
]

const week2Features = [
  { icon: Activity,     label: 'Dashboard',  desc: 'Admin + Pharmacist view, KPI charts',    color: 'text-blue-400' },
  { icon: Pill,         label: 'Medicines',  desc: 'CRUD, search, category/supplier filter',  color: 'text-emerald-400' },
  { icon: Package,      label: 'Inventory',  desc: 'Stock tabs, batch/expiry, adjustments',   color: 'text-amber-400' },
  { icon: Truck,        label: 'Suppliers',  desc: 'CRUD, GST/license, performance rating',   color: 'text-purple-400' },
  { icon: ShoppingCart, label: 'Purchases',  desc: 'Multi-item PO, receive/cancel workflow',  color: 'text-cyan-400' },
  { icon: Receipt,      label: 'Sales',      desc: 'Multi-item cart, payment methods',        color: 'text-rose-400' },
  { icon: Bell,         label: 'Alerts',     desc: 'Low-stock & expiry, ack/resolve',         color: 'text-orange-400' },
  { icon: BarChart2,    label: 'Reports',    desc: '5 report types, PDF + CSV export',        color: 'text-indigo-400' },
]

const integrationHighlights = [
  {
    title: 'JWT Token Flow',
    detail: 'Login → Spring AuthService validates BCrypt → JwtUtil issues signed token → stored in localStorage → Axios interceptor attaches Bearer header on every request → JwtAuthFilter validates → 401 → auto-logout + redirect to /login',
    color: 'border-blue-500/30 bg-blue-500/5',
  },
  {
    title: 'Auto Stock-In on Purchase Receipt',
    detail: 'Mark PO RECEIVED → PurchaseService iterates items → InventoryService.adjustStock(+qty) → StockMovement(PURCHASE_IN) logged → inventory repo saved → Dashboard KPIs refresh on next load',
    color: 'border-emerald-500/30 bg-emerald-500/5',
  },
  {
    title: 'Auto Stock-Out on Sale',
    detail: 'Create Sale → SalesService checks inventory.qty ≥ item.qty (else 400) → deducts qty → StockMovement(SALE_OUT) logged → if qty < reorderLevel → LOW_STOCK alert auto-created',
    color: 'border-amber-500/30 bg-amber-500/5',
  },
  {
    title: 'Scheduled Alert Engine',
    detail: '@Scheduled(cron="0 0 6 * * ?") runs daily at 6 AM → scans all inventory → LOW_STOCK if qty < reorderLevel → EXPIRY_30/60/90_DAYS if expiry within threshold days → alerts stored in DB',
    color: 'border-rose-500/30 bg-rose-500/5',
  },
  {
    title: 'Role-Based UI Rendering',
    detail: 'AuthContext stores { user, role } → Sidebar filters nav items by role → PrivateRoute guards protected routes → API controllers enforce same role permissions server-side via Spring Security',
    color: 'border-purple-500/30 bg-purple-500/5',
  },
]

// ── WEEK 3 ──────────────────────────────────────
const week3Tasks = [
  { task: 'Advanced Search & Filtering — full-text search across all modules' },
  { task: 'PDF Report Generation — jsPDF integration for downloadable inventory reports' },
  { task: 'Excel CSV Export — structured data export for all report types' },
  { task: 'Supplier Performance Analytics — purchase history, delivery tracking per supplier' },
  { task: 'Stock Movement Audit Log Page — filterable by medicine, type, date range' },
  { task: 'Notification Settings — configure alert thresholds and email preferences' },
  { task: 'Barcode-style medicine lookup — search by HSN code' },
  { task: 'Dashboard Pharmacist vs Admin view switching (PDF Module 5 compliance)' },
  { task: 'Project Plan page — in-app documentation and progress tracker' },
  { task: 'Settings page — theme, notification preferences, system information' },
  { task: 'System Architecture modal — visual diagram inside the app' },
  { task: 'CategoryController endpoint for hierarchical category browsing' },
  { task: 'End-to-end data verification — all 10 modules load correctly' },
  { task: 'JWT expiry fix — extended to 30 days for development session persistence' },
]

// ── WEEK 4 ──────────────────────────────────────
const week4Tasks = [
  { task: 'Complete README.md — full API reference, RBAC matrix, architecture, quick-start' },
  { task: 'Week 1 & Week 2 academic documentation update — FR/NFR, module details' },
  { task: 'Week 2 documentation creation — frontend modules, integration flows' },
  { task: 'diagrams.md update — ER diagram, architecture layers, workflow diagrams' },
  { task: 'ProjectPlan.jsx update — 4-week comprehensive project plan in-app viewer' },
  { task: 'Sample data alignment — DataInitializer matches sample_data.sql exactly' },
  { task: 'Login credential documentation — all 5 test accounts with correct passwords' },
  { task: 'docker-compose.yml verification — MySQL + Backend + Frontend 3-service config' },
  { task: 'Application.yml — JWT 30d expiry, H2 console enabled, alert scheduler config' },
  { task: 'Final project verification — all pages load data, all CRUD workflows tested' },
  { task: 'Production build validation — Vite bundle + Spring Boot JAR' },
  { task: 'GitHub repository cleanup — .gitignore, docs/, docs structure' },
]

const projectMetrics = [
  { label: 'REST Endpoints', value: '40+',   color: 'text-blue-400' },
  { label: 'React Pages',    value: '13',    color: 'text-emerald-400' },
  { label: 'DB Tables',      value: '13',    color: 'text-purple-400' },
  { label: 'JPA Entities',   value: '13',    color: 'text-amber-400' },
  { label: 'User Roles',     value: '4',     color: 'text-cyan-400' },
  { label: 'Alert Types',    value: '5',     color: 'text-rose-400' },
  { label: 'Report Types',   value: '5',     color: 'text-orange-400' },
  { label: 'Docker Services',value: '3',     color: 'text-indigo-400' },
]

/* ─────────────────────────────────────────────────
   COMPONENTS
   ───────────────────────────────────────────────── */

function Section({ title, icon: Icon, iconColor = 'text-primary-400', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-slate-800/60 dark:bg-slate-900/60 border border-white/8 rounded-2xl overflow-hidden mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <span className="font-semibold text-white text-sm">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2">{children}</div>}
    </div>
  )
}

function TaskRow({ task }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
      <span className="text-slate-300 text-sm">{task}</span>
    </div>
  )
}

const WEEKS = [
  { key: 'week1', label: 'Week 1', icon: GitBranch,  subtitle: 'Requirements & Backend Setup' },
  { key: 'week2', label: 'Week 2', icon: Code2,       subtitle: 'Frontend & Integration' },
  { key: 'week3', label: 'Week 3', icon: Zap,         subtitle: 'Enhancement & Reporting' },
  { key: 'week4', label: 'Week 4', icon: Award,       subtitle: 'Documentation & Delivery' },
]

/* ─────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────── */
export default function ProjectPlan() {
  const [activeWeek, setActiveWeek] = useState('week1')

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Project Plan & Documentation</h1>
            <p className="text-slate-400 text-sm">{PROJECT_INFO.org} · {PROJECT_INFO.type}</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-teal-500/10 border border-blue-500/20 rounded-xl flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Star className="w-4 h-4 text-amber-400" />
            <span><strong className="text-white">Project:</strong> Medical Inventory Management Platform (MIMP)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span><strong className="text-white">Duration:</strong> 4 Weeks · Infosys Springboard Internship</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span><strong className="text-white">Status:</strong> All 4 Weeks — Completed ✅</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span><strong className="text-white">Stack:</strong> {PROJECT_INFO.stack}</span>
          </div>
        </div>
      </div>

      {/* ── Week Tabs ── */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/60 p-1.5 rounded-xl border border-white/8">
        {WEEKS.map(({ key, label, icon: Icon, subtitle }) => (
          <button
            key={key}
            onClick={() => setActiveWeek(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeWeek === key
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.replace('Week ', 'W')}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          WEEK 1
         ══════════════════════════════════════════ */}
      {activeWeek === 'week1' && (
        <div>
          {/* Hero card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-teal-600/10 border border-blue-500/20 p-6 mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-3">
              <GitBranch className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Week 1 — Requirements & System Design</h2>
              <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✅ Completed</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
              Week 1 focused on understanding the complete project scope, designing the system architecture,
              defining all functional and non-functional requirements, setting up the full-stack development
              environment, and implementing the core backend infrastructure with JWT security, database entities,
              REST APIs, and the Spring alert engine.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {['Planning', 'Architecture', 'Backend Setup', 'JWT Auth', 'Database Design', 'REST APIs', 'Docker'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">{t}</span>
              ))}
            </div>
          </div>

          {/* Objectives */}
          <Section title="Project Objectives (O1–O10)" icon={Target} iconColor="text-amber-400">
            <div className="grid gap-2">
              {week1Objectives.map(({ id, text }) => (
                <div key={id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">{id}</span>
                  <span className="text-slate-300 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* User Roles */}
          <Section title="User Roles & Permissions" icon={Users} iconColor="text-blue-400">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map(({ role, color, desc }) => (
                <div key={role} className="p-4 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-colors">
                  <div className={`inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r ${color} text-white text-xs font-bold mb-2`}>
                    {role}
                  </div>
                  <p className="text-slate-300 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Tech Stack */}
          <Section title="Technology Stack & Architecture" icon={Layers} iconColor="text-purple-400">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {techStack.map(({ layer, items }) => (
                <div key={layer} className="p-4 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{layer}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map(item => (
                      <span key={item} className="px-2 py-1 rounded-md text-xs bg-white/8 text-slate-300 border border-white/10">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Architecture layers */}
            <div className="bg-slate-900/60 border border-white/8 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">5-Layer Architecture</p>
              <div className="space-y-2">
                {[
                  { label: 'Client Layer', sub: 'React 18 + Vite 5 — AuthContext, ThemeContext, Axios interceptor, React Router', icon: Monitor, color: 'border-blue-500/40 bg-blue-500/5' },
                  { label: 'Security Gateway', sub: 'Spring Security · CORS Filter · JWT Authentication Filter · Role Authorization', icon: Shield, color: 'border-amber-500/40 bg-amber-500/5' },
                  { label: 'API Controller Layer', sub: '10 REST Controllers — Auth, Medicine, Inventory, Supplier, Purchase, Sales, Alerts, Employee, Category, Dashboard', icon: Server, color: 'border-emerald-500/40 bg-emerald-500/5' },
                  { label: 'Service Layer', sub: 'Business Logic — Stock calculation, Alert engine, Report generation, @Scheduled jobs', icon: Cpu, color: 'border-purple-500/40 bg-purple-500/5' },
                  { label: 'Repository & Database', sub: 'Spring Data JPA · HikariCP Pool · H2 (dev) / MySQL 8 (prod) · 13 tables', icon: Database, color: 'border-rose-500/40 bg-rose-500/5' },
                ].map(({ label, sub, icon: Icon, color }) => (
                  <div key={label} className={`flex items-center gap-4 p-3 rounded-lg border ${color}`}>
                    <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">{label}</p>
                      <p className="text-slate-400 text-xs">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Week 1 Tasks */}
          <Section title={`Week 1 — Completed Tasks (${week1Tasks.length} deliverables)`} icon={CheckCircle2} iconColor="text-emerald-400">
            <div>
              {week1Tasks.map(({ task }, i) => <TaskRow key={i} task={task} />)}
            </div>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>All {week1Tasks.length} Week 1 deliverables completed ✅</span>
            </div>
          </Section>

          {/* Key Deliverables */}
          <Section title="Week 1 — Key Deliverables" icon={FileText} iconColor="text-cyan-400">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Academic Report', desc: 'FR/NFR matrix (50+ requirements), problem statement, objectives, stakeholder analysis', icon: FileText },
                { label: 'System Architecture', desc: 'Workflow diagram, architecture layers, ER diagram with all 13 entities and relationships', icon: Layers },
                { label: 'Backend API', desc: '40+ REST endpoints secured with JWT across 10 controllers, Spring Security config', icon: Server },
              ].map(({ label, desc, icon: Icon }) => (
                <div key={label} className="p-4 rounded-xl bg-white/3 border border-white/8 text-center">
                  <Icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <p className="text-white text-sm font-semibold mb-1">{label}</p>
                  <p className="text-slate-400 text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ══════════════════════════════════════════
          WEEK 2
         ══════════════════════════════════════════ */}
      {activeWeek === 'week2' && (
        <div>
          {/* Hero card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/20 via-teal-600/15 to-cyan-600/10 border border-emerald-500/20 p-6 mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-3">
              <Code2 className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Week 2 — Frontend Development & Full Integration</h2>
              <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✅ Completed</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
              Week 2 delivered all 13 React pages connected to the Spring Boot REST API, a premium
              glassmorphism dark/light mode UI, role-based rendering, Recharts analytics, full CRUD
              workflows for all 9 core modules, and the complete production-ready application.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {['React UI', 'API Integration', 'Dashboard Charts', 'CRUD Pages', 'Alert Engine', 'Reports', 'Dark Mode', 'Docker'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{t}</span>
              ))}
            </div>
          </div>

          {/* Feature Pages */}
          <Section title="Frontend Pages Developed (9 Core Modules)" icon={Monitor} iconColor="text-blue-400">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {week2Features.map(({ icon: Icon, label, desc, color }) => (
                <div key={label} className="p-4 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-colors text-center">
                  <Icon className={`w-7 h-7 ${color} mx-auto mb-2`} />
                  <p className="text-white text-sm font-semibold">{label}</p>
                  <p className="text-slate-400 text-xs mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Integration */}
          <Section title="Full-Stack Integration Highlights" icon={GitBranch} iconColor="text-purple-400">
            <div className="space-y-3">
              {integrationHighlights.map(({ title, detail, color }) => (
                <div key={title} className={`p-4 rounded-xl border ${color}`}>
                  <div className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-semibold mb-1">{title}</p>
                      <p className="text-slate-400 text-xs leading-relaxed">{detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Week 2 Tasks */}
          <Section title={`Week 2 — Completed Tasks (${week2Tasks.length} deliverables)`} icon={CheckCircle2} iconColor="text-emerald-400">
            <div>
              {week2Tasks.map(({ task }, i) => <TaskRow key={i} task={task} />)}
            </div>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>All {week2Tasks.length} Week 2 deliverables completed ✅</span>
            </div>
          </Section>

          {/* Metrics */}
          <Section title="Project Metrics" icon={BarChart2} iconColor="text-amber-400">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {projectMetrics.map(({ label, value, color }) => (
                <div key={label} className="p-4 rounded-xl bg-white/3 border border-white/8 text-center">
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  <p className="text-slate-400 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ══════════════════════════════════════════
          WEEK 3
         ══════════════════════════════════════════ */}
      {activeWeek === 'week3' && (
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/20 via-purple-600/15 to-indigo-600/10 border border-violet-500/20 p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-violet-400" />
              <h2 className="text-xl font-bold text-white">Week 3 — Enhancement, Search & Advanced Features</h2>
              <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✅ Completed</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
              Week 3 enhanced the application with advanced search and filtering across all modules,
              multi-format report export (PDF/CSV), supplier performance analytics, notification settings,
              the in-app Project Plan page, and critical fixes including JWT token lifetime extension
              and data loading verification across all 9 modules.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {['Advanced Search', 'PDF Export', 'CSV Export', 'Supplier Analytics', 'Notification Settings', 'Project Plan Page', 'JWT Fix', 'Data Verification'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">{t}</span>
              ))}
            </div>
          </div>

          <Section title={`Week 3 — Completed Tasks (${week3Tasks.length} deliverables)`} icon={CheckCircle2} iconColor="text-emerald-400">
            <div>
              {week3Tasks.map(({ task }, i) => <TaskRow key={i} task={task} />)}
            </div>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>All {week3Tasks.length} Week 3 deliverables completed ✅</span>
            </div>
          </Section>

          <Section title="Week 3 — Key Enhancements" icon={Target} iconColor="text-violet-400">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Globe, label: 'Advanced Search', desc: 'Full-text search by medicine name, brand, generic name across Medicines and Inventory modules', color: 'text-blue-400' },
                { icon: FileText, label: 'PDF Export', desc: 'Browser print API integration for one-click PDF generation of any report', color: 'text-amber-400' },
                { icon: Database, label: 'CSV Export', desc: 'Client-side CSV generation with structured column headers for all 5 report types', color: 'text-emerald-400' },
                { icon: Shield, label: 'JWT Fix', desc: 'Extended JWT expiry from 24h to 30 days — eliminates session expiry during development', color: 'text-rose-400' },
                { icon: BarChart2, label: 'Supplier Analytics', desc: 'Performance rating, on-time delivery %, total purchase value per supplier', color: 'text-purple-400' },
                { icon: Bell, label: 'Notification Settings', desc: 'Configurable alert thresholds, notification preferences panel in Settings page', color: 'text-orange-400' },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div key={label} className="p-4 rounded-xl bg-white/3 border border-white/8 flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className="text-white text-sm font-semibold mb-1">{label}</p>
                    <p className="text-slate-400 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ══════════════════════════════════════════
          WEEK 4
         ══════════════════════════════════════════ */}
      {activeWeek === 'week4' && (
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600/20 via-pink-600/15 to-amber-600/10 border border-rose-500/20 p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-6 h-6 text-rose-400" />
              <h2 className="text-xl font-bold text-white">Week 4 — Documentation, Testing & Final Delivery</h2>
              <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✅ Completed</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
              Week 4 completed the full academic documentation suite, updated all project files to match
              the PDF specification, verified all 13 modules load data correctly, finalized the README
              with complete API reference and RBAC matrix, and delivered the production-ready application.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {['README Update', 'Week 2 Docs', 'Week 3 Docs', 'Data Verification', 'Final Testing', 'Production Build', 'Project Delivery'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">{t}</span>
              ))}
            </div>
          </div>

          <Section title={`Week 4 — Completed Tasks (${week4Tasks.length} deliverables)`} icon={CheckCircle2} iconColor="text-emerald-400">
            <div>
              {week4Tasks.map(({ task }, i) => <TaskRow key={i} task={task} />)}
            </div>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>All {week4Tasks.length} Week 4 deliverables completed ✅</span>
            </div>
          </Section>

          {/* Login Credentials */}
          <Section title="Test Credentials (All Roles)" icon={Lock} iconColor="text-amber-400">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-xs border-b border-white/10">
                    <th className="text-left py-2 pr-4">Role</th>
                    <th className="text-left py-2 pr-4">Username</th>
                    <th className="text-left py-2 pr-4">Email</th>
                    <th className="text-left py-2">Password</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {[
                    ['ADMIN', 'admin', 'admin@medicalinv.com', 'Admin@123'],
                    ['PHARMACIST', 'dr_patel', 'patel@medicalinv.com', 'Pharma@123'],
                    ['INVENTORY_MANAGER', 'ravi_inv', 'ravi@medicalinv.com', 'Inv@12345'],
                    ['STAFF', 'priya_staff', 'priya@medicalinv.com', 'Staff@123'],
                    ['PHARMACIST', 'sneha_ph', 'sneha@medicalinv.com', 'Pharma@123'],
                  ].map(([role, user, email, pass]) => (
                    <tr key={user} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          role === 'ADMIN' ? 'bg-red-500/20 text-red-300' :
                          role === 'PHARMACIST' ? 'bg-blue-500/20 text-blue-300' :
                          role === 'INVENTORY_MANAGER' ? 'bg-emerald-500/20 text-emerald-300' :
                          'bg-violet-500/20 text-violet-300'
                        }`}>{role}</span>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs">{user}</td>
                      <td className="py-2.5 pr-4 text-xs">{email}</td>
                      <td className="py-2.5 font-mono text-xs text-amber-300">{pass}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Sample Data */}
          <Section title="Sample Data (Auto-Seeded on Startup)" icon={Database} iconColor="text-indigo-400">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Medicines', value: '10', detail: 'Amoxicillin, Paracetamol, Metformin...' },
                { label: 'Suppliers', value: '10', detail: 'Sun Pharma, Cipla, Dr. Reddy\'s...' },
                { label: 'Purchase Orders', value: '8', detail: 'INV-2024-0001 to INV-2024-0008' },
                { label: 'Sales', value: '10', detail: 'SALE-2024-0001 to SALE-2024-0010' },
                { label: 'Employees', value: '5', detail: 'Admin, Pharmacist, Inv. Mgr, Staff' },
                { label: 'Categories', value: '10', detail: 'Antibiotics, Analgesics, Vitamins...' },
                { label: 'Alerts', value: '6', detail: '3 LOW_STOCK + 3 EXPIRY_30_DAYS' },
                { label: 'Stock Movements', value: '12', detail: 'PURCHASE_IN, SALE_OUT, ADJUST...' },
              ].map(({ label, value, detail }) => (
                <div key={label} className="p-3 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-2xl font-bold text-blue-400">{value}</p>
                  <p className="text-white text-xs font-semibold mt-1">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{detail}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ── Progress Footer ── */}
      <div className="mt-8 p-5 bg-slate-800/60 dark:bg-slate-900/60 border border-white/8 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Overall Project Progress</span>
          <span className="text-sm font-bold text-emerald-400">100% Complete 🎉</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2.5">
          <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-400 transition-all duration-1000" style={{ width: '100%' }} />
        </div>
        <div className="flex justify-between mt-3 text-xs text-slate-500">
          <span className="text-emerald-400 font-medium">✅ Week 1 Done</span>
          <span className="text-emerald-400 font-medium">✅ Week 2 Done</span>
          <span className="text-emerald-400 font-medium">✅ Week 3 Done</span>
          <span className="text-emerald-400 font-medium">✅ Week 4 Done</span>
        </div>
        <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {projectMetrics.slice(0, 4).map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
