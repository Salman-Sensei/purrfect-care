import { Outlet } from 'react-router-dom'
import Sidebar        from './Sidebar'
import Navbar         from './Navbar'
import BottomNav      from './BottomNav'
import AnimeAssistant from './AnimeAssistant'   // ← NEW

export default function Layout() {
  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="md:pl-[260px] flex flex-col min-h-dvh">
        <Navbar />
        <main className="flex-1 px-4 pt-5 pb-28 md:px-7 md:pt-7 md:pb-8 max-w-4xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <BottomNav />

      {/* ── Anime assistant: renders above everything, fixed position ── */}
      <AnimeAssistant />
    </div>
  )
}
