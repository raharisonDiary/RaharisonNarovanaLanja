import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu" />}
      <div className="app-shell__main">
        <Topbar onMenu={() => setSidebarOpen((value) => !value)} />
        <main className="page-container"><Outlet /></main>
      </div>
    </div>
  )
}
