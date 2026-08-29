import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar  from '../components/Navbar'
import Breadcrumbs from '../components/Breadcrumbs'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f5f0] dark:bg-[#12241b] transition-colors duration-300">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onMenuClick={() => setSidebarOpen(prev => !prev)}
        />

        <main className="flex-1 overflow-y-auto scrollbar-thin
                         bg-[#f8f5f0] dark:bg-[#12241b]">
          <div className="relative z-10 max-w-7xl mx-auto p-6 pb-24 animate-fade-in">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
