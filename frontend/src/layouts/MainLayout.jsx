import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar  from '../components/Navbar'
import Breadcrumbs from '../components/Breadcrumbs'
import AIChatbot from '../components/AIChatbot'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0C111D] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC] dark:bg-[#0C111D]">
        <Navbar
          onMenuClick={() => setSidebarOpen(prev => !prev)}
        />

        <main className="flex-1 overflow-y-auto scrollbar-thin
                         bg-[#F8FAFC] dark:bg-[#0C111D]
                         transition-colors duration-300">
          <div className="relative z-10 max-w-[1600px] mx-auto p-5 lg:p-7 pb-24 animate-fade-in">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
      <AIChatbot />
    </div>
  )
}
