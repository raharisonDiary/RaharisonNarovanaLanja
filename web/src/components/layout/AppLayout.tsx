import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import MobileBottomNav from './MobileBottomNav'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu" />}
      <div className="app-shell__main">
        <Topbar onMenu={() => setSidebarOpen((value) => !value)} />
        <main className="page-container route-stage" key={location.pathname}><Outlet /></main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
