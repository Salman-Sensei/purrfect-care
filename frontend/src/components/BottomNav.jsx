import { NavLink } from 'react-router-dom'

const NAV = [
  {
    to: '/dashboard', label: 'Home',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    to: '/cats', label: 'Cats',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-3.582-8-8 0-1.906.672-3.65 1.786-5.02C6.367 7.16 7.5 6 9 5.5c.5-1 1.5-2 3-2s2.5 1 3 2c1.5.5 2.633 1.66 3.214 2.48C19.328 9.35 20 11.094 20 13c0 4.418-3.582 8-8 8z" /></svg>,
  },
  {
    to: '/checklist', label: 'Tasks',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    to: '/vet', label: 'Vet',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  },
  {
    to: '/symptoms', label: 'Guide',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
  },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30
                    bg-white/95 dark:bg-slate-900/95 backdrop-blur-md
                    border-t border-slate-100 dark:border-slate-800 flex">
      {NAV.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `
            flex-1 flex flex-col items-center justify-center gap-1 py-3 relative
            text-[10px] font-black uppercase tracking-wide transition-all duration-200
            ${isActive
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
            }
          `}
        >
          {({ isActive }) => (
            <>
              {/* Active pill background */}
              {isActive && (
                <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-10
                                 bg-brand-50 dark:bg-brand-950/50 rounded-2xl -z-10" />
              )}
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {icon}
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
