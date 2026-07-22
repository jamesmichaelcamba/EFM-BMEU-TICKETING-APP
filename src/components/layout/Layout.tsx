import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-efm-bg-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-efm-bg-100">
        <Outlet />
      </main>
    </div>
  )
}
