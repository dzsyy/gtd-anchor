import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-3 left-3 z-30 p-2 bg-white rounded-md shadow-lg md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="md:ml-56 min-h-screen px-3 py-4 md:p-6">
        <div className="mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
